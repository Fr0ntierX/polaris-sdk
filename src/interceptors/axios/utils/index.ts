import axios from "axios";

export const getPublicKeyFromContainer = async (containerUrl: string): Promise<string> => {
  const { data } = await axios.get(`${containerUrl}/polaris-container/publicKey`);

  if (!data.publicKey) {
    throw new Error("The request URL is not a valid Polaris container");
  }

  return data.publicKey;
};
