import crypto from "crypto";

import type { KeyHandler } from "../../../types";

export class EphemeralNodeKeyHandler implements KeyHandler {
  private readonly privateKey;

  private readonly publicKey;

  constructor() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  async getPublicKey(): Promise<string> {
    return this.publicKey;
  }

  async unwrapKey(wrappedKey: Buffer): Promise<Buffer> {
    return crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      wrappedKey
    );
  }
}
