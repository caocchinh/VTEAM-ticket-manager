"use client";

import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  RefreshCcw,
  ShoppingCart,
  TriangleAlert,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatVietnameseCurrency } from "@/lib/utils";

interface SalesInfoCardProps {
  isSalesInfoFetching: boolean;
  isSalesInfoError: boolean;
  isMoneyVisible: boolean;
  totalSalesAmount: number;
  currentStaffStats: {
    revenue: number;
    orderCount: number;
  };
  onToggleMoneyVisibility: () => void;
  onRefetchSales: () => void;
}

const SalesInfoCard = ({
  isSalesInfoFetching,
  isSalesInfoError,
  isMoneyVisible,
  totalSalesAmount,
  currentStaffStats,
  onToggleMoneyVisibility,
  onRefetchSales,
}: SalesInfoCardProps) => {
  return (
    <div className="flex p-2 h-[50px] shadow-sm bg-card rounded-md items-center justify-between gap-1 border-1 relative">
      {isSalesInfoFetching && (
        <div className="absolute top-0 left-0 flex  w-full h-full rounded-md items-center justify-center bg-black/50 z-[10] text-white gap-2">
          Đang cập nhật
          <Loader2 className="animate-spin" />
        </div>
      )}
      {isSalesInfoError && !isSalesInfoFetching && (
        <div className="absolute top-0 left-0 flex  w-full h-full rounded-md items-center justify-center bg-red-500/70 z-[10] text-white gap-2">
          <div className="flex items-center justify-center gap-2">
            Lỗi
            <TriangleAlert />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="border w-[42px] border-white cursor-pointer"
                onClick={onRefetchSales}
              >
                <RefreshCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Thử lại</TooltipContent>
          </Tooltip>
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
                Tổng revenue{" "}
                {isMoneyVisible
                  ? formatVietnameseCurrency(totalSalesAmount)
                  : "*****"}
              </CardDescription>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-white z-[5] w-max py-0 px-4">
          <div className="flex p-2  bg-card rounded-md items-center justify-between gap-3 ">
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
                      % tổng doanh thu
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
            onClick={onToggleMoneyVisibility}
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="border w-[35px] border-white cursor-pointer -ml-2"
            onClick={onRefetchSales}
          >
            <RefreshCcw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Cập nhật dữ liệu</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default SalesInfoCard;
