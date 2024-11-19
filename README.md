# Polaris SDK

Fr0ntierX’s Polaris SDK is a TypeScript library designed for encrypting and decrypting communications within [Polaris Secure Containers](https://www.fr0ntierx.com/polaris) and applications communicating with them.

## Overview

Polaris SDK enables data encryption and decryption using an integrated asymmetric encryption scheme based on RSA asymmetric encryption and AES-GCM symmetric encryption. For more details on algorithm implementations, please refer to the [Polaris Documentation](https://docs.fr0ntierx.com/polaris-sdk/encryption-scheme).

### Environments

Polaris SDK functions in both browser context (using the [WebCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)) and in a Node.js context (using the [Node.js Crypto API](https://nodejs.org/api/crypto.html)). This enables both backend servers and browsers to directly communicate with [Polaris Secure Containers](https://www.fr0ntierx.com/polaris).

### Key Management

Polaris SDK supports various keys via the `KeyHandler` interface. A `KeyHandler` is only required to implement the `getPublicKey` and `unwrap` methods, that require access to the private key. The rest of the integrated encryption scheme is implemented by the SDK in an unified manner.

We provide an ephemeral key handler as part of the SDK that generates a new key on each initialization. Additional implmenetations for permanent keys are available with the [Polaris Proxy](https://github.com/Fr0ntierX/polaris-proxy).

## Installation

The SDK can be installed through any JavaScript package manager.

### NPM

```bash
npm install @fr0ntier-x/polaris-sdk
```

### Yarn

```bash
yarn add @fr0ntier-x/polaris-sdk
```

## Usage

Polaris SDK is designed to be user-friendly. The following example demonstrates how to encrypt and decrypt messages using the SDK and an ephemeral key:

```typescript
import { EphemeralKeyHandler, PolarisSDK } from "@fr0ntier-x/polaris-sdk";

const polarisSDK = new PolarisSDK(new EphemeralKeyHandler());
const publicKey = await polarisSDK.getPublicKey();

const message = "Hello from Polaris!";

const encryptedMessage = await polarisSDK.encrypt(Buffer.from(message), publicKey);
const decryptedMessage = await polarisSDK.decrypt(encryptedMessage);

console.log(decryptedMessage.toString()); // Hello from Polaris!
```

### Axios Interceptors

If you are using `axios` for HTTP requests, you can use the [request and response interceptors](https://axios-http.com/docs/interceptors) provided by the SDK to automatically encrypt and decrypt the request and response data.

```typescript
import { createAxiosRequestInterceptor, createAxiosResponseInterceptor } from "@fr0ntier-x/polaris-sdk";

axios.interceptors.request.use(createAxiosRequestInterceptor({ polarisSDK }));
axios.interceptors.response.use(createAxiosResponseInterceptor({ polarisSDK }));
```

## About Polaris

Fr0ntierX’s Polaris Secure Containers encrypt data throughout its lifecycle and isolate sensitive information from cloud providers or unauthorized entities by securing application deployment within a Trusted Execution Environment (TEE). For more information about Polaris Secure Containers, please visit the [website](https://www.fr0ntierx.com/polaris).

## Documentation

For more information about the Polaris SDK, please visit the [Polaris Documentation website](https://docs.fr0ntierx.com/polaris-sdk).

## Support

If you encounter any problmes please refer to the [documentation](https://docs.fr0ntierx.com/polaris-sdk) or create an [Issue](https://github.com/Fr0ntierX/polaris-sdk/issues).

## License

Polaris SDK is licensed under Apache 2.0. For more details, please refer to the [LICENSE](LICENSE).
