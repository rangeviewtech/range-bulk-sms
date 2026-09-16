import bcrypt from 'bcryptjs';
import * as argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith('$argon2')) {
    return await argon2.verify(hash, password);
  } else if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    // Legacy bcrypt hash
    return await bcrypt.compare(password, hash);
  }
  return false;
}

export function needsRehash(hash: string): boolean {
  return !hash.startsWith('$argon2');
}
