import "server-only";
import { google } from "googleapis";
import { randomUUID } from "crypto";
import { safeTrim } from "./utils";
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
  ONLINE_SALES_ORDER_SHEET_NAME,
  ONLINE_SALES_ORDER_BUYER_ID_INDEX,
  ONLINE_SALES_ORDER_SUBMIT_TIME_INDEX,
  ONLINE_SALES_ORDER_BUYER_CLASS_INDEX,
  ONLINE_SALES_ORDER_BUYER_NAME_INDEX,
  ONLINE_SALES_ORDER_BUYER_EMAIL_INDEX,
  ONLINE_SALES_ORDER_TICKET_TYPE_INDEX,
  ONLINE_SALES_ORDER_REJECTION_REASON_INDEX,
  ONLINE_SALES_ORDER_PROOF_OF_PAYMENT_IMAGE_INDEX,
  ONLINE_SALES_ORDER_HAS_BEEN_VERIFIED_INDEX,
  ONLINE_SALES_COORDINATOR_SHEET_NAME,
  ONLINE_SALES_COORDINATOR_EMAIL_INDEX,
  ONLINE_SALES_COORDINATOR_NAME_INDEX,
  STUDENT_LIST_STUDENT_EMAIL_INDEX,
  ONLINE_SALES_ORDER_HAS_BEEN_VERIFIED_COLUMN,
  ONLINE_SALES_ORDER_REJECTION_REASON_COLUMN,
  VERIFICATION_FAILED,
  VERIFICATION_APPROVED,
  VERIFICATION_PENDING_DB,
  VERIFICATION_APPROVED_DB,
  VERIFICATION_FAILED_DB,
  OFFLINE_SALES_EVENT_INFO_EVENT_TYPE_INDEX,
  OFFLINE_SALES_EVENT_INFO_EVENT_YEAR_INDEX,
  OFFLINE_SALES_EVENT_INFO_EVENT_DATE_INDEX,
  OFFLINE_SALES_EVENT_INFO_EVENT_NAME_INDEX,
  OFFLINE_SALES_EMAIL_INFO_SHEET_NAME,
  OFFLINE_SALES_EMAIL_INFO_EMAIL_BANNER_IMAGE_INDEX,
  OFFLINE_SALES_EMAIL_INFO_EMAIL_SUBJECT_INDEX,
  OFFLINE_SALES_ORDER_EMAIL_STATUS_COLUMN,
  ONLINE_SALES_ORDER_EMAIL_STATUS_COLUMN,
  TEACHER_VERIFICATION_SHEET_ID,
  TEACHER_VERIFICATION_SHEET_NAME,
  TEACHER_VERIFICATION_STUDENT_NAME_INDEX,
  TEACHER_VERIFICATION_STUDENT_ID_INDEX,
  TEACHER_VERIFICATION_STUDENT_HOMEROOM_INDEX,
  PENDING_EMAIL_STATUS,
  SENT_EMAIL_STATUS,
  OFFLINE_SALES_ORDER_EMAIL_STATUS_INDEX,
  ONLINE_SALES_ORDER_EMAIL_STATUS_INDEX,
  FAILED_EMAIL_STATUS,
  TEACHER_VERIFICATION_TEACHER_NOTICE_INDEX,
  TEACHER_VERIFICATION_STUDENT_ACCEPT_STATUS_INDEX,
  TEACHER_VERIFICATION_STUDENT_REJECT_STATUS_INDEX,
} from "@/constants/constants";
import {
  EventInfo,
  OfflineSalesInfo,
  OnlineSalesInfo,
  OnlineCoordinator,
  Staff,
  Student,
  StudentInput,
  TicketInfo,
  SheetOrderStatus,
  EmailInfo,
  TeacherVerificationInfo,
  TeacherVerificationStatus,
} from "@/constants/types";
import { getCurrentTime } from "./utils";
import { offlineTicketDb } from "@/drizzle/offline/db";
import { backUpOrder } from "@/drizzle/offline/schema";
import { retryExternalApi, retryDatabase } from "@/dal/retry";
import { onlineTicketDb } from "@/drizzle/online/db";
import { currentOrderStatus } from "@/drizzle/online/schema";
import { eq } from "drizzle-orm";

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
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: STUDENT_LIST_SHEET_ID,
        range: `${STUDENT_LIST_SHEET_NAME}!A:Z`,
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
    }, "fetchStudentList");

    const data = response.data.values?.map((value) => ({
      name: safeTrim(value[STUDENT_LIST_STUDENT_NAME_INDEX]),
      homeroom: safeTrim(value[STUDENT_LIST_STUDENT_HOMEROOM_INDEX]),
      studentId: safeTrim(value[STUDENT_LIST_STUDENT_ID_INDEX]),
      gender: safeTrim(value[STUDENT_LIST_STUDENT_GENDER_INDEX]),
      email: safeTrim(value[STUDENT_LIST_STUDENT_EMAIL_INDEX]),
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
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: OFFLINE_SALES_SHEET_ID,
        range: `${OFFLINE_SALES_TICKET_INFO_SHEET_NAME}!A:Z`,
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
    }, "fetchTicketInfo");

    // Ignore the first row
    const data = response.data.values?.slice(1).map((value) => ({
      ticketName: safeTrim(value[OFFLINE_SALES_TICKET_INFO_NAME_INDEX]),
      price: safeTrim(value[OFFLINE_SALES_TICKET_INFO_PRICE_INDEX]),
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
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: OFFLINE_SALES_SHEET_ID,
        range: `${OFFLINE_SALES_STAFF_SHEET_NAME}!A:Z`,
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
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
        `[SPREADSHEET] Successfully offline found staff info for: ${data.name} (${email})`
      );
      return { error: false, data: data };
    }

    console.log(`[SPREADSHEET] No offline staff found for email: ${email}`);
    return { error: false, data: undefined };
  } catch (error) {
    console.error(
      `[SPREADSHEET] Failed to fetch offline staff info for ${email} after all retries:`,
      error
    );
    return { error: true, data: undefined };
  }
};

