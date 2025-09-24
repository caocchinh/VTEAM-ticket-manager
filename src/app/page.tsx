import { redirect } from "next/navigation";
import Image from "next/image";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { ClientGreeting } from "@/components/ClientGreeting";
import { ErrorCard } from "@/components/ErrorCard";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { verifySession } from "@/dal/verifySession";
import { fetchStaffInfo } from "@/lib/SpreadSheet";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { NOT_LOGGED_IN_ERROR, NOT_STAFF_ERROR } from "@/constants/constants";
import { ERROR_CODES, getErrorMessage } from "@/constants/errors";
import Beams from "@/components/Beams";
import EmbededBrowserWarning from "@/components/EmbededBrowserWarning";

type HomeProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HomePage({ searchParams }: HomeProps) {
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

  if (session) {
    let staffInfo;
    try {
      staffInfo = await fetchStaffInfo({ email: session.user.email });
    } catch (staffInfoError) {
      console.error("Failed to fetch staff info:", staffInfoError);
      return (
        <ErrorCard
          message={getErrorMessage(ERROR_CODES.INTERNAL_SERVER_ERROR)}
        />
      );
    }

    if (staffInfo.data) {
      redirect("/dashboard");
    } else {
      if (staffInfo.error) {
        return (
          <ErrorCard
            message={getErrorMessage(ERROR_CODES.INTERNAL_SERVER_ERROR)}
          />
        );
      }

      try {
        await auth.api.signOut({
          headers: await headers(),
        });
      } catch (signOutError) {
        console.error("Failed to sign out user:", signOutError);
      }

      redirect(`/?error=${NOT_STAFF_ERROR}`);
    }
  }

  const getErrorMessageFromCode = (error: string) => {
    // Map legacy error codes to new system
    switch (error) {
      case NOT_STAFF_ERROR:
        return getErrorMessage(ERROR_CODES.UNAUTHORIZED);
      case NOT_LOGGED_IN_ERROR:
        return getErrorMessage(ERROR_CODES.NOT_LOGGED_IN);
      default:
        return getErrorMessage(ERROR_CODES.UNKNOWN_ERROR);
    }
  };

  let errorMessage = null;
  try {
    const resolvedSearchParams = await searchParams;
    errorMessage = resolvedSearchParams.error
      ? getErrorMessageFromCode(resolvedSearchParams.error as string)
      : null;
  } catch (searchParamsError) {
    console.error("Failed to resolve search params:", searchParamsError);
    errorMessage = getErrorMessage(ERROR_CODES.UNKNOWN_ERROR);
  }

  return (
    <>
      <EmbededBrowserWarning />
      <div className="h-[calc(100vh-40px)] -mb-4 overflow-hidden w-full flex flex-row justify-between items-center gap-0 relative z-10">
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
                  <ClientGreeting />
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
    </>
  );
}
