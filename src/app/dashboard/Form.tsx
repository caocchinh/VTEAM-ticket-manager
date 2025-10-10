/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import StatisticsDialog from "@/components/Sidebar/StatisticsDialog";
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
  sucessToast,
  errorToast,
  safeTrim,
} from "@/lib/utils";
import { useIsMutating, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getCache, setCache } from "@/drizzle/idb";
import {
  updateOfflineDataAction,
  updateOnlineDataAction,
} from "@/server/actions";
import SalesSummaryDialog from "@/components/Sidebar/SalesSummaryDialog";
import UpdateDataDialog from "@/components/Sidebar/UpdateDataDialog";
import SalesInfoCard from "@/components/Sidebar/SalesInfoCard";
import { DEFAULT_TICKET_COLORS } from "@/constants/constants";
import OnlineTicketManagement from "@/components/Sidebar/OnlineTicketManagement";
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
import OrderInfo from "@/components/OrderInfo";
import CalculatorWrapper from "@/components/CalculatorWrapper";

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
  const [isRefreshDialogOpen, setIsRefreshDialogOpen] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [ticketColors, setTicketColors] = useState<Record<string, string>>({});
  const [isSideBarTranisitioning, setIsSidebarTransitioning] = useState(false);
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

  const isAnyOngoingRequestPending =
    useIsMutating({
      mutationKey: ["submit_order", "update_online"],
    }) > 0;

  // Prevent accidental page refresh/close when there's unsaved data or submitting critical data
  useEffect(() => {
    const hasUnsavedData =
      safeTrim(selectedStudentIdInput) ||
      safeTrim(studentNameInput) ||
      safeTrim(homeroomInput) ||
      safeTrim(emailInput) ||
      safeTrim(noticeInput) ||
      currentOrder.length > 0 ||
      isAnyOngoingRequestPending;

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
    isAnyOngoingRequestPending,
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
      <Sidebar
        collapsible="icon"
        className="bg-sidebar-primary"
        onTransitionEnd={() => {
          setTimeout(() => {
            setIsSidebarTransitioning(false);
          }, 0);
        }}
        sideBarOpenCallback={() => {
          setIsSidebarTransitioning(true);
        }}
      >
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
        <OrderInfo
          ticketColors={ticketColors}
          currentOrder={currentOrder}
          ticketInfo={ticketInfo}
          orderSubtotal={orderSubtotal}
          shouldSendEmail={shouldSendEmail}
          clearForm={clearForm}
          setTicketColors={setTicketColors}
          setCurrentOrders={setCurrentOrders}
          setNoticeInput={setNoticeInput}
          setTicketType={setTicketType}
          setPaymentMedium={setPaymentMedium}
          setStudentNameInput={setStudentNameInput}
          setHomeroomInput={setHomeroomInput}
          setShouldSendEmail={setShouldSendEmail}
          getTicketColor={getTicketColor}
          setEmailInput={setEmailInput}
          setSelectedStudentIdInput={setSelectedStudentIdInput}
        />

        <CalculatorWrapper
          orderSubtotal={orderSubtotal}
          isSideBarTranisitioning={isSideBarTranisitioning}
        />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Form;
