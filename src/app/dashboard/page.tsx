/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { verifySession } from "@/dal/verifySession";
import { fetchStaffInfo } from "@/lib/SpreadSheet";
import { LogoutButton } from "@/components/LogoutButton";
import { auth } from "@/lib/auth/auth";

export default async function Dashboard() {
  const session = await verifySession();

  if (!session) {
    redirect("/");
  }

  const staffInfo = await fetchStaffInfo({ email: session.user.email });

  if (!staffInfo.data) {
    // Sign out the user server-side since they're not staff
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/?error=not-staff");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User Avatar"}
                      width={64}
                      height={64}
                      className="rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-xl font-semibold">
                        {session.user.name?.charAt(0) ||
                          session.user.email?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {staffInfo.data.name || "User"}!
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {session.user.email}
                  </CardDescription>
                </div>
              </div>
              <LogoutButton />
            </div>
          </CardHeader>
        </Card>

        {staffInfo.data && (
          <Card>
            <CardHeader>
              <CardTitle>Staff Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> {staffInfo.data.email}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
