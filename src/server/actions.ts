"use server";

import { SheetOrderStatus, StudentInput } from "@/constants/types";
import { verifySession } from "@/dal/verifySession";
import {
  fetchEmailInfo,
  fetchOfflineEventInfo,
  sendOfflineOrder,
  updateOnlineOrderStatus,
} from "@/lib/SpreadSheet";
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
import { sendFailedEmail, sendSuccessEmail } from "@/lib/sendMail";
import { getCurrentTime } from "@/lib/utils";
import { EmailInfo, EventInfo } from "@/constants/types";

const getEmailInfo = async (): Promise<{
  error: boolean;
  data: EmailInfo | undefined;
}> => {
  try {
    const cachedEmailInfo = await Cache.get("email-info");
    if (cachedEmailInfo) {
      return { error: false, data: JSON.parse(cachedEmailInfo as string) };
    }

    const emailInfo = await fetchEmailInfo();
    if (!emailInfo.error && emailInfo.data) {
      await Cache.set(
        "email-info",
        JSON.stringify(emailInfo.data),
        60 * 60 * 24 * 100
      ); // Cache for 100 days
    }
    if (emailInfo.error) {
      return { error: true, data: undefined };
    }
    return emailInfo;
  } catch (error) {
    console.error("Failed to fetch email info:", error);
    return { error: true, data: undefined };
  }
};

const getEventInfo = async (): Promise<{
  error: boolean;
  data: EventInfo | undefined;
}> => {
  try {
    const cachedEventInfo = await Cache.get("offline-event-info");
    if (cachedEventInfo) {
      return { error: false, data: JSON.parse(cachedEventInfo as string) };
    }

    const eventInfo = await fetchOfflineEventInfo();
    if (!eventInfo.error && eventInfo.data) {
      await Cache.set(
        "offline-event-info",
        JSON.stringify(eventInfo.data),
        60 * 60 * 24 * 100
      ); // Cache for 100 days
    }
    if (eventInfo.error) {
      return { error: true, data: undefined };
    }
    return eventInfo;
  } catch (error) {
    console.error("Failed to fetch form info:", error);
    return { error: true, data: undefined };
  }
};

const getEmailAndEventInfo = async (): Promise<{
  error: boolean;
  data: { emailInfo: EmailInfo | undefined; eventInfo: EventInfo | undefined };
}> => {
  const [emailInfoResult, eventInfoResult] = await Promise.allSettled([
    getEmailInfo(),
    getEventInfo(),
  ]);

  const emailInfo =
    emailInfoResult.status === "fulfilled"
      ? emailInfoResult.value
      : { error: true, data: undefined };

  const eventInfo =
    eventInfoResult.status === "fulfilled"
      ? eventInfoResult.value
      : { error: true, data: undefined };

  return {
    error:
      emailInfo.error || eventInfo.error || !emailInfo.data || !eventInfo.data,
    data: { emailInfo: emailInfo.data, eventInfo: eventInfo.data },
  };
};

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
      const { error: emailAndEventInfoError, data: emailAndEventInfoData } =
        await getEmailAndEventInfo();

      if (
        !(
          emailAndEventInfoError ||
          !emailAndEventInfoData.emailInfo ||
          !emailAndEventInfoData.eventInfo
        )
      ) {
        await Promise.allSettled(
          orders.map(async (order) => {
            await sendSuccessEmail({
              email: order.email,
              studentName: order.nameInput,
              studentId: order.studentIdInput,
              homeroom: order.homeroomInput,
              ticketType: order.ticketType,
              emailInfo: emailAndEventInfoData.emailInfo!,
              eventInfo: emailAndEventInfoData.eventInfo!,
              purchaseTime: getCurrentTime({ includeTime: true }),
              typeOfSale: "offline",
            });
          })
        );
      }

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
          const response = await Cache.delete("online-event-info");
          if (!response) {
            console.error(
              `[${operationId}] Cache delete failed for event-info`
            );
            throw new Error("CACHE_DELETE_FAILED");
          }
        })(),
        (async () => {
          const response = await Cache.delete("online-form-info");
          if (!response) {
            console.error(`[${operationId}] Cache delete failed for form-info`);
            throw new Error("CACHE_DELETE_FAILED");
          }
        })(),
        (async () => {
          const response = await Cache.delete("online-ticket-info");
          if (!response) {
            console.error(
              `[${operationId}] Cache delete failed for ticket-info`
            );
            throw new Error("CACHE_DELETE_FAILED");
          }
        })(),
        (async () => {
          const response = await Cache.delete("online-student-list");
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
      if (result.data) {
        const { error: emailAndEventInfoError, data: emailAndEventInfoData } =
          await getEmailAndEventInfo();

        if (
          !(
            emailAndEventInfoError ||
            !emailAndEventInfoData.emailInfo ||
            !emailAndEventInfoData.eventInfo
          )
        ) {
          if (verificationStatus === VERIFICATION_APPROVED) {
            await sendSuccessEmail({
              email: result.data!.buyerEmail,
              studentName: result.data.buyerName,
              studentId: result.data.buyerId,
              homeroom: result.data.buyerClass,
              ticketType: result.data.buyerTicketType,
              emailInfo: emailAndEventInfoData.emailInfo,
              eventInfo: emailAndEventInfoData.eventInfo,
              purchaseTime: result.data.time,
              typeOfSale: "online",
            });
          } else if (verificationStatus === VERIFICATION_FAILED) {
            await sendFailedEmail({
              email: result.data.buyerEmail,
              studentName: result.data.buyerName,
              studentId: result.data.buyerId,
              homeroom: result.data.buyerClass,
              ticketType: result.data.buyerTicketType,
              emailInfo: emailAndEventInfoData.emailInfo,
              eventInfo: emailAndEventInfoData.eventInfo,
              purchaseTime: result.data.time,
              proofOfPaymentURL: result.data.proofOfPaymentImage,
              rejectionReason: result.data.rejectionReason,
            });
          }
        }
      }
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
