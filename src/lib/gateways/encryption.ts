import crypto from 'crypto';

export function deriveGatewayEncryptionKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret + "_E2EE_KEY").digest();
}

export function deriveGatewayMacKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret + "_E2EE_MAC").digest();
}

export function encryptGatewayPayload(payload: unknown, secret: string): string {
  const key = deriveGatewayEncryptionKey(secret);
  const macKey = deriveGatewayMacKey(secret);
  const iv = crypto.randomBytes(16); // CBC needs 16 bytes IV
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const jsonStr = JSON.stringify(payload);
  
  let ciphertext = cipher.update(jsonStr, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  
  // Encrypt-then-MAC
  const hmac = crypto.createHmac('sha256', macKey);
  hmac.update(iv.toString('hex') + ':' + ciphertext);
  const mac = hmac.digest('hex');
  
  return `${iv.toString('hex')}:${mac}:${ciphertext}`;
}

export function decryptGatewayPayload(encryptedString: string, secret: string): unknown {
  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) throw new Error('Invalid E2EE format');
    
    const [ivHex, macHex, ciphertextHex] = parts;
    
    const macKey = deriveGatewayMacKey(secret);
    const hmac = crypto.createHmac('sha256', macKey);
    hmac.update(ivHex + ':' + ciphertextHex);
    const expectedMac = hmac.digest('hex');
    
    // Constant-time compare
    if (!crypto.timingSafeEqual(Buffer.from(macHex, 'hex'), Buffer.from(expectedMac, 'hex'))) {
      throw new Error('MAC verification failed');
    }
    
    const key = deriveGatewayEncryptionKey(secret);
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (_error) {
    throw new Error('Decryption failed');
  }
}
