# Polaris SDK

The Polaris SDK is a TypeScript library that implements encryption and decryption utilities for communication with [Polaris Secure Containers](https://www.fr0ntierx.com/polaris).

## Overview

The Polaris SDK allows the user to encrypt and decrypt data using an integrated assymetric encryption scheme that is based on RSA asymmetric encryption and AES-GCM symmetric encryption. For details about the implementation of the algorithm, please refer to the [Polaris Documentation](https://docs.fr0ntierx.com/polaris-sdk/encryption-scheme).

### Environments

The Polaris SDK can operate both in a browser context (using the [WebCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)) and in a Node.js context (using the [Node.js Crypto API](https://nodejs.org/api/crypto.html)). This allows for both backend servers as well as browsers to directly communicated with [Polaris Secure Containers](https://www.fr0ntierx.com/polaris).

### Key Management

The Polaris SDK can work with a variaty of keys. This functionality is abstracted by the `KeyHandler` interface. A `KeyHandler` is only required to implement the `getPublicKey` and `unwrap` methods, that require access to the private key. The symmetric encryption is handled by the SDK. We provide an ephemeral key handler as part of the SDK that generates a new key on initialization. More implmenetations are available as part of the [Polaris Proxy](https://github.com/Fr0ntierX/polaris-proxy).

## Installation

You can install the library using all JavaScript package managers.

### NPM

```bash
npm install @fr0ntier-x/polaris-sdk
```

### Yarn

```bash
yarn add @fr0ntier-x/polaris-sdk
```

## Usage

The Polaris SDK is designed to be easy to use. The following example demonstrates how to encrypt and decrypt a message using the SDK and an ephemeral key.

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

If you are using `axios` to make HTTP requests, you can use the request and response interceptors provided by the SDK to automatically encrypt and decrypt the request and response data.

```typescript
import { createAxiosRequestInterceptor, createAxiosResponseInterceptor } from "@fr0ntier-x/polaris-sdk";

axios.interceptors.request.use(createAxiosRequestInterceptor({ polarisSDK }));
axios.interceptors.response.use(createAxiosResponseInterceptor({ polarisSDK }));
```

## About Polaris

Polaris Secure Containers enable the secure deployment of applications within a Trusted Execution Environment (TEE), encrypting all data in transit, and isolating sensitive information from the underlying infrastructure. To learn more about Polaris, please visit the [Polaris Secure Containers website](https://www.fr0ntierx.com/polaris).

## Documentation

You can find the full documentation for the Polaris SDK on the [Polaris Documentation](https://docs.fr0ntierx.com/polaris-sdk) website.

## Support

If you encounter any problmes please create an [Issue](https://github.com/Fr0ntierX/polaris-sdk/issues).

## License

This Polaris SDK is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
