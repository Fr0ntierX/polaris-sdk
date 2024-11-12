import { EphemeralBrowserKeyHandler } from "./browser";
import { EphemeralNodeKeyHandler } from "./node";

import type { KeyHandler } from "../../types";

export class EphemeralKeyHandler implements KeyHandler {
  private readonly keyHandlerImplementation: KeyHandler;

  constructor() {
    if (typeof window !== "undefined") {
      this.keyHandlerImplementation = new EphemeralBrowserKeyHandler();
    } else {
      this.keyHandlerImplementation = new EphemeralNodeKeyHandler();
    }
  }

  async getPublicKey(): Promise<string> {
    return await this.keyHandlerImplementation.getPublicKey();
  }

  async unwrapKey(wrappedKey: Buffer): Promise<Buffer> {
    return await this.keyHandlerImplementation.unwrapKey(wrappedKey);
  }
}
