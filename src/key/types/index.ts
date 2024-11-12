export interface KeyHandler {
  /**
   * Get the public key of the confgured key service
   */
  getPublicKey(): Promise<string>;

  /**
   * Unwrap a symmetric encryption key with the configured private key
   *
   * @param key The key to unwrap as Buffer
   * @returns The unwrapped key as Buffer
   */
  unwrapKey(wrappedKey: Buffer): Promise<Buffer>;
}
