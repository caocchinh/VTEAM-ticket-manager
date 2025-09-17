import "server-only";
import { google } from "googleapis";
import {
  STUDENT_LIST_SHEET_ID,
  STUDENT_LIST_SHEET_NAME,
  STUDENT_LIST_STUDENT_GENDER_INDEX,
  STUDENT_LIST_STUDENT_HOMEROOM_INDEX,
  STUDENT_LIST_STUDENT_ID_INDEX,
  STUDENT_LIST_STUDENT_NAME_INDEX,
  SALES_SHEET_ID,
  SALES_STAFF_EMAIL_INDEX,
  SALES_STAFF_NAME_INDEX,
  SALES_STAFF_SHEET_NAME,
  SALES_TICKET_INFO_SHEET_NAME,
  SALES_TICKET_INFO_NAME_INDEX,
  SALES_TICKET_INFO_PRICE_INDEX,
  SALES_TICKET_INFO_CLASS_RANGE_INDEX,
  SALES_ORDER_SHEET_NAME,
} from "@/constants/constants";
import { Staff, Student, StudentInput, TicketInfo } from "@/constants/types";
import { getCurrentTime } from "./utils";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: atob(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY).replace(
      /\\n/g,
      "\n"
    ),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const fetchStudentList = async (): Promise<{
  error: boolean;
  data: Student[] | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: STUDENT_LIST_SHEET_ID,
      range: `${STUDENT_LIST_SHEET_NAME}!A:Z`,
    });
    const data = response.data.values?.map((value, index) => ({
      name: value[STUDENT_LIST_STUDENT_NAME_INDEX]
        ? value[STUDENT_LIST_STUDENT_NAME_INDEX].trim()
        : "",
      homeroom: value[STUDENT_LIST_STUDENT_HOMEROOM_INDEX]
        ? value[STUDENT_LIST_STUDENT_HOMEROOM_INDEX].trim()
        : "",
      studentId: value[STUDENT_LIST_STUDENT_ID_INDEX]
        ? value[STUDENT_LIST_STUDENT_ID_INDEX].trim()
        : "",
      gender: value[STUDENT_LIST_STUDENT_GENDER_INDEX]
        ? value[STUDENT_LIST_STUDENT_GENDER_INDEX].trim()
        : "",

      row: index,
    }));
    return { error: false, data: data };
  } catch (error) {
    console.error(error);
    return { error: true, data: undefined };
  }
};

export const fetchTicketInfo = async (): Promise<{
  error: boolean;
  data: TicketInfo[] | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SALES_SHEET_ID,
      range: `${SALES_TICKET_INFO_SHEET_NAME}!A:Z`,
    });
    // Ignore the first row
    const data = response.data.values?.slice(1).map((value) => ({
      ticketName: value[SALES_TICKET_INFO_NAME_INDEX]
        ? value[SALES_TICKET_INFO_NAME_INDEX].trim()
        : "",
      price: value[SALES_TICKET_INFO_PRICE_INDEX]
        ? value[SALES_TICKET_INFO_PRICE_INDEX].trim()
        : "",
      classRange: value[SALES_TICKET_INFO_CLASS_RANGE_INDEX]
        ? value[SALES_TICKET_INFO_CLASS_RANGE_INDEX].split(",").map(
            (_value: string) => parseInt(_value)
          )
        : [],
    }));
    if (data) {
      return { error: false, data: data };
    }
    return { error: true, data: undefined };
  } catch (error) {
    console.error(error);
    return { error: true, data: undefined };
  }
};

export const fetchStaffInfo = async ({
  email,
}: {
  email: string;
}): Promise<{
  error: boolean;
  data: Staff | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SALES_SHEET_ID,
      range: `${SALES_STAFF_SHEET_NAME}!A:Z`,
    });
    const foundValue = response.data.values?.find(
      (value) => value[SALES_STAFF_EMAIL_INDEX] === email
    );

    const data = foundValue
      ? {
          email,
          name: foundValue[SALES_STAFF_NAME_INDEX],
        }
      : undefined;
    if (data) {
      return { error: false, data: data };
    }
    return { error: true, data: undefined };
  } catch (error) {
    console.error(error);
    return { error: true, data: undefined };
  }
};

export const sendOrder = async ({
  orders,
}: {
  orders: StudentInput | StudentInput[];
}) => {
  const sheets = google.sheets({ version: "v4", auth });
  try {
    // Convert single order to array for consistent handling
    const ordersArray = Array.isArray(orders) ? orders : [orders];

    // Convert orders to rows format - matching the column order from constants
    const rows = ordersArray.map((order) => [
      getCurrentTime(), // A: Submit time
      "", // B: Staff name (to be filled separately if needed)
      order.paymentMedium, // C: Payment medium
      order.nameInput, // D: Buyer name
      order.homeroomInput, // E: Buyer class
      order.email, // F: Buyer email
      order.studentIdInput, // G: Buyer ID
      order.ticketType, // H: Ticket type
      order.notice, // I: Notice
    ]);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SALES_SHEET_ID,
      range: `${SALES_ORDER_SHEET_NAME}!A:Z`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: rows,
      },
    });

    return { error: false, data: response.data };
  } catch (error) {
    console.error(error);
    return { error: true, data: undefined };
  }
};