export const fetchOnlineCoordinatorInfo = async ({
  email,
}: {
  email: string;
}): Promise<{
  error: boolean;
  data: OnlineCoordinator | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    console.log(`[SPREADSHEET] Starting fetchStaffInfo for email: ${email}`);

    const response = await retryExternalApi(async () => {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: ONLINE_SALES_SHEET_ID,
        range: `${ONLINE_SALES_COORDINATOR_SHEET_NAME}!A:Z`,
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
    }, "fetchStaffInfo");

    const foundValue = response.data.values?.find(
      (value) => value[ONLINE_SALES_COORDINATOR_EMAIL_INDEX] === email
    );

    const data = foundValue
      ? {
          email,
          name: foundValue[ONLINE_SALES_COORDINATOR_NAME_INDEX],
        }
      : undefined;

    if (data) {
      console.log(
        `[SPREADSHEET] Successfully online found staff info for: ${data.name} (${email})`
      );
      return { error: false, data: data };
    }

    console.log(`[SPREADSHEET] No online staff found for email: ${email}`);
    return { error: false, data: undefined };
  } catch (error) {
    console.error(
      `[SPREADSHEET] Failed to fetch online staff info for ${email} after all retries:`,
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
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
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
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
    }, "createSheetIfNotExists - create sheet");

    const sheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId;

    if (sheetId !== undefined) {
      console.log(
        `[SPREADSHEET] Sheet created with ID: ${sheetId}, adding headers`
      );

      // Add header row values
      await retryExternalApi(async () => {
        const response = await sheets.spreadsheets.values.append({
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
        if (response.status !== 200) {
          throw new Error(
            `Google Sheets API returned status ${response.status}: ${response.statusText}`
          );
        }
        return response;
      }, "createSheetIfNotExists - add headers");

      console.log(
        `[SPREADSHEET] Headers added, applying formatting to sheet: ${sheetName}`
      );

      // Format the header row with colors and borders
      await retryExternalApi(async () => {
        const response = await sheets.spreadsheets.batchUpdate({
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
        if (response.status !== 200) {
          throw new Error(
            `Google Sheets API returned status ${response.status}: ${response.statusText}`
          );
        }
        return response;
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

    try {
      console.log(
        "[SPREADSHEET] Attempting to backup offline orders to database"
      );

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
        return await offlineTicketDb
          .insert(backUpOrder)
          .values(backupData)
          .onConflictDoNothing();
      }, "sendOfflineOrder - database backup");

      console.log(
        `[SPREADSHEET] Successfully backed up ${backupData.length} offline orders to database`
      );
    } catch (dbError) {
      console.error(
        "[SPREADSHEET] Failed to insert backup offline order after all retries:",
        dbError
      );
      // Continue with Google Sheets insertion even if DB backup fails
    }

    const todaySalesSheetName =
      "Offline sales " + getCurrentTime({ includeTime: false });

    console.log(`[SPREADSHEET] Ensuring sheet exists: ${todaySalesSheetName}`);

    // Ensure today's sheet exists before append operations
    await createSheetIfNotExists({
      spreadsheetId: OFFLINE_SALES_SHEET_ID,
      sheetName: todaySalesSheetName,
    });

    console.log(
      "[SPREADSHEET] Inserting offline orders into sheets concurrently"
    );

    // Run both append operations concurrently for better performance with retry
    const [mainSheetResult, todaySheetResult, checkinSheetResult] =
      await Promise.allSettled([
        retryExternalApi(async () => {
          const response = await sheets.spreadsheets.values.append({
            spreadsheetId: OFFLINE_SALES_SHEET_ID,
            range: `${OFFLINE_SALES_ORDER_SHEET_NAME}!A:Z`,
            valueInputOption: "RAW",
            requestBody: {
              values: ordersArray.map((order) => [
                getCurrentTime({ includeTime: true }), // A: Submit time
                staffName, // B: Staff name (to be filled separately if needed)
                order.paymentMedium, // C: Payment medium
                order.nameInput, // D: Buyer name
                order.homeroomInput, // E: Buyer class
                order.email, // F: Buyer email
                order.studentIdInput, // G: Buyer ID
                order.ticketType, // H: Ticket type
                order.notice, // I: Notice
                PENDING_EMAIL_STATUS, // J: Email status
              ]),
            },
          });
          if (response.status !== 200) {
            throw new Error(
              `Google Sheets API returned status ${response.status}: ${response.statusText}`
            );
          }
          return response;
        }, "sendOfflineOrder - main offline sales sheet"),
        retryExternalApi(async () => {
          const response = await sheets.spreadsheets.values.append({
            spreadsheetId: OFFLINE_SALES_SHEET_ID,
            range: `${todaySalesSheetName}!A:Z`,
            valueInputOption: "RAW",
            requestBody: {
              values: ordersArray.map((order) => [
                getCurrentTime({ includeTime: true }), // A: Submit time
                staffName, // B: Staff name (to be filled separately if needed)
                order.paymentMedium, // C: Payment medium
                order.nameInput, // D: Buyer name
                order.homeroomInput, // E: Buyer class
                order.email, // F: Buyer email
                order.studentIdInput, // G: Buyer ID
                order.ticketType, // H: Ticket type
                order.notice, // I: Notice
              ]),
            },
          });
          if (response.status !== 200) {
            throw new Error(
              `Google Sheets API returned status ${response.status}: ${response.statusText}`
            );
          }
          return response;
        }, "sendOfflineOrder - today offline sales sheet"),
        retryExternalApi(async () => {
          const response = await sheets.spreadsheets.values.append({
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
                false, // F: Set is check-in default status to false
              ]),
            },
          });
          if (response.status !== 200) {
            throw new Error(
              `Google Sheets API returned status ${response.status}: ${response.statusText}`
            );
          }
          return response;
        }, "sendOfflineOrder - checkin offline sales sheet"),
      ]);

    // Log individual results
    if (mainSheetResult.status === "fulfilled") {
      console.log(
        `[SPREADSHEET] Main offline sales sheet update: SUCCESS (${mainSheetResult.value.status})`
      );
    } else {
      console.error(
        "[SPREADSHEET] Main offline sales sheet update: FAILED",
        mainSheetResult.reason
      );
    }

    if (todaySheetResult.status === "fulfilled") {
      console.log(
        `[SPREADSHEET] Today offline sales sheet update: SUCCESS (${todaySheetResult.value.status})`
      );
    } else {
      console.error(
        "[SPREADSHEET] Today offline sales sheet update: FAILED",
        todaySheetResult.reason
      );
    }

    if (checkinSheetResult.status === "fulfilled") {
      console.log(
        `[SPREADSHEET] Checkin offline sales sheet update: SUCCESS (${checkinSheetResult.value.status})`
      );
    } else {
      console.error(
        "[SPREADSHEET] Checkin offline sales sheet update: FAILED",
        checkinSheetResult.reason
      );
    }
    // Determine overall success based on main sheet result, other sheets are auxiliary
    const success =
      mainSheetResult.status === "fulfilled" &&
      mainSheetResult.value.status === 200;

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
  data: OfflineSalesInfo[] | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    console.log(
      `[SPREADSHEET] Starting fetchOfflineSales from sheet: ${OFFLINE_SALES_SHEET_ID}`
    );

    const response = await retryExternalApi(async () => {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: OFFLINE_SALES_SHEET_ID,
        range: `${OFFLINE_SALES_ORDER_SHEET_NAME}!A:Z`,
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
    }, "fetchOfflineSales");

    // Ignore the first row
    const data = response.data.values?.slice(1).map((value) => ({
      time: safeTrim(value[OFFLINE_SALES_ORDER_SUBMIT_TIME_INDEX]),
      staffName: safeTrim(value[OFFLINE_SALES_ORDER_STAFF_NAME_INDEX]),
      paymentMedium: safeTrim(value[OFFLINE_SALES_ORDER_MEDIUM_TYPE_INDEX]),
      buyerName: safeTrim(value[OFFLINE_SALES_ORDER_BUYER_NAME_INDEX]),
      buyerClass: safeTrim(value[OFFLINE_SALES_ORDER_BUYER_CLASS_INDEX]),
      buyerEmail: safeTrim(value[OFFLINE_SALES_ORDER_BUYER_EMAIL_INDEX]),
      buyerId: safeTrim(value[OFFLINE_SALES_ORDER_BUYER_ID_INDEX]),
      buyerTicketType: safeTrim(value[OFFLINE_SALES_ORDER_TICKET_TYPE_INDEX]),
      buyerNotice: safeTrim(value[OFFLINE_SALES_ORDER_NOTICE_INDEX]),
      emailStatus: safeTrim(value[OFFLINE_SALES_ORDER_EMAIL_STATUS_INDEX]),
    }));

    if (data) {
      console.log(
        `[SPREADSHEET] Successfully fetched ${data.length} offline sales records`
      );
      return { error: false, data: data };
    }

    console.warn("[SPREADSHEET] No offline sales data found in response");
    return { error: true, data: undefined };
  } catch (error) {
    console.error(
      "[SPREADSHEET] Failed to fetch offline sales after all retries:",
      error
    );
    return { error: true, data: undefined };
  }
};

