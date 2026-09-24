import { SendSmsParams, SendSmsResult, SmsProviderAdapter } from "./base-provider";

export class MockProviderAdapter implements SmsProviderAdapter {
  providerName: string;

  constructor(name: string = "MOCK_PROVIDER") {
    this.providerName = name;
  }

  async sendSms(_params: SendSmsParams): Promise<SendSmsResult> {
    // Simulate network latency (50ms - 200ms)
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));

    // Simulate 95% success rate
    const isSuccess = Math.random() > 0.05;

    if (isSuccess) {
      return {
        success: true,
        provider: this.providerName,
        messageId: `mock_${Math.random().toString(36).substring(2, 15)}`,
      };
    } else {
      return {
        success: false,
        provider: this.providerName,
        error: "Simulated network failure or carrier rejection",
      };
    }
  }
}
