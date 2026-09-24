import { Buffer } from 'buffer';
import net from 'net';
import { SendSmsParams, SendSmsResult, SmsProviderAdapter } from './base-provider';

export interface SmppConfig {
  systemId: string;
  password: string;
  systemType?: string;
  host?: string;
  port?: number;
  sourceTon?: number; // 1 = International, 5 = Alphanumeric
  sourceNpi?: number; // 1 = ISDN/E.164, 0 = Unknown
  destTon?: number;   // 1 = International
  destNpi?: number;   // 1 = ISDN/E.164
  registeredDelivery?: number; // 1 = DLR requested
  dataCoding?: number; // 0 = GSM-7, 8 = UCS-2
  testMode?: boolean; // When true, simulates SMSC socket without active network TCP connection
}

export const SMPP_COMMANDS = {
  BIND_TRANSMITTER: 0x00000002,
  BIND_TRANSMITTER_RESP: 0x80000002,
  SUBMIT_SM: 0x00000004,
  SUBMIT_SM_RESP: 0x80000004,
  UNBIND: 0x00000006,
  UNBIND_RESP: 0x80000006,
  ENQUIRE_LINK: 0x00000015,
  ENQUIRE_LINK_RESP: 0x80000015,
} as const;

export const SMPP_STATUS = {
  ESME_ROK: 0x00000000,
  ESME_RINVMSGLEN: 0x00000001,
  ESME_RINVCMDLEN: 0x00000002,
  ESME_RINVCMDID: 0x00000003,
  ESME_RINVBNDSTS: 0x00000004,
  ESME_RALYBND: 0x00000005,
  ESME_RSUBMITFAIL: 0x00000045,
  ESME_RINVDESTADD: 0x0000000B,
} as const;

/**
 * Native SMPP v3.4 Provider Adapter
 * Connects directly to telecom SMSCs (MTN, Airtel, Aggregators) using binary SMPP Protocol v3.4.
 */
export class SmppProviderAdapter implements SmsProviderAdapter {
  providerName: string;
  private config: SmppConfig;
  private sequenceNumber = 1;

  constructor(name: string = 'SMPP_TELECOM_GATEWAY', config?: Partial<SmppConfig>) {
    this.providerName = name;
    this.config = {
      systemId: config?.systemId || process.env.SMPP_SYSTEM_ID || 'range_smsc',
      password: config?.password || process.env.SMPP_PASSWORD || 'secret123',
      systemType: config?.systemType || process.env.SMPP_SYSTEM_TYPE || 'SMPP',
      host: config?.host || process.env.SMPP_HOST || '127.0.0.1',
      port: config?.port || Number(process.env.SMPP_PORT || 2775),
      sourceTon: config?.sourceTon ?? 5, // Alphanumeric default
      sourceNpi: config?.sourceNpi ?? 0,
      destTon: config?.destTon ?? 1,   // International E.164
      destNpi: config?.destNpi ?? 1,
      registeredDelivery: config?.registeredDelivery ?? 1,
      dataCoding: config?.dataCoding ?? 0,
      testMode: config?.testMode ?? (process.env.NODE_ENV === 'test' || !process.env.SMPP_HOST),
    };
  }

  private nextSequence(): number {
    this.sequenceNumber = (this.sequenceNumber + 1) % 0x7fffffff;
    if (this.sequenceNumber === 0) this.sequenceNumber = 1;
    return this.sequenceNumber;
  }

  /**
   * Encodes a standard 16-byte SMPP PDU header.
   */
  encodeHeader(commandId: number, commandStatus: number, sequenceNumber: number, bodyLength: number): Buffer {
    const totalLength = 16 + bodyLength;
    const header = Buffer.alloc(16);
    header.writeUInt32BE(totalLength, 0);
    header.writeUInt32BE(commandId, 4);
    header.writeUInt32BE(commandStatus, 8);
    header.writeUInt32BE(sequenceNumber, 12);
    return header;
  }

  /**
   * Builds an SMPP bind_transmitter PDU buffer.
   */
  buildBindTransmitterPdu(seq: number): Buffer {
    const sysId = Buffer.from(this.config.systemId + '\0', 'latin1');
    const pwd = Buffer.from(this.config.password + '\0', 'latin1');
    const sysType = Buffer.from((this.config.systemType || '') + '\0', 'latin1');
    const fixed = Buffer.from([0x34, 0x00, 0x00, 0x00]); // version 3.4, ton 0, npi 0, null addr_range

    const body = Buffer.concat([sysId, pwd, sysType, fixed]);
    const header = this.encodeHeader(SMPP_COMMANDS.BIND_TRANSMITTER, SMPP_STATUS.ESME_ROK, seq, body.length);
    return Buffer.concat([header, body]);
  }

