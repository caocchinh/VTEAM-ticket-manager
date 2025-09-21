import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { verifySession } from "@/dal/verifySession";
import { fetchStaffInfo } from "@/lib/SpreadSheet";
import { auth } from "@/lib/auth/auth";
import { NOT_LOGGED_IN_ERROR, NOT_STAFF_ERROR } from "@/constants/constants";
import Form from "./Form";
import { ErrorCard } from "@/components/ErrorCard";

export default async function Dashboard() {
  let unexpectedErrorMessage =
    "An unexpected error occurred. Please try again later.";
  let session;
  let staffInfo;

  try {
    session = await verifySession();

    if (session) {
      try {
        staffInfo = await fetchStaffInfo({ email: session.user.email });
        if (!staffInfo.data) {
          try {
            await auth.api.signOut({
              headers: await headers(),
            });
          } catch (signOutError) {
            console.error("Failed to sign out user:", signOutError);
            // Continue with redirect even if sign out fails
          }
          redirect(`/?error=${NOT_STAFF_ERROR}`);
        } else if (staffInfo.error) {
          throw new Error("Failed to fetch staff info");
        }
      } catch (staffInfoError) {
        console.error("Failed to fetch staff info:", staffInfoError);
        unexpectedErrorMessage =
          "Unable to verify staff credentials. Please try again later.";
      }
    } else {
      redirect(`/?error=${NOT_LOGGED_IN_ERROR}`);
    }
  } catch (sessionError) {
    console.error("Failed to verify session:", sessionError);
    return <ErrorCard message={unexpectedErrorMessage} />;
  }

  // If we don't have valid session and staff info, show error, in i
  if (!session || !staffInfo?.data) {
    return <ErrorCard message={unexpectedErrorMessage} />;
  }

  return (
    <div className="min-h-screen p-2">
      <Form staffInfo={staffInfo.data} session={session} />
    </div>
  );
}
