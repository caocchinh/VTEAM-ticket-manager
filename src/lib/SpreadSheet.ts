import { google } from "googleapis";
import {
  STUDENT_LIST_SHEET_ID,
  STUDENT_LIST_SHEET_NAME,
  STUDENT_LIST_STUDENT_GENDER_INDEX,
  STUDENT_LIST_STUDENT_HOMEROOM_INDEX,
  STUDENT_LIST_STUDENT_ID_INDEX,
  STUDENT_LIST_STUDENT_NAME_INDEX,
  TICKET_INFO_SHEET_ID,
  TICKET_INFO_STAFF_EMAIL_INDEX,
  TICKET_INFO_STAFF_NAME_INDEX,
  TICKET_INFO_STAFF_SHEET_NAME,
} from "@/constants/constants";
import { Staff, Student } from "@/constants/types";

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
      spreadsheetId: TICKET_INFO_SHEET_ID,
      range: `${TICKET_INFO_STAFF_SHEET_NAME}!A:Z`,
    });
    const foundValue = response.data.values?.find(
      (value) => value[TICKET_INFO_STAFF_EMAIL_INDEX] === email
    );

    const data = foundValue
      ? {
          email,
          name: foundValue[TICKET_INFO_STAFF_NAME_INDEX],
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
