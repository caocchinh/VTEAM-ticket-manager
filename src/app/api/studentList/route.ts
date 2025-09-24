import { fetchStudentList } from "@/lib/SpreadSheet";
import { checkStaffAuthorization } from "@/dal/staff-auth";
import { createApiError, HTTP_STATUS, ERROR_CODES } from "@/constants/errors";
import { verifySession } from "@/dal/verifySession";

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

    let studentList;
    try {
      const response = await fetchStudentList();
      if (response.error) {
        return createApiError(
          "STUDENT_LIST_FETCH_FAILED",
          HTTP_STATUS.BAD_REQUEST
        );
      } else {
        studentList = response.data;
      }
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
