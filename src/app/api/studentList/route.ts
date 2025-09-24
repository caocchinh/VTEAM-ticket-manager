import { verifySession } from "@/dal/verifySession";
import { fetchStaffInfo, fetchStudentList } from "@/lib/SpreadSheet";
import { createApiError, HTTP_STATUS } from "@/constants/errors";

export async function GET() {
  try {
    const session = await verifySession();

    if (!session) {
      return createApiError("UNAUTHORIZED", HTTP_STATUS.UNAUTHORIZED);
    }

    let staffInfo;
    try {
      staffInfo = await fetchStaffInfo({ email: session.user.email });
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

    let studentList;
    try {
      studentList = await fetchStudentList();
    } catch (error) {
      return createApiError(
        "STUDENT_LIST_FETCH_FAILED",
        HTTP_STATUS.BAD_REQUEST,
        (error as Error).message
      );
    }

    return Response.json(studentList);
  } catch (error) {
    console.error("Error fetching student list:", error);
    return createApiError(
      "INTERNAL_SERVER_ERROR",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
