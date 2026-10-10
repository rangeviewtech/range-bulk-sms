import { Prisma } from '@/lib/prisma';
import { countSms } from '@/lib/sms/counter';
import { analyzePhone } from '@/lib/sms/phone-analyzer';
import { PricingEngine } from '@/lib/wallet/pricing';

export class InvalidSmsRecipientsError extends Error {
  constructor(public readonly invalidRecipients: Array<{ index: number; reason: string }>) {
    super('One or more recipients have an invalid telephone number.');
    this.name = 'InvalidSmsRecipientsError';
  }
}

export async function quoteSms(params: {
  recipients: string[];
  message: string;
  clientId?: string;
}) {
  const { segments, encoding } = countSms(params.message);
  const analyzed = params.recipients.map((phone) => analyzePhone(phone));
  const invalidRecipients = analyzed
    .map((analysis, index) => ({ analysis, index }))
    .filter(({ analysis }) => analysis.validity !== 'valid_pattern' || !analysis.e164)
    .map(({ analysis, index }) => ({ index, reason: analysis.error || 'Invalid telephone number' }));

  if (invalidRecipients.length > 0) {
    throw new InvalidSmsRecipientsError(invalidRecipients);
  }

  let totalCost = new Prisma.Decimal(0);
  let totalUnits = 0;
  const pricingCache = new Map<string, Prisma.Decimal>();
  const recipientDetails = [] as Array<{ phone: string; units: number; cost: Prisma.Decimal }>;

  for (const [index, phone] of params.recipients.entries()) {
    const countryCode = analyzed[index]?.country?.calling_code
      ? `+${analyzed[index].country.calling_code}`
      : '+256';
    let costPerUnit = pricingCache.get(countryCode);
    if (!costPerUnit) {
      const price = await PricingEngine.getPrice({ countryCode, clientId: params.clientId });
      costPerUnit = price.sellingPrice;
      pricingCache.set(countryCode, costPerUnit);
    }

    const cost = costPerUnit.mul(segments);
    totalCost = totalCost.plus(cost);
    totalUnits += segments;
    recipientDetails.push({ phone, units: segments, cost });
  }

  return { segments, encoding, totalCost, totalUnits, recipientDetails };
}
