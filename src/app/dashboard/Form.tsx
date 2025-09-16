"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NOT_STUDENT_IN_SCHOOL } from "@/constants/constants";
import { Student } from "@/constants/types";
import { removeVietnameseAccents } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const Form = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedStudentIdInput, setSelectedStudentIdInput] = useState("");
  const [studentNameAutoCompleteValue, setStudentNameAutoCompleteValue] =
    useState("");
  const [homeroomAutoCompleteValue, setHomeroomAutoCompleteValue] =
    useState("");
  const [genderAutoCompleteValue, setGenderAutoCompleteValue] = useState("");
  const [emailAutoCompleteValue, setEmailAutoCompleteValue] = useState("");
  const [bestMatchStudentId, setBestMatchStudentId] = useState("");

  // State for actual form values (separate from autocomplete preview)
  const [studentName, setStudentName] = useState("");
  const [homeroom, setHomeroom] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");

  const areOtherFieldsBlank = () => {
    return (
      !studentName.trim() && !homeroom.trim() && !gender.trim() && !email.trim()
    );
  };

  const handleTabKeyPress = (e: React.KeyboardEvent) => {
    if (
      e.key === "Tab" &&
      studentList &&
      studentNameAutoCompleteValue &&
      areOtherFieldsBlank()
    ) {
      {
        e.preventDefault();
        setStudentName(studentNameAutoCompleteValue);
        setHomeroom(homeroomAutoCompleteValue);
        setGender(genderAutoCompleteValue);
        setSelectedStudentIdInput(bestMatchStudentId);
        setEmail(emailAutoCompleteValue);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fuzzy search function to find the best matching student
  const findBestMatch = (
    input: string,
    students: Student[]
  ): Student | null => {
    if (!input.trim() || !students.length) return null;

    // First try exact match
    const exactMatch = students.find(
      (student) => student.studentId.toLowerCase() === input.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    // Then try prefix match
    const prefixMatch = students.find((student) =>
      student.studentId.toLowerCase().startsWith(input.toLowerCase())
    );
    if (prefixMatch) return prefixMatch;

    // Finally, fuzzy match - find student ID that contains the input
    const fuzzyMatch = students.find((student) =>
      student.studentId.toLowerCase().includes(input.toLowerCase())
    );

    return fuzzyMatch || null;
  };

  const { data: studentList } = useQuery({
    queryKey: ["student_list"],
    queryFn: async () => {
      const response = await fetch("/api/studentList");
      if (!response.ok) {
        throw new Error("Failed to fetch student list");
      }
      const data = await response.json();
      return data.data as Student[];
    },
    enabled: mounted,
  });

  const handleStudentIdChange = (value: string) => {
    setSelectedStudentIdInput(value);

    if (studentList && value.trim() && value.toLowerCase()) {
      const bestMatch = findBestMatch(value.trim(), studentList);
      if (bestMatch) {
        setStudentNameAutoCompleteValue(bestMatch.name);
        setHomeroomAutoCompleteValue(bestMatch.homeroom);
        setGenderAutoCompleteValue(bestMatch.gender);
        setBestMatchStudentId(bestMatch.studentId);
        const numericalValue = bestMatch.studentId.replace(/\D/g, "");
        const splited = bestMatch.name.split(" ");
        const lastName = removeVietnameseAccents(splited[splited.length - 1]);
        setEmailAutoCompleteValue(
          `${lastName}${numericalValue}@stu.vinschool.edu.vn`
        );
      } else {
        setStudentNameAutoCompleteValue(NOT_STUDENT_IN_SCHOOL);
        setHomeroomAutoCompleteValue(NOT_STUDENT_IN_SCHOOL);
        setGenderAutoCompleteValue(NOT_STUDENT_IN_SCHOOL);
        setEmailAutoCompleteValue(NOT_STUDENT_IN_SCHOOL);
      }
    } else {
      if (value.trim() === "") {
        setStudentNameAutoCompleteValue("");
        setHomeroomAutoCompleteValue("");
        setGenderAutoCompleteValue("");
        setEmailAutoCompleteValue("");
        setStudentName("");
        setHomeroom("");
        setGender("");
        setEmail("");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 items-start w-[350px]">
      <div className="w-full flex flex-col items-start gap-2">
        <Label htmlFor="student-id">Mã số học sinh</Label>
        <Input
          id="student-id"
          onChange={(e) => handleStudentIdChange(e.target.value)}
          onKeyDown={handleTabKeyPress}
          value={selectedStudentIdInput}
          placeholder="Nhập mã số HS"
          tabIndex={-1}
        />
      </div>
      <div className="w-full flex flex-col items-start gap-2">
        <Label htmlFor="student-name">Tên học sinh</Label>
        <Input
          id="student-name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder={
            studentNameAutoCompleteValue || "Tên học sinh sẽ hiển thị tự động"
          }
          tabIndex={-1}
        />
      </div>
      <div className="w-full flex flex-col items-start gap-2">
        <Label htmlFor="homeroom">Lớp học</Label>
        <Input
          id="homeroom"
          value={homeroom}
          onChange={(e) => setHomeroom(e.target.value)}
          placeholder={
            homeroomAutoCompleteValue || "Lớp học sẽ hiển thị tự động"
          }
          tabIndex={-1}
        />
      </div>
      <div className="w-full flex flex-col items-start gap-2">
        <Label htmlFor="gender">Giới tính</Label>
        <Input
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          placeholder={
            genderAutoCompleteValue || "Giới tính sẽ hiển thị tự động"
          }
          tabIndex={-1}
        />
      </div>
      <div className="w-full flex flex-col items-start gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={emailAutoCompleteValue || "Email sẽ hiển thị tự động"}
          tabIndex={-1}
        />
      </div>
    </div>
  );
};

export default Form;
