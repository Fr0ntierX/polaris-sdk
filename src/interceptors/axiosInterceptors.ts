import type { PolarisSDK } from "..";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";

const encrypt = async (sdk: PolarisSDK, data: string): Promise<Buffer> => {
  try {
    const publicKey = await sdk.getPublicKey();
    return sdk.encrypt(Buffer.from(data), publicKey);
  } catch (error: any) {
    console.error(error);
    throw new Error(`Failed to encrypt data: ${error.message}`);
  }
};

/**
 * Creates an Axios interceptor for encryption.
 * This function is designed to be used with Axios interceptors to encrypt request data before sending.
 * It encrypts the request path, headers, and body if they exist.
 *
 * @param {string} [polarisBase=""] - The base URL of the Polaris service.
 * @param {PolarisSDK} sdk - The Polaris SDK instance.
 * @returns {(config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>} - A function that takes an Axios request configuration and returns a promise that resolves to the modified configuration.
 */
export function axiosRequestInterceptor(
  polarisBase: string = "",
  sdk: PolarisSDK
): (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> {
  return async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const url = config.url || "";
    const path = url.split(polarisBase).pop() || "";

    // Encrypt the request path if it exists
    if (path) {
      const encryptedPath = await encrypt(sdk, path).then((data) => data.toString("hex"));
      config.url = `${polarisBase}/${encryptedPath}`;
    }

    // Encrypt the headers if they exist
    if (config.headers) {
      const encryptedHeaders = await encrypt(sdk, JSON.stringify(config.headers));
      config.headers["polaris-secure"] = encryptedHeaders.toString("hex");
    }

    // Encrypt the body if it exists
    if (config.data) {
      config.data = await encrypt(sdk, config.data);
    }

    return config;
  };
}

/**
 * Creates an Axios interceptor for decryption.
 * This function is designed to be used with Axios interceptors to decrypt response data after receiving.
 * It decrypts the response body if it exists.
 *
 * @param {PolarisSDK} sdk - The Polaris SDK instance.
 * @returns {(response: AxiosResponse) => Promise<AxiosResponse>} - A function that takes an Axios response and returns a promise that resolves to the modified response.
 */
export function axiosResponseInterceptor(sdk: PolarisSDK): (response: AxiosResponse) => Promise<AxiosResponse> {
  return async (response: AxiosResponse): Promise<AxiosResponse> => {
    // Decrypt the body if it exists
    if (response.data) {
      response.data = await sdk.decrypt(response.data);
      response.config.responseType = "arraybuffer";
    }
    return response;
  };
}
