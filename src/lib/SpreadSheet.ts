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
  OFFLINE_SALES_SHEET_ID,
  OFFLINE_SALES_STAFF_EMAIL_INDEX,
  OFFLINE_SALES_STAFF_NAME_INDEX,
  OFFLINE_SALES_STAFF_SHEET_NAME,
  OFFLINE_SALES_TICKET_INFO_SHEET_NAME,
  OFFLINE_SALES_TICKET_INFO_NAME_INDEX,
  OFFLINE_SALES_TICKET_INFO_PRICE_INDEX,
  OFFLINE_SALES_TICKET_INFO_CLASS_RANGE_INDEX,
  OFFLINE_SALES_ORDER_SHEET_NAME,
  OFFLINE_SALES_ORDER_BUYER_CLASS_INDEX,
  OFFLINE_SALES_ORDER_BUYER_EMAIL_INDEX,
  OFFLINE_SALES_ORDER_BUYER_ID_INDEX,
  OFFLINE_SALES_ORDER_BUYER_NAME_INDEX,
  OFFLINE_SALES_ORDER_MEDIUM_TYPE_INDEX,
  OFFLINE_SALES_ORDER_NOTICE_INDEX,
  OFFLINE_SALES_ORDER_STAFF_NAME_INDEX,
  OFFLINE_SALES_ORDER_SUBMIT_TIME_INDEX,
  OFFLINE_SALES_ORDER_TICKET_TYPE_INDEX,
  OFFLINE_SALES_EVENT_INFO_SHEET_NAME,
  CHECKIN_SHEET_NAME,
  CHECKIN_SHEET_ID,
  ONLINE_SALES_SHEET_ID,
  ONLINE_SALES_TICKET_INFO_CLASS_RANGE_INDEX,
  ONLINE_SALES_TICKET_INFO_NAME_INDEX,
  ONLINE_SALES_TICKET_INFO_PRICE_INDEX,
  ONLINE_SALES_TICKET_INFO_SHEET_NAME,
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
import { retryExternalApi, retryDatabase } from "@/dal/retry";

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
    console.log(
      `[SPREADSHEET] Starting fetchStudentList from sheet: ${STUDENT_LIST_SHEET_ID}`
    );

    const response = await retryExternalApi(async () => {
      return await sheets.spreadsheets.values.get({
        spreadsheetId: STUDENT_LIST_SHEET_ID,
        range: `${STUDENT_LIST_SHEET_NAME}!A:Z`,
      });
    }, "fetchStudentList");

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

    console.log(
      `[SPREADSHEET] Successfully fetched ${
        data?.length || 0
      } students from student list`
    );
    return { error: false, data: data };
  } catch (error) {
    console.error(
      "[SPREADSHEET] Failed to fetch student list after all retries:",
      error
    );
    return { error: true, data: undefined };
  }
};

export const fetchOfflineTicketInfo = async (): Promise<{
  error: boolean;
  data: TicketInfo[] | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    console.log(
      `[SPREADSHEET] Starting fetchTicketInfo from sheet: ${OFFLINE_SALES_SHEET_ID}`
    );

    const response = await retryExternalApi(async () => {
      return await sheets.spreadsheets.values.get({
        spreadsheetId: OFFLINE_SALES_SHEET_ID,
        range: `${OFFLINE_SALES_TICKET_INFO_SHEET_NAME}!A:Z`,
      });
    }, "fetchTicketInfo");

    // Ignore the first row
    const data = response.data.values?.slice(1).map((value) => ({
      ticketName: value[OFFLINE_SALES_TICKET_INFO_NAME_INDEX]
        ? value[OFFLINE_SALES_TICKET_INFO_NAME_INDEX].trim()
        : "",
      price: value[OFFLINE_SALES_TICKET_INFO_PRICE_INDEX]
        ? value[OFFLINE_SALES_TICKET_INFO_PRICE_INDEX].trim()
        : "",
      classRange: value[OFFLINE_SALES_TICKET_INFO_CLASS_RANGE_INDEX]
        ? value[OFFLINE_SALES_TICKET_INFO_CLASS_RANGE_INDEX].split(",").map(
            (_value: string) => parseInt(_value)
          )
        : [],
    }));

    if (data) {
      console.log(
        `[SPREADSHEET] Successfully fetched ${data.length} ticket types`
      );
      return { error: false, data: data };
    }

    console.warn("[SPREADSHEET] No ticket data found in response");
    return { error: true, data: undefined };
  } catch (error) {
    console.error(
      "[SPREADSHEET] Failed to fetch ticket info after all retries:",
      error
    );
    return { error: true, data: undefined };
  }
};

