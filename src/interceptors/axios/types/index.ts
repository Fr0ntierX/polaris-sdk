import type { PolarisSDK } from "../../../sdk";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";

export interface CreateAxiosRequestInterceptorParams {
  polarisSDK: PolarisSDK;
  enableInputEncryption?: boolean;
  enableOutputEncryption?: boolean;
  publicKey?: string;
  polarisProxyBasePath?: string;
}

export type CreateAxiosRequestInterceptorResponse = (
  config: InternalAxiosRequestConfig
) => Promise<InternalAxiosRequestConfig>;

export interface CreateAxiosResponseInterceptorParams {
  polarisSDK: PolarisSDK;
}

export type CreateAxiosResponseInterceptorResponse = (response: AxiosResponse) => Promise<AxiosResponse>;
