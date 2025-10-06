/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatisticsDialog from "@/components/Sidebar/StatisticsDialog";
import {
  Dialog,
  DialogClose,
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
  VERIFICATION_APPROVED,
} from "@/constants/constants";
import {
  AllSalesInfo,
  AllTicketInfo,
  EventInfo,
  Staff,
  Student,
  StudentInput,
} from "@/constants/types";
import {
  cn,
  extractFirstNumber,
  parseVietnameseCurrency,
  formatVietnameseCurrency,
  sucessToast,
  errorToast,
  safeTrim,
} from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  Calculator,
  Loader2,
  PencilLine,
  ShoppingCart,
  Sparkle,
  Trash2,
  TriangleAlert,
  WandSparkles,
  X,
  Zap,
  Banknote,
  CreditCard,
  Check,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import TeacherVerificationStatus from "@/components/TeacherVerificationStatus";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EnhancedSelect from "@/components/EnhancedSelect";
import { getCache, setCache } from "@/drizzle/idb";
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
import {
  sendOrderAction,
  updateOfflineDataAction,
  updateOnlineDataAction,
} from "@/server/actions";
import SalesSummaryDialog from "@/components/Sidebar/SalesSummaryDialog";
import UpdateDataDialog from "@/components/Sidebar/UpdateDataDialog";
import SalesInfoCard from "@/components/Sidebar/SalesInfoCard";
import TicketColorManager from "@/components/TicketColorManager";
import { DEFAULT_TICKET_COLORS } from "@/constants/constants";
import OnlineTicketManagement from "@/components/Sidebar/OnlineTicketManagement";
import { OrderItemInfo } from "@/components/OrderItemInfo";
import { Switch } from "@/components/ui/switch";
import {
  SidebarInset,
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarGroup,
} from "@/components/ui/sidebar";
import SidebarUser from "@/components/Sidebar/SidebarUser";
import SidebarEventInfo from "@/components/Sidebar/EventInfo";
import { SpreadSheetQuickAccess } from "@/components/Sidebar/SpreadSheetQuickAccess";

