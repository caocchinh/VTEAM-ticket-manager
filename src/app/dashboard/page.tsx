import { headers } from "next/headers";
import { verifySession } from "@/dal/verifySession";
import { checkStaffAuthorization } from "@/dal/staff-auth";
import { auth } from "@/lib/auth/auth";
import { NOT_LOGGED_IN_ERROR, NOT_STAFF_ERROR } from "@/constants/constants";
import { ERROR_CODES, getErrorMessage } from "@/constants/errors";
import Form from "./Form";
import { ErrorCard } from "@/components/ErrorCard";
import RedirectMessage from "@/components/RedirectMessage";

export default async function Dashboard() {
  let session;

  try {
    session = await verifySession();
  } catch (sessionError) {
    console.error("Failed to verify session:", sessionError);
    return (
      <ErrorCard
        message={getErrorMessage(ERROR_CODES.SESSION_VERIFICATION_FAILED)}
      />
    );
  }

  if (!session) {
    return (
      <RedirectMessage
        message="Bạn chưa đăng nhập"
        subMessage="Đang chuyển hướng đến trang đăng nhập..."
        redirectTo={`/?error=${NOT_LOGGED_IN_ERROR}`}
      />
    );
  }

  const staffAuth = await checkStaffAuthorization(session.user.email);

  if (!staffAuth.isStaff) {
    if (staffAuth.error) {
      console.error("Staff authorization failed:", staffAuth.error);

      // If it's an internal server error, show error page
      if (staffAuth.error === ERROR_CODES.INTERNAL_SERVER_ERROR) {
        return <ErrorCard message={getErrorMessage(staffAuth.error)} />;
      }
    }

    // For unauthorized users, sign out and redirect
    try {
      await auth.api.signOut({
        headers: await headers(),
      });
    } catch (signOutError) {
      console.error("Failed to sign out user:", signOutError);
    }
    return (
      <RedirectMessage
        message="Bạn không có quyền truy cập"
        subMessage="Đang chuyển hướng đến trang đăng nhập..."
        redirectTo={`/?error=${NOT_STAFF_ERROR}`}
      />
    );
  }

  return (
    <div className="min-h-screen p-2">
      <Form
        staffInfo={{
          name: staffAuth.staffInfo!.name,
          email: staffAuth.staffInfo!.email,
        }}
        isOnlineCoordinator={staffAuth.isOnlineCoordinator}
        session={session}
      />
    </div>
  );
}
