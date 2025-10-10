/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { Button } from "@/components/ui/button";
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
import { VERIFICATION_APPROVED } from "@/constants/constants";
import {
  AllSalesInfo,
  AllTicketInfo,
  EventInfo,
  Staff,
  Student,
  StudentInput,
} from "@/constants/types";
import {
  parseVietnameseCurrency,
  formatVietnameseCurrency,
  sucessToast,
  errorToast,
  safeTrim,
} from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Calculator,
  Loader2,
  PencilLine,
  Trash2,
  WandSparkles,
  Zap,
} from "lucide-react";
import TeacherVerificationStatus from "@/components/TeacherVerificationStatus";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import RefreshSales from "@/components/Sidebar/RefreshSales";
import StaffInfo from "@/components/Sidebar/StaffInfo";
import SidebarToggle from "@/components/Sidebar/SidebarToggle";
import InlineSidebarTrigger from "@/components/Sidebar/InlineSidebarTrigger";
import InputForm from "@/components/InputForm";

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
  const [currentOrder, setCurrentOrders] = useState<StudentInput[]>([]);
  const [isOnlineTicketManagementOpen, setIsOnlineTicketManagementOpen] =
    useState<{
      isOpen: boolean;
      buyerId: string;
    }>({
      isOpen: false,
      buyerId: "",
    });
  const [studentNameInput, setStudentNameInput] = useState("");
  const [homeroomInput, setHomeroomInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
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
  const [studentNameAutoCompleteValue, setStudentNameAutoCompleteValue] =
    useState("");
  const [homeroomAutoCompleteValue, setHomeroomAutoCompleteValue] =
    useState("");
  const [emailAutoCompleteValue, setEmailAutoCompleteValue] = useState("");
  const [bestMatchStudentId, setBestMatchStudentId] = useState("");

  const [
    isConfirmingOrderAlertDialogOpen,
    setIsConfirmingOrderAlertDialogOpen,
  ] = useState(false);
  const [isRefreshDialogOpen, setIsRefreshDialogOpen] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [ticketColors, setTicketColors] = useState<Record<string, string>>({});
  // State for validation errors
  const [errors, setErrors] = useState({
    studentId: false,
    studentName: false,
    homeroom: false,
    email: false,
  });

  useEffect(() => {
    setMounted(true);

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
    setStudentNameAutoCompleteValue("");
    setHomeroomAutoCompleteValue("");
    setEmailAutoCompleteValue("");
    setBestMatchStudentId("");

    // Clear saved form data from localStorage
    localStorage.removeItem("currentFormData");
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
    isPending: isSalesInfoPending,
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

  const offlineRevenue = useMemo(() => {
    if (
      salesInfo &&
      salesInfo.offline.length > 0 &&
      ticketInfo &&
      ticketInfo.offline.length > 0
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
      return total;
    }
    return 0;
  }, [salesInfo, ticketInfo]);

  const onlineRevenue = useMemo(() => {
    if (
      salesInfo &&
      salesInfo.online.length > 0 &&
      ticketInfo &&
      ticketInfo.online.length > 0
    ) {
      let total = 0;
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

  const totalRevenue = useMemo(() => {
    return offlineRevenue + onlineRevenue;
  }, [offlineRevenue, onlineRevenue]);

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
          "--sidebar-width": "300px",
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
                  isSalesInfoFetching={isSalesInfoPending}
                  totalRevenue={totalRevenue}
                  offlineRevenue={offlineRevenue}
                  onlineRevenue={onlineRevenue}
                  totalOfflineOrders={salesInfo?.offline?.length ?? 0}
                  totalOnlineOrders={
                    salesInfo?.online?.filter(
                      (sale) =>
                        sale.verificationStatus === VERIFICATION_APPROVED
                    ).length ?? 0
                  }
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <StaffInfo
                  isSalesInfoFetching={isSalesInfoPending}
                  staffInfo={currentStaffStats}
                  totalRevenue={totalRevenue}
                  totalRevenueOffline={offlineRevenue}
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
                <RefreshSales
                  isSalesInfoFetching={isSalesInfoFetching || isRefetchingSales}
                  isSalesInfoError={isSalesInfoError}
                  onRefetchSales={mutateRefetchSales}
                />
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
                  isRefetchingSales={isRefetchingSales || isRefetchingSales}
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
          <SidebarToggle />
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

      <SidebarInset className="flex relative flex-row items-start justify-center gap-5 p-4 flex-wrap w-full">
        <InlineSidebarTrigger className="absolute top-1 left-1 w-[35px] cursor-pointer" />
        <InputForm
          selectedStudentIdInput={selectedStudentIdInput}
          emailInput={emailInput}
          isStudentListFetching={isStudentListFetching}
          homeroomInput={homeroomInput}
          isTicketInfoError={isTicketInfoError}
          clearForm={clearForm}
          currentOrder={currentOrder}
          isTicketInfoFetching={isTicketInfoFetching}
          setCurrentOrders={setCurrentOrders}
          mounted={mounted}
          getTicketColor={getTicketColor}
          ticketType={ticketType}
          noticeInput={noticeInput}
          setNoticeInput={setNoticeInput}
          setTicketType={setTicketType}
          studentList={studentList}
          lastValidTicketType={lastValidTicketType}
          paymentMedium={paymentMedium}
          setPaymentMedium={setPaymentMedium}
          setLastValidTicketType={setLastValidTicketType}
          ticketInfo={ticketInfo}
          isStudentListError={isStudentListError}
          errors={errors}
          setErrors={setErrors}
          studentNameInput={studentNameInput}
          setStudentNameInput={setStudentNameInput}
          setHomeroomInput={setHomeroomInput}
          setEmailInput={setEmailInput}
          setSelectedStudentIdInput={setSelectedStudentIdInput}
          setEmailAutoCompleteValue={setEmailAutoCompleteValue}
          setBestMatchStudentId={setBestMatchStudentId}
          setHomeroomAutoCompleteValue={setHomeroomAutoCompleteValue}
          setStudentNameAutoCompleteValue={setStudentNameAutoCompleteValue}
          studentNameAutoCompleteValue={studentNameAutoCompleteValue}
          homeroomAutoCompleteValue={homeroomAutoCompleteValue}
          bestMatchStudentId={bestMatchStudentId}
          emailAutoCompleteValue={emailAutoCompleteValue}
        />
        <div className="flex flex-col items-center justify-center gap-2 w-[90%] sm:w-[35%] ">
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
            <ScrollArea className="h-[403px] pr-4" type="always">
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

        <ChangeCalculator totalAmount={orderSubtotal} />
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
