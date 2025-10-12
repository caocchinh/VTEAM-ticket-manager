import { Dispatch, SetStateAction } from "react";

export interface Student {
  name: string;
  studentId: string;
  gender: string;
  homeroom: string;
  email: string;
}

export interface TicketInfo {
  ticketName: string;
  price: string;
  includeConcert: boolean;
  classRange: number[];
}

export interface AllTicketInfo {
  online: TicketInfo[];
  offline: TicketInfo[];
}

export interface StudentInput {
  nameInput: string;
  studentIdInput: string;
  homeroomInput: string;
  notice: string;
  ticketType: string;
  concertIncluded: boolean;
  paymentMedium: "Tiền mặt" | "Chuyển khoản";
  email: string;
}

export interface Staff {
  email: string;
  name: string;
}

export type OnlineCoordinator = Staff;

export interface EventInfo {
  eventName: string;
  eventDate: string;
  eventYear: string;
  eventType: "Silencio" | "PROM";
}

export interface EmailInfo {
  emailBannerImage: string;
  emailSubject: string;
}

export interface OfflineSalesInfo {
  time: string;
  staffName: string;
  paymentMedium: string;
  buyerName: string;
  buyerClass: string;
  buyerEmail: string;
  buyerId: string;
  buyerTicketType: string;
  buyerNotice: string;
  emailStatus: string;
}

export interface OnlineSalesInfo {
  time: string;
  buyerName: string;
  buyerClass: string;
  buyerEmail: string;
  buyerId: string;
  buyerTicketType: string;
  proofOfPaymentImage: string;
  rejectionReason: string;
  verificationStatus: string;
  emailStatus: string;
}

export interface AllSalesInfo {
  offline: OfflineSalesInfo[];
  online: OnlineSalesInfo[];
}

export interface OrderSelectProps {
  order: OnlineSalesInfo;
  currentTab: number;
  currentOrderId?: string;
  isInspectSidebarOpen: boolean;
  setCurrentOrderId: Dispatch<SetStateAction<string | undefined>>;
  questionScrollAreaRef: React.RefObject<HTMLDivElement | null>;
  answerScrollAreaRef: React.RefObject<HTMLDivElement | null>;
  setCurrentTabThatContainsOrder: Dispatch<SetStateAction<number>>;
}

export const DB_ORDER_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
} as const;

export type DBOrderStatus =
  (typeof DB_ORDER_STATUS)[keyof typeof DB_ORDER_STATUS];

export const VERIFICATION_STATUS = {
  PENDING: "Đang đợi xác minh",
  SUCCESS: "Đã xác minh",
  FAILED: "Đã từ chối",
} as const;

export type SheetOrderStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

export interface OnlineManagementProps {
  salesInfo: OnlineSalesInfo[] | undefined;
  isOnlineCoordinator: boolean;
  isSalesInfoError: boolean;
  isRefetchingSales: boolean;
  isSalesInfoFetching: boolean;
  onlineTicketInfo: TicketInfo[] | undefined;
  onRefetchSales: () => void;
  isOnlineTicketManagementOpen: {
    isOpen: boolean;
    buyerId: string;
  };
  setIsOnlineTicketManagementOpen: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      buyerId: string;
    }>
  >;
}

export interface SuccessEmailPayload {
  studentName: string;
  email: string;
  studentId: string;
  eventDay: string;
  concertIncluded: "Có" | "Không";
  eventYear: string;
  homeroom: string;
  bannerImage: string;
  eventName: string;
  ticketType: string;
  eventType: "Silencio" | "PROM";
  purchaseTime: string;
}

export interface FailedEmailPayload {
  studentName: string;
  email: string;
  studentId: string;
  eventDay: string;
  eventYear: string;
  homeroom: string;
  bannerImage: string;
  eventName: string;
  ticketType: string;
  proofOfPaymentURL?: string;
  rejectionReason?: string;
  eventType: "Silencio" | "PROM";
  purchaseTime: string;
}

export type TeacherVerificationStatus = "TRUE" | "FALSE" | "";

export interface TeacherVerificationInfo {
  name: string;
  studentId: string;
  homeroom: string;
  acceptStatus: TeacherVerificationStatus;
  rejectStatus: TeacherVerificationStatus;
  teacherNotice: string;
}

export interface InputFormProps {
  selectedStudentIdInput: string;
  emailInput: string;
  homeroomInput: string;
  studentNameInput: string;
  ticketType: string;
  mounted: boolean;
  isTicketInfoError: boolean;
  noticeInput: string;
  studentList: Student[] | undefined;
  ticketInfo: AllTicketInfo | undefined;
  isStudentListFetching: boolean;
  isTicketInfoFetching: boolean;
  getTicketColor: (ticketType: string) => string;
  isStudentListError: boolean;
  errors: {
    studentId: boolean;
    studentName: boolean;
    homeroom: boolean;
    email: boolean;
  };
  setErrors: Dispatch<
    SetStateAction<{
      studentId: boolean;
      studentName: boolean;
      homeroom: boolean;
      email: boolean;
    }>
  >;
  clearForm: ({ clearNotice }: { clearNotice: boolean }) => void;
  studentNameAutoCompleteValue: string;
  homeroomAutoCompleteValue: string;
  emailAutoCompleteValue: string;
  bestMatchStudentId: string;
  setStudentNameInput: Dispatch<SetStateAction<string>>;
  setHomeroomInput: Dispatch<SetStateAction<string>>;
  setEmailInput: Dispatch<SetStateAction<string>>;
  setTicketType: Dispatch<SetStateAction<string>>;
  setNoticeInput: Dispatch<SetStateAction<string>>;
  setSelectedStudentIdInput: Dispatch<SetStateAction<string>>;
  currentOrder: StudentInput[];
  setCurrentOrders: Dispatch<SetStateAction<StudentInput[]>>;
  lastValidTicketType: string;
  setLastValidTicketType: Dispatch<SetStateAction<string>>;
  paymentMedium: "Tiền mặt" | "Chuyển khoản";
  setPaymentMedium: Dispatch<SetStateAction<"Tiền mặt" | "Chuyển khoản">>;
  setStudentNameAutoCompleteValue: Dispatch<SetStateAction<string>>;
  setHomeroomAutoCompleteValue: Dispatch<SetStateAction<string>>;
  setEmailAutoCompleteValue: Dispatch<SetStateAction<string>>;
  setBestMatchStudentId: Dispatch<SetStateAction<string>>;
}

export interface OrderInfoProps {
  ticketColors: Record<string, string>;
  setTicketColors: Dispatch<SetStateAction<Record<string, string>>>;
  currentOrder: StudentInput[];
  setCurrentOrders: Dispatch<SetStateAction<StudentInput[]>>;
  clearForm: ({ clearNotice }: { clearNotice: boolean }) => void;
  ticketInfo: AllTicketInfo | undefined;
  setNoticeInput: Dispatch<SetStateAction<string>>;
  setStudentNameInput: Dispatch<SetStateAction<string>>;
  setHomeroomInput: Dispatch<SetStateAction<string>>;
  setEmailInput: Dispatch<SetStateAction<string>>;
  setTicketType: Dispatch<SetStateAction<string>>;
  setSelectedStudentIdInput: Dispatch<SetStateAction<string>>;
  setPaymentMedium: Dispatch<SetStateAction<"Tiền mặt" | "Chuyển khoản">>;
  getTicketColor: (ticketType: string) => string;
  shouldSendEmail: boolean;
  setShouldSendEmail: Dispatch<SetStateAction<boolean>>;
  orderSubtotal: number;
}
