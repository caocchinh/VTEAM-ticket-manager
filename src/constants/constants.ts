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

export const SALES_SHEET_ID = "1K3kNv-klSmu2TT3_fKwFJ9IDHkeZIeGRDFoOWzMVUT8";
export const SALES_STAFF_SHEET_NAME = "Staff điền form";
export const SALES_ORDER_SHEET_NAME = "Tổng sales bán vé";
export const SALES_TICKET_INFO_SHEET_NAME = "Thông tin vé offline";
export const SALES_EVENT_INFO_SHEET_NAME = "Thông tin sự kiện";
export const SALES_EVENT_CHECKIN_SHEET_NAME = "Check-in";

export const SALES_EVENT_INFO_INFO_COLUMN = "A";

export const SALES_EVENT_INFO_INFO_INDEX = getColumnNumber(
  SALES_EVENT_INFO_INFO_COLUMN
);

export const SALES_STAFF_EMAIL_COLUMN = "A";
export const SALES_STAFF_NAME_COLUMN = "B";

export const SALES_STAFF_EMAIL_INDEX = getColumnNumber(
  SALES_STAFF_EMAIL_COLUMN
);
export const SALES_STAFF_NAME_INDEX = getColumnNumber(SALES_STAFF_NAME_COLUMN);

export const SALES_ORDER_SUBMIT_TIME_COLUMN = "A";
export const SALES_ORDER_STAFF_NAME_COLUMN = "B";
export const SALES_ORDER_MEDIUM_TYPE_COLUMN = "C";
export const SALES_ORDER_BUYER_NAME_COLUMN = "D";
export const SALES_ORDER_BUYER_CLASS_COLUMN = "E";
export const SALES_ORDER_BUYER_EMAIL_COLUMN = "F";
export const SALES_ORDER_BUYER_ID_COLUMN = "G";
export const SALES_ORDER_TICKET_TYPE_COLUMN = "H";
export const SALES_ORDER_NOTICE_COLUMN = "I";

export const SALES_ORDER_SUBMIT_TIME_INDEX = getColumnNumber(
  SALES_ORDER_SUBMIT_TIME_COLUMN
);
export const SALES_ORDER_STAFF_NAME_INDEX = getColumnNumber(
  SALES_ORDER_STAFF_NAME_COLUMN
);
export const SALES_ORDER_MEDIUM_TYPE_INDEX = getColumnNumber(
  SALES_ORDER_MEDIUM_TYPE_COLUMN
);
export const SALES_ORDER_BUYER_NAME_INDEX = getColumnNumber(
  SALES_ORDER_BUYER_NAME_COLUMN
);
export const SALES_ORDER_BUYER_CLASS_INDEX = getColumnNumber(
  SALES_ORDER_BUYER_CLASS_COLUMN
);
export const SALES_ORDER_BUYER_EMAIL_INDEX = getColumnNumber(
  SALES_ORDER_BUYER_EMAIL_COLUMN
);
export const SALES_ORDER_BUYER_ID_INDEX = getColumnNumber(
  SALES_ORDER_BUYER_ID_COLUMN
);
export const SALES_ORDER_TICKET_TYPE_INDEX = getColumnNumber(
  SALES_ORDER_TICKET_TYPE_COLUMN
);
export const SALES_ORDER_NOTICE_INDEX = getColumnNumber(
  SALES_ORDER_NOTICE_COLUMN
);

export const SALES_TICKET_INFO_NAME_COLUMN = "A";
export const SALES_TICKET_INFO_PRICE_COLUMN = "B";
export const SALES_TICKET_INFO_CLASS_RANGE_COLUMN = "C";

export const SALES_TICKET_INFO_NAME_INDEX = getColumnNumber(
  SALES_TICKET_INFO_NAME_COLUMN
);
export const SALES_TICKET_INFO_PRICE_INDEX = getColumnNumber(
  SALES_TICKET_INFO_PRICE_COLUMN
);
export const SALES_TICKET_INFO_CLASS_RANGE_INDEX = getColumnNumber(
  SALES_TICKET_INFO_CLASS_RANGE_COLUMN
);

export const NOT_STAFF_ERROR = "not-staff";
export const NOT_LOGGED_IN_ERROR = "not-logged-in";
export const INVALID_TICKET_DUE_TO_INVALID_CLASS = "Lớp không hợp lệ!";
export const NOT_STUDENT_IN_SCHOOL =
  "Không phải học sinh trong trường, vui lòng tự điền";
