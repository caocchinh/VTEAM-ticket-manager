"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NOT_STUDENT_IN_SCHOOL } from "@/constants/constants";
import { Student, StudentInput } from "@/constants/types";
import { removeVietnameseAccents } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const Form = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedStudentIdInput, setSelectedStudentIdInput] = useState("");
  const [studentNameAutoCompleteValue, setStudentNameAutoCompleteValue] =
    useState("");
  const [homeroomAutoCompleteValue, setHomeroomAutoCompleteValue] =
    useState("");
  const [emailAutoCompleteValue, setEmailAutoCompleteValue] = useState("");
  const [bestMatchStudentId, setBestMatchStudentId] = useState("");
  const [currentOrders, setCurrentOrders] = useState<StudentInput[]>([]);

  // State for actual form values (separate from autocomplete preview)
  const [studentNameInput, setStudentNameInput] = useState("");
  const [homeroomInput, setHomeroomInput] = useState("");
  const studentIdInputRef = useRef<HTMLInputElement | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [whichInputIsBeingFocused, setWhichInputIsBeingFocused] = useState<
    "id" | "name" | "homeroom" | "email"
  >("id");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noticeInput, setNoticeInput] = useState("");

  // State for validation errors
  const [errors, setErrors] = useState({
    studentId: false,
    studentName: false,
    homeroom: false,
    email: false,
  });

  // Validation useEffect hooks for each input field
  useEffect(() => {
    if (selectedStudentIdInput.trim()) {
      setErrors((prev) => ({ ...prev, studentId: false }));
    }
  }, [selectedStudentIdInput]);

  useEffect(() => {
    if (studentNameInput.trim()) {
      setErrors((prev) => ({ ...prev, studentName: false }));
    }
  }, [studentNameInput]);

  useEffect(() => {
    if (homeroomInput.trim()) {
      setErrors((prev) => ({ ...prev, homeroom: false }));
    }
  }, [homeroomInput]);

  useEffect(() => {
    if (emailInput.trim()) {
      setErrors((prev) => ({ ...prev, email: false }));
    }
  }, [emailInput]);

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
    setEmailAutoCompleteValue("");
    setBestMatchStudentId("");
    setStudentNameInput("");
    setHomeroomInput("");
    setNoticeInput("");
    setEmailInput("");
    setErrors({
      studentId: false,
      studentName: false,
      homeroom: false,
      email: false,
    });
  };

  const handleConfirmClear = () => {
    clearForm();
    setIsDialogOpen(false);
  };

  const validateForm = () => {
    const newErrors = {
      studentId: !selectedStudentIdInput.trim(),
      studentName: !studentNameInput.trim(),
      homeroom: !homeroomInput.trim(),
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
          homeroomInput: homeroomInput,
          studentIdInput: selectedStudentIdInput,
          notice: noticeInput,
        },
      ]);
      clearForm();
      studentIdInputRef?.current?.focus();
    }
  };

  const handleStudentIdChange = (value: string) => {
    setSelectedStudentIdInput(value);

    if (studentList && value.trim() && value.toLowerCase()) {
      const bestMatch = findBestMatch(value.trim(), studentList);
      if (bestMatch && bestMatch.studentId.includes("VS")) {
        setStudentNameAutoCompleteValue(bestMatch.name);
        setHomeroomAutoCompleteValue(bestMatch.homeroom);
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
        setEmailAutoCompleteValue(NOT_STUDENT_IN_SCHOOL);
      }
    } else {
      if (value.trim() === "") {
        if (studentNameAutoCompleteValue !== NOT_STUDENT_IN_SCHOOL) {
          clearForm();
        } else {
          setStudentNameAutoCompleteValue("");
          setHomeroomAutoCompleteValue("");
          setEmailAutoCompleteValue("");
        }
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
        if (
          whichInputIsBeingFocused === "id" &&
          (studentNameInput !== studentNameAutoCompleteValue ||
            homeroomInput !== homeroomAutoCompleteValue ||
            emailAutoCompleteValue !== emailInput)
        ) {
          e.preventDefault();
          setStudentNameInput(studentNameAutoCompleteValue);
          setHomeroomInput(homeroomAutoCompleteValue);
          setSelectedStudentIdInput(bestMatchStudentId);
          setEmailInput(emailAutoCompleteValue);
        } else if (
          whichInputIsBeingFocused === "name" &&
          studentNameInput.trim() === ""
        ) {
          e.preventDefault();

          setStudentNameInput(studentNameAutoCompleteValue);
        } else if (
          whichInputIsBeingFocused === "homeroom" &&
          homeroomInput.trim() === ""
        ) {
          e.preventDefault();

          setHomeroomInput(homeroomAutoCompleteValue);
        } else if (
          whichInputIsBeingFocused === "email" &&
          emailInput.trim() === ""
        ) {
          e.preventDefault();

          setEmailInput(emailAutoCompleteValue);
        }
      }
    },
    [
      studentList,
      studentNameAutoCompleteValue,
      homeroomAutoCompleteValue,
      emailAutoCompleteValue,
      bestMatchStudentId,
      whichInputIsBeingFocused,
      studentNameInput,
      homeroomInput,
      emailInput,
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
    <div className="flex flex-col items-center gap-2 justify-center">
      <h3>Thông tin người mua</h3>
      <div className="flex flex-col border shadow-sm p-4 rounded-md gap-4 items-start w-[90%] md:w-[400px]">
        <div className="w-full flex flex-col items-start gap-2 ">
          <Label
            htmlFor="student-id"
            className={errors.studentId ? "text-red-500" : ""}
          >
            Mã số học sinh
          </Label>
          <div className="relative w-full">
            <Input
              onFocus={() => {
                setWhichInputIsBeingFocused("id");
              }}
              ref={studentIdInputRef}
              id="student-id"
              onChange={(e) => {
                handleStudentIdChange(e.target.value);
              }}
              value={selectedStudentIdInput}
              placeholder="Nhập mã số HS"
              className={
                errors.studentId
                  ? "border-red-500 focus:border-red-500 placeholder:text-red-400"
                  : ""
              }
            />
            <X
              className="absolute right-1 top-1/2 cursor-pointer -translate-y-1/2 text-red-400"
              size={17}
              onClick={() => {
                handleStudentIdChange("");
              }}
            />
          </div>
        </div>
        <div className="w-full flex flex-col items-start gap-2">
          <Label
            htmlFor="student-name"
            className={errors.studentName ? "text-red-500" : ""}
          >
            Tên học sinh
          </Label>
          <div className="relative w-full">
            <Input
              id="student-name"
              onFocus={() => {
                setWhichInputIsBeingFocused("name");
              }}
              value={studentNameInput}
              onChange={(e) => {
                setStudentNameInput(e.target.value);
              }}
              placeholder={
                studentNameAutoCompleteValue ||
                "Tên học sinh sẽ hiển thị tự động"
              }
              className={
                errors.studentName
                  ? "border-red-500 focus:border-red-500 placeholder:text-red-400"
                  : ""
              }
            />
            <X
              className="absolute right-1 top-1/2 cursor-pointer -translate-y-1/2 text-red-400"
              size={17}
              onClick={() => {
                setStudentNameInput("");
              }}
            />
          </div>
        </div>
        <div className="w-full flex flex-col items-start gap-2">
          <Label
            htmlFor="homeroom"
            className={errors.homeroom ? "text-red-500" : ""}
          >
            Lớp
          </Label>
          <div className="relative w-full">
            <Input
              id="homeroom"
              onFocus={() => {
                setWhichInputIsBeingFocused("homeroom");
              }}
              value={homeroomInput}
              onChange={(e) => {
                setHomeroomInput(e.target.value);
              }}
              placeholder={
                homeroomAutoCompleteValue || "Lớp học sẽ hiển thị tự động"
              }
              className={
                errors.homeroom
                  ? "border-red-500 focus:border-red-500 placeholder:text-red-400"
                  : ""
              }
            />
            <X
              className="absolute right-1 top-1/2 cursor-pointer -translate-y-1/2 text-red-400"
              size={17}
              onClick={() => {
                setHomeroomInput("");
              }}
            />
          </div>
        </div>

        <div className="w-full flex flex-col items-start gap-2">
          <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>
            Email
          </Label>
          <div className="relative w-full">
            <Input
              id="email"
              value={emailInput}
              onFocus={() => {
                setWhichInputIsBeingFocused("email");
              }}
              onChange={(e) => {
                setEmailInput(e.target.value);
              }}
              placeholder={
                emailAutoCompleteValue || "Email sẽ hiển thị tự động"
              }
              className={
                errors.email
                  ? "border-red-500 focus:border-red-500 placeholder:text-red-400"
                  : ""
              }
            />
            <X
              className="absolute right-1 top-1/2 cursor-pointer -translate-y-1/2 text-red-400"
              size={17}
              onClick={() => {
                setEmailInput("");
              }}
            />
          </div>
        </div>

        <div className="w-full flex flex-col items-start gap-2">
          <Label htmlFor="notice">Lưu ý</Label>
          <div className="relative w-full">
            <Textarea
              id="notice"
              value={noticeInput}
              onChange={(e) => {
                setNoticeInput(e.target.value);
              }}
              placeholder={"Nếu có"}
            />
            <X
              className="absolute right-1 top-1 cursor-pointer  text-red-400"
              size={17}
              onClick={() => {
                setEmailInput("");
              }}
            />
          </div>
        </div>
        <Button onClick={handleSubmit} className="w-full cursor-pointer">
          Thêm vào đơn
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full cursor-pointer -mt-2">
              Xóa tất cả
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa tất cả thông tin đã nhập? Hành động
                này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleConfirmClear}>
                Xóa tất cả
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Form;
