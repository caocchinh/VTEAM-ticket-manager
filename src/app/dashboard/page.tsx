/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { verifySession } from "@/dal/verifySession";
import { fetchStaffInfo } from "@/lib/SpreadSheet";
import { LogoutButton } from "@/components/LogoutButton";
import { auth } from "@/lib/auth/auth";
import { NOT_LOGGED_IN_ERROR, NOT_STAFF_ERROR } from "@/constants/constants";
import { truncateText } from "@/lib/utils";
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
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="flex p-2 shadow-sm bg-card rounded-md items-center justify-between mr-auto w-max  gap-3 border-1 ">
        <div className="flex items-center">
          <div className="relative">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User Avatar"}
                width={35}
                height={35}
                className="rounded-full border-2  h-[35px] mr-1 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-xl font-semibold">
                  {session.user.name?.charAt(0) ||
                    session.user.email?.charAt(0) ||
                    "U"}
                </span>
              </div>
            )}
          </div>
          <div>
            <CardTitle className="text-sm">
              {truncateText(staffInfo.data.name, 24)}
            </CardTitle>
            <CardDescription className="text-[10px]">
              {truncateText(session.user.email, 24)}
            </CardDescription>
          </div>
        </div>
        <LogoutButton />
      </div>
      <Form />
    </div>
  );
}
