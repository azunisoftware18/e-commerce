import { shiprocketConfig } from "../config/shiprocket.config.js";

let shiprocketToken = null;
let tokenExpiresAt = null;
let loginPromise = null;

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try { 
    return JSON.parse(text);
  } catch {
    const error = new Error(
      `Shiprocket API returned HTTP ${response.status} with a non-JSON response${
        text ? `: ${text.slice(0, 200)}` : ""
      }`,
    );
    error.status = 502;
    throw error;
  }
}

class ShiprocketService {
  static async login() {
    const isTokenValid =
      shiprocketToken && tokenExpiresAt && Date.now() < tokenExpiresAt;

    if (isTokenValid) {
      return shiprocketToken;
    }

    if (loginPromise) {
      return loginPromise;
    }

    loginPromise = (async () => {
      try {
        const { email, password, baseURL } = shiprocketConfig;

        if (!email || !password || !baseURL) {
          throw new Error("Shiprocket credentials are missing");
        }

        const response = await fetch(`${baseURL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await parseResponse(response);

        if (!response.ok || !data.token) {
          const error = new Error(
            data.message || "Shiprocket authentication failed",
          );
          error.status = response.status;
          throw error;
        }

        shiprocketToken = data.token;

        // Token validity: 10 days.
        // Refresh 1 hour before expiration.
        tokenExpiresAt =
          Date.now() + 9 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000;

        return data.token;
      } catch (error) {
        shiprocketToken = null;
        tokenExpiresAt = null;
        throw error;
      } finally {
        loginPromise = null;
      }
    })();

    return loginPromise;
  }

  static async getToken() {
    return this.login();
  }

  static async logout() {
    if (!shiprocketToken) {
      return { message: "No active Shiprocket token" };
    }

    const response = await fetch(`${shiprocketConfig.baseURL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${shiprocketToken}`,
      },
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      const error = new Error(data.message || "Shiprocket logout failed");
      error.status = response.status;
      throw error;
    }

    shiprocketToken = null;
    tokenExpiresAt = null;

    return data;
  }

  static async createOrder(orderPayload) {
    const token = await this.getToken();

    const response = await fetch(
      `${shiprocketConfig.baseURL}/orders/create/adhoc`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      },
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      const error = new Error(
        data.message || "Shiprocket order creation failed",
      );

      error.status = response.status;
      error.details = data;

      throw error;
    }

    return data;
  }
}

export default ShiprocketService;
