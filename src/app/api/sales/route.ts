import { verifySession } from "@/dal/verifySession";
import { fetchOfflineSales, fetchOfflineStaffInfo } from "@/lib/SpreadSheet";
import { createApiError, HTTP_STATUS } from "@/constants/errors";

export async function GET() {
  try {
    const session = await verifySession();

    if (!session) {
      return createApiError("UNAUTHORIZED", HTTP_STATUS.UNAUTHORIZED);
    }

    let staffInfo;
    try {
      staffInfo = await fetchOfflineStaffInfo({ email: session.user.email });
    } catch (error) {
      return createApiError(
        "INTERNAL_SERVER_ERROR",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        (error as Error).message
      );
    }

    if (!staffInfo.data) {
      return createApiError("UNAUTHORIZED", HTTP_STATUS.UNAUTHORIZED);
    }

    let salesData;
    try {
      salesData = await fetchOfflineSales();
    } catch (error) {
      return createApiError(
        "INTERNAL_SERVER_ERROR",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        (error as Error).message
      );
    }

    return Response.json(salesData);
  } catch (error) {
    console.error("Error fetching sales info:", error);
    return createApiError(
      "INTERNAL_SERVER_ERROR",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
