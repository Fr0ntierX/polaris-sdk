import { EphemeralKeyHandler, PolarisSDK } from "../src";
import { createChunkedStream, DecryptStream, EncryptStream, readChunkedStream } from "../src/interceptors/axios/utils";

describe("Encrypt/Decrypt", () => {
  it("should encrypt and decrypt to the same message with node ephimeral key", async () => {
    const message = "Test message";

    const polarisSDK = new PolarisSDK(new EphemeralKeyHandler());
    const publicKey = await polarisSDK.getPublicKey();

    const encryptedMessage = await polarisSDK.encrypt(Buffer.from(message), publicKey);
    const decryptedMessage = await polarisSDK.decrypt(encryptedMessage);

    expect(decryptedMessage.toString()).toBe(message);
  });

  it("should encrypt and decrypt to the same streamed message with node ephimeral key", async () => {
    // 20 KB buffer filled with 'A'
    const message = Buffer.alloc(20 * 1024, "A");

    // Stream with 1 KB chunks
    const stream = createChunkedStream(message, 1024);

    const polarisSDK = new PolarisSDK(new EphemeralKeyHandler());

    // Polaris Stream Encrypt
    const streamEncryptor = new EncryptStream(polarisSDK);
    const encryptedStream = stream.pipe(streamEncryptor);

    // Polaris Stream Decrypt
    const streamDecryptor = new DecryptStream(polarisSDK);
    const decryptedStream = encryptedStream.pipe(streamDecryptor);

    // Collect Result
    const result = await readChunkedStream(decryptedStream);

    // Should be the Same as the large Streamed Message
    expect(result).toEqual(message);
  });
});
