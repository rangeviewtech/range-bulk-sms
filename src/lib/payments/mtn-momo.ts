import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { generateTransactionReference } from '@/lib/sms/idempotency';

type MomoEnvironment = 'sandbox' | 'production';
type MomoStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED';

interface MomoConfig {
  environment: MomoEnvironment;
  baseUrl: string;
  targetEnvironment: string;
  currency: string;
  subscriptionKey: string;
  apiUser: string;
  apiKey: string;
  callbackUrl?: string;
}

interface ProviderStatus {
  status?: string;
  amount?: string;
  currency?: string;
  externalId?: string;
  financialTransactionId?: string;
  reason?: { code?: string; message?: string };
}

const REQUEST_TIMEOUT_MS = 12_000;
let cachedAccessToken: { token: string; expiresAt: number } | undefined;

function getConfig(): MomoConfig | null {
  const environment = process.env.MTN_MOMO_ENVIRONMENT;
  const subscriptionKey = process.env.MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY;
  const apiUser = process.env.MTN_MOMO_API_USER;
  const apiKey = process.env.MTN_MOMO_API_KEY;
  if (!environment || !subscriptionKey || !apiUser || !apiKey) return null;
  if (environment !== 'sandbox' && environment !== 'production') {
    throw new Error('MTN_MOMO_ENVIRONMENT must be sandbox or production');
  }
  const callbackUrl = process.env.MTN_MOMO_CALLBACK_URL;
  if (callbackUrl) {
    const parsedCallbackUrl = new URL(callbackUrl);
    if (parsedCallbackUrl.protocol !== 'https:' || parsedCallbackUrl.hostname === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(parsedCallbackUrl.hostname)) {
      throw new Error('MTN_MOMO_CALLBACK_URL must use HTTPS and a public hostname');
    }
  }

  const baseUrl = environment === 'sandbox'
    ? 'https://sandbox.momodeveloper.mtn.com'
    : 'https://momoapi.mtn.com';
  return {
    environment,
    baseUrl,
    targetEnvironment: environment === 'sandbox'
      ? 'sandbox'
      : process.env.MTN_MOMO_TARGET_ENVIRONMENT || 'mtnuganda',
    currency: process.env.MTN_MOMO_CURRENCY || (environment === 'sandbox' ? 'EUR' : 'UGX'),
    subscriptionKey,
    apiUser,
    apiKey,
    callbackUrl,
  };
}

export function isMtnMomoConfigured(): boolean {
  return getConfig() !== null;
}