export const fetchOnlineSales = async (): Promise<{
  error: boolean;
  data: OnlineSalesInfo[] | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    console.log(
      `[SPREADSHEET] Starting fetchOnlineSales from sheet: ${ONLINE_SALES_SHEET_ID}`
    );

    const response = await retryExternalApi(async () => {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: ONLINE_SALES_SHEET_ID,
        range: `${ONLINE_SALES_ORDER_SHEET_NAME}!A:Z`,
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
    }, "fetchOnlineSales");

    // Ignore the first row
    const data = response.data.values?.slice(1).map((value) => ({
      time: safeTrim(value[ONLINE_SALES_ORDER_SUBMIT_TIME_INDEX]),
      buyerName: safeTrim(value[ONLINE_SALES_ORDER_BUYER_NAME_INDEX]),
      buyerClass: safeTrim(value[ONLINE_SALES_ORDER_BUYER_CLASS_INDEX]),
      buyerEmail: safeTrim(value[ONLINE_SALES_ORDER_BUYER_EMAIL_INDEX]),
      buyerId: safeTrim(value[ONLINE_SALES_ORDER_BUYER_ID_INDEX]),
      buyerTicketType: safeTrim(value[ONLINE_SALES_ORDER_TICKET_TYPE_INDEX]),
      proofOfPaymentImage: safeTrim(
        value[ONLINE_SALES_ORDER_PROOF_OF_PAYMENT_IMAGE_INDEX]
      ),
      rejectionReason: safeTrim(
        value[ONLINE_SALES_ORDER_REJECTION_REASON_INDEX]
      ),
      verificationStatus: safeTrim(
        value[ONLINE_SALES_ORDER_HAS_BEEN_VERIFIED_INDEX]
      ) as SheetOrderStatus,
      emailStatus: safeTrim(value[ONLINE_SALES_ORDER_EMAIL_STATUS_INDEX]),
    }));

    if (data) {
      console.log(
        `[SPREADSHEET] Successfully fetched ${data.length} online sales records`
      );
      return { error: false, data: data };
    }

    console.warn("[SPREADSHEET] No online sales data found in response");
    return { error: true, data: undefined };
  } catch (error) {
    console.error(
      "[SPREADSHEET] Failed to fetch online sales after all retries:",
      error
    );
    return { error: true, data: undefined };
  }
};

