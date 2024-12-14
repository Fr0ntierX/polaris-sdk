import { Readable } from "stream";

import axios from "axios";

import { DecryptStream, EncryptStream, getPublicKeyFromContainer } from "./utils";

import type {
  CreateAxiosRequestInterceptorParams,
  CreateAxiosRequestInterceptorResponse,
  CreateAxiosResponseInterceptorParams,
  CreateAxiosResponseInterceptorResponse,
} from "./types";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { AESKey } from "../../crypto/types";

/**
 * Creates an Axios interceptor for encryption.
 * This function is designed to be used with Axios interceptors to encrypt request data before sending.
 * It encrypts the request path, headers, and body if they exist.
 *
 * @param {PolarisSDK} polarisSDK - The Polaris SDK instance.
 * @param {string} [publicKey] - The public key of the Polaris container.
 * @param {string} [polarisProxyBasePath] - The base path of the Polaris proxy.
 * @param {AESKey} aesKey - The Preset AESKey
 * @returns {CreateRequestInterceptorResponse} - A function that takes an Axios request configuration and returns a promise that resolves to the modified configuration.
 */
export const createAxiosRequestInterceptor = ({
  polarisSDK,
  publicKey,
  enableInputEncryption = true,
  enableOutputEncryption = true,
  polarisProxyBasePath = "",
  aesKey,
}: CreateAxiosRequestInterceptorParams): CreateAxiosRequestInterceptorResponse => {
  return async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {


    // Add the public key for the response encryption if output encryption is used
    if (enableOutputEncryption) {
      config.headers["polaris-response-public-key"] = Buffer.from(await polarisSDK.getPublicKey()).toString("base64");
      if (aesKey) {
        const pubKey = Buffer.from(publicKey as string, "base64").toString();
        const wrappedKey = await polarisSDK.wrapKey(aesKey.key, pubKey);
        const wrappedKeyB64 = wrappedKey.toString("base64");
        const wrappedIv = await polarisSDK.wrapKey(aesKey.iv, pubKey);
        const wrappedIvB64 = wrappedIv.toString("base64");
        const wrappedKeyIV = `${wrappedKeyB64}:${wrappedIvB64}`;
        config.headers["polaris-response-wrapped-key"] = wrappedKeyIV;
      }
    }

    // Skip changes if input encryption is disabled
    if (!enableInputEncryption) return config;

    // Fix the polarisProxyBasePath if needed
    if (polarisProxyBasePath && !polarisProxyBasePath.endsWith("/")) {
      polarisProxyBasePath += "/";
    }

    // Get the full URL of the request
    let fullUrl: URL;
    try {
      fullUrl = new URL(axios.getUri(config));
    } catch (e) {
      throw new Error("Polaris SDK interceptors for axios only work with absolute URLs of a Polaris container");
    }

    // Passthrough requests to the Polaris system endpoints
    if (fullUrl.pathname.startsWith("/polaris-container")) {
      return config;
    }

    // Get the Polaris container public key if not already provided
    const containerPublicKey = publicKey || (await getPublicKeyFromContainer(fullUrl.origin));

    // Encrypt the request path if it exists
    const requestPath = fullUrl.pathname + fullUrl.search + fullUrl.hash;
    if (requestPath && requestPath != "/") {
      const encryptedPath = aesKey ? await polarisSDK.encryptWithPresetKey(Buffer.from(requestPath), aesKey)
        : await polarisSDK.encrypt(Buffer.from(requestPath), containerPublicKey);

      config.baseURL = undefined;
      config.url = `${fullUrl.origin}/${polarisProxyBasePath}`;
      config.headers["polaris-url"] = (encryptedPath as Buffer).toString("base64");
    }

    // Encrypt the headers if they exist
    if (config.headers) {
      const encryptedHeaders = aesKey ?
        await polarisSDK.encryptWithPresetKey(Buffer.from(JSON.stringify(config.headers)), aesKey) :
        await polarisSDK.encrypt(
          Buffer.from(JSON.stringify(config.headers)),
          containerPublicKey
        );
      config.headers["polaris-secure"] = (encryptedHeaders as Buffer).toString("base64");
    }

    // Encrypt the body if it exists
    if (config.data) {
      if (config.data instanceof Readable) {
        config.data = config.data.pipe(new EncryptStream(polarisSDK, undefined, aesKey));
      } else {
        const encryptedData = await polarisSDK.encrypt(Buffer.from(config.data), containerPublicKey);
        config.data = encryptedData;
      }
    }
    return config;
  };
};

/**
 * Creates an Axios interceptor for decryption.
 * This function is designed to be used with Axios interceptors to decrypt response data after receiving.
 * It decrypts the response body if it exists.
 *
 * @param {PolarisSDK} polarisSDK - The Polaris SDK instance.
 * @param {AESKey} aesKey - The Preset AESKey
 * @returns {CreateResponseInterceptorResponse} - A function that takes an Axios response and returns a promise that resolves to the modified response.
 */
export const createAxiosResponseInterceptor = ({
  polarisSDK,
  aesKey,
}: CreateAxiosResponseInterceptorParams): CreateAxiosResponseInterceptorResponse => {
  return async (response: AxiosResponse): Promise<AxiosResponse> => {
    // Passthrough responses from the Polaris system endpoints
    const responseUrl = new URL(axios.getUri(response.config));
    if (responseUrl.pathname.startsWith("/polaris-container")) {
      return response;
    }
    // To Workload
    const rspData = response.data;
    const cnfData = response.config.data;
    const data = rspData instanceof Readable ? rspData : cnfData;
    if (!aesKey) {
      const wrappedKeyIv = response.headers["polaris-response-wrapped-key"] as string;
      if (wrappedKeyIv) {
        const wrappedKeyIvArray = wrappedKeyIv.split(":");
        const key = await polarisSDK.unwrapKey(Buffer.from(wrappedKeyIvArray[0], "base64"));
        const iv = await polarisSDK.unwrapKey(Buffer.from(wrappedKeyIvArray[1], "base64"));
        aesKey = {
          key,
          iv,
        };
      }
    }
    if (data instanceof Readable) {
      response.data = data.pipe(new DecryptStream(polarisSDK, aesKey));
      response.config.responseType = "stream";
    } else if (response.config.data) {
      response.data = await polarisSDK.decrypt(data);
      response.config.responseType = "arraybuffer";
    }
    return response;
  };
};
