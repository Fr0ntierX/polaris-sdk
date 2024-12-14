import { CryptoProviderBrowser } from "../crypto/providers/browser";
import { CryptoProviderNode } from "../crypto/providers/node";

import type { PolarisSDKInterface } from "./types";
import type { CryptoProvider } from "../crypto";
import type { AESEncryptionData, AESKey } from "../crypto/types";
import type { KeyHandler } from "../key/types";

export class PolarisSDK implements PolarisSDKInterface {
  // Key handler used to get access to the private key
  private readonly keyHandler: KeyHandler;

  // Crypto provider abstracting away node/browser specific crypto functions
  private readonly cryptoProvider: CryptoProvider;

  constructor(keyHandler: KeyHandler) {
    this.keyHandler = keyHandler;

    // Choose a crypto provider based on the environment
    if (typeof window !== "undefined") {
      this.cryptoProvider = new CryptoProviderBrowser();
    } else {
      this.cryptoProvider = new CryptoProviderNode();
    }
  }

  /**
   * Get the public key of the confgured key service
   * @returns The public key in PEM format
   */
  async getPublicKey(): Promise<string> {
    return await this.keyHandler.getPublicKey();
  }

  /**
   * Wrap a symmetric encryption key or IV with a given public key.
   *
   * PCKS1 padding is used with a sha256 hash.
   *
   * @param key The key to wrap as Buffer
   * @param publicKey The public key to wrap the key with
   * @returns The wrapped key as Buffer
   */
  async wrapKey(key: Buffer, publicKey: string): Promise<Buffer> {
    return this.cryptoProvider.wrapKey(key, publicKey);
  }

  /**
   * Unwrap a symmetric encryption key or IV with the configured private key
   *
   * @param key The key to unwrap as Buffer
   * @returns The unwrapped key as Buffer
   */
  async unwrapKey(wrappedKey: Buffer): Promise<Buffer> {
    return this.keyHandler.unwrapKey(wrappedKey);
  }

  /**
   * Generate a new random AES key for encryption purposes.
   *
   * This method creates a fresh AES key with a default key size, typically 256 bits, 
   * unless specified otherwise in the `cryptoProvider`.
   *
   * @returns An object conforming to the AESKey interface, containing the key and IV
   */
  async createRandomAESKey(): Promise<AESKey> {
    return this.cryptoProvider.createRandomAESKey()
  }

  /**
   * Encrypt data using a preset AES key.
   *
   * This method supports both Buffer and ArrayBuffer data types for input flexibility. 
   * It performs AES-GCM encryption by default, assuming the `AESKey` includes necessary 
   * parameters like IV (Initialization Vector).
   *
   * @param data The data to encrypt, can be either Buffer or ArrayBuffer
   * @param aesKey An AESKey object containing the encryption key and IV
   * @returns The encrypted data as either Buffer or ArrayBuffer, matching the input type
   */
  async encryptWithPresetKey(data: Buffer | ArrayBuffer, aesKey: AESKey): Promise<Buffer | ArrayBuffer> {
    return this.cryptoProvider.encryptWithPresetKey(data, aesKey);
  }

  /**
   * Decrypt data using a preset AES key.
   *
   * This method decrypts data that was previously encrypted with AES-GCM, using the 
   * provided AES key and IV. It supports decryption of both Buffer and ArrayBuffer 
   * data types.
   *
   * @param data The encrypted data to decrypt, can be either Buffer or ArrayBuffer
   * @param aesKey An AESKey object containing the decryption key and IV
   * @returns The decrypted data as either Buffer or ArrayBuffer, matching the input type
   */
  async decryptWithPresetKey(data: Buffer | ArrayBuffer, aesKey: AESKey): Promise<Buffer | ArrayBuffer> {
    return this.cryptoProvider.decryptWithPresetKey(data, aesKey);
  }

  /**
   * Encrypt data
   *
   * @param data Data to encrypt
   * @param publicKey Public key used to wrap the encryption key with
   * @returns The encrypted message as buffer
   */
  async encrypt(data: Buffer, publicKey: string): Promise<Buffer> {
    // Encrypt the data with new random key and IV
    const { ciphertext, authTag, key, iv } = await this.cryptoProvider.encryptWithRandomKey(data);

    // Create the encrypted message
    return await this.createEncrytedMessage({ ciphertext, authTag, key, iv }, publicKey);
  }

  /**
   * Decrypt data
   *
   * @param message Encrypted message
   * @returns The decrypted data
   */
  async decrypt(message: Buffer): Promise<Buffer> {
    // Parse the header
    const { key, iv, authTag, ciphertext } = await this.parseEncryptedMessage(message);

    // Decrypt the data
    return await this.cryptoProvider.decryptData({ ciphertext, authTag, key, iv });
  }

  private async createEncrytedMessage(
    { ciphertext, authTag, key, iv }: AESEncryptionData,
    publicKey: string
  ): Promise<Buffer> {
    // Create the header with the wrapped key and IV
    const header = JSON.stringify({
      wrappedKey: (await this.wrapKey(key, publicKey)).toString("base64"),
      wrappedIV: (await this.wrapKey(iv, publicKey)).toString("base64"),
      authTag: authTag.toString("base64"),
    });

    // Get the size of the header
    const headerSizeBuffer = Buffer.alloc(4);
    headerSizeBuffer.writeUInt32BE(Buffer.byteLength(header));

    // Combine the header size, the header and the ciphertext
    return Buffer.concat([headerSizeBuffer, Buffer.from(header), ciphertext]);
  }

  private async parseEncryptedMessage(message: Buffer): Promise<AESEncryptionData> {
    const headerLength = message.readUInt32BE(0);
    const { wrappedKey, wrappedIV, authTag } = JSON.parse(message.subarray(4, headerLength + 4).toString());

    // Unwrap the encryption key and IV
    const key = await this.unwrapKey(Buffer.from(wrappedKey, "base64"));
    const iv = await this.unwrapKey(Buffer.from(wrappedIV, "base64"));

    // Get the ciphertext
    const ciphertext = message.subarray(headerLength + 4);

    return { key, iv, authTag: Buffer.from(authTag, "base64"), ciphertext };
  }
}
