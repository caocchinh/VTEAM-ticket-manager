"use server";

import { StudentInput } from "@/constants/types";
import { verifySession } from "@/dal/verifySession";
import { fetchOfflineStaffInfo, sendOfflineOrder } from "@/lib/SpreadSheet";

export const sendOrderAction = async ({
  orders,
}: {
  orders: StudentInput[];
}) => {
  try {
    const session = await verifySession();

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    const staffInfo = await fetchOfflineStaffInfo({ email: session.user.email });

    if (!staffInfo.data) {
      return { success: false, message: "Unauthorized" };
    }

    const result = await sendOfflineOrder({ orders, staffName: staffInfo.data.name });
    return { success: result.success };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
    return { success: false, message: "Unknow error" };
  }
};