export const fetchOfflineStaffInfo = async ({
  email,
}: {
  email: string;
}): Promise<{
  error: boolean;
  data: Staff | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    console.log(`[SPREADSHEET] Starting fetchStaffInfo for email: ${email}`);

    const response = await retryExternalApi(async () => {
      return await sheets.spreadsheets.values.get({
        spreadsheetId: OFFLINE_SALES_SHEET_ID,
        range: `${OFFLINE_SALES_STAFF_SHEET_NAME}!A:Z`,
      });
    }, "fetchStaffInfo");

    const foundValue = response.data.values?.find(
      (value) => value[OFFLINE_SALES_STAFF_EMAIL_INDEX] === email
    );

    const data = foundValue
      ? {
          email,
          name: foundValue[OFFLINE_SALES_STAFF_NAME_INDEX],
        }
      : undefined;

    if (data) {
      console.log(
        `[SPREADSHEET] Successfully found staff info for: ${data.name} (${email})`
      );
      return { error: false, data: data };
    }

    console.log(`[SPREADSHEET] No staff found for email: ${email}`);
    return { error: false, data: undefined };
  } catch (error) {
    console.error(
      `[SPREADSHEET] Failed to fetch staff info for ${email} after all retries:`,
      error
    );
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
    console.log(
      `[SPREADSHEET] Starting createSheetIfNotExists for sheet: ${sheetName} in spreadsheet: ${spreadsheetId}`
    );

    // Check if sheet already exists
    const spreadsheet = await retryExternalApi(async () => {
      return await sheets.spreadsheets.get({
        spreadsheetId,
      });
    }, "createSheetIfNotExists - check existing sheet");

    const existingSheet = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === sheetName
    );

    if (existingSheet) {
      console.log(
        `[SPREADSHEET] Sheet ${sheetName} already exists, skipping creation`
      );
      return {
        success: true,
      };
    }

    console.log(`[SPREADSHEET] Creating new sheet: ${sheetName}`);

    // Create new sheet
    const response = await retryExternalApi(async () => {
      return await sheets.spreadsheets.batchUpdate({
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
    }, "createSheetIfNotExists - create sheet");

    const sheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId;

    if (sheetId !== undefined) {
      console.log(
        `[SPREADSHEET] Sheet created with ID: ${sheetId}, adding headers`
      );

      // Add header row values
      await retryExternalApi(async () => {
        return await sheets.spreadsheets.values.append({
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
      }, "createSheetIfNotExists - add headers");

      console.log(
        `[SPREADSHEET] Headers added, applying formatting to sheet: ${sheetName}`
      );

      // Format the header row with colors and borders
      await retryExternalApi(async () => {
        return await sheets.spreadsheets.batchUpdate({
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
      }, "createSheetIfNotExists - format sheet");

      console.log(
        `[SPREADSHEET] Successfully created and formatted sheet: ${sheetName}`
      );
      return {
        success: true,
      };
    }

    console.error(
      `[SPREADSHEET] Failed to get sheet ID after creation for: ${sheetName}`
    );
    return {
      success: false,
    };
  } catch (error: unknown) {
    console.error(
      `[SPREADSHEET] Failed to create sheet ${sheetName} after all retries:`,
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create sheet",
    };
  }
};

export const sendOfflineOrder = async ({
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

    console.log(
      `[SPREADSHEET] Starting sendOfflineOrder for ${ordersArray.length} orders by staff: ${staffName}`
    );

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
      console.log("[SPREADSHEET] Attempting to backup orders to database");

      // Insert backup orders into database with retry
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

      await retryDatabase(async () => {
        return await db.insert(backUpOrder).values(backupData);
      }, "sendOfflineOrder - database backup");

      console.log(
        `[SPREADSHEET] Successfully backed up ${backupData.length} orders to database`
      );
    } catch (dbError) {
      console.error(
        "[SPREADSHEET] Failed to insert backup order after all retries:",
        dbError
      );
      // Continue with Google Sheets insertion even if DB backup fails
    }

    const todaySalesSheetName =
      "Sales offline " + getCurrentTime({ includeTime: false });

    console.log(`[SPREADSHEET] Ensuring sheet exists: ${todaySalesSheetName}`);

    // Ensure today's sheet exists before append operations
    await createSheetIfNotExists({
      spreadsheetId: OFFLINE_SALES_SHEET_ID,
      sheetName: todaySalesSheetName,
    });

    console.log("[SPREADSHEET] Inserting orders into sheets concurrently");

    // Run both append operations concurrently for better performance with retry
    const [mainSheetResult, todaySheetResult, checkinSheetResult] =
      await Promise.allSettled([
        retryExternalApi(async () => {
          return await sheets.spreadsheets.values.append({
            spreadsheetId: OFFLINE_SALES_SHEET_ID,
            range: `${OFFLINE_SALES_ORDER_SHEET_NAME}!A:Z`,
            valueInputOption: "RAW",
            requestBody: {
              values: rows,
            },
          });
        }, "sendOfflineOrder - main sales sheet"),
        retryExternalApi(async () => {
          return await sheets.spreadsheets.values.append({
            spreadsheetId: OFFLINE_SALES_SHEET_ID,
            range: `${todaySalesSheetName}!A:Z`,
            valueInputOption: "RAW",
            requestBody: {
              values: rows,
            },
          });
        }, "sendOfflineOrder - today sales sheet"),
        retryExternalApi(async () => {
          return await sheets.spreadsheets.values.append({
            spreadsheetId: CHECKIN_SHEET_ID,
            range: `${CHECKIN_SHEET_NAME}!A:Z`,
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
          });
        }, "sendOfflineOrder - checkin sheet"),
      ]);

    // Log individual results
    if (mainSheetResult.status === "fulfilled") {
      console.log(
        `[SPREADSHEET] Main sales sheet update: SUCCESS (${mainSheetResult.value.status})`
      );
    } else {
      console.error(
        "[SPREADSHEET] Main sales sheet update: FAILED",
        mainSheetResult.reason
      );
    }

    if (todaySheetResult.status === "fulfilled") {
      console.log(
        `[SPREADSHEET] Today sales sheet update: SUCCESS (${todaySheetResult.value.status})`
      );
    } else {
      console.error(
        "[SPREADSHEET] Today sales sheet update: FAILED",
        todaySheetResult.reason
      );
    }

    if (checkinSheetResult.status === "fulfilled") {
      console.log(
        `[SPREADSHEET] Checkin sheet update: SUCCESS (${checkinSheetResult.value.status})`
      );
    } else {
      console.error(
        "[SPREADSHEET] Checkin sheet update: FAILED",
        checkinSheetResult.reason
      );
    }

    const success =
      (mainSheetResult.status === "fulfilled" &&
        mainSheetResult.value.status === 200) ||
      (todaySheetResult.status === "fulfilled" &&
        todaySheetResult.value.status === 200) ||
      (checkinSheetResult.status === "fulfilled" &&
        checkinSheetResult.value.status === 200);

    console.log(
      `[SPREADSHEET] sendOfflineOrder completed with success: ${success}`
    );

    return {
      success,
    };
  } catch (error) {
    console.error(
      "[SPREADSHEET] sendOfflineOrder failed after all retries:",
      error
    );
    return { success: false };
  }
};

export const fetchOfflineSales = async (): Promise<{
  error: boolean;
  data: SalesInfo[] | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    console.log(
      `[SPREADSHEET] Starting fetchSales from sheet: ${OFFLINE_SALES_SHEET_ID}`
    );

    const response = await retryExternalApi(async () => {
      return await sheets.spreadsheets.values.get({
        spreadsheetId: OFFLINE_SALES_SHEET_ID,
        range: `${OFFLINE_SALES_ORDER_SHEET_NAME}!A:Z`,
      });
    }, "fetchOfflineSales");

    // Ignore the first row
    const data = response.data.values?.slice(1).map((value) => ({
      time: value[OFFLINE_SALES_ORDER_SUBMIT_TIME_INDEX]
        ? value[OFFLINE_SALES_ORDER_SUBMIT_TIME_INDEX].trim()
        : "",
      staffName: value[OFFLINE_SALES_ORDER_STAFF_NAME_INDEX]
        ? value[OFFLINE_SALES_ORDER_STAFF_NAME_INDEX].trim()
        : "",
      paymentMedium: value[OFFLINE_SALES_ORDER_MEDIUM_TYPE_INDEX]
        ? value[OFFLINE_SALES_ORDER_MEDIUM_TYPE_INDEX].trim()
        : "",
      buyerName: value[OFFLINE_SALES_ORDER_BUYER_NAME_INDEX]
        ? value[OFFLINE_SALES_ORDER_BUYER_NAME_INDEX].trim()
        : "",
      buyerClass: value[OFFLINE_SALES_ORDER_BUYER_CLASS_INDEX]
        ? value[OFFLINE_SALES_ORDER_BUYER_CLASS_INDEX].trim()
        : "",
      buyerEmail: value[OFFLINE_SALES_ORDER_BUYER_EMAIL_INDEX]
        ? value[OFFLINE_SALES_ORDER_BUYER_EMAIL_INDEX].trim()
        : "",
      buyerId: value[OFFLINE_SALES_ORDER_BUYER_ID_INDEX]
        ? value[OFFLINE_SALES_ORDER_BUYER_ID_INDEX].trim()
        : "",
      buyerTicketType: value[OFFLINE_SALES_ORDER_TICKET_TYPE_INDEX]
        ? value[OFFLINE_SALES_ORDER_TICKET_TYPE_INDEX].trim()
        : "",
      buyerNotice: value[OFFLINE_SALES_ORDER_NOTICE_INDEX]
        ? value[OFFLINE_SALES_ORDER_NOTICE_INDEX].trim()
        : "",
    }));

    if (data) {
      console.log(
        `[SPREADSHEET] Successfully fetched ${data.length} sales records`
      );
      return { error: false, data: data };
    }

    console.warn("[SPREADSHEET] No sales data found in response");
    return { error: true, data: undefined };
  } catch (error) {
    console.error(
      "[SPREADSHEET] Failed to fetch sales after all retries:",
      error
    );
    return { error: true, data: undefined };
  }
};

export const fetchEventInfo = async (): Promise<{
  error: boolean;
  data: EventInfo | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    console.log(
      `[SPREADSHEET] Starting fetchOfflineEventInfo from sheet: ${OFFLINE_SALES_SHEET_ID}`
    );

    const response = await retryExternalApi(async () => {
      return await sheets.spreadsheets.values.get({
        spreadsheetId: OFFLINE_SALES_SHEET_ID,
        range: `${OFFLINE_SALES_EVENT_INFO_SHEET_NAME}!A:Z`,
      });
    }, "fetchOfflineEventInfo");

    if (response.data.values) {
      const eventInfo = response.data.values[1][0] as EventInfo;
      console.log(
        `[SPREADSHEET] Successfully fetched event info: ${eventInfo}`
      );
      return { error: false, data: eventInfo };
    }

    console.warn("[SPREADSHEET] No event info found in response");
    return { error: true, data: undefined };
  } catch (error) {
    console.error(
      "[SPREADSHEET] Failed to fetch event info after all retries:",
      error
    );
    return { error: true, data: undefined };
  }
};

export const fetchOnlineTicketInfo = async (): Promise<{
  error: boolean;
  data: TicketInfo[] | undefined;
}> => {
  const operationId = randomUUID().slice(0, 6);
  console.log(`[TICKET-${operationId}] Fetching ticket info...`);

  try {
    const result = await retryExternalApi(async () => {
      const sheets = google.sheets({ version: "v4", auth });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: ONLINE_SALES_SHEET_ID,
        range: `${ONLINE_SALES_TICKET_INFO_SHEET_NAME}!A:Z`,
      });

      // Check if response is successful
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }

      return response;
    }, `Ticket info fetch from Google Sheets`);

    // Ignore the first row
    const data = result.data.values?.slice(1).map((value) => ({
      ticketName: value[ONLINE_SALES_TICKET_INFO_NAME_INDEX]
        ? value[ONLINE_SALES_TICKET_INFO_NAME_INDEX].trim()
        : "",
      price: value[ONLINE_SALES_TICKET_INFO_PRICE_INDEX]
        ? value[ONLINE_SALES_TICKET_INFO_PRICE_INDEX].trim()
        : "",
      classRange: value[ONLINE_SALES_TICKET_INFO_CLASS_RANGE_INDEX]
        ? value[ONLINE_SALES_TICKET_INFO_CLASS_RANGE_INDEX].split(",").map(
            (_value: string) => parseInt(_value)
          )
        : [],
    }));

    if (data) {
      console.log(
        `[TICKET-${operationId}] Successfully fetched ${data.length} ticket types`
      );
      return { error: false, data: data };
    }

    console.warn(`[TICKET-${operationId}] No ticket data found`);
    return { error: true, data: undefined };
  } catch (error) {
    console.error(
      `[TICKET-${operationId}] Failed to fetch ticket info:`,
      error
    );

    if (error instanceof Error) {
      // Provide specific error context
      if (
        error.message.includes("rate limit") ||
        error.message.includes("quota")
      ) {
        console.error(
          `[TICKET-${operationId}] Google Sheets rate limit for ticket data`
        );
      } else if (error.message.includes("authentication")) {
        console.error(
          `[TICKET-${operationId}] Authentication issue with ticket sheet`
        );
      }
    }

    return { error: true, data: undefined };
  }
};
