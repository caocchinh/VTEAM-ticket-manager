import "server-only";
import { google } from "googleapis";
import { randomUUID } from "crypto";
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
  SALES_ORDER_BUYER_CLASS_INDEX,
  SALES_ORDER_BUYER_EMAIL_INDEX,
  SALES_ORDER_BUYER_ID_INDEX,
  SALES_ORDER_BUYER_NAME_INDEX,
  SALES_ORDER_MEDIUM_TYPE_INDEX,
  SALES_ORDER_NOTICE_INDEX,
  SALES_ORDER_STAFF_NAME_INDEX,
  SALES_ORDER_SUBMIT_TIME_INDEX,
  SALES_ORDER_TICKET_TYPE_INDEX,
  SALES_EVENT_INFO_SHEET_NAME,
  SALES_EVENT_CHECKIN_SHEET_NAME,
} from "@/constants/constants";
import {
  EventInfo,
  SalesInfo,
  Staff,
  Student,
  StudentInput,
  TicketInfo,
} from "@/constants/types";
import { getCurrentTime } from "./utils";
import { db } from "@/drizzle/db";
import { backUpOrder } from "@/drizzle/schema";

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

export const createSheetIfNotExists = async ({
  spreadsheetId,
  sheetName,
}: {
  spreadsheetId: string;
  sheetName: string;
}): Promise<{
  success: boolean;
  error?: string;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    // Check if sheet already exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const existingSheet = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === sheetName
    );

    if (existingSheet) {
      return {
        success: true,
      };
    }

    // Create new sheet
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    });

    const sheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId;

    if (sheetId !== undefined) {
      // Add header row values
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              "Thời gian mua",
              "Tên người điền",
              "Hình thức",
              "Tên người mua",
              "Lớp",
              "Email",
              "Mã số HS",
              "Hạng vé",
              "Lưu ý (nếu có)",
            ],
          ],
        },
      });

      // Format the header row with colors and borders
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            // Freeze the header row
            {
              updateSheetProperties: {
                properties: {
                  sheetId: sheetId,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
                fields: "gridProperties.frozenRowCount",
              },
            },
            // Light green for first 3 columns (A, B, C)
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 3,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      green: 0.843,
                      red: 0.714,
                      blue: 0.659,
                    },
                    textFormat: {
                      bold: true,
                    },
                  },
                },
                fields: "userEnteredFormat(backgroundColor,textFormat)",
              },
            },
            // Orange for remaining columns (D, E, F, G, H, I)
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 3,
                  endColumnIndex: 9,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.965,
                      green: 0.698,
                      blue: 0.419,
                    },
                    textFormat: {
                      bold: true,
                    },
                  },
                },
                fields: "userEnteredFormat(backgroundColor,textFormat)",
              },
            },
            {
              addConditionalFormatRule: {
                rule: {
                  ranges: [
                    {
                      sheetId: sheetId,
                      startRowIndex: 1,
                      startColumnIndex: 0,
                      endColumnIndex: 9,
                    },
                  ],
                  booleanRule: {
                    condition: {
                      type: "CUSTOM_FORMULA",
                      values: [
                        {
                          userEnteredValue: "=ISEVEN(ROW())",
                        },
                      ],
                    },
                    format: {
                      backgroundColor: {
                        red: 0.972,
                        green: 0.976,
                        blue: 0.98,
                      },
                    },
                  },
                },
                index: 0,
              },
            },
          ],
        },
      });

      return {
        success: true,
      };
    }

    return {
      success: false,
    };
  } catch (error: unknown) {
    console.error("Error creating sheet:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create sheet",
    };
  }
};

