import { AESKey } from "../../../crypto/types";
import type { PolarisSDK } from "../../../sdk";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";

export interface CreateAxiosRequestInterceptorParams {
  polarisSDK: PolarisSDK;
  enableInputEncryption?: boolean;
  enableOutputEncryption?: boolean;
  publicKey?: string;
  aesKey?: string;
  polarisProxyBasePath?: string;
}

export type CreateAxiosRequestInterceptorResponse = (
  config: InternalAxiosRequestConfig
) => Promise<InternalAxiosRequestConfig>;

export interface CreateAxiosResponseInterceptorParams {
  polarisSDK: PolarisSDK;
  aesKey?: AESKey;
}

export type CreateAxiosResponseInterceptorResponse = (response: AxiosResponse) => Promise<AxiosResponse>;
