export interface Student {
  name: string;
  studentId: string;
  row: number;
  gender: string;
  homeroom: string;
}

export interface StudentInput {
  nameInput: string;
  studentIdInput: string;
  homeroomInput: string;
  notice: string;
  ticketType: string;
}

export interface Staff {
  email: string;
  name: string;
}
