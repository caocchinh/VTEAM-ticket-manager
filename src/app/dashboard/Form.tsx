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
import { cn, removeVietnameseAccents } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShoppingCart, Sparkle, Trash2, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Form = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedStudentIdInput, setSelectedStudentIdInput] = useState("");
  const [studentNameAutoCompleteValue, setStudentNameAutoCompleteValue] =
    useState("");
  const [homeroomAutoCompleteValue, setHomeroomAutoCompleteValue] =
    useState("");
  const [emailAutoCompleteValue, setEmailAutoCompleteValue] = useState("");
  const [bestMatchStudentId, setBestMatchStudentId] = useState("");
  const [, setCurrentOrders] = useState<StudentInput[]>([]);

  // State for actual form values (separate from autocomplete preview)
  const [studentNameInput, setStudentNameInput] = useState("");
  const [homeroomInput, setHomeroomInput] = useState("");
  const studentIdInputRef = useRef<HTMLInputElement | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [ticketType, setTicketType] = useState("");
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

  const clearForm = ({ clearNotice }: { clearNotice: boolean }) => {
    setSelectedStudentIdInput("");
    setStudentNameAutoCompleteValue("");
    setHomeroomAutoCompleteValue("");
    setEmailAutoCompleteValue("");
    setBestMatchStudentId("");
    setStudentNameInput("");
    setHomeroomInput("");
    if (clearNotice) {
      setNoticeInput("");
    }
    setEmailInput("");
    setErrors({
      studentId: false,
      studentName: false,
      homeroom: false,
      email: false,
    });
  };

  const handleConfirmClear = () => {
    clearForm({ clearNotice: true });
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
          ticketType,
        },
      ]);
      clearForm({ clearNotice: false });
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
          clearForm({ clearNotice: false });
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
    <div className="flex flex-col items-center  gap-2 justify-center">
      <h2 className="font-semibold">Thông tin người mua</h2>
      <div className="flex flex-col border shadow-sm p-4 rounded-md gap-4 items-start w-[90%] md:w-[420px]">
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
                handleStudentIdChange(e.target.value.toUpperCase());
              }}
              value={selectedStudentIdInput}
              placeholder="Nhập mã số HS"
              className={cn(
                errors.studentId
                  ? "border-red-500  focus:border-red-500 placeholder:text-red-400"
                  : "",
                "pl-23"
              )}
            />
            <X
              className="absolute right-1 top-1/2 cursor-pointer -translate-y-1/2 text-red-400"
              size={17}
              onClick={() => {
                handleStudentIdChange("");
              }}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={
                    studentNameAutoCompleteValue === "" ||
                    studentNameAutoCompleteValue === NOT_STUDENT_IN_SCHOOL ||
                    (studentNameInput === studentNameAutoCompleteValue &&
                      homeroomInput === homeroomAutoCompleteValue &&
                      emailAutoCompleteValue === emailInput)
                  }
                  onClick={() => {
                    setStudentNameInput(studentNameAutoCompleteValue);
                    setHomeroomInput(homeroomAutoCompleteValue);
                    setSelectedStudentIdInput(bestMatchStudentId);
                    setEmailInput(emailAutoCompleteValue);
                  }}
                  tabIndex={-1}
                  className="bg-yellow-500 absolute top-1/2 left-2 -translate-y-1/2 text-white hover:text-white hover:bg-yellow-500 cursor-pointer w-20 h-6"
                >
                  <Sparkle size={8} /> Tất cả
                </Button>
              </TooltipTrigger>
              <TooltipContent>Autocomplete tất cả</TooltipContent>
            </Tooltip>
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
              className={cn(
                errors.studentName
                  ? "border-red-500 focus:border-red-500 placeholder:text-red-400"
                  : studentNameAutoCompleteValue &&
                    studentNameAutoCompleteValue !== NOT_STUDENT_IN_SCHOOL &&
                    studentNameInput === ""
                  ? "placeholder:text-[#0084ff]  placeholder:opacity-50  "
                  : "",
                "pl-10"
              )}
            />
            <X
              className="absolute right-1 top-1/2 cursor-pointer -translate-y-1/2 text-red-400"
              size={17}
              onClick={() => {
                setStudentNameInput("");
              }}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={
                    studentNameAutoCompleteValue === "" ||
                    studentNameAutoCompleteValue === NOT_STUDENT_IN_SCHOOL ||
                    studentNameAutoCompleteValue === studentNameInput
                  }
                  onClick={() => {
                    setStudentNameInput(studentNameAutoCompleteValue);
                  }}
                  tabIndex={-1}
                  className="bg-[#0084ff] absolute top-1/2 left-2 -translate-y-1/2 text-white hover:text-white hover:bg-[#0084ff] cursor-pointer w-6 h-6"
                >
                  <Sparkle size={8} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Autocomplete tên</TooltipContent>
            </Tooltip>
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
                setHomeroomInput(e.target.value.toUpperCase());
              }}
              placeholder={
                homeroomAutoCompleteValue || "Lớp học sẽ hiển thị tự động"
              }
              className={cn(
                errors.homeroom
                  ? "border-red-500 focus:border-red-500 placeholder:text-red-400"
                  : homeroomAutoCompleteValue &&
                    homeroomAutoCompleteValue !== NOT_STUDENT_IN_SCHOOL &&
                    homeroomInput === ""
                  ? "placeholder:text-[#0084ff]  placeholder:opacity-50  "
                  : "",
                "pl-10"
              )}
            />
            <X
              className="absolute right-1 top-1/2 cursor-pointer -translate-y-1/2 text-red-400"
              size={17}
              onClick={() => {
                setHomeroomInput("");
              }}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={
                    homeroomAutoCompleteValue === "" ||
                    homeroomAutoCompleteValue === NOT_STUDENT_IN_SCHOOL ||
                    homeroomAutoCompleteValue === homeroomInput
                  }
                  onClick={() => {
                    setHomeroomInput(homeroomAutoCompleteValue);
                  }}
                  tabIndex={-1}
                  className="bg-[#0084ff] absolute top-1/2 left-2 -translate-y-1/2 text-white hover:text-white hover:bg-[#0084ff] cursor-pointer w-6 h-6"
                >
                  <Sparkle size={8} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Autocomplete lớp</TooltipContent>
            </Tooltip>
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
              className={cn(
                errors.email
                  ? "border-red-500 focus:border-red-500 placeholder:text-red-400"
                  : emailAutoCompleteValue &&
                    emailAutoCompleteValue !== NOT_STUDENT_IN_SCHOOL &&
                    emailInput === ""
                  ? "placeholder:text-[#0084ff] placeholder:opacity-50 "
                  : "",
                "pl-10"
              )}
            />
            <X
              className="absolute right-1 top-1/2 cursor-pointer -translate-y-1/2 text-red-400"
              size={17}
              onClick={() => {
                setEmailInput("");
              }}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={
                    emailAutoCompleteValue === "" ||
                    emailAutoCompleteValue === NOT_STUDENT_IN_SCHOOL ||
                    emailAutoCompleteValue === emailInput
                  }
                  onClick={() => {
                    setEmailInput(emailAutoCompleteValue);
                  }}
                  tabIndex={-1}
                  className="bg-[#0084ff] absolute top-1/2 left-2 -translate-y-1/2 text-white hover:text-white hover:bg-[#0084ff] cursor-pointer w-6 h-6"
                >
                  <Sparkle size={8} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Autocomplete email</TooltipContent>
            </Tooltip>
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
          <ShoppingCart />
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full cursor-pointer -mt-2">
              Xóa tất cả
              <Trash2 />
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
