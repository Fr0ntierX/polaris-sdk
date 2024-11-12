import { Buffer } from "buffer";

import type { KeyHandler } from "../../../types";

export class EphemeralBrowserKeyHandler implements KeyHandler {
  private keyPair: CryptoKeyPair | undefined;

  constructor() {}

  private async getKeyPair(): Promise<CryptoKeyPair> {
    if (!this.keyPair) {
      this.keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );
    }

    return this.keyPair;
  }

  async getPublicKey(): Promise<string> {
    const keyPair = await this.getKeyPair();

    const exported = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const exportedAsBase64 = Buffer.from(exported).toString("base64");
    const exportedAsBase64WithNewLines = exportedAsBase64.match(/.{1,64}/g)?.join("\n");

    return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64WithNewLines}\n-----END PUBLIC KEY-----`;
  }

  async unwrapKey(wrappedKey: Buffer): Promise<Buffer> {
    const keyPair = await this.getKeyPair();

    // Unwrap the key using the private key
    const unwrappedKey = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      keyPair.privateKey,
      wrappedKey
    );

    // Convert the unwrapped key to a base64 string
    return Buffer.from(unwrappedKey);
  }
}
