import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Box, Loader2, ShieldBan } from "lucide-react";
import { OnlineSalesInfo } from "@/constants/types";
import { Separator } from "./ui/separator";

const OnlineTicketManagement = ({
  salesInfo,
  isSalesInfoError,
  isOnlineCoordinator,
  isRefetchingSales,
  isSalesInfoFetching,
  onRefetchSales,
}: {
  salesInfo: OnlineSalesInfo[] | undefined;
  isOnlineCoordinator: boolean;
  isSalesInfoError: boolean;
  isRefetchingSales: boolean;
  isSalesInfoFetching: boolean;
  onRefetchSales: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              className="cursor-pointer w-[35px] !bg-[#F48120] !text-white"
              disabled={!salesInfo || isSalesInfoError}
              variant="outline"
            >
              <Box />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          className="!bg-[#F48120] !text-white "
          arrowClassName="fill-[#F48120] bg-[#F48120]"
        >
          Kiểm soát vé online
        </TooltipContent>
      </Tooltip>
      <DialogContent className="h-[95vh] flex flex-col justify-between !py-2 !max-w-[100vw] w-[90vw]">
        <DialogTitle className="sr-only">Báo cáo doanh thu</DialogTitle>
        <DialogDescription className="sr-only">
          Báo cáo doanh thu bán vé
        </DialogDescription>
        <div className="flex items-center h-max justify-center gap-2">
          <h3 className="text-center font-semibold text-xl uppercase">
            Kiểm soát vé online
          </h3>
          <Separator orientation="vertical" />
          <Button
            onClick={() => onRefetchSales()}
            variant="ghost"
            className="border border-black cursor-pointer"
            disabled={
              isRefetchingSales || isSalesInfoFetching || !isOnlineCoordinator
            }
          >
            Cập nhật dữ liệu
            {isRefetchingSales && <Loader2 className="animate-spin " />}
          </Button>
        </div>

        {isOnlineCoordinator ? (
          <div className="flex items-center h-max justify-center gap-2">
            <h3 className="text-center font-semibold text-xl uppercase">
              Kiểm soát vé online
            </h3>
          </div>
        ) : (
          <div className="flex items-center flex-col h-max justify-center gap-4">
            <ShieldBan size={75} className="text-red-500" strokeWidth={1.6} />
            <h3 className="text-center font-semibold text-xl text-red-500 uppercase">
              Xin lỗi, bạn không phải là coordinator bán vé online, bạn không có
              quyền truy cập!
            </h3>
          </div>
        )}

        <DialogFooter className="h-max">
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

export default OnlineTicketManagement;
