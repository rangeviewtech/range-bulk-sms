import { describe, it, expect } from 'vitest';
import { SmppProviderAdapter, SMPP_COMMANDS, SMPP_STATUS } from '@/lib/sms/providers/smpp-provider';

describe('SMPP v3.4 Provider Adapter Domain', () => {
  const adapter = new SmppProviderAdapter('MTN_UGANDA_SMPP', {
    systemId: 'range_view_esme',
    password: 'secure_smpp_pwd',
    systemType: 'SMPP',
    testMode: true,
  });

  it('correctly constructs a 16-byte SMPP PDU header', () => {
    const header = adapter.encodeHeader(
      SMPP_COMMANDS.SUBMIT_SM,
      SMPP_STATUS.ESME_ROK,
      42,
      20
    );

    expect(header.length).toBe(16);
    expect(header.readUInt32BE(0)).toBe(36); // total length = 16 + 20
    expect(header.readUInt32BE(4)).toBe(SMPP_COMMANDS.SUBMIT_SM);
    expect(header.readUInt32BE(8)).toBe(SMPP_STATUS.ESME_ROK);
    expect(header.readUInt32BE(12)).toBe(42);
  });

  it('parses valid SMPP headers accurately', () => {
    const raw = Buffer.alloc(16);
    raw.writeUInt32BE(16, 0);
    raw.writeUInt32BE(SMPP_COMMANDS.ENQUIRE_LINK, 4);
    raw.writeUInt32BE(SMPP_STATUS.ESME_ROK, 8);
    raw.writeUInt32BE(99, 12);

    const parsed = adapter.parseHeader(raw);
    expect(parsed.length).toBe(16);
    expect(parsed.commandId).toBe(SMPP_COMMANDS.ENQUIRE_LINK);
    expect(parsed.status).toBe(SMPP_STATUS.ESME_ROK);
    expect(parsed.sequence).toBe(99);
  });

  it('builds a valid bind_transmitter PDU', () => {
    const pdu = adapter.buildBindTransmitterPdu(1);
    expect(pdu.length).toBeGreaterThan(16);

    const parsed = adapter.parseHeader(pdu);
    expect(parsed.commandId).toBe(SMPP_COMMANDS.BIND_TRANSMITTER);
    expect(parsed.sequence).toBe(1);

    // Verify systemId is encoded in body
    const bodyStr = pdu.subarray(16).toString('latin1');
    expect(bodyStr).toContain('range_view_esme');
    expect(bodyStr).toContain('secure_smpp_pwd');
  });

  it('builds a valid submit_sm PDU with short message payload', () => {
    const message = 'Hello from Range Bulk SMS via SMPP!';
    const pdu = adapter.buildSubmitSmPdu(2, 'RangeSMS', '+256772123456', message);

    const parsed = adapter.parseHeader(pdu);
    expect(parsed.commandId).toBe(SMPP_COMMANDS.SUBMIT_SM);
    expect(parsed.sequence).toBe(2);

    // Verify message text is embedded
    const bodyStr = pdu.subarray(16).toString('utf8');
    expect(bodyStr).toContain('RangeSMS');
    expect(bodyStr).toContain('256772123456');
    expect(bodyStr).toContain(message);
  });

  it('dispatches SMS through SMPP test mode successfully', async () => {
    const result = await adapter.sendSms({
      from: 'RangeSMS',
      to: '+256772000111',
      message: 'Your verification code is 492810',
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe('MTN_UGANDA_SMPP');
    expect(result.messageId).toMatch(/^SMPP_/);
  });
});