export const fetchTeacherVerification = async (): Promise<{
  error: boolean;
  data: TeacherVerificationInfo[] | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    console.log(
      `[SPREADSHEET] Starting fetchTeacherVerification from sheet: ${TEACHER_VERIFICATION_SHEET_ID}`
    );

    const response = await retryExternalApi(async () => {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: TEACHER_VERIFICATION_SHEET_ID,
        range: `${TEACHER_VERIFICATION_SHEET_NAME}!A:Z`,
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
    }, "fetchTeacherVerification");

    // Ignore the first row
    const data = response.data.values?.slice(1).map((value) => ({
      name: safeTrim(value[TEACHER_VERIFICATION_STUDENT_NAME_INDEX]),
      studentId: safeTrim(value[TEACHER_VERIFICATION_STUDENT_ID_INDEX]),
      homeroom: safeTrim(value[TEACHER_VERIFICATION_STUDENT_HOMEROOM_INDEX]),
      acceptStatus: safeTrim(
        value[TEACHER_VERIFICATION_STUDENT_ACCEPT_STATUS_INDEX]
      ) as TeacherVerificationStatus,
      rejectStatus: safeTrim(
        value[TEACHER_VERIFICATION_STUDENT_REJECT_STATUS_INDEX]
      ) as TeacherVerificationStatus,
      teacherNotice: safeTrim(value[TEACHER_VERIFICATION_TEACHER_NOTICE_INDEX]),
    }));

    if (data) {
      console.log(
        `[SPREADSHEET] Successfully fetched ${data.length} teacher verification records`
      );
      return { error: false, data: data };
    }

    console.warn(
      "[SPREADSHEET] No teacher verification data found in response"
    );
    return { error: true, data: undefined };
  } catch (error) {
    console.error(
      "[SPREADSHEET] Failed to fetch teacher verification after all retries:",
      error
    );
    return { error: true, data: undefined };
  }
};

