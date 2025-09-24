import { kv } from "./kv";
import { randomUUID } from "crypto";

export class Cache {
  static async get(key: string): Promise<string | null> {
    const cacheId = randomUUID().slice(0, 6);

    try {
      console.log(`[CACHE-${cacheId}] Getting key: ${key}`);

      const value = await kv.get(key);

      if (!value) {
        console.log(`[CACHE-${cacheId}] Key not found: ${key}`);
        return null;
      }

      console.log(`[CACHE-${cacheId}] Successfully retrieved key: ${key}`);
      return value;
    } catch (error) {
      console.error(`[CACHE-${cacheId}] Get error for key ${key}:`, error);
      return null;
    }
  }

  static async set(
    key: string,
    value: string,
    ttlSeconds?: number
  ): Promise<boolean> {
    const cacheId = randomUUID().slice(0, 6);
    const startTime = Date.now();

    try {
      console.log(
        `[CACHE-${cacheId}] Setting key: ${key}${
          ttlSeconds ? ` (TTL: ${ttlSeconds}s)` : ""
        }`
      );

      const result = await kv.put(
        key,
        value,
        ttlSeconds ? { ttl: ttlSeconds } : undefined
      );

      const duration = Date.now() - startTime;

      if (result) {
        console.log(
          `[CACHE-${cacheId}] Successfully set key: ${key} in ${duration}ms`
        );
      } else {
        console.warn(
          `[CACHE-${cacheId}] Set operation returned false for key: ${key} after ${duration}ms`
        );
      }

      return result === true;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[CACHE-${cacheId}] Set error for key ${key} after ${duration}ms:`,
        error
      );
      return false;
    }
  }

  static async delete(key: string): Promise<boolean> {
    const cacheId = randomUUID().slice(0, 6);
    const startTime = Date.now();

    try {
      console.log(`[CACHE-${cacheId}] Deleting key: ${key}`);

      const result = await kv.delete(key);

      const duration = Date.now() - startTime;

      if (result) {
        console.log(
          `[CACHE-${cacheId}] Successfully deleted key: ${key} in ${duration}ms`
        );
      } else {
        console.warn(
          `[CACHE-${cacheId}] Delete operation returned false for key: ${key} after ${duration}ms`
        );
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[CACHE-${cacheId}] Delete error for key ${key} after ${duration}ms:`,
        error
      );
      return false;
    }
  }

  static async has(key: string): Promise<boolean> {
    const cacheId = randomUUID().slice(0, 6);

    try {
      console.log(`[CACHE-${cacheId}] Checking existence of key: ${key}`);

      const value = await kv.get(key);

      const exists = value !== null;
      console.log(
        `[CACHE-${cacheId}] Key ${key} ${exists ? "exists" : "does not exist"}`
      );

      return exists;
    } catch (error) {
      console.error(`[CACHE-${cacheId}] Has error for key ${key}:`, error);
      return false;
    }
  }

  // Cache with fallback - if cache miss, execute function and cache result
  static async getOrSet(
    key: string,
    fallbackFn: () => Promise<string>,
    ttlSeconds?: number
  ): Promise<string> {
    const cacheId = randomUUID().slice(0, 6);

    try {
      console.log(`[CACHE-${cacheId}] GetOrSet for key: ${key}`);

      const cached = await this.get(key);
      if (cached !== null) {
        console.log(`[CACHE-${cacheId}] Cache hit for key: ${key}`);
        return cached;
      }

      console.log(
        `[CACHE-${cacheId}] Cache miss for key: ${key}, executing fallback`
      );
      const fresh = await fallbackFn();

      console.log(
        `[CACHE-${cacheId}] Fallback executed, caching result for key: ${key}`
      );
      await this.set(key, fresh, ttlSeconds);

      return fresh;
    } catch (error) {
      console.error(`[CACHE-${cacheId}] GetOrSet error for key ${key}:`, error);
      // If cache operations fail, still try to execute fallback
      console.log(
        `[CACHE-${cacheId}] Cache failed, executing fallback directly for key: ${key}`
      );
      return await fallbackFn();
    }
  }
}
