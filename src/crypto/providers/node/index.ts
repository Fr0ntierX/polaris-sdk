import crypto from "crypto";

import { CryptoProvider } from "../..";

import type { AESEncryptionData } from "../../types";

export class CryptoProviderNode extends CryptoProvider {
  async wrapKey(key: Buffer, publicKey: string): Promise<Buffer> {
    return crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      key
    );
  }

  async encryptWithRandomKey(data: Buffer): Promise<AESEncryptionData> {
    // Generate new AEW encryption key and IV
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // Encrypt the data
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);

    return {
      ciphertext,
      authTag: cipher.getAuthTag(),
      key,
      iv,
    };
  }

  async decryptData({ ciphertext, authTag, key, iv }: AESEncryptionData): Promise<Buffer> {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  }
}
