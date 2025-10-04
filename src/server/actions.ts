"use server";

import { SheetOrderStatus, StudentInput } from "@/constants/types";
import { verifySession } from "@/dal/verifySession";
import { sendOfflineOrder, updateOnlineOrderStatus } from "@/lib/SpreadSheet";
import { checkStaffAuthorization } from "@/dal/staff-auth";
import {
  createActionError,
  createActionSuccess,
  type ActionResponse,
  ERROR_CODES,
} from "@/constants/errors";
import { randomUUID } from "crypto";
import { Cache } from "@/lib/cache";
import {
  VERIFICATION_APPROVED,
  VERIFICATION_FAILED,
  VERIFICATION_PENDING,
} from "@/constants/constants";

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

    // Check staff authorization
    console.log(`[${operationId}] Checking staff authorization...`);
    const staffAuth = await checkStaffAuthorization(session.user.email);

    if (!staffAuth.isStaff) {
      console.log(
        `[${operationId}] Staff authorization failed: ${
          staffAuth.error || "Unknown error"
        }`
      );
      return createActionError(
        staffAuth.error === ERROR_CODES.INTERNAL_SERVER_ERROR
          ? "INTERNAL_SERVER_ERROR"
          : "UNAUTHORIZED"
      );
    }

    console.log(
      `[${operationId}] Staff authorization successful for: ${staffAuth.staffInfo?.name}`
    );

    // Submit orders
    console.log(`[${operationId}] Submitting orders to spreadsheet...`);
    const result = await sendOfflineOrder({
      orders,
      staffName: staffAuth.staffInfo!.name,
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

    // Check staff authorization
    console.log(`[${operationId}] Checking staff authorization...`);
    const staffAuth = await checkStaffAuthorization(session.user.email);

    if (!staffAuth.isStaff) {
      console.log(
        `[${operationId}] Staff authorization failed: ${
          staffAuth.error || "Unknown error"
        }`
      );
      return createActionError(
        staffAuth.error === ERROR_CODES.INTERNAL_SERVER_ERROR
          ? "INTERNAL_SERVER_ERROR"
          : "UNAUTHORIZED"
      );
    }

    console.log(
      `[${operationId}] Staff authorization successful for: ${staffAuth.staffInfo?.name}`
    );

    // Clear cache to force fresh data fetch
    console.log(`[${operationId}] Clearing cached data...`);
    try {
      await Promise.all([
        (async () => {
          const response = await Cache.delete("event-info");
          if (!response) {
            console.error(
              `[${operationId}] Cache delete failed for event-info`
            );
            throw new Error("CACHE_DELETE_FAILED");
          }
        })(),
        (async () => {
          const response = await Cache.delete("form-info");
          if (!response) {
            console.error(`[${operationId}] Cache delete failed for form-info`);
            throw new Error("CACHE_DELETE_FAILED");
          }
        })(),
        (async () => {
          const response = await Cache.delete("ticket-info");
          if (!response) {
            console.error(
              `[${operationId}] Cache delete failed for ticket-info`
            );
            throw new Error("CACHE_DELETE_FAILED");
          }
        })(),
        (async () => {
          const response = await Cache.delete("student-list");
          if (!response) {
            console.error(
              `[${operationId}] Cache delete failed for student-list`
            );
            throw new Error("CACHE_DELETE_FAILED");
          }
        })(),
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

export const updateOnlineOrderStatusAction = async ({
  studentId,
  verificationStatus,
  rejectionReason,
}: {
  studentId: string;
  verificationStatus: SheetOrderStatus;
  rejectionReason: string | null;
}): Promise<ActionResponse> => {
  const operationId = randomUUID();
  const startTime = Date.now();

  console.log(`[${operationId}] Starting online order status update`);

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

    // Check staff authorization
    console.log(`[${operationId}] Checking staff authorization...`);
    const staffAuth = await checkStaffAuthorization(session.user.email);

    if (!staffAuth.isStaff || !staffAuth.isOnlineCoordinator) {
      console.log(
        `[${operationId}] Staff authorization failed: ${
          staffAuth.error || "Unknown error"
        }`
      );
      return createActionError(
        staffAuth.error === ERROR_CODES.INTERNAL_SERVER_ERROR
          ? "INTERNAL_SERVER_ERROR"
          : "UNAUTHORIZED"
      );
    }

    console.log(
      `[${operationId}] Staff authorization successful for: ${staffAuth.staffInfo?.name}`
    );

    // Input validation
    console.log(`[${operationId}] Validating input data...`);
    if (!studentId || !verificationStatus) {
      return createActionError("MISSING_REQUIRED_FIELDS");
    }
    if (
      verificationStatus !== VERIFICATION_PENDING &&
      verificationStatus !== VERIFICATION_APPROVED &&
      verificationStatus !== VERIFICATION_FAILED
    ) {
      return createActionError("MISSING_REQUIRED_FIELDS");
    }
    if (!rejectionReason && verificationStatus === VERIFICATION_FAILED) {
      return createActionError("MISSING_REQUIRED_FIELDS");
    }

    console.log(`[${operationId}] Input validation passed`);

    // Update online order status
    console.log(`[${operationId}] Updating online order status...`);
    const result = await updateOnlineOrderStatus({
      studentId,
      verificationStatus,
      rejectionReason,
    });

    if (!result.error) {
      const duration = Date.now() - startTime;
      console.log(
        `[${operationId}] Online order status updated successfully in ${duration}ms`
      );
      return createActionSuccess();
    } else {
      console.error(
        `[${operationId}] Online order status update failed: ${result.errorMessage}`
      );
      return createActionError("ORDER_SUBMISSION_FAILED");
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `[${operationId}] Online order status update failed after ${duration}ms:`,
      error
    );

    if (error instanceof Error) {
      console.error(`[${operationId}] Error details:`, error.message);
      console.error(`[${operationId}] Error stack:`, error.stack);
    }
    return createActionError("UNKNOWN_ERROR");
  }
};
