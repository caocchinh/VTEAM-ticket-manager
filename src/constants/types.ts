export interface Student {
  name: string;
  studentId: string;
  row: number;
  gender: string;
  homeroom: string;
}

export interface TicketInfo {
  ticketName: string;
  price: number;
  classRange: number[];
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

export interface EventInfo {
  eventName: string;
}

export interface SalesInfo {
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