function timeoutSignal() {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

async function getAccessToken(config: MomoConfig): Promise<string> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 30_000) {
    return cachedAccessToken.token;
  }
  const credentials = Buffer.from(`${config.apiUser}:${config.apiKey}`).toString('base64');
  const response = await fetch(`${config.baseUrl}/collection/token/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
    },
    cache: 'no-store',
    signal: timeoutSignal(),
  });
  if (!response.ok) throw new Error(`MTN authentication failed (${response.status})`);
  const body = await response.json() as { access_token?: unknown; expires_in?: unknown };
  if (typeof body.access_token !== 'string') throw new Error('MTN returned an invalid access token response');
  const expiresIn = typeof body.expires_in === 'number' ? body.expires_in : 300;
  cachedAccessToken = { token: body.access_token, expiresAt: Date.now() + expiresIn * 1000 };
  return body.access_token;
}

export function normalizeUgandaMsisdn(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) digits = `256${digits.slice(1)}`;
  else if (digits.length === 9 && digits.startsWith('7')) digits = `256${digits}`;
  return /^2567\d{8}$/.test(digits) ? digits : null;
}

function mapStatus(status: unknown): MomoStatus {
  if (status === 'SUCCESSFUL') return 'SUCCESSFUL';
  if (status === 'FAILED') return 'FAILED';
  return 'PENDING';
}

function isMatchingIdempotentPayment(
  existing: { userId: string; walletId: string; amount: Prisma.Decimal; phone: string },
  params: { userId: string; walletId: string; amount: number; phone: string },
) {
  return existing.userId === params.userId && existing.walletId === params.walletId &&
    existing.amount.equals(new Prisma.Decimal(params.amount)) && existing.phone === params.phone;
}

async function findIdempotentPayment(params: {
  userId: string;
  walletId: string;
  amount: number;
  phone: string;
  idempotencyKey?: string;
}) {
  if (!params.idempotencyKey) return null;
  const existing = await prisma.momoPayment.findUnique({ where: { idempotencyKey: params.idempotencyKey } });
  if (!existing) return null;
  if (!isMatchingIdempotentPayment(existing, params)) {
    throw new Error('This payment request key was already used for different payment details');
  }
  return existing;
}

export const MtnMomoService = {
  async initiate(params: {
    userId: string;
    walletId: string;
    amount: number;
    phone: string;
    idempotencyKey?: string;
  }) {
    const config = getConfig();
    if (!config) throw new Error('MTN Mobile Money top-ups are not configured yet');
    const phone = normalizeUgandaMsisdn(params.phone);
    if (!phone) throw new Error('Enter a valid Uganda MTN number, such as 0772 123 456');

    const existing = await findIdempotentPayment({ ...params, phone });
    if (existing) return existing;

    const wallet = await prisma.wallet.findFirst({
      where: { id: params.walletId, userId: params.userId, isActive: true },
      select: { id: true, currency: true },
    });
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.currency !== config.currency) {
      throw new Error(`Wallet currency (${wallet.currency}) does not match the MTN payment currency (${config.currency})`);
    }

    const paymentId = randomUUID();
    const amount = new Prisma.Decimal(params.amount);
    let payment;
    try {
      payment = await prisma.momoPayment.create({
        data: {
          id: paymentId,
          walletId: params.walletId,
          userId: params.userId,
          amount,
          currency: config.currency,
          phone,
          providerReference: randomUUID(),
          idempotencyKey: params.idempotencyKey,
        },
      });
    } catch (error) {
      // The unique idempotency constraint is the concurrency guard when two
      // identical requests arrive before either can observe the other's row.
      if (params.idempotencyKey && error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const concurrentPayment = await findIdempotentPayment({ ...params, phone });
        if (concurrentPayment) return concurrentPayment;
      }
      throw error;
    }

    try {
      const accessToken = await getAccessToken(config);
      const response = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': config.subscriptionKey,
          'X-Target-Environment': config.targetEnvironment,
          'X-Reference-Id': payment.providerReference,
          'Content-Type': 'application/json',
          ...(config.callbackUrl ? { 'X-Callback-Url': config.callbackUrl } : {}),
        },
        body: JSON.stringify({
          amount: amount.toFixed(0),
          currency: config.currency,
          externalId: payment.id,
          payer: { partyIdType: 'MSISDN', partyId: phone },
          payerMessage: 'Range SMS wallet top-up',
          payeeNote: 'Range SMS wallet top-up',
        }),
        cache: 'no-store',
        signal: timeoutSignal(),
      });

      if (response.status === 202) return payment;
      // Keep uncertain server failures pending so a later status check can reconcile
      // requests that MTN accepted even if its response was lost.
      if (response.status >= 500 || response.status === 429) return payment;
      await prisma.momoPayment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', providerStatus: `HTTP_${response.status}`, failureReason: 'MTN rejected the payment request' },
      });
      throw new Error('MTN could not start the payment. Check the number and try again.');
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('MTN could not start')) throw error;
      // Network/time-out failures are ambiguous; leave the record pending and allow
      // status polling using the generated provider reference.
      return payment;
    }
  },

  async checkStatus(paymentId: string, userId: string) {
    const config = getConfig();
    if (!config) throw new Error('MTN Mobile Money top-ups are not configured yet');
    const payment = await prisma.momoPayment.findFirst({ where: { id: paymentId, userId } });
    if (!payment) return null;
    if (payment.status !== 'PENDING') return payment;

    const accessToken = await getAccessToken(config);
    const response = await fetch(
      `${config.baseUrl}/collection/v1_0/requesttopay/${encodeURIComponent(payment.providerReference)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': config.subscriptionKey,
          'X-Target-Environment': config.targetEnvironment,
        },
        cache: 'no-store',
        signal: timeoutSignal(),
      },
    );
    if (!response.ok) throw new Error('Payment status is temporarily unavailable; try again shortly');
    const body = await response.json() as ProviderStatus;
    const status = mapStatus(body.status);
    if (status === 'PENDING') {
      if (body.status && typeof body.status === 'string') {
        await prisma.momoPayment.updateMany({
          where: { id: payment.id, status: 'PENDING' },
          data: { providerStatus: body.status },
        });
      }
      return { ...payment, providerStatus: body.status ?? payment.providerStatus };
    }

    if (status === 'FAILED') {
      await prisma.momoPayment.updateMany({
        where: { id: payment.id, status: 'PENDING' },
        data: {
          status: 'FAILED',
          providerStatus: body.status,
          failureReason: body.reason?.message || body.reason?.code || 'Payment was not completed',
          completedAt: new Date(),
        },
      });
      return prisma.momoPayment.findUnique({ where: { id: payment.id } });
    }

    let amountMatches = false;
    try {
      amountMatches = typeof body.amount === 'string' && new Prisma.Decimal(body.amount).equals(payment.amount);
    } catch {
      amountMatches = false;
    }
    if (!amountMatches || body.currency !== payment.currency || body.externalId !== payment.id) {
      await prisma.momoPayment.updateMany({
        where: { id: payment.id, status: 'PENDING' },
        data: {
          status: 'FAILED',
          providerStatus: body.status,
          failureReason: 'Provider payment details did not match the request; manual review is required',
          completedAt: new Date(),
        },
      });
      return prisma.momoPayment.findUnique({ where: { id: payment.id } });
    }

    // Re-read under the wallet row lock and credit only while the durable payment
    // remains pending. This makes concurrent polls and retries safe.
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "MomoPayment" WHERE id = ${payment.id} FOR UPDATE`;
      const current = await tx.momoPayment.findUnique({ where: { id: payment.id } });
      if (!current || current.status !== 'PENDING') return current;
      const walletRows = await tx.$queryRaw<{ balance: Prisma.Decimal }[]>`
        SELECT balance FROM "Wallet" WHERE id = ${current.walletId} FOR UPDATE
      `;
      const wallet = walletRows[0];
      if (!wallet) throw new Error('Wallet not found');
      const balanceBefore = new Prisma.Decimal(wallet.balance);
      const balanceAfter = balanceBefore.plus(current.amount);
      const transactionRef = generateTransactionReference();
      const transaction = await tx.transaction.create({
        data: {
          walletId: current.walletId,
          userId: current.userId,
          type: 'DEPOSIT',
          amount: current.amount,
          balanceBefore,
          balanceAfter,
          currency: current.currency,
          reference: transactionRef,
          description: 'Wallet top-up via MTN Mobile Money',
          paymentMethod: 'MTN_MOMO',
          paymentRef: body.financialTransactionId || current.providerReference,
          idempotencyKey: `momo-${current.id}`,
        },
      });
      await tx.wallet.update({ where: { id: current.walletId }, data: { balance: balanceAfter, lastTopUpAt: new Date() } });
      await tx.momoPayment.update({
        where: { id: current.id },
        data: {
          status: 'SUCCESSFUL',
          providerStatus: body.status,
          transactionId: transaction.id,
          completedAt: new Date(),
        },
      });
      return tx.momoPayment.findUnique({ where: { id: current.id } });
    });
  },
};
