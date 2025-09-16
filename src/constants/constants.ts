import { getColumnNumber } from "@/lib/utils";

export const STUDENT_LIST_SHEET_ID =
  "1mLvMGOdNAo8nne1pytHe6xAIAAucnk9pDdRb3lzecxg";
export const STUDENT_LIST_SHEET_NAME = "Student list";

export const STUDENT_LIST_STUDENT_NAME_COLUMN = "C";
export const STUDENT_LIST_STUDENT_ID_COLUMN = "B";
export const STUDENT_LIST_STUDENT_GENDER_COLUMN = "E";
export const STUDENT_LIST_STUDENT_HOMEROOM_COLUMN = "F";

export const STUDENT_LIST_STUDENT_NAME_INDEX = getColumnNumber(
  STUDENT_LIST_STUDENT_NAME_COLUMN
);
export const STUDENT_LIST_STUDENT_ID_INDEX = getColumnNumber(
  STUDENT_LIST_STUDENT_ID_COLUMN
);
export const STUDENT_LIST_STUDENT_GENDER_INDEX = getColumnNumber(
  STUDENT_LIST_STUDENT_GENDER_COLUMN
);
export const STUDENT_LIST_STUDENT_HOMEROOM_INDEX = getColumnNumber(
  STUDENT_LIST_STUDENT_HOMEROOM_COLUMN
);

export const SALES_INFO_SHEET_ID =
  "1K3kNv-klSmu2TT3_fKwFJ9IDHkeZIeGRDFoOWzMVUT8";
export const SALES_INFO_STAFF_SHEET_NAME = "Staff";
export const SALES_INFO_TICKET_SHEET_NAME = "Thông tin bán vé";

export const SALES_INFO_STAFF_EMAIL_COLUMN = "A";
export const SALES_INFO_STAFF_NAME_COLUMN = "B";

export const SALES_INFO_TICKET_SUBMIT_TIME_COLUMN = "A";
export const SALES_INFO_TICKET_STAFF_NAME_COLUMN = "B";
export const SALES_INFO_MEDIUM_TYPE_COLUMN = "C";
export const SALES_INFO_BUYER_NAME_COLUMN = "D";
export const SALES_INFO_BUYER_CLASS_COLUMN = "E";
export const SALES_INFO_BUYER_EMAIL_COLUMN = "F";
export const SALES_INFO_BUYER_ID_COLUMN = "G";
export const SALES_INFO_TICKET_TYPE_COLUMN = "H";
export const SALES_INFO_NOTICE_COLUMN = "I";

export const SALES_INFO_STAFF_EMAIL_INDEX = getColumnNumber(
  SALES_INFO_STAFF_EMAIL_COLUMN
);
export const SALES_INFO_STAFF_NAME_INDEX = getColumnNumber(
  SALES_INFO_STAFF_NAME_COLUMN
);

export const NOT_STAFF_ERROR = "not-staff";
export const NOT_LOGGED_IN_ERROR = "not-logged-in";

export const NOT_STUDENT_IN_SCHOOL =
  "Không phải học sinh trong trường, vui lòng tự điền";
