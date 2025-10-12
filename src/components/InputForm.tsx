import {
  INVALID_TICKET_DUE_TO_INVALID_CLASS,
  NOT_STUDENT_IN_SCHOOL,
} from "@/constants/constants";
import { InputFormProps, Student } from "@/constants/types";
import {
  cn,
  errorToast,
  extractFirstNumber,
  findBestStudentMatch,
  safeTrim,
} from "@/lib/utils";
import {
  Banknote,
  Check,
  CreditCard,
  Loader2,
  ShoppingCart,
  Sparkle,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import EnhancedSelect from "./EnhancedSelect";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useSidebar } from "./ui/sidebar";

const InputForm = ({
  selectedStudentIdInput,
  emailInput,
  isStudentListFetching,
  homeroomInput,
  isTicketInfoError,
  currentOrder,
  isTicketInfoFetching,
  setCurrentOrders,
  mounted,
  clearForm,
  getTicketColor,
  bestMatchStudentId,
  ticketType,
  noticeInput,
  setNoticeInput,
  setStudentNameAutoCompleteValue,
  setBestMatchStudentId,
  setEmailAutoCompleteValue,
  setHomeroomAutoCompleteValue,
  homeroomAutoCompleteValue,
  emailAutoCompleteValue,
  studentNameAutoCompleteValue,
  errors,
  setErrors,
  setTicketType,
  studentList,
  lastValidTicketType,
  paymentMedium,
  setPaymentMedium,
  setLastValidTicketType,
  ticketInfo,
  isStudentListError,
  studentNameInput,
  setStudentNameInput,
  setHomeroomInput,
  setEmailInput,
  setSelectedStudentIdInput,
}: InputFormProps) => {
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [whichInputIsBeingFocused, setWhichInputIsBeingFocused] = useState<
    "id" | "name" | "homeroom" | "email"
  >("id");
  const { open: isSidebarOpen } = useSidebar();

  // Validation useEffect hooks for each input field
  useEffect(() => {
    if (selectedStudentIdInput) {
      if (safeTrim(selectedStudentIdInput)) {
        setErrors((prev) => ({ ...prev, studentId: false }));
      }
    }
  }, [selectedStudentIdInput, setErrors]);

  useEffect(() => {
    if (studentNameInput) {
      if (safeTrim(studentNameInput)) {
        setErrors((prev) => ({ ...prev, studentName: false }));
      }
    }
  }, [setErrors, studentNameInput]);

  useEffect(() => {
    if (emailInput) {
      if (safeTrim(emailInput)) {
        setErrors((prev) => ({ ...prev, email: false }));
      }
    }
  }, [emailInput, setErrors]);

  // Fuzzy search function to find the best matching student

  useEffect(() => {
    const trimmed = safeTrim(homeroomInput);
    const numericPartofClassName = extractFirstNumber(trimmed) ?? 0;
    const availabelClassRange = ticketInfo?.offline
      .map((ticket) => ticket.classRange)
      .flat();
    if (trimmed) {
      if (availabelClassRange?.includes(numericPartofClassName)) {
        setErrors((prev) => ({ ...prev, homeroom: false }));
        return;
      }
      setErrors((prev) => ({ ...prev, homeroom: true }));
    } else {
      setErrors((prev) => ({ ...prev, homeroom: false }));
    }
  }, [homeroomInput, setErrors, ticketInfo?.offline]);

  const updateAutocompleteValues = useCallback(
    (value: string, students: Student[]) => {
      if (!safeTrim(value)) {
        setStudentNameAutoCompleteValue("");
        setHomeroomAutoCompleteValue("");
        setEmailAutoCompleteValue("");
        setBestMatchStudentId("");
        return;
      }

      const bestMatch = findBestStudentMatch(safeTrim(value), students);
      if (bestMatch && bestMatch.studentId.includes("VS")) {
        setStudentNameAutoCompleteValue(bestMatch.name);
        setHomeroomAutoCompleteValue(bestMatch.homeroom);
        setBestMatchStudentId(bestMatch.studentId);
        setEmailAutoCompleteValue(bestMatch.email);
      } else {
        setStudentNameAutoCompleteValue(NOT_STUDENT_IN_SCHOOL);
        setHomeroomAutoCompleteValue(NOT_STUDENT_IN_SCHOOL);
        setEmailAutoCompleteValue(NOT_STUDENT_IN_SCHOOL);
        setBestMatchStudentId("");
      }
    },
    [
      setBestMatchStudentId,
      setEmailAutoCompleteValue,
      setHomeroomAutoCompleteValue,
      setStudentNameAutoCompleteValue,
    ]
  );

  useEffect(() => {
    if (studentList && mounted) {
      updateAutocompleteValues(selectedStudentIdInput, studentList);
    }
  }, [studentList, selectedStudentIdInput, mounted, updateAutocompleteValues]);

  const handleStudentIdChange = (value: string) => {
    setSelectedStudentIdInput(value);

    if (studentList) {
      updateAutocompleteValues(value, studentList);
    }

    // Handle clearing form when input is empty
    if (
      safeTrim(value) === "" &&
      studentNameAutoCompleteValue !== NOT_STUDENT_IN_SCHOOL
    ) {
      clearForm({ clearNotice: false });
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
          safeTrim(studentNameInput) === ""
        ) {
          e.preventDefault();

          setStudentNameInput(studentNameAutoCompleteValue);
        } else if (
          whichInputIsBeingFocused === "homeroom" &&
          safeTrim(homeroomInput) === ""
        ) {
          e.preventDefault();

          setHomeroomInput(homeroomAutoCompleteValue);
        } else if (
          whichInputIsBeingFocused === "email" &&
          safeTrim(emailInput) === ""
        ) {
          e.preventDefault();

          setEmailInput(emailAutoCompleteValue);
        }
      }
    },
    [
      studentList,
      studentNameAutoCompleteValue,
      whichInputIsBeingFocused,
      studentNameInput,
      homeroomInput,
      homeroomAutoCompleteValue,
      emailAutoCompleteValue,
      emailInput,
      setStudentNameInput,
      setHomeroomInput,
      setSelectedStudentIdInput,
      bestMatchStudentId,
      setEmailInput,
    ]
  );

  const availableTicketsType = useMemo(() => {
    if (ticketInfo) {
      return (
        ticketInfo.offline
          ?.filter((value) =>
            value.classRange.includes(extractFirstNumber(homeroomInput) ?? 0)
          )
          .map((value) => value) ?? []
      );
    } else {
      return [];
    }
  }, [homeroomInput, ticketInfo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleTabKeyPress(e as unknown as React.KeyboardEvent);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleTabKeyPress]);

  const validateForm = () => {
    const newErrors = {
      studentId: !safeTrim(selectedStudentIdInput),
      studentName: !safeTrim(studentNameInput),
      homeroom: errors.homeroom || !safeTrim(homeroomInput),
      email: !safeTrim(emailInput),
    };

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const isDuplicate = currentOrder.some(
        (order) => order.studentIdInput === selectedStudentIdInput
      );

      if (isDuplicate) {
        errorToast({
          message: `Học sinh với mã số ${selectedStudentIdInput} đã có trong order! 1 HS không được phép mua nhiều vé trong 1 lần.`,
        });
        return;
      }

      setCurrentOrders((prev) => [
        ...prev,
        {
          nameInput: studentNameInput,
          homeroomInput: homeroomInput,
          studentIdInput: selectedStudentIdInput,
          notice: noticeInput,
          paymentMedium: paymentMedium,
          ticketType,
          email: emailInput,
        },
      ]);
      clearForm({ clearNotice: true });
      setLastValidTicketType("");
    }
  };

  useEffect(() => {
    if (availableTicketsType.length > 0) {
      if (
        lastValidTicketType &&
        availableTicketsType.some(
          (ticket) => ticket.ticketName === lastValidTicketType
        )
      ) {
        setTicketType(lastValidTicketType);
      } else {
        if (availableTicketsType.some((ticket) => ticket.ticketName === ticketType)) {
          return;
        }
        const newTicketType = availableTicketsType[0];
        setTicketType(newTicketType.ticketName);
        setLastValidTicketType(newTicketType.ticketName);
      }
    } else {
      if (homeroomInput) {
        setTicketType(INVALID_TICKET_DUE_TO_INVALID_CLASS);
      } else {
        setTicketType("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTicketsType, homeroomInput, lastValidTicketType]);

  // Update lastValidTicketType only when ticketType changes to a valid ticket
  useEffect(() => {
    if (
      ticketType &&
      ticketType !== INVALID_TICKET_DUE_TO_INVALID_CLASS &&
      availableTicketsType.some((ticket) => ticket.ticketName === ticketType)
    ) {
      setLastValidTicketType(ticketType);
    }
  }, [ticketType, availableTicketsType, setLastValidTicketType]);

  const handleConfirmClear = () => {
    clearForm({ clearNotice: true });
    setIsDeleteAllDialogOpen(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 w-[90%] min-w-full sm:min-w-[400px] max-w-[550px]",
        isSidebarOpen ? "w-[48%]" : " w-[35%]"
      )}
    >
      {" "}
      <h2 className="font-semibold">Điền thông tin người mua</h2>
      <div className="flex flex-col border shadow-sm p-4 rounded-md gap-[15px] items-start w-full relative">
        {(isTicketInfoFetching || isStudentListFetching) && (
          <div className="absolute w-full h-full bg-black/40 z-[10] top-0 left-0 rounded-md flex items-center justify-center flex-col">
            <p className="text-white">Đang lấy thông tin từ cơ sở dữ liệu</p>
            <Loader2
              className="animate-spin"
              size={50}
              color="white"
              strokeWidth={1}
            />
          </div>
        )}
        {(isTicketInfoError || isStudentListError) &&
          !isTicketInfoFetching &&
          !isStudentListFetching && (
            <div className="absolute w-full h-full bg-red-600/60 z-[1] top-0 left-0 rounded-md flex items-center justify-center flex-col">
              <p className="text-white">
                Lấy thông tin từ cơ sở dữ liệu thất bại
              </p>
              <TriangleAlert size={50} color="white" strokeWidth={2} />
              <Button
                variant="ghost"
                className="border-white border text-white mt-4 cursor-pointer"
                onClick={() => {
                  if (typeof window !== undefined) {
                    window.location.reload();
                  }
                }}
              >
                Tải lại trang
              </Button>
            </div>
          )}
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
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
          <div className="w-full flex flex-col items-start gap-3">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="ticket-type"
                className={errors.studentId ? "text-red-500" : ""}
              >
                Hạng vé
              </Label>
              {ticketType &&
                ticketType !== INVALID_TICKET_DUE_TO_INVALID_CLASS && (
                  <div
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{
                      backgroundColor: getTicketColor(ticketType),
                    }}
                    title={`Màu cho ${ticketType}`}
                  />
                )}
            </div>
            <EnhancedSelect
              prerequisite={
                !!ticketInfo &&
                homeroomInput &&
                extractFirstNumber(homeroomInput) &&
                availableTicketsType.length > 0
                  ? ""
                  : "Vui lòng điền lớp"
              }
              setSelectedValue={setTicketType}
              selectedValue={ticketType}
              side="bottom"
              label="Hạng vé"
              data={
                availableTicketsType &&
                availableTicketsType.length &&
                homeroomInput.length > 0
                  ? availableTicketsType
                  : [
                      {
                        ticketName: INVALID_TICKET_DUE_TO_INVALID_CLASS,
                        price: "",
                        includeConcert: false,
                        classRange: [],
                      },
                    ]
              }
            />
          </div>
        </div>

        <div className="flex flex-col w-full items-center gap-2 justify-center">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 self-start">
            Phương thức thanh toán
          </Label>
          <div className="flex flex-row gap-3 w-full">
            <div
              className={cn(
                "relative flex w-1/2 items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                paymentMedium === "Tiền mặt"
                  ? "border-[#0084ff] bg-[#0084ff]/5 shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
              onClick={() => setPaymentMedium("Tiền mặt")}
            >
              <div className="flex flex-row items-center gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center",
                    paymentMedium === "Tiền mặt"
                      ? "bg-[#0084ff] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  )}
                >
                  <Banknote className="w-4 h-4" />
                </div>
                <Label
                  htmlFor="cash-payment"
                  className={cn(
                    "text-sm font-medium cursor-pointer transition-colors",
                    paymentMedium === "Tiền mặt"
                      ? "text-[#0084ff]"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  Tiền mặt
                </Label>
              </div>
              <input
                type="radio"
                id="cash-payment"
                name="payment-method"
                checked={paymentMedium === "Tiền mặt"}
                onChange={() => setPaymentMedium("Tiền mặt")}
                className="absolute opacity-0  cursor-pointer"
                aria-label="Thanh toán bằng tiền mặt"
              />
              {paymentMedium === "Tiền mặt" && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-[#0084ff] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div
              className={cn(
                "relative flex w-1/2 items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                paymentMedium === "Chuyển khoản"
                  ? "border-[#0084ff] bg-[#0084ff]/5 shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
              onClick={() => setPaymentMedium("Chuyển khoản")}
            >
              <div className="flex flex-row items-center gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center",
                    paymentMedium === "Chuyển khoản"
                      ? "bg-[#0084ff] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  )}
                >
                  <CreditCard className="w-4 h-4" />
                </div>
                <Label
                  htmlFor="bank-transfer"
                  className={cn(
                    "text-sm font-medium cursor-pointer transition-colors",
                    paymentMedium === "Chuyển khoản"
                      ? "text-[#0084ff]"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  Chuyển khoản
                </Label>
              </div>
              <input
                type="radio"
                id="bank-transfer"
                name="payment-method"
                checked={paymentMedium === "Chuyển khoản"}
                onChange={() => setPaymentMedium("Chuyển khoản")}
                className="absolute opacity-0  cursor-pointer"
                aria-label="Thanh toán bằng chuyển khoản"
              />
              {paymentMedium === "Chuyển khoản" && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-[#0084ff] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
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
              placeholder="Nếu có"
              autoResize
              rows={1}
              className="!min-h-[30px] py-1"
            />
            <X
              className="absolute right-1 top-1 cursor-pointer  text-red-400"
              size={17}
              onClick={() => {
                setNoticeInput("");
              }}
            />
          </div>
        </div>
        <Button onClick={handleSubmit} className="w-full cursor-pointer">
          Thêm vào order
          <ShoppingCart />
        </Button>
        <Dialog
          open={isDeleteAllDialogOpen}
          onOpenChange={setIsDeleteAllDialogOpen}
        >
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
              <Button
                variant="outline"
                onClick={() => setIsDeleteAllDialogOpen(false)}
              >
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

export default InputForm;
