import type { AESEncryptionData, AESKey, EncryptedData } from "./types";

export abstract class CryptoProvider {
  abstract wrapKey(key: Buffer, publicKey: string): Promise<Buffer>;

  abstract encryptWithRandomKey(data: Buffer): Promise<AESEncryptionData>;

  abstract decryptData(params: AESEncryptionData): Promise<Buffer>;

  /* aes key re-use */

  abstract createRandomAESKey(): Promise<AESKey>;

  abstract encryptWithPresetKey(data: Buffer | ArrayBuffer, aesKey: AESKey): Promise<Buffer | ArrayBuffer>;

  abstract decryptWithPresetKey(data: Buffer | ArrayBuffer, aesKey: AESKey): Promise<Buffer | ArrayBuffer>;
}
