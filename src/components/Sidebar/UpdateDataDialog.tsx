"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudDownload, Loader2 } from "lucide-react";
import { deleteCache } from "@/drizzle/idb";
import { Dispatch, SetStateAction } from "react";
import { SidebarMenuButton } from "../ui/sidebar";

interface UpdateDataDialogProps {
  isOpen: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  isStudentListFetching: boolean;
  isTicketInfoFetching: boolean;
  isOnlineDataUpdating: boolean;
  onRefreshOfflineData: () => void;
  onRefreshOnlineData: () => void;
}

const UpdateDataDialog = ({
  isOpen,
  onOpenChange,
  isStudentListFetching,
  isTicketInfoFetching,
  isOnlineDataUpdating,
  onRefreshOfflineData,
  onRefreshOnlineData,
}: UpdateDataDialogProps) => {
  const handleOfflineRefresh = async () => {
    try {
      await Promise.all([
        deleteCache("ticket_info"),
        deleteCache("student_list"),
        deleteCache("event_info"),
      ]);
    } catch (error) {
      console.log(error);
    }
    onRefreshOfflineData();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <SidebarMenuButton
          tooltip="Cập nhật dữ liệu"
          className="cursor-pointer"
        >
          <CloudDownload />
          <span>Cập nhật dữ liệu app</span>
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận cập nhật dữ liệu</DialogTitle>
          <DialogDescription className="text-orange-500">
            Mỗi khi thông tin trong sheet được cập nhật (ví dụ như giá vé, thông
            tin sự kiện, thông tin email, ...), bạn cần cập nhật dữ liệu trong
            app để đảm bảo dữ liệu trong app là mới nhất.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="offline">
          <TabsList>
            <TabsTrigger value="offline">Dữ liệu bán vé offline</TabsTrigger>
            <TabsTrigger value="online">Form bán vé online</TabsTrigger>
          </TabsList>
          <TabsContent value="offline">
            <DialogDescription>
              Hành động này sẽ xóa tất cả thông tin đang nhập trong phiên làm
              việc hiện tại và tải lại thông tin mới (danh sách học sinh & thông
              tin vé & thông tin sự kiện & thông tin email) từ cơ sở dữ liệu.
              Bạn có chắc chắn muốn tiếp tục?
            </DialogDescription>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                disabled={isStudentListFetching || isTicketInfoFetching}
                onClick={handleOfflineRefresh}
                className="cursor-pointer"
              >
                Xác nhận update dữ liệu offline
                {(isStudentListFetching || isTicketInfoFetching) && (
                  <Loader2 className="animate-spin" />
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="online">
            <DialogDescription>
              Hành động này sẽ update form bán vé online từ cơ sở dữ liệu (danh
              sách học sinh & thông tin vé & thông tin sự kiện & thông tin
              form). Bạn có chắc chắn muốn tiếp tục?
            </DialogDescription>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={onRefreshOnlineData}
                className="cursor-pointer"
                disabled={isOnlineDataUpdating}
              >
                Xác nhận update form bán vé online
                {isOnlineDataUpdating && <Loader2 className="animate-spin" />}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDataDialog;
