import { Readable, Transform } from "stream";

import axios from "axios";

import type { PolarisSDK } from "../../../sdk";

/**
 * Fetches the public key from a specified Polaris container URL.
 * @param containerUrl - The URL of the Polaris container.
 * @returns A promise that resolves to the public key as a string.
 * @throws An error if the public key is not found.
 */
export const getPublicKeyFromContainer = async (containerUrl: string): Promise<string> => {
  const { data } = await axios.get(`${containerUrl}/polaris-container/publicKey`);

  if (!data.publicKey) {
    throw new Error("The request URL is not a valid Polaris container");
  }

  return data.publicKey;
};

/**
 * A Transform stream that encrypts data using the Polaris SDK.
 */
export class EncryptStream extends Transform {
  private sdk: PolarisSDK;
  constructor(sdk: PolarisSDK) {
    super();
    this.sdk = sdk;
  }

  /**
   * Encrypts the given data.
   * @param data - The data to encrypt as a string.
   * @returns A promise that resolves to the encrypted data as a Buffer.
   * @throws An error if encryption fails.
   */
  async encrypt(data: string): Promise<Buffer> {
    try {
      const publicKey = await this.sdk.getPublicKey();
      return this.sdk.encrypt(Buffer.from(data), publicKey);
    } catch (error: any) {
      throw new Error(`Failed to encrypt data: ${error.message}`);
    }
  }

  /**
   * Transforms the input chunk by encrypting it.
   * @param chunk - The input data chunk as a Buffer.
   * @param encoding - The encoding type.
   * @param callback - The callback function to signal completion.
   */
  async _transform(chunk: Buffer, encoding: string, callback: Function) {
    try {
      const encryptedChunk = await this.encrypt(chunk.toString());
      this.push(encryptedChunk);
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

/**
 * A Transform stream that decrypts data using the Polaris SDK.
 */
export class DecryptStream extends Transform {
  private sdk: PolarisSDK;
  constructor(sdk: PolarisSDK) {
    super();
    this.sdk = sdk;
  }

  /**
   * Transforms the input chunk by decrypting it.
   * @param chunk - The input data chunk as a Buffer.
   * @param encoding - The encoding type.
   * @param callback - The callback function to signal completion.
   */
  async _transform(chunk: Buffer, encoding: string, callback: Function) {
    try {
      const decryptedChunk = await this.sdk.decrypt(chunk);
      this.push(decryptedChunk);
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

/**
 * Creates a chunked Readable stream from a Buffer.
 * @param buffer - The Buffer to create a stream from.
 * @param chunkSize - The size of each chunk (default is 1024 bytes).
 * @returns A Readable stream that emits chunks of the buffer.
 */
export function createChunkedStream(buffer: Buffer, chunkSize: number = 1024): Readable {
  let offset = 0;
  return new Readable({
    read(_size) {
      if (offset < buffer.length) {
        const end = Math.min(offset + chunkSize, buffer.length);
        this.push(Buffer.from(buffer.subarray(offset, end)));
        offset = end;
      } else {
        this.push(null); // Signal end of stream
      }
    },
  });
}

/**
 * Reads data from a chunked Readable stream and concatenates it into a single Buffer.
 * @param stream - The Readable stream to read from.
 * @returns A promise that resolves to a Buffer containing all the concatenated data.
 */
export async function readChunkedStream(stream: Readable) {
  return new Promise<Buffer>((res, _rej) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    stream.on("end", () => {
      res(Buffer.concat(chunks));
    });
    stream.on("error", (err: any) => {
      console.error("Stream error:", err);
    });
  });
}
