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
        deleteCache("offline_event_info"),
      ]);
    } catch (error) {
      console.log(error);
    }
    onRefreshOfflineData();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <SidebarMenuButton tooltip="Update app data" className="cursor-pointer">
          <CloudDownload />
          <span>Update app data</span>
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Data Update</DialogTitle>
          <DialogDescription className="text-orange-500">
            Whenever information in the sheet is updated (such as ticket prices,
            event information, email information, etc.), you need to update the
            data in the app to ensure the app data is up to date (This data does
            not include sales information).
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="offline">
          <TabsList>
            <TabsTrigger value="offline">Offline Ticket Sales Data</TabsTrigger>
            <TabsTrigger value="online">Online Ticket Sales Form</TabsTrigger>
          </TabsList>
          <TabsContent value="offline">
            <DialogDescription>
              This action will clear all information currently entered in the
              current session and reload new information (student list & ticket
              information & event information & email information) from the
              database. Are you sure you want to continue?
            </DialogDescription>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={isStudentListFetching || isTicketInfoFetching}
                onClick={handleOfflineRefresh}
                className="cursor-pointer"
              >
                Confirm Offline Data Update
                {(isStudentListFetching || isTicketInfoFetching) && (
                  <Loader2 className="animate-spin" />
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="online">
            <DialogDescription>
              This action will update the online ticket sales form from the
              database (student list & ticket information & event information &
              form information). Are you sure you want to continue?
            </DialogDescription>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={onRefreshOnlineData}
                className="cursor-pointer"
                disabled={isOnlineDataUpdating}
              >
                Confirm Online Form Update
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