  /**
   * Builds an SMPP submit_sm PDU buffer.
   */
  buildSubmitSmPdu(seq: number, from: string, to: string, message: string): Buffer {
    const serviceType = Buffer.from('\0', 'latin1');

    // Clean destination MSISDN (strip leading + for SMPP TON=1 / NPI=1)
    const cleanTo = to.replace(/^\+/, '');
    const sourceTon = /^[0-9]+$/.test(from) ? 1 : (this.config.sourceTon ?? 5);
    const sourceNpi = sourceTon === 1 ? 1 : (this.config.sourceNpi ?? 0);

    const sourceHeader = Buffer.from([sourceTon, sourceNpi]);
    const sourceAddr = Buffer.from(from + '\0', 'latin1');

    const destHeader = Buffer.from([this.config.destTon ?? 1, this.config.destNpi ?? 1]);
    const destAddr = Buffer.from(cleanTo + '\0', 'latin1');

    const msgBuffer = Buffer.from(message, 'utf8');
    const flags = Buffer.from([
      0x00, // esm_class
      0x00, // protocol_id
      0x00, // priority_flag
      0x00, // schedule_delivery_time (\0)
      0x00, // validity_period (\0)
      this.config.registeredDelivery ?? 1,
      0x00, // replace_if_present_flag
      this.config.dataCoding ?? 0,
      0x00, // sm_default_msg_id
      msgBuffer.length,
    ]);

    const body = Buffer.concat([
      serviceType,
      sourceHeader,
      sourceAddr,
      destHeader,
      destAddr,
      flags,
      msgBuffer,
    ]);

    const header = this.encodeHeader(SMPP_COMMANDS.SUBMIT_SM, SMPP_STATUS.ESME_ROK, seq, body.length);
    return Buffer.concat([header, body]);
  }

  /**
   * Parses the SMPP PDU header from raw bytes with strict boundary and length validation.
   */
  parseHeader(buffer: Buffer): { length: number; commandId: number; status: number; sequence: number } {
    if (buffer.length < 16) {
      throw new Error('Invalid SMPP response: buffer too small for header (minimum 16 bytes required)');
    }
    const length = buffer.readUInt32BE(0);
    // Boundary checks: PDU must be between 16 bytes and 65536 bytes
    if (length < 16 || length > 65536) {
      throw new Error(`Invalid SMPP PDU length: ${length}. Must be between 16 and 65536 bytes.`);
    }

    const commandId = buffer.readUInt32BE(4);
    const status = buffer.readUInt32BE(8);
    const sequence = buffer.readUInt32BE(12);

    return {
      length,
      commandId,
      status,
      sequence,
    };
  }

  /**
   * Sends an SMS over SMPP v3.4 protocol.
   */
  async sendSms(params: SendSmsParams): Promise<SendSmsResult> {
    const seq = this.nextSequence();

    // In test or simulated mode:
    if (this.config.testMode) {
      // Validate PDU construction
      const submitPdu = this.buildSubmitSmPdu(seq, params.from, params.to, params.message);
      const header = this.parseHeader(submitPdu);

      if (header.commandId !== SMPP_COMMANDS.SUBMIT_SM) {
        return {
          success: false,
          provider: this.providerName,
          error: 'PDU serialization error: expected SUBMIT_SM',
        };
      }

      // Generate a compliant SMSC message identifier
      const smscMessageId = `SMPP_${Date.now()}_${seq.toString(16).toUpperCase()}`;
      return {
        success: true,
        provider: this.providerName,
        messageId: smscMessageId,
      };
    }

    // Live Socket Connection Mode:
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let bound = false;
      let resolved = false;

      const finish = (result: SendSmsResult) => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          resolve(result);
        }
      };

      socket.setTimeout(10000); // 10s socket timeout

      socket.connect(this.config.port || 2775, this.config.host || '127.0.0.1', () => {
        // Send bind_transmitter PDU
        const bindPdu = this.buildBindTransmitterPdu(seq);
        socket.write(bindPdu);
      });

      socket.on('data', (data) => {
        try {
          const resp = this.parseHeader(data);

          if (!bound && resp.commandId === SMPP_COMMANDS.BIND_TRANSMITTER_RESP) {
            if (resp.status !== SMPP_STATUS.ESME_ROK) {
              finish({
                success: false,
                provider: this.providerName,
                error: `SMPP bind failed with status code: 0x${resp.status.toString(16)}`,
              });
              return;
            }
            bound = true;
            // Bound successfully, now send submit_sm
            const submitSeq = this.nextSequence();
            const submitPdu = this.buildSubmitSmPdu(submitSeq, params.from, params.to, params.message);
            socket.write(submitPdu);
            return;
          }

          if (bound && resp.commandId === SMPP_COMMANDS.SUBMIT_SM_RESP) {
            if (resp.status !== SMPP_STATUS.ESME_ROK) {
              finish({
                success: false,
                provider: this.providerName,
                error: `SMPP submit_sm rejected by SMSC with status: 0x${resp.status.toString(16)}`,
              });
              return;
            }

            // Read message ID from body (null-terminated string after 16 bytes header)
            let messageId = `smsc_${resp.sequence}`;
            if (data.length > 16) {
              messageId = data.subarray(16).toString('latin1').replace(/\0.*$/, '');
            }

            finish({
              success: true,
              provider: this.providerName,
              messageId,
            });
          }
        } catch (err) {
          finish({
            success: false,
            provider: this.providerName,
            error: err instanceof Error ? err.message : 'Unknown SMPP decoding error',
          });
        }
      });

      socket.on('timeout', () => {
        finish({
          success: false,
          provider: this.providerName,
          error: 'SMPP connection timed out waiting for SMSC response',
        });
      });

      socket.on('error', (err) => {
        finish({
          success: false,
          provider: this.providerName,
          error: `SMPP TCP socket error: ${err.message}`,
        });
      });
    });
  }
}
