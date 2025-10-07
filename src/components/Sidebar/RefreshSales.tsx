import React from "react";
import { SidebarMenuButton } from "../ui/sidebar";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshSalesProps {
  isSalesInfoFetching: boolean;
  isSalesInfoError: boolean;
  onRefetchSales: () => void;
}

const RefreshSales = ({
  isSalesInfoFetching,
  isSalesInfoError,
  onRefetchSales,
}: RefreshSalesProps) => {
  return (
    <SidebarMenuButton
      tooltip={isSalesInfoError ? "Lỗi! Tải lại" : "Cập nhật dữ liệu sales"}
      className={cn(
        "cursor-pointer",
        isSalesInfoError &&
          "bg-red-500 text-white hover:bg-red-500 hover:text-white active:bg-red-500 active:text-white"
      )}
      disabled={isSalesInfoFetching}
      onClick={onRefetchSales}
    >
      {!isSalesInfoError && (
        <RefreshCw
          className={cn("size-4", isSalesInfoFetching && "animate-spin")}
        />
      )}
      {isSalesInfoError && <TriangleAlert className="size-4 text-white " />}
      <span
        className={cn("whitespace-nowrap", isSalesInfoError && "text-white ")}
      >
        {isSalesInfoError
          ? "Lỗi lấy dữ liệu, vui lòng thử lại"
          : "Cập nhật dữ liệu sales"}
      </span>
    </SidebarMenuButton>
  );
};

export default RefreshSales;
