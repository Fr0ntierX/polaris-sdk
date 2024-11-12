import { Buffer } from "buffer";

import { CryptoProvider } from "../..";

import type { AESEncryptionData } from "../../types";

export class CryptoProviderBrowser extends CryptoProvider {
  private static async importPublicKey(pemKey: string): Promise<CryptoKey> {
    // Remove the PEM header and footer
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pemKey.replace(pemHeader, "").replace(pemFooter, "").replace(/\s+/g, "");

    // Decode the base64 string to an ArrayBuffer
    const binaryDer = Buffer.from(pemContents, "base64");

    // Import the ArrayBuffer as a public key
    return window.crypto.subtle.importKey(
      "spki",
      binaryDer.buffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );
  }

  async wrapKey(key: Buffer, publicKey: string): Promise<Buffer> {
    const publicKeyObject = await CryptoProviderBrowser.importPublicKey(publicKey);

    // Wrap the key using the public key
    const wrappedKey = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKeyObject,
      key
    );

    // Convert the wrapped key to a base64 string
    return Buffer.from(wrappedKey);
  }

  async encryptWithRandomKey(data: Buffer): Promise<AESEncryptionData> {
    // Generate new AEW encryption key and IV
    const key = await window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      data
    );

    // Split the ciphertext and the auth tag
    const authTag = Buffer.from(encryptedData.slice(encryptedData.byteLength - 16));
    const ciphertext = Buffer.from(encryptedData.slice(0, encryptedData.byteLength - 16));

    // Get the header
    const exportedKey = Buffer.from(await window.crypto.subtle.exportKey("raw", key));

    return {
      ciphertext,
      authTag,
      key: exportedKey,
      iv: Buffer.from(iv),
    };
  }

  async decryptData({ ciphertext, authTag, key, iv }: AESEncryptionData): Promise<Buffer> {
    const keyObject = await window.crypto.subtle.importKey("raw", key, "AES-GCM", true, ["decrypt"]);

    const dataToDecrypt = Buffer.concat([ciphertext, authTag]);

    // Decrypt the data
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
        tagLength: 128,
      },
      keyObject,
      dataToDecrypt
    );

    return Buffer.from(decrypted);
  }
}
