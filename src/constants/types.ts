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
}

export interface OnlineSalesInfo {
  time: string;
  buyerName: string;
  buyerClass: string;
  buyerEmail: string;
  buyerId: string;
  buyerTicketType: string;
  proofOfPaymentImage: string;
  confirmationImage: string;
  rejectionReason: string;
  verificationStatus: string;
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

export type DBOrderStatus = "pending" | "success" | "failed";

export const VERIFICATION_STATUS = {
  PENDING: "Đang đợi xác minh",
  SUCCESS: "Đã xác minh",
  FAILED: "Đã từ chối",
} as const;

export type SheetOrderStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];
