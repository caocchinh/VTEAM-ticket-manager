import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { verifySession } from "@/dal/verifySession";
import { fetchStaffInfo } from "@/lib/SpreadSheet";
import { auth } from "@/lib/auth/auth";
import { NOT_LOGGED_IN_ERROR, NOT_STAFF_ERROR } from "@/constants/constants";
import Form from "./Form";
import { ErrorCard } from "@/components/ErrorCard";

export default async function Dashboard() {
  let session;
  let staffInfo;

  try {
    session = await verifySession();
  } catch (sessionError) {
    console.error("Failed to verify session:", sessionError);
    return <ErrorCard message={"Failed to verify session"} />;
  }

  if (!session) {
    redirect(`/?error=${NOT_LOGGED_IN_ERROR}`);
  }

  try {
    staffInfo = await fetchStaffInfo({ email: session.user.email });
  } catch (staffInfoError) {
    console.error("Failed to fetch staff info:", staffInfoError);
    return <ErrorCard message={"Failed to fetch staff info"} />;
  }

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
    return <ErrorCard message={"Failed to fetch staff info"} />;
  }

  return (
    <div className="min-h-screen p-2">
      <Form staffInfo={staffInfo.data} session={session} />
    </div>
  );
}
