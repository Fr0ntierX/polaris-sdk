import type { PolarisSDK } from "../../..";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";

export interface CreateRequestInterceptorParams {
  polarisSDK: PolarisSDK;
  publicKey?: string;
  polarisProxyBasePath?: string;
}

export type CreateRequestInterceptorResponse = (
  config: InternalAxiosRequestConfig
) => Promise<InternalAxiosRequestConfig>;

export interface CreateResponseInterceptorParams {
  polarisSDK: PolarisSDK;
}

export type CreateResponseInterceptorResponse = (response: AxiosResponse) => Promise<AxiosResponse>;
