import type { AESEncryptionData } from "./types";

export abstract class CryptoProvider {
  abstract wrapKey(key: Buffer, publicKey: string): Promise<Buffer>;

  abstract encryptWithRandomKey(data: Buffer): Promise<AESEncryptionData>;

  abstract decryptData(params: AESEncryptionData): Promise<Buffer>;
}
