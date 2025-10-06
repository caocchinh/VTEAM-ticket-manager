"use client";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { List, RefreshCw, AlertCircle } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { StudentInput, TeacherVerificationInfo } from "@/constants/types";
import { useTeacherVerification } from "@/hooks/useTeacherVerification";
import Loader from "./Loader/Loader";
import { ScrollArea } from "./ui/scroll-area";

const TeacherVerificationStatus = ({
  currentOrder,
}: {
  currentOrder: StudentInput[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentOrderRef = useRef<StudentInput[]>([]);

  // Track if currentOrder has changed since last fetch
  const [orderChanged, setOrderChanged] = useState(false);

  // Update orderChanged state when currentOrder changes
  useEffect(() => {
    const currentOrderString = JSON.stringify(currentOrder);
    const previousOrderString = JSON.stringify(currentOrderRef.current);

    if (currentOrderString !== previousOrderString) {
      setOrderChanged(true);
      currentOrderRef.current = currentOrder;
    }
  }, [currentOrder]);

  // Enable query only when dialog opens and either first time or order changed

  const {
    data: teacherVerificationData,
    isFetching,
    isError,
    error,
    refetch,
    isRefetching,
  } = useTeacherVerification({ enabled: isOpen });

  // Handle dialog open
  const handleDialogOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && orderChanged) {
      setOrderChanged(false);
      refetch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="cursor-pointer"
          disabled={currentOrder.length === 0}
        >
          GVCN xác nhận
          <List />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Trạng thái xác nhận GVCN</span>
            {isOpen && !orderChanged && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="ml-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[47dvh] w-full [&_.bg-border]:bg-logo-main/25 !pr-4">
          {teacherVerificationData && teacherVerificationData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không có dữ liệu xác nhận GVCN
            </div>
          )}
          {isFetching && (
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
          {teacherVerificationData && !isFetching && (
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
                    <div className="flex justify-start items-center gap-2">
                      <p>{index + 1}.</p>
                      <div className="font-medium">{student.name}</div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          student.verificationStatus === "TRUE"
                            ? "bg-green-100 text-green-800"
                            : student.verificationStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.verificationStatus === "FALSE"
                          ? "Chưa xác minh"
                          : "Đã xác minh"}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      Mã số HS: {student.studentId}
                    </div>
                    <div className="text-sm text-gray-600">
                      Lớp: {student.homeroom}
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
    </Dialog>
  );
};

export default TeacherVerificationStatus;