export const updateOnlineOrderStatus = async ({
  studentId,
  verificationStatus,
  rejectionReason,
}: {
  studentId: string;
  verificationStatus: SheetOrderStatus;
  rejectionReason: string | null;
}): Promise<{
  error: boolean;
  errorMessage: string | undefined;
  data: OnlineSalesInfo | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  const onlineSales = await fetchOnlineSales();
  if (onlineSales.error || !onlineSales.data) {
    return {
      error: true,
      errorMessage: "Failed to fetch online sales",
      data: undefined,
    };
  }
  const onlineSalesData = onlineSales.data;
  const orderIndexInSheet = onlineSalesData?.findIndex(
    (order) =>
      order.buyerId === studentId &&
      order.verificationStatus !== verificationStatus
  );
  if (!onlineSalesData) {
    return {
      error: true,
      errorMessage: "Failed to fetch online sales",
      data: undefined,
    };
  }
  if (orderIndexInSheet === -1) {
    return { error: true, errorMessage: "Order not found", data: undefined };
  }
  const order = onlineSalesData?.[orderIndexInSheet] as OnlineSalesInfo;
  if (
    !order.buyerId ||
    !order.buyerName ||
    !order.buyerClass ||
    !order.buyerEmail ||
    !order.buyerTicketType
  ) {
    return {
      error: true,
      errorMessage: "Order data is invalid",
      data: undefined,
    };
  }

  if (
    verificationStatus === VERIFICATION_FAILED &&
    order.verificationStatus === VERIFICATION_APPROVED
  ) {
    return {
      error: false,
      errorMessage: undefined,
      data: undefined,
    };
  }

  const rowIndexInSheet = orderIndexInSheet + 2;
  const dataToUpdate = [
    {
      range: `${ONLINE_SALES_ORDER_SHEET_NAME}!${ONLINE_SALES_ORDER_HAS_BEEN_VERIFIED_COLUMN}${rowIndexInSheet}`,
      values: [[verificationStatus as string]],
    },
    {
      range: `${ONLINE_SALES_ORDER_SHEET_NAME}!${ONLINE_SALES_ORDER_EMAIL_STATUS_COLUMN}${rowIndexInSheet}`,
      values: [[PENDING_EMAIL_STATUS as string]],
    },
  ];
  if (verificationStatus === VERIFICATION_FAILED) {
    dataToUpdate.push({
      range: `${ONLINE_SALES_ORDER_SHEET_NAME}!${ONLINE_SALES_ORDER_REJECTION_REASON_COLUMN}${rowIndexInSheet}`,
      values: [[rejectionReason as string]],
    });
  } else {
    dataToUpdate.push({
      range: `${ONLINE_SALES_ORDER_SHEET_NAME}!${ONLINE_SALES_ORDER_REJECTION_REASON_COLUMN}${rowIndexInSheet}`,
      values: [[""]],
    });
  }

  try {
    await retryExternalApi(async () => {
      const response = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: ONLINE_SALES_SHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: dataToUpdate,
        },
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
    }, "updateOnlineSales");
    await retryDatabase(async () => {
      const verificationStatusToUpdate =
        verificationStatus === VERIFICATION_APPROVED
          ? VERIFICATION_APPROVED_DB
          : verificationStatus === VERIFICATION_FAILED
          ? VERIFICATION_FAILED_DB
          : VERIFICATION_PENDING_DB;
      return await onlineTicketDb
        .update(currentOrderStatus)
        .set({
          orderStatus: verificationStatusToUpdate,
          rejectionReason:
            verificationStatus === VERIFICATION_FAILED ? rejectionReason : null,
        })
        .where(eq(currentOrderStatus.email, order.buyerEmail));
    }, "updateOnlineSales - database update");
    if (verificationStatus === VERIFICATION_APPROVED) {
      await retryExternalApi(async () => {
        const response = await sheets.spreadsheets.values.append({
          spreadsheetId: CHECKIN_SHEET_ID,
          range: `${CHECKIN_SHEET_NAME}!A:Z`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [
              [
                order.buyerTicketType, // A: Ticket type
                order.buyerName, // B: Buyer name
                order.buyerClass, // C: Buyer class
                order.buyerId, // D: Buyer ID
                order.buyerEmail, // E: Buyer email
                false, // F: Set is check-in default status to false
              ],
            ],
          },
        });
        if (response.status !== 200) {
          throw new Error(
            `Google Sheets API returned status ${response.status}: ${response.statusText}`
          );
        }
        return response;
      }, "updateOnlineSales");
    }
    return { error: false, errorMessage: undefined, data: order };
  } catch (error) {
    console.error(
      "[SPREADSHEET] Failed to update online sales after all retries:",
      error
    );
    return {
      error: true,
      errorMessage: "Failed to update online sales after all retries",
      data: undefined,
    };
  }
};

