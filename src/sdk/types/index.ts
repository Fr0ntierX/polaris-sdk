export interface PolarisSDKInterface {
  /**
   * Get the public key of the confgured key service
   * @returns The public key in PEM format
   */
  getPublicKey(): Promise<string>;

  /**
   * Wrap a symmetric encryption key or IV with a given public key.
   *
   * PCKS1 padding is used with a sha256 hash.
   *
   * @param key The key to wrap as Buffer
   * @param publicKey The public key to wrap the key with
   * @returns The wrapped key as Buffer
   */
  wrapKey(key: Buffer, publicKey: string): Promise<Buffer>;

  /**
   * Unwrap a symmetric encryption key or IV with the configured private key
   *
   * @param key The key to unwrap as Buffer
   * @returns The unwrapped key as Buffer
   */
  unwrapKey(wrappedKey: Buffer): Promise<Buffer>;

  /**
   * Encrypt data
   *
   * @param data Data to encrypt
   * @param publicKey Public key used to wrap the encryption key with
   * @returns The encrypted message as buffer
   */
  encrypt(data: Buffer, publicKey: string): Promise<Buffer>;

  /**
   * Decrypt data
   *
   * @param message Encrypted message
   * @returns The decrypted data
   */
  decrypt(message: Buffer): Promise<Buffer>;
}
