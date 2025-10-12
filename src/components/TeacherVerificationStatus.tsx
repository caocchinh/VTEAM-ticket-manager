"use client";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { Dialog, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import {
  List,
  RefreshCw,
  AlertCircle,
  Trash2,
  PencilLine,
  X,
} from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  StudentInput,
  TeacherVerificationInfo,
  AllTicketInfo,
} from "@/constants/types";
import { useTeacherVerification } from "@/hooks/useTeacherVerification";
import Loader from "./Loader/Loader";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { OrderItemInfo } from "./OrderItemInfo";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "./ui/sidebar";
import { TeacherVerificationStatus as TeacherVerificationStatusType } from "@/constants/types";

// Helper function to get verification status styling and text
const getVerificationStatus = (
  acceptStatus: TeacherVerificationStatusType,
  rejectStatus: TeacherVerificationStatusType
) => {
  if (acceptStatus === "TRUE") {
    return {
      className: "bg-green-100 text-green-800",
      text: "Được tham gia",
      fullClassName: "bg-green-100 text-green-800 border border-green-200",
      fullText: "✓ Được tham gia",
    };
  }
  if (rejectStatus === "TRUE") {
    return {
      className: "bg-red-100 text-red-800",
      text: "Không được tham gia",
      fullClassName: "bg-red-100 text-red-800 border border-red-200",
      fullText: "✗ Không được tham gia",
    };
  }
  return {
    className: "bg-orange-100 text-orange-800",
    text: "Chưa xác nhận",
    fullClassName: "bg-orange-100 text-orange-800 border border-orange-200",
    fullText: "⏳ Chưa xác nhận",
  };
};