export const updateOfflineOrderEmailStatus = async ({
  studentEmail,
  emailStatus,
}: {
  studentEmail: string;
  emailStatus: string;
}): Promise<{
  error: boolean;
  errorMessage: string | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  const offlineSales = await fetchOfflineSales();
  if (offlineSales.error || !offlineSales.data) {
    return { error: true, errorMessage: "Failed to fetch online sales" };
  }
  const offlineSalesData = offlineSales.data;
  const orderIndexInSheet = offlineSalesData?.findIndex(
    (order) =>
      order.buyerEmail === studentEmail &&
      order.emailStatus !== SENT_EMAIL_STATUS &&
      order.emailStatus !== FAILED_EMAIL_STATUS
  );
  if (!offlineSalesData) {
    return { error: true, errorMessage: "Failed to fetch online sales" };
  }
  if (orderIndexInSheet === -1) {
    return { error: true, errorMessage: "Order not found" };
  }
  const order = offlineSalesData?.[orderIndexInSheet] as OfflineSalesInfo;
  if (
    !order.buyerId ||
    !order.buyerName ||
    !order.buyerClass ||
    !order.buyerEmail ||
    !order.buyerTicketType
  ) {
    return { error: true, errorMessage: "Order data is invalid" };
  }

  const rowIndexInSheet = orderIndexInSheet + 2;
  const dataToUpdate = [
    {
      range: `${OFFLINE_SALES_ORDER_SHEET_NAME}!${OFFLINE_SALES_ORDER_EMAIL_STATUS_COLUMN}${rowIndexInSheet}`,
      values: [[emailStatus as string]],
    },
  ];

  try {
    await retryExternalApi(async () => {
      const response = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: OFFLINE_SALES_SHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: dataToUpdate,
        },
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
    }, "updateOfflineOrderEmailStatus");

    return { error: false, errorMessage: undefined };
  } catch (error) {
    console.error(
      "[SPREADSHEET] Failed to update offline order email status after all retries:",
      error
    );
    return {
      error: true,
      errorMessage:
        "Failed to update offline order email status after all retries",
    };
  }
};

