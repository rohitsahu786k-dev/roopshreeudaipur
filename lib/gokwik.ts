import axios from "axios";

const baseUrls = {
  sandbox: "https://sandbox.gokwik.co",
  production: "https://api.gokwik.co"
};

export function getGoKwikConfig() {
  const env = process.env.NEXT_PUBLIC_GOKWIK_ENV === "production" ? "production" : "sandbox";
  const merchantId = process.env.GOKWIK_MERCHANT_ID;
  const apiKey = process.env.GOKWIK_API_KEY;
  const apiSecret = process.env.GOKWIK_API_SECRET;

  if (!merchantId || !apiKey || !apiSecret) {
    throw new Error("GoKwik credentials are not configured");
  }

  return {
    baseUrl: baseUrls[env],
    merchantId,
    apiKey,
    apiSecret
  };
}

export async function createGoKwikCheckout(payload: Record<string, unknown>) {
  const config = getGoKwikConfig();
  const { data } = await axios.post(`${config.baseUrl}/v1/orders`, payload, {
    timeout: 15000,
    headers: {
      "x-merchant-id": config.merchantId,
      "x-api-key": config.apiKey,
      "x-api-secret": config.apiSecret
    }
  });

  return data;
}
