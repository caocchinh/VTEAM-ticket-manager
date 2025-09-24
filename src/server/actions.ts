"use server";

import { StudentInput } from "@/constants/types";
import { verifySession } from "@/dal/verifySession";
import { fetchOfflineStaffInfo, sendOfflineOrder } from "@/lib/SpreadSheet";
import {
  createActionError,
  createActionSuccess,
  type ActionResponse,
} from "@/constants/errors";
import { randomUUID } from "crypto";
import { Cache } from "@/lib/cache";

export const sendOrderAction = async ({
  orders,
}: {
  orders: StudentInput[];
}): Promise<ActionResponse> => {
  const operationId = randomUUID();
  const startTime = Date.now();

  console.log(
    `[${operationId}] Starting offline order submission for ${orders.length} orders`
  );

  try {
    // Session verification
    const session = await verifySession();
    if (!session) {
      console.log(`[${operationId}] Session verification failed`);
      return createActionError("SESSION_VERIFICATION_FAILED");
    }

    console.log(
      `[${operationId}] Session verified for user: ${session.user.email}`
    );

    // Input validation
    console.log(`[${operationId}] Validating input data...`);
    if (!orders || orders.length === 0) {
      return createActionError("MISSING_REQUIRED_FIELDS");
    }

    // Validate each order has required fields
    for (const order of orders) {
      if (
        !order.nameInput ||
        !order.homeroomInput ||
        !order.studentIdInput ||
        !order.ticketType
      ) {
        return createActionError("MISSING_REQUIRED_FIELDS");
      }
    }

    console.log(`[${operationId}] Input validation passed`);

    // Fetch staff info
    console.log(`[${operationId}] Fetching staff information...`);
    const staffInfo = await fetchOfflineStaffInfo({
      email: session.user.email,
    });

    if (!staffInfo.data) {
      console.log(
        `[${operationId}] Staff info not found for email: ${session.user.email}`
      );
      return createActionError("UNAUTHORIZED");
    }

    console.log(
      `[${operationId}] Staff info retrieved for: ${staffInfo.data.name}`
    );

    // Submit orders
    console.log(`[${operationId}] Submitting orders to spreadsheet...`);
    const result = await sendOfflineOrder({
      orders,
      staffName: staffInfo.data.name,
    });

    if (result.success) {
      const duration = Date.now() - startTime;
      console.log(
        `[${operationId}] Orders submitted successfully in ${duration}ms`
      );
      return createActionSuccess();
    } else {
      console.error(`[${operationId}] Order submission to spreadsheet failed`);
      return createActionError("ORDER_SUBMISSION_FAILED");
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `[${operationId}] Order submission failed after ${duration}ms:`,
      error
    );

    if (error instanceof Error) {
      console.error(`[${operationId}] Error details:`, error.message);
      console.error(`[${operationId}] Error stack:`, error.stack);
    }
    return createActionError("UNKNOWN_ERROR");
  }
};

export const updateOnlineDataAction = async (): Promise<ActionResponse> => {
  const operationId = randomUUID();
  const startTime = Date.now();

  console.log(`[${operationId}] Starting online data update`);

  try {
    // Session verification
    const session = await verifySession();
    if (!session) {
      console.log(`[${operationId}] Session verification failed`);
      return createActionError("SESSION_VERIFICATION_FAILED");
    }

    console.log(
      `[${operationId}] Session verified for user: ${session.user.email}`
    );

    // Fetch staff info
    console.log(`[${operationId}] Fetching staff information...`);
    const staffInfo = await fetchOfflineStaffInfo({
      email: session.user.email,
    });

    if (!staffInfo.data) {
      console.log(
        `[${operationId}] Staff info not found for email: ${session.user.email}`
      );
      return createActionError("UNAUTHORIZED");
    }

    console.log(
      `[${operationId}] Staff info retrieved for: ${staffInfo.data.name}`
    );

    // Clear cache to force fresh data fetch
    console.log(`[${operationId}] Clearing cached data...`);
    try {
      await Promise.all([
        async () => {
          const response = await Cache.delete("event-info");
          if (!response) {
            console.error(`[${operationId}] Cache delete failed`);
            throw new Error("CACHE_DELETE_FAILED");
          }
        },
        async () => {
          const response = await Cache.delete("form-info");
          if (!response) {
            console.error(`[${operationId}] Cache delete failed`);
            throw new Error("CACHE_DELETE_FAILED");
          }
        },
        async () => {
          const response = await Cache.delete("ticket-info");
          if (!response) {
            console.error(`[${operationId}] Cache delete failed`);
            throw new Error("CACHE_DELETE_FAILED");
          }
        },
        async () => {
          const response = await Cache.delete("student-list");
          if (!response) {
            console.error(`[${operationId}] Cache delete failed`);
            throw new Error("CACHE_DELETE_FAILED");
          }
        },
      ]);
      console.log(`[${operationId}] Cache cleared successfully`);
    } catch (cacheError) {
      console.error(`[${operationId}] Cache clear failed:`, cacheError);
      return createActionError("CACHE_ERROR");
    }

    const duration = Date.now() - startTime;
    console.log(
      `[${operationId}] Online data update completed in ${duration}ms`
    );
    return createActionSuccess();
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `[${operationId}] Online data update failed after ${duration}ms:`,
      error
    );

    if (error instanceof Error) {
      console.error(`[${operationId}] Error details:`, error.message);
      console.error(`[${operationId}] Error stack:`, error.stack);
    }
    return createActionError("UNKNOWN_ERROR");
  }
};