export const updateOnlineOrderEmailStatus = async ({
  studentEmail,
  emailStatus,
}: {
  studentEmail: string;
  emailStatus: string;
}): Promise<{
  error: boolean;
  errorMessage: string | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  const onlineSales = await fetchOnlineSales();
  if (onlineSales.error || !onlineSales.data) {
    return { error: true, errorMessage: "Failed to fetch online sales" };
  }
  const onlineSalesData = onlineSales.data;
  const orderIndexInSheet = onlineSalesData?.findIndex(
    (order) =>
      order.buyerEmail === studentEmail &&
      order.emailStatus !== SENT_EMAIL_STATUS &&
      order.emailStatus !== FAILED_EMAIL_STATUS
  );
  if (!onlineSalesData) {
    return { error: true, errorMessage: "Failed to fetch online sales" };
  }
  if (orderIndexInSheet === -1) {
    return { error: true, errorMessage: "Order not found" };
  }
  const order = onlineSalesData?.[orderIndexInSheet] as OnlineSalesInfo;
  if (
    !order.buyerId ||
    !order.buyerName ||
    !order.buyerClass ||
    !order.buyerEmail ||
    !order.buyerTicketType
  ) {
    return { error: true, errorMessage: "Order data is invalid" };
  }

  const rowIndexInSheet = orderIndexInSheet + 2;
  const dataToUpdate = [
    {
      range: `${ONLINE_SALES_ORDER_SHEET_NAME}!${ONLINE_SALES_ORDER_EMAIL_STATUS_COLUMN}${rowIndexInSheet}`,
      values: [[emailStatus as string]],
    },
  ];

  try {
    await retryExternalApi(async () => {
      const response = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: ONLINE_SALES_SHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: dataToUpdate,
        },
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
    }, "updateOnlineOrderEmailStatus");

    return { error: false, errorMessage: undefined };
  } catch (error) {
    console.error(
      "[SPREADSHEET] Failed to update online order email status after all retries:",
      error
    );
    return {
      error: true,
      errorMessage:
        "Failed to update online order email status after all retries",
    };
  }
};