const TeacherVerificationStatus = ({
  currentOrder,
  setCurrentOrders,
  ticketInfo,
}: {
  currentOrder: StudentInput[];
  setCurrentOrders: Dispatch<SetStateAction<StudentInput[]>>;
  ticketInfo?: AllTicketInfo; // We'll need this to get ticket prices for the delete dialog
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentOrderRef = useRef<StudentInput[]>([]);

  // Track if currentOrder has changed since last fetch
  const [orderChanged, setOrderChanged] = useState(false);

  // State for delete functionality
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  // State for edit functionality
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingNotice, setEditingNotice] = useState("");

  // Update orderChanged state when currentOrder changes
  useEffect(() => {
    const currentOrderString = JSON.stringify(currentOrder);
    const previousOrderString = JSON.stringify(currentOrderRef.current);

    if (currentOrderString !== previousOrderString && !isOpen) {
      setOrderChanged(true);
    }
  }, [currentOrder, isOpen]);

  useEffect(() => {
    currentOrderRef.current = currentOrder;
  }, [currentOrder]);

  // Enable query only when dialog opens and either first time or order changed

  const {
    data: teacherVerificationData,
    isFetching,
    isError,
    error,
    refetch,
    isRefetching,
  } = useTeacherVerification({ enabled: true });

  // Handle dialog open
  const handleDialogOpen = (open: boolean) => {
    setIsOpen(open);
    const currentOrderString = JSON.stringify(currentOrder);
    const previousOrderString = JSON.stringify(currentOrderRef.current);
    if (open && orderChanged) {
      setOrderChanged(false);
      refetch();
    } else if (!open && currentOrderString !== previousOrderString) {
      setOrderChanged(false);
    }
  };

  // Handle delete click
  const handleDeleteClick = (index: number) => {
    setDeletingIndex(index);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (deletingIndex !== null) {
      setCurrentOrders((prev) => prev.filter((_, i) => i !== deletingIndex));
    }
    setIsDeleteDialogOpen(false);
    setDeletingIndex(null);
    if (currentOrder.length === 1) {
      setIsOpen(false);
    }
  };

  // Handle edit click
  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setEditingNotice(currentOrder[index]?.notice || "");
    setIsEditDialogOpen(true);
  };

  // Handle confirm edit
  const handleConfirmEdit = () => {
    if (editingIndex !== null) {
      setCurrentOrders((prev) =>
        prev.map((order, i) =>
          i === editingIndex ? { ...order, notice: editingNotice } : order
        )
      );
    }
    setIsEditDialogOpen(false);
    setEditingIndex(null);
    setEditingNotice("");
  };
  const isMobile = useIsMobile({ breakpoint: 1216 });
  const { open: isSidebarOpen } = useSidebar();

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            isSidebarOpen && !isMobile ? "flex-1" : null,
            isMobile && "flex-1",
            "cursor-pointer"
          )}
          disabled={currentOrder.length === 0}
        >
          GVCN xác nhận
          <List />
        </Button>
      </DialogTrigger>
      <DialogContent className=" max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Trạng thái xác nhận GVCN</span>
            {isOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="ml-2 cursor-pointer"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Chỉ hiển thị học sinh ở trong trường
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[47dvh] w-full [&_.bg-border]:bg-logo-main/25 !pr-4">
          {teacherVerificationData && teacherVerificationData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không có dữ liệu xác nhận GVCN
            </div>
          )}
          {isFetching && !teacherVerificationData && (
            <div className="flex items-center justify-center py-8">
              <Loader loadingText="Đang tải dữ liệu..." />
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>
                Lỗi khi tải dữ liệu:{" "}
                {(error as Error)?.message || "Không xác định"}
              </span>
            </div>
          )}
          {teacherVerificationData && !isError && (
            <div className="flex flex-col w-full gap-4">
              {teacherVerificationData
                .filter((student) =>
                  currentOrder.some(
                    (order) => order.studentIdInput === student.studentId
                  )
                )
                .map((student: TeacherVerificationInfo, index: number) => (
                  <div
                    key={`${student.studentId}-${index}`}
                    className="border rounded-lg p-4 flex flex-col gap-4 w-full"
                  >
                    <div className="flex justify-between items-center gap-5 flex-wrap">
                      <div className="flex justify-start items-center gap-2">
                        <p>{index + 1}.</p>
                        <div className="font-medium">{student.name}</div>
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            getVerificationStatus(
                              student.acceptStatus,
                              student.rejectStatus
                            ).className
                          )}
                        >
                          {
                            getVerificationStatus(
                              student.acceptStatus,
                              student.rejectStatus
                            ).text
                          }
                        </span>
                      </div>
                      <OrderItemActions
                        orderIndex={currentOrder.findIndex(
                          (order) => order.studentIdInput === student.studentId
                        )}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteClick}
                      />
                    </div>

                    <div className="text-sm text-black wrap-anywhere">
                      <span className="font-semibold">Mã số HS:</span>{" "}
                      {student.studentId}
                    </div>
                    <div className="text-sm text-black wrap-anywhere">
                      <span className="font-semibold">Lớp:</span>{" "}
                      {student.homeroom}
                    </div>
                    <div className="text-sm text-black">
                      <span className="font-semibold">Lưu ý của bạn:</span>{" "}
                      <span className="whitespace-pre-wrap wrap-anywhere">
                        {currentOrder.find(
                          (order) => order.studentIdInput === student.studentId
                        )?.notice || "Không có lưu ý"}
                      </span>
                    </div>
                    <div className="text-sm text-black">
                      <span className="font-semibold">Ghi chú của GVCN:</span>{" "}
                      <span className="whitespace-pre-wrap wrap-anywhere">
                        {student.teacherNotice || "Không có ghi chú"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {deletingIndex !== null && currentOrder[deletingIndex] && (
            <div className="p-2 border border-red-600 rounded-md">
              <div className="flex flex-row gap-2">
                <p className="font-semibold">Tên & Mã số HS:</p>
                <p className="wrap-anywhere">
                  {currentOrder[deletingIndex].nameInput} -{" "}
                  {currentOrder[deletingIndex].studentIdInput}
                </p>
              </div>
              <OrderItemInfo
                order={currentOrder[deletingIndex]}
                price={
                  ticketInfo?.offline?.find(
                    (info) =>
                      currentOrder[deletingIndex]?.ticketType ===
                      info.ticketName
                  )?.price ?? ""
                }
                includeConcert={
                  ticketInfo?.offline?.find(
                    (info) =>
                      currentOrder[deletingIndex]?.ticketType ===
                      info.ticketName
                  )?.includeConcert ?? false
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <PencilLine className="w-3 h-3 text-blue-600" />
              </div>
              Chỉnh sửa lưu ý của bạn
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin lưu ý cho đơn hàng này. Thay đổi sẽ được lưu
              ngay lập tức.
            </DialogDescription>
          </DialogHeader>
          {editingIndex !== null && currentOrder[editingIndex] && (
            <div className="space-y-4">
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="font-semibold text-blue-900">
                    Thông tin học sinh:
                  </p>
                </div>
                <div className="mt-2 pl-4">
                  <div className="flex flex-row gap-2">
                    <p className="font-medium text-gray-700">Tên & Mã số HS:</p>
                    <p className="text-gray-900">
                      {currentOrder[editingIndex].nameInput} -{" "}
                      {currentOrder[editingIndex].studentIdInput}
                    </p>
                  </div>
                  {teacherVerificationData && editingIndex !== null && (
                    <StudentVerificationInfo
                      studentId={currentOrder[editingIndex].studentIdInput}
                      teacherVerificationData={teacherVerificationData}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <label
                    htmlFor="notice-edit"
                    className="font-medium text-gray-700"
                  >
                    Lưu ý:
                  </label>
                </div>
                <div className="w-full relative">
                  <Textarea
                    id="notice-edit"
                    value={editingNotice}
                    onChange={(e) => setEditingNotice(e.target.value)}
                    placeholder="Nhập lưu ý (nếu có)..."
                    className="min-h-[100px] resize-none  text-gray-900 w-full p-2 border border-gray-300  h-24 overflow-y-auto overflow-x-hidden"
                  />
                  <X
                    className="absolute right-1 top-4 cursor-pointer -translate-y-1/2 text-red-400"
                    size={17}
                    onClick={() => {
                      setEditingNotice("");
                    }}
                  />
                </div>
                {editingNotice && (
                  <p className="text-xs text-gray-500">
                    {editingNotice.length} ký tự
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button className="cursor-pointer" onClick={handleConfirmEdit}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

// StudentVerificationInfo component - displays student homeroom and verification status
const StudentVerificationInfo = ({
  studentId,
  teacherVerificationData,
}: {
  studentId: string;
  teacherVerificationData: TeacherVerificationInfo[];
}) => {
  const studentData = teacherVerificationData.find(
    (student) => student.studentId === studentId
  );

  const verificationStatus = getVerificationStatus(
    studentData?.acceptStatus || "",
    studentData?.rejectStatus || ""
  );

  return (
    <div className="flex flex-col gap-2 mt-3">
      <div className="flex flex-row gap-2">
        <p className="font-semibold text-gray-700">Lớp:</p>
        <p className="text-gray-900">{studentData?.homeroom}</p>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <p className="font-semibold text-gray-700">Trạng thái xác nhận:</p>
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            verificationStatus.fullClassName
          )}
        >
          {verificationStatus.fullText}
        </span>
      </div>
    </div>
  );
};

// OrderItemActions component for edit and delete functionality
const OrderItemActions = ({
  orderIndex,
  onEditClick,
  onDeleteClick,
}: {
  orderIndex: number;
  onEditClick: (index: number) => void;
  onDeleteClick: (index: number) => void;
}) => {
  return (
    <div className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer w-8 h-8"
            onClick={() => onEditClick(orderIndex)}
          >
            <PencilLine size={12} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Sửa lưu ý của bạn</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            className="cursor-pointer w-8 h-8"
            onClick={() => onDeleteClick(orderIndex)}
          >
            <Trash2 size={12} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Xóa khỏi order</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default TeacherVerificationStatus;
