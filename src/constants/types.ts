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
  genderInput: string;
  homeroomInput: string;
}

export interface Staff {
  email: string;
  name: string;
}
