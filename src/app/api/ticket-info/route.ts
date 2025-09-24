import {
  fetchOfflineTicketInfo,
  fetchOnlineTicketInfo,
} from "@/lib/SpreadSheet";
import { checkStaffAuthorization } from "@/dal/staff-auth";
import { createApiError, HTTP_STATUS, ERROR_CODES } from "@/constants/errors";
import { verifySession } from "@/dal/verifySession";
import { AllTicketInfo } from "@/constants/types";

export async function GET() {
  try {
    const session = await verifySession();

    if (!session) {
      return createApiError("UNAUTHORIZED", HTTP_STATUS.UNAUTHORIZED);
    }

    const staffAuth = await checkStaffAuthorization(session.user.email);

    if (!staffAuth.isStaff) {
      if (staffAuth.error) {
        const statusCode =
          staffAuth.error === ERROR_CODES.INTERNAL_SERVER_ERROR
            ? HTTP_STATUS.INTERNAL_SERVER_ERROR
            : HTTP_STATUS.UNAUTHORIZED;

        return createApiError(
          staffAuth.error as keyof typeof ERROR_CODES,
          statusCode
        );
      }
      return createApiError("UNAUTHORIZED", HTTP_STATUS.UNAUTHORIZED);
    }

    try {
      const [offlineTicketInfo, onlineTicketInfo] = await Promise.all([
        (async () => {
          const response = await fetchOfflineTicketInfo();
          if (response.error || !response.data) {
            throw new Error(ERROR_CODES.TICKET_INFO_FETCH_FAILED);
          }
          return response.data;
        })(),
        (async () => {
          const response = await fetchOnlineTicketInfo();
          if (response.error || !response.data) {
            throw new Error(ERROR_CODES.TICKET_INFO_FETCH_FAILED);
          }
          return response.data;
        })(),
      ]);

      return Response.json({
        offline: offlineTicketInfo,
        online: onlineTicketInfo,
      } as AllTicketInfo);
    } catch (error) {
      return createApiError(
        "TICKET_INFO_FETCH_FAILED",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        (error as Error).message
      );
    }
  } catch (error) {
    console.error("Error fetching ticket info:", error);
    return createApiError(
      "INTERNAL_SERVER_ERROR",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
