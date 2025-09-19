import { NextResponse } from "next/server";
import { verifySession } from "@/dal/verifySession";
import { fetchEventInfo, fetchStaffInfo } from "@/lib/SpreadSheet";

export async function GET() {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffInfo = await fetchStaffInfo({ email: session.user.email });

    if (!staffInfo.data) {
      return NextResponse.json({});
    }

    const studentList = await fetchEventInfo();
    return NextResponse.json(studentList);
  } catch (error) {
    console.error("Error fetching student list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
