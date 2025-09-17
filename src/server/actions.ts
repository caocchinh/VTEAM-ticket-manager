"use server";

import { StudentInput } from "@/constants/types";
import { verifySession } from "@/dal/verifySession";
import { fetchStaffInfo, sendOrder } from "@/lib/SpreadSheet";

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

    const staffInfo = await fetchStaffInfo({ email: session.user.email });

    if (!staffInfo.data) {
      return { success: false, message: "Unauthorized" };
    }

    const result = await sendOrder({ orders, staffName: staffInfo.data.name });
    return { sucess: result.success };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
    return { success: false, message: "Unknow error" };
  }
};
