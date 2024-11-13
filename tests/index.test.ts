import { EphemeralKeyHandler, PolarisSDK } from "../src";

describe("Encrypt/Decrypt", () => {
  it("should encrypt and decrypt to the same message with node ephimeral key", async () => {
    const message = "Test message";

    const polarisSDK = new PolarisSDK(new EphemeralKeyHandler());
    const publicKey = await polarisSDK.getPublicKey();

    const encryptedMessage = await polarisSDK.encrypt(Buffer.from(message), publicKey);
    const decryptedMessage = await polarisSDK.decrypt(encryptedMessage);

    expect(decryptedMessage.toString()).toBe(message);
  });
});
