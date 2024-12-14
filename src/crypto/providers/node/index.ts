import crypto from "crypto";

import { CryptoProvider } from "../..";

import type { AESEncryptionData, AESKey } from "../../types";

export class CryptoProviderNode extends CryptoProvider {

  async createRandomAESKey(): Promise<AESKey> {
    return {
      key: crypto.randomBytes(32),
      iv: crypto.randomBytes(16)
    };
  }

  async encryptWithPresetKey(data: Buffer, aesKey: AESKey): Promise<Buffer> {
    const cipher = crypto.createCipheriv("aes-256-gcm", aesKey.key, aesKey.iv);
    const cipherText = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([cipherText, authTag]);
  }

  async decryptWithPresetKey(data: Buffer, aesKey: AESKey): Promise<Buffer> {
    const authTagLength = 16; // AES-GCM uses a 16-byte authentication tag
    if (data.length <= authTagLength) {
      throw new Error("Invalid data: too short to contain authTag and cipherText.");
    }
    // Separate cipherText and authTag
    const cipherText = data.subarray(0, data.length - authTagLength);
    const authTag = data.subarray(data.length - authTagLength);
    const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey.key, aesKey.iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(cipherText), decipher.final()]);
  }

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
