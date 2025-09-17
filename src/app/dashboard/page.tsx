import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { verifySession } from "@/dal/verifySession";
import { fetchStaffInfo } from "@/lib/SpreadSheet";
import { auth } from "@/lib/auth/auth";
import { NOT_LOGGED_IN_ERROR, NOT_STAFF_ERROR } from "@/constants/constants";
import Form from "./Form";

export default async function Dashboard() {
  const session = await verifySession();

  if (!session) {
    redirect(`/?error=${NOT_LOGGED_IN_ERROR}`);
  }

  const staffInfo = await fetchStaffInfo({ email: session.user.email });

  if (!staffInfo.data) {
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect(`/?error=${NOT_STAFF_ERROR}`);
  }

  return (
    <div className="min-h-screen  p-2">
      <Form staffInfo={staffInfo.data} session={session} />
    </div>
  );
}
