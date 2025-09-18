/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { LogoutButton } from "@/components/LogoutButton";
import { truncateText } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  INVALID_TICKET_DUE_TO_INVALID_CLASS,
  NOT_STUDENT_IN_SCHOOL,
  SALES_SHEET_ID,
} from "@/constants/constants";
import {
  SalesInfo,
  Staff,
  Student,
  StudentInput,
  TicketInfo,
} from "@/constants/types";
import {
  cn,
  extractFirstNumber,
  removeVietnameseAccents,
  parseVietnameseCurrency,
  formatVietnameseCurrency,
  sucessToast,
  errorToast,
} from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Calculator,
  CloudDownload,
  Eye,
  EyeOff,
  Loader2,
  PencilLine,
  RefreshCcw,
  ShoppingCart,
  Sparkle,
  Trash2,
  TriangleAlert,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EnhancedSelect from "@/components/EnhancedSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteCache, getCache, setCache } from "@/drizzle/idb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChangeCalculator from "@/components/ChangeCalculator";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { sendOrderAction } from "@/server/actions";
import Image from "next/image";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { PopoverContent } from "@radix-ui/react-popover";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Form = ({ session, staffInfo }: { session: any; staffInfo: Staff }) => {
  const [mounted, setMounted] = useState(false);
  const [selectedStudentIdInput, setSelectedStudentIdInput] = useState("");
  const [studentNameAutoCompleteValue, setStudentNameAutoCompleteValue] =
    useState("");
  const [homeroomAutoCompleteValue, setHomeroomAutoCompleteValue] =
    useState("");
  const [emailAutoCompleteValue, setEmailAutoCompleteValue] = useState("");
  const [bestMatchStudentId, setBestMatchStudentId] = useState("");
  const [currentOrder, setCurrentOrders] = useState<StudentInput[]>([]);

  // State for actual form values (separate from autocomplete preview)
  const [studentNameInput, setStudentNameInput] = useState("");
  const [homeroomInput, setHomeroomInput] = useState("");
  const studentIdInputRef = useRef<HTMLInputElement | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [whichInputIsBeingFocused, setWhichInputIsBeingFocused] = useState<
    "id" | "name" | "homeroom" | "email"
  >("id");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [noticeInput, setNoticeInput] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [lastValidTicketType, setLastValidTicketType] = useState("");
  const [paymentMedium, setPaymentMedium] = useState<
    "Tiền mặt" | "Chuyển khoản"
  >("Tiền mặt");
  const [
    isConfirmingOrderAlertDialogOpen,
    setIsConfirmingOrderAlertDialogOpen,
  ] = useState(false);
  const [isRefreshDialogOpen, setIsRefreshDialogOpen] = useState(false);
  const [isMoneyVisible, setIsMoneyVisible] = useState(true);

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
    const trimmed = homeroomInput.trim();
    const numericPartofClassName = extractFirstNumber(trimmed) ?? 0;

    if (trimmed) {
      if (numericPartofClassName > 12 || numericPartofClassName < 6) {
        setErrors((prev) => ({ ...prev, homeroom: true }));
        return;
      }
      setErrors((prev) => ({ ...prev, homeroom: false }));
    } else {
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
    // Load money visibility preference from localStorage
    const savedVisibility = localStorage.getItem("moneyVisibility");
    if (savedVisibility !== null) {
      setIsMoneyVisible(JSON.parse(savedVisibility));
    }
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

  const fetchStudentList = async () => {
    const response = await fetch("/api/studentList");
    if (!response.ok) {
      throw new Error("Failed to fetch student list");
    }
    const data = await response.json();
    return data.data as Student[];
  };

  const {
    data: studentList,
    isFetching: isStudentListFetching,
    isError: isStudentListError,
    refetch: refetchStudentList,
  } = useQuery({
    queryKey: ["student_list"],
    queryFn: async () => {
      try {
        const cachedData = await getCache<string>("student_list");
        if (cachedData) {
          return JSON.parse(cachedData) as Student[];
        } else {
          const freshData = await fetchStudentList();
          await setCache("student_list", JSON.stringify(freshData));
          return freshData;
        }
      } catch (error) {
        if (error == "Failed to fetch student list") {
          throw new Error("Failed to fetch student list");
        }
        return fetchStudentList();
      }
    },
    enabled: mounted,
  });

  const fetchTicketInfo = async () => {
    const response = await fetch("/api/ticket-info");
    if (!response.ok) {
      throw new Error("Failed to fetch ticket info");
    }
    const data = await response.json();
    return data.data as TicketInfo[];
  };

  const {
    data: ticketInfo,
    isFetching: isTicketInfoFetching,
    isError: isTicketInfoError,
    refetch: refetchTicketInfo,
  } = useQuery({
    queryKey: ["ticket_info"],
    queryFn: async () => {
      try {
        const cachedData = await getCache<string>("ticket_info");
        if (cachedData) {
          return JSON.parse(cachedData) as TicketInfo[];
        } else {
          const freshData = await fetchTicketInfo();
          await setCache("ticket_info", JSON.stringify(freshData));
          return freshData;
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Failed to fetch ticket info"
        ) {
          throw new Error("Failed to fetch ticket info");
        }
        return fetchTicketInfo();
      }
    },
    enabled: mounted,
  });

  const toggleMoneyVisibility = () => {
    const newVisibility = !isMoneyVisible;
    setIsMoneyVisible(newVisibility);
    localStorage.setItem("moneyVisibility", JSON.stringify(newVisibility));
  };

  const clearForm = ({ clearNotice }: { clearNotice: boolean }) => {
    setSelectedStudentIdInput("");
    setStudentNameAutoCompleteValue("");
    setHomeroomAutoCompleteValue("");
    setEmailAutoCompleteValue("");
    setBestMatchStudentId("");
    setLastValidTicketType("");
    setStudentNameInput("");
    setPaymentMedium("Tiền mặt");
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

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setIsEditDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    if (editingIndex !== null) {
      const orderToEdit = currentOrder[editingIndex];
      setSelectedStudentIdInput(orderToEdit.studentIdInput);
      setStudentNameInput(orderToEdit.nameInput);
      setHomeroomInput(orderToEdit.homeroomInput);
      setEmailInput(orderToEdit.email);
      setNoticeInput(orderToEdit.notice);
      setTicketType(orderToEdit.ticketType);
      setPaymentMedium(orderToEdit.paymentMedium);

      setCurrentOrders((prev) => prev.filter((_, i) => i !== editingIndex));
    }
    setIsEditDialogOpen(false);
    setEditingIndex(null);
  };

  const handleDeleteClick = (index: number) => {
    setDeletingIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingIndex !== null) {
      setCurrentOrders((prev) => prev.filter((_, i) => i !== deletingIndex));
    }
    setIsDeleteDialogOpen(false);
    setDeletingIndex(null);
  };

  const validateForm = () => {
    const newErrors = {
      studentId: !selectedStudentIdInput.trim(),
      studentName: !studentNameInput.trim(),
      homeroom: errors.homeroom || !homeroomInput.trim(),
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
          paymentMedium: paymentMedium,
          ticketType,
          email: emailInput,
        },
      ]);
      clearForm({ clearNotice: true });
      setLastValidTicketType("");
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

  const availableTicketsType = useMemo(() => {
    if (ticketInfo) {
      return (
        ticketInfo
          ?.filter((value) =>
            value.classRange.includes(extractFirstNumber(homeroomInput) ?? 0)
          )
          .map((value) => value.ticketName) ?? []
      );
    } else {
      return [];
    }
  }, [homeroomInput, ticketInfo]);

  useEffect(() => {
    if (availableTicketsType.length > 0) {
      if (
        lastValidTicketType &&
        availableTicketsType.includes(lastValidTicketType)
      ) {
        setTicketType(lastValidTicketType);
      } else {
        if (availableTicketsType.includes(ticketType)) {
          return;
        }
        const newTicketType = availableTicketsType[0];
        setTicketType(newTicketType);
        setLastValidTicketType(newTicketType);
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
      availableTicketsType.includes(ticketType)
    ) {
      setLastValidTicketType(ticketType);
    }
  }, [ticketType, availableTicketsType]);

  const orderSubtotal = useMemo(() => {
    if (currentOrder.length > 0 && ticketInfo) {
      let subTotal = 0;
      currentOrder.forEach((order) => {
        const ticketPrice =
          ticketInfo.find((info) => order.ticketType === info.ticketName)
            ?.price ?? 0;
        const numericPrice = parseVietnameseCurrency(ticketPrice);
        subTotal += numericPrice;
      });
      return subTotal;
    }
    return 0;
  }, [currentOrder, ticketInfo]);

  const queryClient = useQueryClient();
  const { mutate: mutateOrder, isPending: isOrderMutating } = useMutation({
    mutationKey: ["submit_order"],
    mutationFn: async () => {
      const result = await sendOrderAction({ orders: currentOrder });
      if (!result.success) {
        throw new Error(result.message);
      }
      return true;
    },
    onSuccess: () => {
      clearForm({ clearNotice: true });
      setCurrentOrders([]);
      sucessToast({ message: "Chốt deal thành công!" });
      setIsConfirmingOrderAlertDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["sales_info"] });
    },
    onError: () => {
      errorToast({ message: "Chốt deal thất bại, vui lòng thử lại!" });
    },
  });

  const {
    data: salesInfo,
    isFetching: isSalesInfoFetching,
    isError: isSalesInfoError,
    refetch: refetchSalesInfo,
  } = useQuery({
    queryKey: ["sales_info"],
    queryFn: async () => {
      const response = await fetch("/api/sales");
      if (!response.ok) {
        throw new Error("Failed to fetch sales info");
      }
      const data = await response.json();
      return data.data as SalesInfo[];
    },
    enabled: mounted,
  });

  const totalSalesAmount = useMemo(() => {
    if (salesInfo && salesInfo.length > 0 && ticketInfo) {
      let total = 0;
      salesInfo.forEach((sale) => {
        const ticketPrice =
          ticketInfo.find((info) => sale.buyerTicketType === info.ticketName)
            ?.price ?? 0;
        const numericPrice = parseVietnameseCurrency(ticketPrice);
        total += numericPrice;
      });
      return total;
    }
    return 0;
  }, [salesInfo, ticketInfo]);

  const currentStaffStats = useMemo(() => {
    if (salesInfo && salesInfo.length > 0 && ticketInfo && staffInfo) {
      let staffRevenue = 0;
      let staffOrderCount = 0;

      salesInfo.forEach((sale) => {
        if (sale.staffName === staffInfo.name) {
          staffOrderCount++;
          const ticketPrice =
            ticketInfo.find((info) => sale.buyerTicketType === info.ticketName)
              ?.price ?? 0;
          const numericPrice = parseVietnameseCurrency(ticketPrice);
          staffRevenue += numericPrice;
        }
      });

      return { revenue: staffRevenue, orderCount: staffOrderCount };
    }
    return { revenue: 0, orderCount: 0 };
  }, [salesInfo, ticketInfo, staffInfo]);

  return (
    <>
      <div className="flex flex-row m-auto w-full flex-wrap items-center justify-center gap-4">
        <div className="flex p-2 shadow-sm bg-card rounded-md items-center justify-between gap-3 border-1 ">
          <div className="flex items-center">
            <div className="relative">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User Avatar"}
                  width={35}
                  height={35}
                  className="rounded-full border-2  h-[35px] mr-1 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xl font-semibold">
                    {session.user.name?.charAt(0) ||
                      session.user.email?.charAt(0) ||
                      "U"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-sm">
                {truncateText(staffInfo.name, 24)}
              </CardTitle>
              <CardDescription className="text-[10px]">
                {truncateText(session.user.email, 24)}
              </CardDescription>
            </div>
          </div>
          <LogoutButton />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              target="_blank"
              rel="noopener"
              href={`https://docs.google.com/spreadsheets/d/${SALES_SHEET_ID}`}
              className="border rounded-md shadow-sm p-2"
            >
              <Image
                src="/assets/sheet_logo.png"
                className="w-[35px] h-[35px] object-contain"
                alt="Google Sheet logo"
                width={35}
                height={35}
              />
            </a>
          </TooltipTrigger>
          <TooltipContent>Sheet bán vé & checkin</TooltipContent>
        </Tooltip>
        <Dialog
          open={isRefreshDialogOpen}
          onOpenChange={setIsRefreshDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              className="h-[50px] border cursor-pointer"
              variant="ghost"
              disabled={isStudentListFetching || isTicketInfoFetching}
            >
              Update thông tin vé & học sinh
              <CloudDownload />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận cập nhật dữ liệu</DialogTitle>
              <DialogDescription>
                Hành động này sẽ xóa tất cả dữ liệu đã nhập trong phiên làm việc
                hiện tại và tải lại thông tin mới từ cơ sở dữ liệu. Bạn có chắc
                chắn muốn tiếp tục?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRefreshDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={async () => {
                  await deleteCache("ticket_info");
                  await deleteCache("student_list");
                  refetchStudentList();
                  refetchTicketInfo();
                  setIsRefreshDialogOpen(false);
                  clearForm({ clearNotice: true });
                  setCurrentOrders([]);
                }}
                disabled={isStudentListFetching || isTicketInfoFetching}
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex p-2 shadow-sm bg-card rounded-md items-center justify-between gap-1 border-1 relative">
          {isSalesInfoFetching && (
            <div className="absolute top-0 left-0 flex  w-full h-full rounded-md items-center justify-center bg-black/50 z-[10] text-white gap-2">
              Đang cập nhật
              <Loader2 className="animate-spin" />
            </div>
          )}
          {isSalesInfoError && !isSalesInfoFetching && (
            <div className="absolute top-0 left-0 flex  w-full h-full rounded-md items-center justify-center bg-red-500/70 z-[10] text-white gap-2">
              <div className="flex items-center justify-center">
                Lỗi
                <TriangleAlert />
              </div>
              <Button
                variant="ghost"
                className="border w-[35px] border-white cursor-pointer"
                onClick={() => {
                  refetchSalesInfo();
                }}
              >
                <RefreshCcw />
              </Button>
            </div>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="flex items-center gap-2 bg-transparent hover:bg-transparent cursor-pointer border rounded-sm"
                disabled={isSalesInfoFetching || isSalesInfoError}
              >
                <ShoppingCart size={20} className="text-green-600" />
                <div>
                  <CardDescription className="text-md font-semibold text-green-600">
                    Tổng doanh thu{" "}
                    {isMoneyVisible
                      ? formatVietnameseCurrency(totalSalesAmount)
                      : "*****"}
                  </CardDescription>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex p-2 shadow-sm bg-card rounded-md items-center justify-between gap-3 border-1">
                <div className="flex items-center justify-center gap-1 flex-col">
                  <CardTitle className="text-sm">Doanh thu bạn kiếm </CardTitle>

                  <div className="flex items-center justify-center w-full gap-2">
                    <Zap size={20} className="text-blue-600" />
                    <div>
                      <CardDescription className="text-lg font-semibold text-blue-600">
                        {isMoneyVisible
                          ? formatVietnameseCurrency(currentStaffStats.revenue)
                          : "*****"}
                      </CardDescription>
                      <CardDescription className="text-xs text-gray-500">
                        {currentStaffStats.orderCount} đơn hàng
                      </CardDescription>
                      {totalSalesAmount > 0 && (
                        <CardDescription className="text-xs text-gray-500">
                          {Math.round(
                            (currentStaffStats.revenue / totalSalesAmount) * 100
                          )}
                          % tổng danh thu
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMoneyVisibility}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                {isMoneyVisible ? (
                  <Eye size={16} className="text-gray-600" />
                ) : (
                  <EyeOff size={16} className="text-gray-600" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isMoneyVisible ? "Ẩn số tiền" : "Hiện số tiền"}
            </TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            className="border w-[35px] border-white cursor-pointer -ml-2"
            onClick={() => {
              refetchSalesInfo();
            }}
          >
            <RefreshCcw />
          </Button>
        </div>
      </div>
      <div className="flex flex-row items-start justify-center gap-5 mt-5 flex-wrap w-full">
        <div className="flex flex-col items-center  gap-2 justify-center w-[90%] sm:w-[440px]">
          <h2 className="font-semibold">Điền thông tin người mua</h2>
          <div className="flex flex-col border shadow-sm p-4 rounded-md gap-4 items-start w-full relative">
            {(isTicketInfoFetching || isStudentListFetching) && (
              <div className="absolute w-full h-full bg-black/40 z-[10] top-0 left-0 rounded-md flex items-center justify-center flex-col">
                <p className="text-white">
                  Đang lấy thông tin từ cơ sở dữ liệu
                </p>
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
                <div className="absolute w-full h-full bg-red-600/60 z-[100] top-0 left-0 rounded-md flex items-center justify-center flex-col">
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
                        studentNameAutoCompleteValue ===
                          NOT_STUDENT_IN_SCHOOL ||
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
                        studentNameAutoCompleteValue !==
                          NOT_STUDENT_IN_SCHOOL &&
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
                        studentNameAutoCompleteValue ===
                          NOT_STUDENT_IN_SCHOOL ||
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
              <Label
                htmlFor="email"
                className={errors.email ? "text-red-500" : ""}
              >
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

            <div className="flex flex-row items-center justify-between gap-5 w-full">
              <div className="w-full flex flex-col items-start gap-3 ">
                <Label
                  htmlFor="ticket-type"
                  className={errors.studentId ? "text-red-500" : ""}
                >
                  Hạng vé
                </Label>
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
                      : [INVALID_TICKET_DUE_TO_INVALID_CLASS]
                  }
                />
              </div>
              <div className="flex flex-col w-full items-center gap-2 justify-center">
                <div className="flex flex-row items-center justify-between gap-1 w-full">
                  <Label
                    htmlFor="offline"
                    className={cn(
                      paymentMedium === "Tiền mặt" && "text-[#0084ff]",
                      "cursor-pointer"
                    )}
                  >
                    Tiền mặt
                  </Label>
                  <Checkbox
                    id="offline"
                    checked={paymentMedium == "Tiền mặt"}
                    onCheckedChange={() => {
                      setPaymentMedium("Tiền mặt");
                    }}
                    className="data-[state=checked]:border-[#0084ff] data-[state=checked]:bg-[#0084ff] data-[state=checked]:text-white dark:data-[state=checked]:border-[#0084ff] dark:data-[state=checked]:bg-[#0084ff] cursor-pointer"
                  />
                </div>
                <div className="flex flex-row items-center justify-between gap-1 w-full">
                  <Label
                    htmlFor="bank-transfer"
                    className={cn(
                      paymentMedium === "Chuyển khoản" && "text-[#0084ff]",
                      "cursor-pointer"
                    )}
                  >
                    Chuyển khoản
                  </Label>
                  <Checkbox
                    id="bank-transfer"
                    checked={paymentMedium == "Chuyển khoản"}
                    onCheckedChange={() => {
                      setPaymentMedium("Chuyển khoản");
                    }}
                    className="data-[state=checked]:border-[#0084ff] data-[state=checked]:bg-[#0084ff] data-[state=checked]:text-white dark:data-[state=checked]:border-[#0084ff] dark:data-[state=checked]:bg-[#0084ff] cursor-pointer"
                  />
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
                  placeholder={"Nếu có"}
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer -mt-2"
                >
                  Xóa tất cả
                  <Trash2 />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận xóa</DialogTitle>
                  <DialogDescription>
                    Bạn có chắc chắn muốn xóa tất cả thông tin đã nhập? Hành
                    động này không thể hoàn tác.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
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
        <div className="flex flex-col items-center justify-center gap-2 w-[90%] sm:w-[425px]">
          <h2 className="font-semibold">Thông tin order</h2>
          <div className="flex flex-col gap-2 w-full border rounded-md shadow-sm p-4">
            {currentOrder.length === 0 && (
              <h3 className="text-center">Hiện tại chưa có đơn nào!</h3>
            )}
            <ScrollArea className="h-[50vh] pr-4" type="always">
              {currentOrder.length > 0 && (
                <Accordion type="multiple" className="w-full">
                  {currentOrder.map((order, index) => (
                    <Fragment key={index}>
                      <div className="flex flex-row items-start gap-2">
                        <div className="flex flex-row gap-1">
                          <Dialog
                            open={isEditDialogOpen}
                            onOpenChange={setIsEditDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="cursor-pointer w-6 h-6"
                                      onClick={() => handleEditClick(index)}
                                    >
                                      <PencilLine size={8} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Sửa</TooltipContent>
                                </Tooltip>
                              </div>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Xác nhận chỉnh sửa</DialogTitle>
                                <DialogDescription>
                                  Bạn có chắc chắn muốn chỉnh sửa đơn hàng này?
                                  Thông tin sẽ được đưa về form để chỉnh sửa và
                                  đơn hàng hiện tại sẽ bị xóa khỏi danh sách.
                                </DialogDescription>
                              </DialogHeader>
                              {editingIndex !== null && (
                                <div className="p-2 border border-[#0084ff] rounded-md">
                                  <div className="flex flex-row gap-2">
                                    <p className="font-semibold">
                                      Tên & Mã số HS:
                                    </p>
                                    <p>
                                      {currentOrder[editingIndex].nameInput} -{" "}
                                      {
                                        currentOrder[editingIndex]
                                          .studentIdInput
                                      }
                                    </p>
                                  </div>
                                  <OrderItemInfo
                                    order={currentOrder[editingIndex]}
                                    price={
                                      ticketInfo?.find(
                                        (info) =>
                                          currentOrder[editingIndex!]
                                            ?.ticketType === info.ticketName
                                      )?.price ?? 0
                                    }
                                  />
                                </div>
                              )}
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  className="cursor-pointer"
                                  onClick={() => setIsEditDialogOpen(false)}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  onClick={handleConfirmEdit}
                                  className="cursor-pointer"
                                >
                                  Xác nhận chỉnh sửa
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={isDeleteDialogOpen}
                            onOpenChange={setIsDeleteDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      className="cursor-pointer w-6 h-6"
                                      onClick={() => handleDeleteClick(index)}
                                    >
                                      <Trash2 size={8} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Xóa</TooltipContent>
                                </Tooltip>
                              </div>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Xác nhận xóa</DialogTitle>
                                <DialogDescription>
                                  Bạn có chắc chắn muốn xóa đơn hàng này? Hành
                                  động này không thể hoàn tác.
                                </DialogDescription>
                              </DialogHeader>
                              {deletingIndex !== null && (
                                <div className="p-2 border border-red-600 rounded-md">
                                  <div className="flex flex-row gap-2">
                                    <p className="font-semibold">
                                      Tên & Mã số HS:
                                    </p>
                                    <p>
                                      {currentOrder[deletingIndex].nameInput} -{" "}
                                      {
                                        currentOrder[deletingIndex]
                                          .studentIdInput
                                      }
                                    </p>
                                  </div>
                                  <OrderItemInfo
                                    order={currentOrder[deletingIndex]}
                                    price={
                                      ticketInfo?.find(
                                        (info) =>
                                          currentOrder[deletingIndex]
                                            ?.ticketType === info.ticketName
                                      )?.price ?? 0
                                    }
                                  />
                                </div>
                              )}
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  className="cursor-pointer"
                                  onClick={() => setIsDeleteDialogOpen(false)}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  variant="destructive"
                                  className="cursor-pointer"
                                  onClick={handleConfirmDelete}
                                >
                                  Xóa đơn hàng
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <OrderInfoAccordionItem
                          price={
                            ticketInfo?.find(
                              (info) => order.ticketType === info.ticketName
                            )?.price ?? 0
                          }
                          index={index}
                          order={order}
                        />
                      </div>
                      <Separator className="my-3" />
                    </Fragment>
                  ))}
                </Accordion>
              )}
            </ScrollArea>
            <p className="font-semibold">
              Thành tiền: {formatVietnameseCurrency(orderSubtotal)}
            </p>
          </div>
          <AlertDialog
            open={isConfirmingOrderAlertDialogOpen}
            onOpenChange={setIsConfirmingOrderAlertDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                className="w-full cursor-pointer"
                disabled={currentOrder.length === 0}
              >
                Chốt deal <WandSparkles />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Lưu thông tin về spreadsheet
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Kiểm tra kỹ lại thông tin order nhé!!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <ScrollArea className="h-[45vh] pr-4" type="always">
                <Accordion type="multiple">
                  {currentOrder.map((order, index) => (
                    <Fragment key={index}>
                      <OrderInfoAccordionItem
                        price={
                          ticketInfo?.find(
                            (info) => order.ticketType === info.ticketName
                          )?.price ?? 0
                        }
                        index={index}
                        order={order}
                      />
                      <div className="my-4"></div>
                    </Fragment>
                  ))}
                </Accordion>
              </ScrollArea>
              <p className="text-center">
                Tôi chắc chắn đã nhận đủ{" "}
                <span className="text-green-700 font-semibold">
                  {" "}
                  {formatVietnameseCurrency(orderSubtotal)}
                </span>{" "}
                trước khi bấm{" "}
                <span className="text-red-500 font-semibold">
                  &quot;Chốt&quot;
                </span>
              </p>
              <DialogFooter>
                <Button
                  className="w-1/2 border cursor-pointer"
                  disabled={isOrderMutating}
                  variant="ghost"
                  onClick={() => {
                    setIsConfirmingOrderAlertDialogOpen(false);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  disabled={isOrderMutating}
                  className="w-1/2 border cursor-pointer"
                  onClick={() => {
                    mutateOrder();
                  }}
                >
                  Chốt
                  {!isOrderMutating && <Zap />}
                  {isOrderMutating && <Loader2 className="animate-spin" />}
                </Button>
              </DialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Dialog>
            <DialogTrigger asChild className="calculator_dialog_trigger hidden">
              <Button className="w-full bg-[#0084ff] hover:bg-[#0084ff] cursor-pointer">
                Tính tiền <Calculator />
              </Button>
            </DialogTrigger>
            <DialogContent className="!py-2">
              <DialogTitle className="sr-only">Tính tiền</DialogTitle>
              <div className="flex-col items-center justify-center w-full flex gap-2 ">
                <ChangeCalculator totalAmount={orderSubtotal} />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isDeleteAllDialogOpen}
            onOpenChange={setIsDeleteAllDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={currentOrder.length === 0}
                className="cursor-pointer w-full"
              >
                Xóa hết order
                <Trash2 size={8} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận xóa hết tất cả</DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn xóa hết order hiện tại này? Hành động
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
                <Button
                  variant="destructive"
                  onClick={() => {
                    setCurrentOrders([]);
                    setIsDeleteAllDialogOpen(false);
                  }}
                >
                  Xóa hết
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-col items-center justify-start gap-2 change_calculator">
          <ChangeCalculator totalAmount={orderSubtotal} />
        </div>
      </div>
    </>
  );
};

export default Form;

const OrderInfoAccordionItem = ({
  order,
  index,
  price,
}: {
  order: StudentInput;
  index: number;
  price: number;
}) => {
  return (
    <AccordionItem
      value={order.nameInput + order.studentIdInput + index}
      className="flex-1 w-full"
    >
      <AccordionTrigger className="!p-0 ml-2 cursor-pointer">
        {index + 1}
        {": "}
        {order.nameInput} - {order.studentIdInput}
      </AccordionTrigger>
      <AccordionContent className="mt-1 flex w-full flex-col gap-4 p-2 text-balance border border-[#0084ff] rounded-md mb-2">
        <OrderItemInfo order={order} price={price} />
      </AccordionContent>
    </AccordionItem>
  );
};

export const OrderItemInfo = ({
  order,
  price,
}: {
  order: StudentInput;
  price: number;
}) => {
  return (
    <>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Lớp:</p>
        <p>{order.homeroomInput}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Email:</p>
        <p className="wrap-anywhere">{order.email}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Hạng vé:</p>
        <p>{order.ticketType}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Giá vé:</p>
        <p>{formatVietnameseCurrency(parseVietnameseCurrency(price))}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Hình thức:</p>
        <p>{order.paymentMedium}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Lưu ý:</p>
        <p>{order.notice || "Không có lưu ý"}</p>
      </div>
    </>
  );
};
