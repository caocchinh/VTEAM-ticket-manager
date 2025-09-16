import { redirect } from "next/navigation";
import Image from "next/image";
import { getTimeBasedGreeting } from "@/lib/timeGreeting";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { verifySession } from "@/dal/verifySession";
import { fetchStaffInfo } from "@/lib/SpreadSheet";

type HomeProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HomePage({ searchParams }: HomeProps) {
  const session = await verifySession();

  if (session) {
    const staffInfo = await fetchStaffInfo({ email: session.user.email });

    if (staffInfo.data) {
      redirect("/dashboard");
    }
  }
  const greeting = getTimeBasedGreeting();

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "not-staff":
        return "You are not a staff member";
      case "not-logged-in":
        return "You are not logged in";
      default:
        return null;
    }
  };

  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams.error
    ? getErrorMessage(resolvedSearchParams.error as string)
    : null;

  return (
    <div className="min-h-screen w-full p-6 md:p-10 flex justify-start items-center flex-col gap-6 relative z-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-2 self-center font-medium">
          <Image
            src="/assets/logo.webp"
            alt="VTEAM"
            width={110}
            height={110}
            className="dark:invert"
          />
          <h1 className="text-3xl text-center">
            VTEAM - Vinschool Central Park
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-center font-medium">
                {errorMessage}
              </p>
            </div>
          )}

          <Card className="min-h-[100px]">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{greeting.message}</CardTitle>
              <CardDescription>Staff login</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-6 items-center justify-center">
              <GoogleSignInButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
