/**
 * Sandbox Execution Engine for Range Bulk SMS Public API
 * Provides isolated, deterministic test responses without real wallet deductions
 * or upstream carrier dispatch.
 */

export interface SandboxCheckOptions {
  headers?: Headers;
  recipients?: string[];
  apiKey?: string;
}

export const DETERMINISTIC_TEST_NUMBERS = {
  DELIVERED: '+999000000001',
  REJECTED: '+999000000002',
  UNDELIVERED: '+999000000003',
  INSUFFICIENT_BALANCE: '+999000000004',
  INVALID_SENDER: '+999000000005',
  QUEUED_THEN_DELIVERED: '+999000000006',
} as const;

export function isSandboxRequest(options: SandboxCheckOptions): boolean {
  if (options.headers) {
    const env = options.headers.get('x-environment')?.toLowerCase();
    const sandboxHeader = options.headers.get('x-sandbox')?.toLowerCase();
    if (env === 'sandbox' || sandboxHeader === 'true' || sandboxHeader === '1') {
      return true;
    }
  }

  if (options.apiKey) {
    if (options.apiKey.startsWith('rsms_test_') || options.apiKey.startsWith('sms_test_')) {
      return true;
    }
  }

  if (options.recipients && options.recipients.length > 0) {
    const hasTestNumber = options.recipients.some((r) => r.startsWith('+999'));
    if (hasTestNumber) {
      return true;
    }
  }

  return false;
}

export interface SandboxSmsResult {
  isSandbox: true;
  status: number;
  body: Record<string, unknown>;
}

export function handleDeterministicSms(recipients: string[], senderId?: string): SandboxSmsResult | null {
  const primaryRecipient = recipients[0] || '';

  // Check deterministic failure numbers first
  if (primaryRecipient === DETERMINISTIC_TEST_NUMBERS.INSUFFICIENT_BALANCE) {
    return {
      isSandbox: true,
      status: 402,
      body: {
        type: 'https://docs.rangesms.com/errors/insufficient-balance',
        title: 'Insufficient account balance',
        status: 402,
        detail: 'Sandbox account simulated insufficient balance for this request.',
        instance: `/v1/messages/msg_test_${Date.now()}`,
        code: 'insufficient_balance',
        requestId: `req_test_${crypto.randomUUID().slice(0, 8)}`,
      },
    };
  }

  if (primaryRecipient === DETERMINISTIC_TEST_NUMBERS.INVALID_SENDER || senderId === 'INVALID') {
    return {
      isSandbox: true,
      status: 400,
      body: {
        type: 'https://docs.rangesms.com/errors/invalid-sender',
        title: 'Invalid or unapproved sender ID',
        status: 400,
        detail: `The sender ID '${senderId || 'UNKNOWN'}' is not registered or approved.`,
        code: 'invalid_sender',
        requestId: `req_test_${crypto.randomUUID().slice(0, 8)}`,
      },
    };
  }

  let messageStatus = 'QUEUED';
  if (primaryRecipient === DETERMINISTIC_TEST_NUMBERS.DELIVERED) {
    messageStatus = 'DELIVERED';
  } else if (primaryRecipient === DETERMINISTIC_TEST_NUMBERS.REJECTED) {
    messageStatus = 'REJECTED';
  } else if (primaryRecipient === DETERMINISTIC_TEST_NUMBERS.UNDELIVERED) {
    messageStatus = 'UNDELIVERED';
  }

  const messageId = `msg_test_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;

  return {
    isSandbox: true,
    status: 201,
    body: {
      success: true,
      sandbox: true,
      messageId,
      status: messageStatus,
      recipientCount: recipients.length,
      cost: 0,
      currency: 'UGX',
      timestamp: new Date().toISOString(),
      note: 'Simulated sandbox dispatch. No carrier network reached and no wallet charges incurred.',
    },
  };
}
