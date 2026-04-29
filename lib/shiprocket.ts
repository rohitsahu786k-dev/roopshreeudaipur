import axios from "axios";

type ShiprocketAuthResponse = {
  token: string;
};

export async function getShiprocketToken() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials are not configured");
  }

  const { data } = await axios.post<ShiprocketAuthResponse>(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    { email, password },
    { timeout: 10000 }
  );

  return data.token;
}

export async function pushOrderToShiprocket(payload: Record<string, unknown>) {
  const token = await getShiprocketToken();
  const { data } = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    payload,
    {
      timeout: 15000,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return data;
}