export const sendOrder = async ({
  orders,
  staffName,
}: {
  orders: StudentInput[];
  staffName: string;
}) => {
  const sheets = google.sheets({ version: "v4", auth });
  try {
    // Convert single order to array for consistent handling
    const ordersArray = Array.isArray(orders) ? orders : [orders];

    // Convert orders to rows format - matching the column order from constants
    const rows = ordersArray.map((order) => [
      getCurrentTime({ includeTime: true }), // A: Submit time
      staffName, // B: Staff name (to be filled separately if needed)
      order.paymentMedium, // C: Payment medium
      order.nameInput, // D: Buyer name
      order.homeroomInput, // E: Buyer class
      order.email, // F: Buyer email
      order.studentIdInput, // G: Buyer ID
      order.ticketType, // H: Ticket type
      order.notice, // I: Notice
    ]);

    try {
      // Insert backup orders into database
      const backupData = ordersArray.map((order) => ({
        id: randomUUID(), // Generate proper UUID
        staffName: staffName,
        paymentMedium: order.paymentMedium,
        buyerName: order.nameInput,
        email: order.email,
        studentIdId: order.studentIdInput,
        ticketType: order.ticketType,
        notice: order.notice || "",
      }));

      await db.insert(backUpOrder).values(backupData);
    } catch (dbError) {
      console.error("Failed to insert backup order:", dbError);
      // Continue with Google Sheets insertion even if DB backup fails
    }

    const todaySalesSheetName =
      "Sales offline " + getCurrentTime({ includeTime: false });

    // Ensure today's sheet exists before append operations
    await createSheetIfNotExists({
      spreadsheetId: SALES_SHEET_ID,
      sheetName: todaySalesSheetName,
    });

    // Run both append operations concurrently for better performance
    const [mainSheetResult, todaySheetResult, checkinSheetResult] =
      await Promise.allSettled([
        sheets.spreadsheets.values.append({
          spreadsheetId: SALES_SHEET_ID,
          range: `${SALES_ORDER_SHEET_NAME}!A:Z`,
          valueInputOption: "RAW",
          requestBody: {
            values: rows,
          },
        }),
        sheets.spreadsheets.values.append({
          spreadsheetId: SALES_SHEET_ID,
          range: `${todaySalesSheetName}!A:Z`,
          valueInputOption: "RAW",
          requestBody: {
            values: rows,
          },
        }),
        // First append the data
        sheets.spreadsheets.values.append({
          spreadsheetId: SALES_SHEET_ID,
          range: `${SALES_EVENT_CHECKIN_SHEET_NAME}!A:Z`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: ordersArray.map((order) => [
              order.ticketType, // A: Ticket type
              order.nameInput, // B: Buyer name
              order.homeroomInput, // C: Buyer class
              order.studentIdInput, // D: Buyer ID
              order.email, // E: Buyer email
              false, // F: Set is checkin to false
            ]),
          },
        }),
      ]);

    return {
      success:
        (mainSheetResult.status === "fulfilled" &&
          mainSheetResult.value.status === 200) ||
        (todaySheetResult.status === "fulfilled" &&
          todaySheetResult.value.status === 200) ||
        (checkinSheetResult.status === "fulfilled" &&
          checkinSheetResult.value.status === 200),
    };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const fetchSales = async (): Promise<{
  error: boolean;
  data: SalesInfo[] | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SALES_SHEET_ID,
      range: `${SALES_ORDER_SHEET_NAME}!A:Z`,
    });
    // Ignore the first row
    const data = response.data.values?.slice(1).map((value) => ({
      time: value[SALES_ORDER_SUBMIT_TIME_INDEX]
        ? value[SALES_ORDER_SUBMIT_TIME_INDEX].trim()
        : "",
      staffName: value[SALES_ORDER_STAFF_NAME_INDEX]
        ? value[SALES_ORDER_STAFF_NAME_INDEX].trim()
        : "",
      paymentMedium: value[SALES_ORDER_MEDIUM_TYPE_INDEX]
        ? value[SALES_ORDER_MEDIUM_TYPE_INDEX].trim()
        : "",
      buyerName: value[SALES_ORDER_BUYER_NAME_INDEX]
        ? value[SALES_ORDER_BUYER_NAME_INDEX].trim()
        : "",
      buyerClass: value[SALES_ORDER_BUYER_CLASS_INDEX]
        ? value[SALES_ORDER_BUYER_CLASS_INDEX].trim()
        : "",
      buyerEmail: value[SALES_ORDER_BUYER_EMAIL_INDEX]
        ? value[SALES_ORDER_BUYER_EMAIL_INDEX].trim()
        : "",
      buyerId: value[SALES_ORDER_BUYER_ID_INDEX]
        ? value[SALES_ORDER_BUYER_ID_INDEX].trim()
        : "",
      buyerTicketType: value[SALES_ORDER_TICKET_TYPE_INDEX]
        ? value[SALES_ORDER_TICKET_TYPE_INDEX].trim()
        : "",
      buyerNotice: value[SALES_ORDER_NOTICE_INDEX]
        ? value[SALES_ORDER_NOTICE_INDEX].trim()
        : "",
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

export const fetchEventInfo = async (): Promise<{
  error: boolean;
  data: EventInfo | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SALES_SHEET_ID,
      range: `${SALES_EVENT_INFO_SHEET_NAME}!A:Z`,
    });

    if (response.data.values) {
      return { error: false, data: response.data.values[1][0] as EventInfo };
    }
    return { error: true, data: undefined };
  } catch (error) {
    console.error(error);
    return { error: true, data: undefined };
  }
};