export const fetchOfflineEventInfo = async (): Promise<{
  error: boolean;
  data: EventInfo | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    console.log(
      `[SPREADSHEET] Starting fetchOfflineEventInfo from sheet: ${OFFLINE_SALES_SHEET_ID}`
    );

    const response = await retryExternalApi(async () => {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: OFFLINE_SALES_SHEET_ID,
        range: `${OFFLINE_SALES_EVENT_INFO_SHEET_NAME}!A:Z`,
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
    }, "fetchOfflineEventInfo");

    if (response.data.values) {
      const eventInfo = {
        eventName: safeTrim(
          response.data.values[1][OFFLINE_SALES_EVENT_INFO_EVENT_NAME_INDEX]
        ),
        eventDate: safeTrim(
          response.data.values[1][OFFLINE_SALES_EVENT_INFO_EVENT_DATE_INDEX]
        ),
        eventYear: safeTrim(
          response.data.values[1][OFFLINE_SALES_EVENT_INFO_EVENT_YEAR_INDEX]
        ),
        eventType: safeTrim(
          response.data.values[1][OFFLINE_SALES_EVENT_INFO_EVENT_TYPE_INDEX]
        ) as "Silencio" | "PROM",
      };
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

export const fetchEmailInfo = async (): Promise<{
  error: boolean;
  data: EmailInfo | undefined;
}> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    console.log(
      `[SPREADSHEET] Starting fetchEmailInfo from sheet: ${OFFLINE_SALES_SHEET_ID}`
    );

    const response = await retryExternalApi(async () => {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: OFFLINE_SALES_SHEET_ID,
        range: `${OFFLINE_SALES_EMAIL_INFO_SHEET_NAME}!A:Z`,
      });
      if (response.status !== 200) {
        throw new Error(
          `Google Sheets API returned status ${response.status}: ${response.statusText}`
        );
      }
      return response;
    }, "fetchEmailInfo");

    if (response.data.values) {
      const emailInfo = {
        emailBannerImage: safeTrim(
          response.data.values[1][
            OFFLINE_SALES_EMAIL_INFO_EMAIL_BANNER_IMAGE_INDEX
          ]
        ),
        emailSubject: safeTrim(
          response.data.values[1][OFFLINE_SALES_EMAIL_INFO_EMAIL_SUBJECT_INDEX]
        ),
      };
      console.log(`[SPREADSHEET] Successfully fetched email info`);
      return { error: false, data: emailInfo };
    }

    console.warn("[SPREADSHEET] No email info found in response");
    return { error: true, data: undefined };
  } catch (error) {
    console.error(
      "[SPREADSHEET] Failed to fetch email info after all retries:",
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
      ticketName: safeTrim(value[ONLINE_SALES_TICKET_INFO_NAME_INDEX]),
      price: safeTrim(value[ONLINE_SALES_TICKET_INFO_PRICE_INDEX]),
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
