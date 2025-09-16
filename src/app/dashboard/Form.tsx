"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NOT_STUDENT_IN_SCHOOL } from "@/constants/constants";
import { Student, StudentInput } from "@/constants/types";
import { removeVietnameseAccents } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

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
  const [currentOrders, setCurrentOrders] = useState<StudentInput[]>([]);

  // State for actual form values (separate from autocomplete preview)
  const [studentNameInput, setStudentNameInput] = useState("");
  const [homeroomInput, setHomeroomInput] = useState("");
  const [genderInput, setGenderInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [whichInputIsBeingFocused, setWhichInputIsBeingFocused] = useState<
    "id" | "name" | "homeroom" | "email" | "gender"
  >("id");

  // State for validation errors
  const [errors, setErrors] = useState({
    studentId: false,
    studentName: false,
    homeroom: false,
    gender: false,
    email: false,
  });

  const areOtherFieldsBlank = useCallback(() => {
    return (
      !studentNameInput.trim() &&
      !homeroomInput.trim() &&
      !genderInput.trim() &&
      !emailInput.trim()
    );
  }, [studentNameInput, homeroomInput, genderInput, emailInput]);

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

  const clearForm = () => {
    setSelectedStudentIdInput("");
    setStudentNameAutoCompleteValue("");
    setHomeroomAutoCompleteValue("");
    setGenderAutoCompleteValue("");
    setEmailAutoCompleteValue("");
    setBestMatchStudentId("");
    setStudentNameInput("");
    setHomeroomInput("");
    setGenderInput("");
    setEmailInput("");
    setErrors({
      studentId: false,
      studentName: false,
      homeroom: false,
      gender: false,
      email: false,
    });
  };

  const validateForm = () => {
    const newErrors = {
      studentId: !selectedStudentIdInput.trim(),
      studentName: !studentNameInput.trim(),
      homeroom: !homeroomInput.trim(),
      gender: !genderInput.trim(),
      email: !emailInput.trim(),
    };

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setCurrentOrders((prev) => [
        ...prev,
        {
          nameInput: studentNameInput,
          genderInput: genderInput,
          homeroomInput: homeroomInput,
          studentIdInput: selectedStudentIdInput,
        },
      ]);
      clearForm();
    }
  };

  const handleStudentIdChange = (value: string) => {
    setSelectedStudentIdInput(value);

    if (studentList && value.trim() && value.toLowerCase()) {
      const bestMatch = findBestMatch(value.trim(), studentList);
      if (bestMatch && bestMatch.studentId.includes("VS")) {
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
        clearForm();
      }
    }
  };

  const handleTabKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        e.key === "Tab" &&
        studentList &&
        studentNameAutoCompleteValue &&
        studentNameAutoCompleteValue !== NOT_STUDENT_IN_SCHOOL
      ) {
        e.preventDefault();

        if (areOtherFieldsBlank() && whichInputIsBeingFocused === "id") {
          setStudentNameInput(studentNameAutoCompleteValue);
          setHomeroomInput(homeroomAutoCompleteValue);
          setGenderInput(genderAutoCompleteValue);
          setSelectedStudentIdInput(bestMatchStudentId);
          setEmailInput(emailAutoCompleteValue);
        } else if (
          whichInputIsBeingFocused === "name" &&
          studentNameInput.trim() === ""
        ) {
          setStudentNameInput(studentNameAutoCompleteValue);
        } else if (
          whichInputIsBeingFocused === "homeroom" &&
          homeroomInput.trim() === ""
        ) {
          setHomeroomInput(homeroomAutoCompleteValue);
        } else if (
          whichInputIsBeingFocused === "gender" &&
          genderInput.trim() === ""
        ) {
          setGenderInput(genderAutoCompleteValue);
        } else if (
          whichInputIsBeingFocused === "email" &&
          emailInput.trim() === ""
        ) {
          setEmailInput(emailAutoCompleteValue);
        }
      }
    },
    [
      studentList,
      studentNameAutoCompleteValue,
      homeroomAutoCompleteValue,
      genderAutoCompleteValue,
      emailAutoCompleteValue,
      bestMatchStudentId,
      whichInputIsBeingFocused,
      studentNameInput,
      homeroomInput,
      genderInput,
      emailInput,
      areOtherFieldsBlank,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleTabKeyPress(e as unknown as React.KeyboardEvent);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleTabKeyPress]);

  return (
    <div className="flex flex-col gap-4 items-start w-[350px]">
      <div className="w-full flex flex-col items-start gap-2">
        <Label
          htmlFor="student-id"
          className={errors.studentId ? "text-red-500" : ""}
        >
          Mã số học sinh
        </Label>
        <Input
          onFocus={() => {
            setWhichInputIsBeingFocused("id");
          }}
          id="student-id"
          onChange={(e) => {
            handleStudentIdChange(e.target.value);
            if (errors.studentId && e.target.value.trim()) {
              setErrors((prev) => ({ ...prev, studentId: false }));
            }
          }}
          value={selectedStudentIdInput}
          placeholder="Nhập mã số HS"
          tabIndex={-1}
          className={
            errors.studentId
              ? "border-red-500 focus:border-red-500 placeholder:text-red-400"
              : ""
          }
        />
      </div>
      <div className="w-full flex flex-col items-start gap-2">
        <Label
          htmlFor="student-name"
          className={errors.studentName ? "text-red-500" : ""}
        >
          Tên học sinh
        </Label>
        <Input
          id="student-name"
          onFocus={() => {
            setWhichInputIsBeingFocused("name");
          }}
          value={studentNameInput}
          onChange={(e) => {
            setStudentNameInput(e.target.value);
            if (errors.studentName && e.target.value.trim()) {
              setErrors((prev) => ({ ...prev, studentName: false }));
            }
          }}
          placeholder={
            studentNameAutoCompleteValue || "Tên học sinh sẽ hiển thị tự động"
          }
          tabIndex={-1}
          className={
            errors.studentName
              ? "border-red-500 focus:border-red-500 placeholder:text-red-400"
              : ""
          }
        />
      </div>
      <div className="w-full flex flex-col items-start gap-2">
        <Label
          htmlFor="homeroom"
          className={errors.homeroom ? "text-red-500" : ""}
        >
          Lớp
        </Label>
        <Input
          id="homeroom"
          onFocus={() => {
            setWhichInputIsBeingFocused("homeroom");
          }}
          value={homeroomInput}
          onChange={(e) => {
            setHomeroomInput(e.target.value);
            if (errors.homeroom && e.target.value.trim()) {
              setErrors((prev) => ({ ...prev, homeroom: false }));
            }
          }}
          placeholder={
            homeroomAutoCompleteValue || "Lớp học sẽ hiển thị tự động"
          }
          tabIndex={-1}
          className={
            errors.homeroom
              ? "border-red-500 focus:border-red-500 placeholder:text-red-400"
              : ""
          }
        />
      </div>
      <div className="w-full flex flex-col items-start gap-2">
        <Label htmlFor="gender" className={errors.gender ? "text-red-500" : ""}>
          Giới tính
        </Label>
        <Input
          id="gender"
          onFocus={() => {
            setWhichInputIsBeingFocused("gender");
          }}
          value={genderInput}
          onChange={(e) => {
            setGenderInput(e.target.value);
            if (errors.gender && e.target.value.trim()) {
              setErrors((prev) => ({ ...prev, gender: false }));
            }
          }}
          placeholder={
            genderAutoCompleteValue || "Giới tính sẽ hiển thị tự động"
          }
          tabIndex={-1}
          className={
            errors.gender
              ? "border-red-500 focus:border-red-500 placeholder:text-red-400"
              : ""
          }
        />
      </div>
      <div className="w-full flex flex-col items-start gap-2">
        <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>
          Email
        </Label>
        <Input
          id="email"
          value={emailInput}
          onFocus={() => {
            setWhichInputIsBeingFocused("email");
          }}
          onChange={(e) => {
            setEmailInput(e.target.value);
            if (errors.email && e.target.value.trim()) {
              setErrors((prev) => ({ ...prev, email: false }));
            }
          }}
          placeholder={emailAutoCompleteValue || "Email sẽ hiển thị tự động"}
          tabIndex={-1}
          className={
            errors.email
              ? "border-red-500 focus:border-red-500 placeholder:text-red-400"
              : ""
          }
        />
      </div>
      <Button onClick={handleSubmit} className="w-full">
        Thêm vào đơn
      </Button>
      <Button onClick={clearForm} variant="outline" className="w-full">
        Xóa tất cả
      </Button>

      {currentOrders.length > 0 && (
        <div className="w-full mt-4">
          <Label>Đơn hiện tại ({currentOrders.length} học sinh)</Label>
          <div className="mt-2 space-y-1">
            {currentOrders.map((order, index) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                {order.nameInput} - {order.studentIdInput}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
