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
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { NOT_LOGGED_IN_ERROR, NOT_STAFF_ERROR } from "@/constants/constants";
import Beams from "@/components/Beams";

type HomeProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HomePage({ searchParams }: HomeProps) {
  const session = await verifySession();

  if (session) {
    const staffInfo = await fetchStaffInfo({ email: session.user.email });

    if (staffInfo.data) {
      redirect("/dashboard");
    } else {
      await auth.api.signOut({
        headers: await headers(),
      });
      redirect(`/?error=${NOT_STAFF_ERROR}`);
    }
  }
  const greeting = getTimeBasedGreeting();

  const getErrorMessage = (error: string) => {
    switch (error) {
      case NOT_STAFF_ERROR:
        return "You are not a staff";
      case NOT_LOGGED_IN_ERROR:
        return "Please sign in";
      default:
        return null;
    }
  };

  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams.error
    ? getErrorMessage(resolvedSearchParams.error as string)
    : null;

  return (
    <div className="h-screen overflow-hidden w-full flex flex-row justify-between items-center gap-0 relative z-10">
      <div className=" w-full items-center justify-center lg:w-1/2 p-6">
        <div className="flex w-full flex-col gap-6 items-center">
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

          <div className="flex flex-col gap-6 w-[90%]">
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
      <div className="h-screen w-1/2 hidden lg:block">
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={5}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={3}
          scale={0.2}
          rotation={30}
        />
      </div>
    </div>
  );
}
