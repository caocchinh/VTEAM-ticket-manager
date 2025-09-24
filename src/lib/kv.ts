/* eslint-disable @typescript-eslint/no-explicit-any */
import { retryCache } from "@/dal/retry";
interface CloudflareKVResponse {
  result: any;
  success: boolean;
  errors: any[];
  messages: any[];
}

class CloudflareKV {
  private accountId: string;
  private namespaceId: string;
  private apiToken: string;
  private baseUrl: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    this.namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID!;
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN!;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}`;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CloudflareKVResponse> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `KV API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async get(key: string): Promise<string | null> {
    try {
      return await retryCache(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
          const response = await fetch(`${this.baseUrl}/values/${key}`, {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
            signal: controller.signal,
            // Add additional fetch options for better reliability
            keepalive: true,
          });

          clearTimeout(timeoutId);

          if (response.status === 404) {
            return null;
          }

          if (!response.ok) {
            throw new Error(
              `KV API error: ${response.status} ${response.statusText}`
            );
          }

          return response.text();
        } catch (fetchError) {
          clearTimeout(timeoutId);

          // Enhance error handling for specific timeout cases
          if (fetchError instanceof Error) {
            if (fetchError.name === "AbortError") {
              throw new Error(
                `KV request timeout after 15 seconds for key: ${key}`
              );
            }
            if (
              fetchError.message.includes("Connect Timeout Error") ||
              fetchError.message.includes("UND_ERR_CONNECT_TIMEOUT")
            ) {
              throw new Error(
                `KV connection timeout - Cloudflare API unreachable for key: ${key}`
              );
            }
          }
          throw fetchError;
        }
      }, `KV get for key: ${key}`);
    } catch (error) {
      console.error("Error getting KV value:", error);
      return null;
    }
  }

  async put(
    key: string,
    value: string,
    options?: { ttl?: number }
  ): Promise<boolean> {
    try {
      return await retryCache(async () => {
        const url = new URL(`${this.baseUrl}/values/${key}`);
        if (options?.ttl) {
          url.searchParams.set("expiration_ttl", options.ttl.toString());
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout for PUT operations

        try {
          const response = await fetch(url.toString(), {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
              "Content-Type": "text/plain",
            },
            body: value,
            signal: controller.signal,
            keepalive: true,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(
              `KV API error: ${response.status} ${response.statusText}`
            );
          }

          return response.ok;
        } catch (fetchError) {
          clearTimeout(timeoutId);

          if (fetchError instanceof Error) {
            if (fetchError.name === "AbortError") {
              throw new Error(
                `KV PUT timeout after 20 seconds for key: ${key}`
              );
            }
            if (
              fetchError.message.includes("Connect Timeout Error") ||
              fetchError.message.includes("UND_ERR_CONNECT_TIMEOUT")
            ) {
              throw new Error(
                `KV PUT connection timeout - Cloudflare API unreachable for key: ${key}`
              );
            }
          }
          throw fetchError;
        }
      }, `KV put for key: ${key}`);
    } catch (error) {
      console.error("Error putting KV value:", error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      return await retryCache(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
          const response = await fetch(`${this.baseUrl}/values/${key}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
            signal: controller.signal,
            keepalive: true,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(
              `KV API error: ${response.status} ${response.statusText}`
            );
          }

          return response.ok;
        } catch (fetchError) {
          clearTimeout(timeoutId);

          if (fetchError instanceof Error) {
            if (fetchError.name === "AbortError") {
              throw new Error(
                `KV DELETE timeout after 15 seconds for key: ${key}`
              );
            }
            if (
              fetchError.message.includes("Connect Timeout Error") ||
              fetchError.message.includes("UND_ERR_CONNECT_TIMEOUT")
            ) {
              throw new Error(
                `KV DELETE connection timeout - Cloudflare API unreachable for key: ${key}`
              );
            }
          }
          throw fetchError;
        }
      }, `KV delete for key: ${key}`);
    } catch (error) {
      console.error("Error deleting KV value:", error);
      return false;
    }
  }

  async list(options?: {
    prefix?: string;
    limit?: number;
  }): Promise<{ keys: Array<{ name: string; expiration?: number }> }> {
    try {
      const url = new URL(`${this.baseUrl}/keys`);
      if (options?.prefix) {
        url.searchParams.set("prefix", options.prefix);
      }
      if (options?.limit) {
        url.searchParams.set("limit", options.limit.toString());
      }

      const response = await this.makeRequest(`/keys?${url.searchParams}`);
      return response.result;
    } catch (error) {
      console.error("Error listing KV keys:", error);
      return { keys: [] };
    }
  }
}

export const kv = new CloudflareKV();