const Form = ({
  session,
  staffInfo,
  isOnlineCoordinator,
}: {
  session: any;
  staffInfo: Staff;
  isOnlineCoordinator: boolean;
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedStudentIdInput, setSelectedStudentIdInput] = useState("");
  const [studentNameAutoCompleteValue, setStudentNameAutoCompleteValue] =
    useState("");
  const [homeroomAutoCompleteValue, setHomeroomAutoCompleteValue] =
    useState("");
  const [emailAutoCompleteValue, setEmailAutoCompleteValue] = useState("");
  const [bestMatchStudentId, setBestMatchStudentId] = useState("");
  const [currentOrder, setCurrentOrders] = useState<StudentInput[]>([]);
  const [isOnlineTicketManagementOpen, setIsOnlineTicketManagementOpen] =
    useState<{
      isOpen: boolean;
      buyerId: string;
    }>({
      isOpen: false,
      buyerId: "",
    });
  // State for actual form values (separate from autocomplete preview)
  const [studentNameInput, setStudentNameInput] = useState("");
  const [homeroomInput, setHomeroomInput] = useState("");
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
  const [shouldSendEmail, setShouldSendEmail] = useState(true);
  const [lastValidTicketType, setLastValidTicketType] = useState("");
  const [paymentMedium, setPaymentMedium] = useState<
    "Tiền mặt" | "Chuyển khoản"
  >("Tiền mặt");
  const [
    isConfirmingOrderAlertDialogOpen,
    setIsConfirmingOrderAlertDialogOpen,
  ] = useState(false);
  const [isRefreshDialogOpen, setIsRefreshDialogOpen] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isMoneyVisible, setIsMoneyVisible] = useState(true);
  const [ticketColors, setTicketColors] = useState<Record<string, string>>({});

  // State for validation errors
  const [errors, setErrors] = useState({
    studentId: false,
    studentName: false,
    homeroom: false,
    email: false,
  });

  // Validation useEffect hooks for each input field
  useEffect(() => {
    if (selectedStudentIdInput) {
      if (safeTrim(selectedStudentIdInput)) {
        setErrors((prev) => ({ ...prev, studentId: false }));
      }
    }
  }, [selectedStudentIdInput]);

  useEffect(() => {
    if (studentNameInput) {
      if (safeTrim(studentNameInput)) {
        setErrors((prev) => ({ ...prev, studentName: false }));
      }
    }
  }, [studentNameInput]);

  useEffect(() => {
    if (emailInput) {
      if (safeTrim(emailInput)) {
        setErrors((prev) => ({ ...prev, email: false }));
      }
    }
  }, [emailInput]);

  useEffect(() => {
    setMounted(true);
    // Load money visibility preference from localStorage
    const savedVisibility = localStorage.getItem("moneyVisibility");
    if (savedVisibility !== null) {
      setIsMoneyVisible(JSON.parse(savedVisibility));
    }

    // Load ticket colors from localStorage
    const savedColors = localStorage.getItem("ticketColors");
    if (savedColors) {
      try {
        setTicketColors(JSON.parse(savedColors));
      } catch (error) {
        console.error("Failed to parse saved ticket colors:", error);
      }
    }

    // Load current order list from localStorage
    const savedOrderList = localStorage.getItem("currentOrderList");
    if (savedOrderList) {
      try {
        const parsedOrderList = JSON.parse(savedOrderList) as StudentInput[];
        setCurrentOrders(parsedOrderList);
      } catch (error) {
        console.error("Failed to parse saved order list:", error);
      }
    }

    // Load form data from localStorage
    const savedFormData = localStorage.getItem("currentFormData");
    if (savedFormData) {
      try {
        const parsedFormData = JSON.parse(savedFormData);
        setSelectedStudentIdInput(parsedFormData.selectedStudentIdInput || "");
        setStudentNameInput(parsedFormData.studentNameInput || "");
        setHomeroomInput(parsedFormData.homeroomInput || "");
        setEmailInput(parsedFormData.emailInput || "");
        setNoticeInput(parsedFormData.noticeInput || "");
        setTicketType(parsedFormData.ticketType || "");
        setLastValidTicketType(parsedFormData.lastValidTicketType || "");
        setPaymentMedium(parsedFormData.paymentMedium || "Tiền mặt");
        setShouldSendEmail(parsedFormData.shouldSendEmail || false);
      } catch (error) {
        console.error("Failed to parse saved form data:", error);
      }
    }
  }, []);

  // Fuzzy search function to find the best matching student
  const findBestMatch = (
    input: string,
    students: Student[]
  ): Student | null => {
    if (!input) return null;
    if (!safeTrim(input) || !students.length) return null;

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

  const fetchOfflineEventInfo = async () => {
    const response = await fetch("/api/event-info");
    if (!response.ok) {
      throw new Error("Failed to fetch event information");
    }
    const data = await response.json();
    return data as EventInfo;
  };

  const {
    data: offlineEventInfo,
    isFetching: isOfflineEventInfoFetching,
    isError: isOfflineEventInfoError,
    refetch: refetchOfflineEventInfo,
  } = useQuery({
    queryKey: ["offline_event_info"],
    queryFn: async () => {
      try {
        const cachedData = await getCache<string>("offline_event_info");
        if (cachedData) {
          return JSON.parse(cachedData) as EventInfo;
        } else {
          const freshData = await fetchOfflineEventInfo();
          await setCache("offline_event_info", JSON.stringify(freshData));
          return freshData;
        }
      } catch (error) {
        if (error == "Failed to fetch event information") {
          throw new Error("Failed to fetch  event information");
        }
        return fetchOfflineEventInfo();
      }
    },
    enabled: mounted,
  });

  const fetchStudentList = async () => {
    const response = await fetch("/api/studentList");
    if (!response.ok) {
      throw new Error("Failed to fetch student list");
    }
    const data = await response.json();
    return data as Student[];
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
    return data as AllTicketInfo;
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
          return JSON.parse(cachedData) as AllTicketInfo;
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
  }, [homeroomInput, ticketInfo?.offline]);

  const toggleMoneyVisibility = () => {
    const newVisibility = !isMoneyVisible;
    setIsMoneyVisible(newVisibility);
    localStorage.setItem("moneyVisibility", JSON.stringify(newVisibility));
  };

  const handleTicketColorChange = (ticketType: string, color: string) => {
    const newColors = { ...ticketColors, [ticketType]: color };
    setTicketColors(newColors);
    localStorage.setItem("ticketColors", JSON.stringify(newColors));
  };

  const handleResetTicketColors = () => {
    setTicketColors({});
    localStorage.removeItem("ticketColors");
  };

  // Save current order list to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("currentOrderList", JSON.stringify(currentOrder));
    }
  }, [currentOrder, mounted]);

  // Save form data to localStorage whenever any form field changes
  useEffect(() => {
    if (mounted) {
      const formData = {
        selectedStudentIdInput,
        studentNameInput,
        homeroomInput,
        emailInput,
        noticeInput,
        ticketType,
        lastValidTicketType,
        paymentMedium,
        shouldSendEmail,
      };
      localStorage.setItem("currentFormData", JSON.stringify(formData));
    }
  }, [
    mounted,
    selectedStudentIdInput,
    studentNameInput,
    homeroomInput,
    emailInput,
    noticeInput,
    ticketType,
    lastValidTicketType,
    paymentMedium,
    shouldSendEmail,
  ]);

  // Update autocomplete when studentList becomes available or when student ID changes

  const updateAutocompleteValues = useCallback(
    (value: string, students: Student[]) => {
      if (!safeTrim(value)) {
        setStudentNameAutoCompleteValue("");
        setHomeroomAutoCompleteValue("");
        setEmailAutoCompleteValue("");
        setBestMatchStudentId("");
        return;
      }

      const bestMatch = findBestMatch(safeTrim(value), students);
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
    []
  );

  useEffect(() => {
    if (studentList && mounted) {
      updateAutocompleteValues(selectedStudentIdInput, studentList);
    }
  }, [studentList, selectedStudentIdInput, mounted, updateAutocompleteValues]);

  const getTicketColor = (ticketType: string) => {
    // If user has set a custom color, use it
    if (ticketColors[ticketType]) {
      return ticketColors[ticketType];
    }
    // Get all unique ticket types from ticketInfo to ensure consistency
    const uniqueTicketTypes = ticketInfo
      ? Array.from(
          new Set(ticketInfo.offline.map((ticket) => ticket.ticketName))
        ).sort()
      : [];

    const ticketIndex = uniqueTicketTypes.indexOf(ticketType);
    return DEFAULT_TICKET_COLORS[
      ticketIndex >= 0 ? ticketIndex % DEFAULT_TICKET_COLORS.length : 0
    ];
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

    // Clear saved form data from localStorage
    localStorage.removeItem("currentFormData");
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
      // The autocomplete will be updated by the useEffect when selectedStudentIdInput changes
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
        ticketInfo.offline
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
          ticketInfo.offline.find(
            (info) => order.ticketType === info.ticketName
          )?.price ?? 0;
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
      const result = await sendOrderAction({
        orders: currentOrder,
        shouldSendEmail,
      });
      if (!result.success) {
        throw new Error(result.message);
      }
      return true;
    },
    onSuccess: () => {
      clearForm({ clearNotice: true });
      setCurrentOrders([]);
      localStorage.removeItem("currentOrderList"); // Clear saved order list after successful submission
      localStorage.removeItem("currentFormData"); // Clear saved form data after successful submission
      sucessToast({ message: "Chốt deal thành công!" });
      setIsConfirmingOrderAlertDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["sales_info"] });
    },
    onError: (error: Error) => {
      errorToast({
        message: `Chốt deal thất bại, vui lòng thử lại! ${error.message}`,
      });
    },
  });

  const { mutate: mutateRefetchSales, isPending: isRefetchingSales } =
    useMutation({
      mutationKey: ["refetch_sales"],
      mutationFn: async () => {
        const result = await refetchSalesInfo();
        if (result.isError) {
          throw new Error(result.error.message);
        }
        return true;
      },
      onSuccess: () => {
        sucessToast({ message: "Cập nhật dữ liệu bán vé thành công!" });
      },
      onError: () => {
        errorToast({ message: "Cập nhật dữ liệu bán vé thất bại!" });
      },
    });

  const { mutate: refetchAllDataMutation } = useMutation({
    mutationKey: ["refetch_all_data"],
    mutationFn: async () => {
      const [
        studentListResult,
        offlineEventInfoResult,
        ticketInfoResult,
        offlineDataResult,
      ] = await Promise.all([
        refetchStudentList(),
        refetchOfflineEventInfo(),
        refetchTicketInfo(),
        updateOfflineDataAction(),
      ]);

      // Check if any of the refetch operations failed
      if (
        studentListResult.isError ||
        offlineEventInfoResult.isError ||
        ticketInfoResult.isError ||
        !offlineDataResult.success
      ) {
        throw new Error(`Failed to refetch`);
      }
    },
    onSuccess: () => {
      sucessToast({ message: "Làm mới dữ liệu thành công!" });
    },
    onError: () => {
      errorToast({ message: "Làm mới dữ liệu thất bại, vui lòng thử lại!" });
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
      return data as AllSalesInfo;
    },
    enabled: mounted,
  });

  const totalSalesAmount = useMemo(() => {
    if (
      salesInfo &&
      salesInfo.offline.length + salesInfo.online.length > 0 &&
      ticketInfo &&
      ticketInfo.offline.length > 0 &&
      ticketInfo.online.length > 0
    ) {
      let total = 0;
      salesInfo.offline.forEach((sale) => {
        const ticketPrice =
          ticketInfo.offline.find(
            (info) => sale.buyerTicketType === info.ticketName
          )?.price ?? 0;
        const numericPrice = parseVietnameseCurrency(ticketPrice);
        total += numericPrice;
      });
      salesInfo.online.forEach((sale) => {
        const ticketPrice =
          ticketInfo.online.find(
            (info) =>
              sale.buyerTicketType === info.ticketName &&
              sale.verificationStatus === VERIFICATION_APPROVED
          )?.price ?? 0;
        const numericPrice = parseVietnameseCurrency(ticketPrice);
        total += numericPrice;
      });
      return total;
    }
    return 0;
  }, [salesInfo, ticketInfo]);

  const currentStaffStats = useMemo(() => {
    if (
      salesInfo &&
      salesInfo.offline &&
      salesInfo.offline.length > 0 &&
      ticketInfo &&
      staffInfo
    ) {
      let staffRevenue = 0;
      let staffOrderCount = 0;

      salesInfo.offline.forEach((sale) => {
        if (sale.staffName === staffInfo.name) {
          staffOrderCount++;
          const ticketPrice =
            ticketInfo.offline.find(
              (info) => sale.buyerTicketType === info.ticketName
            )?.price ?? 0;
          const numericPrice = parseVietnameseCurrency(ticketPrice);
          staffRevenue += numericPrice;
        }
      });

      return { revenue: staffRevenue, orderCount: staffOrderCount };
    }
    return { revenue: 0, orderCount: 0 };
  }, [salesInfo, ticketInfo, staffInfo]);

  // Prevent accidental page refresh/close when there's unsaved data
  useEffect(() => {
    const hasUnsavedData =
      safeTrim(selectedStudentIdInput) ||
      safeTrim(studentNameInput) ||
      safeTrim(homeroomInput) ||
      safeTrim(emailInput) ||
      safeTrim(noticeInput) ||
      currentOrder.length > 0 ||
      isOrderMutating;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedData) {
        e.preventDefault();
      }
    };

    if (hasUnsavedData) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    selectedStudentIdInput,
    studentNameInput,
    homeroomInput,
    emailInput,
    noticeInput,
    currentOrder.length,
    isOrderMutating,
  ]);

  const { mutate: mutateUpdateOnlineData, isPending: isOnlineDataUpdating } =
    useMutation({
      mutationKey: ["update_online_data"],
      mutationFn: async () => {
        const result = await updateOnlineDataAction();
        if (!result.success) {
          throw new Error(result.message);
        }
        return true;
      },
      onSuccess: () => {
        sucessToast({ message: "Cập nhật form bán vé online thành công!" });
      },
      onError: (error: Error) => {
        errorToast({
          message: `Cập nhật form bán vé online thất bại, vui lòng thử lại! ${error.message}`,
        });
      },
    });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "289.6px",
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="icon" className="bg-sidebar-primary">
        <SidebarHeader>
          <SidebarEventInfo
            offlineEventInfo={offlineEventInfo}
            isOfflineEventInfoError={isOfflineEventInfoError}
            isOfflineEventInfoFetching={isOfflineEventInfoFetching}
            refetchOfflineEventInfo={refetchOfflineEventInfo}
          />
          <SidebarSeparator className="mx-0" />
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupLabel>Tổng quát</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SalesInfoCard
                  isSalesInfoFetching={isSalesInfoFetching}
                  isSalesInfoError={isSalesInfoError}
                  isMoneyVisible={isMoneyVisible}
                  totalSalesAmount={totalSalesAmount}
                  currentStaffStats={currentStaffStats}
                  onToggleMoneyVisibility={toggleMoneyVisibility}
                  onRefetchSales={refetchSalesInfo}
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SalesInfoCard
                  isSalesInfoFetching={isSalesInfoFetching}
                  isSalesInfoError={isSalesInfoError}
                  isMoneyVisible={isMoneyVisible}
                  totalSalesAmount={totalSalesAmount}
                  currentStaffStats={currentStaffStats}
                  onToggleMoneyVisibility={toggleMoneyVisibility}
                  onRefetchSales={refetchSalesInfo}
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SalesInfoCard
                  isSalesInfoFetching={isSalesInfoFetching}
                  isSalesInfoError={isSalesInfoError}
                  isMoneyVisible={isMoneyVisible}
                  totalSalesAmount={totalSalesAmount}
                  currentStaffStats={currentStaffStats}
                  onToggleMoneyVisibility={toggleMoneyVisibility}
                  onRefetchSales={refetchSalesInfo}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Tiện ích</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SpreadSheetQuickAccess />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <UpdateDataDialog
                  isOpen={isRefreshDialogOpen}
                  onOpenChange={setIsRefreshDialogOpen}
                  isStudentListFetching={isStudentListFetching}
                  isTicketInfoFetching={isTicketInfoFetching}
                  isOnlineDataUpdating={isOnlineDataUpdating}
                  onRefreshOfflineData={() => {
                    localStorage.removeItem("currentOrderList"); // Clear saved order list on data refresh
                    localStorage.removeItem("currentFormData"); // Clear saved form data on data refresh
                    clearForm({ clearNotice: true });
                    setCurrentOrders([]);
                    refetchAllDataMutation();
                  }}
                  onRefreshOnlineData={mutateUpdateOnlineData}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Dữ liệu bán vé</SidebarGroupLabel>
            <div className="flex flex-col gap-2 w-full">
              <SidebarMenuItem>
                <StatisticsDialog
                  salesInfo={salesInfo}
                  isSalesInfoError={isSalesInfoError}
                  isSalesInfoFetching={isSalesInfoFetching}
                  onRefetchSales={mutateRefetchSales}
                  isRefetchingSales={isRefetchingSales}
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SalesSummaryDialog
                  isOpen={isSummaryDialogOpen}
                  onOpenChange={setIsSummaryDialogOpen}
                  salesInfo={salesInfo}
                  ticketInfo={ticketInfo}
                  staffInfo={staffInfo}
                  isSalesInfoError={isSalesInfoError}
                  isRefetchingSales={isRefetchingSales}
                  isSalesInfoFetching={isSalesInfoFetching}
                  onRefetchSales={mutateRefetchSales}
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <OnlineTicketManagement
                  salesInfo={salesInfo?.online}
                  isSalesInfoError={isSalesInfoError}
                  onlineTicketInfo={ticketInfo?.online}
                  isOnlineCoordinator={isOnlineCoordinator}
                  isRefetchingSales={isRefetchingSales}
                  isSalesInfoFetching={isSalesInfoFetching}
                  onRefetchSales={mutateRefetchSales}
                  isOnlineTicketManagementOpen={isOnlineTicketManagementOpen}
                  setIsOnlineTicketManagementOpen={
                    setIsOnlineTicketManagementOpen
                  }
                />
              </SidebarMenuItem>
            </div>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarUser
            user={{
              name: session.user.name,
              email: session.user.email,
              avatar: session.user.image,
            }}
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="flex flex-row items-start justify-center gap-5 p-4 flex-wrap w-full">
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
            <div className="flex flex-row items-center justify-between gap-2">
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
              <div className="w-full flex flex-col items-start gap-3 ">
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
                      : [INVALID_TICKET_DUE_TO_INVALID_CLASS]
                  }
                />
              </div>
            </div>

            <div className="flex flex-col w-full items-center gap-3 justify-center">
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
          <div className="flex items-start h-max justify-between  w-full">
            <h2 className="font-semibold">Thông tin order</h2>
            {ticketInfo && (
              <TicketColorManager
                ticketInfo={ticketInfo.offline}
                ticketColors={ticketColors}
                onColorChange={handleTicketColorChange}
                onResetColors={handleResetTicketColors}
              />
            )}
          </div>
          <div className="flex flex-col gap-2 -mt-2 w-full border rounded-md shadow-sm p-4">
            <ScrollArea
              className="h-[50vh] !max-h-[460px] !min-h-[460px] pr-4"
              type="always"
            >
              {currentOrder.length === 0 && (
                <h3 className="text-center">Hiện tại chưa có đơn nào!</h3>
              )}
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
                                      ticketInfo?.offline.find(
                                        (info) =>
                                          currentOrder[editingIndex!]
                                            ?.ticketType === info.ticketName
                                      )?.price ?? ""
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
                                      ticketInfo?.offline.find(
                                        (info) =>
                                          currentOrder[deletingIndex]
                                            ?.ticketType === info.ticketName
                                      )?.price ?? ""
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
                            ticketInfo?.offline.find(
                              (info) => order.ticketType === info.ticketName
                            )?.price ?? ""
                          }
                          index={index}
                          order={order}
                          ticketColor={getTicketColor(order.ticketType)}
                        />
                      </div>
                      <Separator className="my-3" />
                    </Fragment>
                  ))}
                </Accordion>
              )}
            </ScrollArea>
            <div className="flex flex-row items-center justify-between w-full">
              <p className="font-semibold">
                Thành tiền: {formatVietnameseCurrency(orderSubtotal)}
              </p>
              <TeacherVerificationStatus
                currentOrder={currentOrder}
                setCurrentOrders={setCurrentOrders}
                ticketInfo={ticketInfo}
              />
            </div>
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
                  Lưu thông tin về spreadsheet & gửi email xác nhận
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Kiểm tra kỹ lại thông tin order nhé!! 1 khi bấm chốt, thông
                  tin sẽ được lưu về spreadsheet và khách hàng sẽ nhận được
                  email xác nhận.
                </AlertDialogDescription>
                <div className="flex flex-row items-center gap-2">
                  <Label htmlFor="send-email">Gửi email xác nhận</Label>
                  <Switch
                    className="data-[state=checked]:border-[#0084ff] data-[state=checked]:bg-[#0084ff] data-[state=checked]:text-white dark:data-[state=checked]:border-[#0084ff] dark:data-[state=checked]:bg-[#0084ff] cursor-pointer"
                    id="send-email"
                    checked={shouldSendEmail}
                    onCheckedChange={(checked) =>
                      setShouldSendEmail(checked === true)
                    }
                  />
                </div>
              </AlertDialogHeader>
              <ScrollArea className="h-[45vh] pr-4" type="always">
                <Accordion type="multiple">
                  {currentOrder.map((order, index) => (
                    <Fragment key={index}>
                      <OrderInfoAccordionItem
                        price={
                          ticketInfo?.offline.find(
                            (info) => order.ticketType === info.ticketName
                          )?.price ?? ""
                        }
                        index={index}
                        order={order}
                        ticketColor={getTicketColor(order.ticketType)}
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
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 ">
                <Button
                  className="w-full md:order-0 order-1 md:w-1/2 border cursor-pointer"
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
                  className="w-full md:order-1 order-0 md:w-1/2 border cursor-pointer"
                  onClick={() => {
                    mutateOrder();
                  }}
                >
                  Chốt
                  {!isOrderMutating && <Zap />}
                  {isOrderMutating && <Loader2 className="animate-spin" />}
                </Button>
              </div>
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
              <DialogFooter className="w-full">
                <DialogClose asChild>
                  <Button variant="outline" className="w-full">
                    Đóng
                  </Button>
                </DialogClose>
              </DialogFooter>
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
                    localStorage.removeItem("currentOrderList"); // Clear saved order list when deleting all
                    localStorage.removeItem("currentFormData"); // Clear saved form data when deleting all
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
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Form;

const OrderInfoAccordionItem = ({
  order,
  index,
  price,
  ticketColor,
}: {
  order: StudentInput;
  index: number;
  price: string;
  ticketColor?: string;
}) => {
  return (
    <AccordionItem
      value={order.nameInput + order.studentIdInput + index}
      className="flex-1 w-full"
    >
      <AccordionTrigger className="!p-0 ml-2 mb-2 cursor-pointer flex items-center gap-2">
        <div className="flex items-center gap-2">
          {ticketColor && (
            <div
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: ticketColor }}
              title={`Màu cho ${order.ticketType}`}
            />
          )}
          <span>
            {index + 1}
            {": "}
            {order.nameInput} - {order.studentIdInput}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <div
          className="flex w-full flex-col gap-4 p-2 text-balance border rounded-sm overflow-hidden"
          style={{
            borderColor: ticketColor || "#0084ff",
            backgroundColor: ticketColor ? `${ticketColor}08` : undefined,
          }}
        >
          <OrderItemInfo order={order} price={price} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
