export interface AESEncryptionData {
  /** The encrypted data ciphertext */
  ciphertext: Buffer;

  /** The encryption auth tag */
  authTag: Buffer;

  /** The encryption key */
  key: Buffer;

  /** The IV */
  iv: Buffer;
}
