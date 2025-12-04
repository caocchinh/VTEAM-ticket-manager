import { OrderInfoProps, StudentInput } from "@/constants/types";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { OrderItemInfo } from "./OrderItemInfo";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Calculator,
  Loader2,
  PencilLine,
  Trash2,
  WandSparkles,
  Zap,
} from "lucide-react";
import ChangeCalculator from "./ChangeCalculator";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  cn,
  errorToast,
  formatVietnameseCurrency,
  sucessToast,
} from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import TeacherVerificationStatus from "./TeacherVerificationStatus";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import TicketColorManager from "./TicketColorManager";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendOrderAction } from "@/server/actions";
import { useSidebar } from "./ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const OrderInfo = ({
  ticketColors,
  currentOrder,
  ticketInfo,
  orderSubtotal,
  shouldSendEmail,
  clearForm,
  setTicketColors,
  isSalesInfoFetching,
  refetchSales,
  setCurrentOrders,
  setNoticeInput,
  setTicketType,
  setPaymentMedium,
  setStudentNameInput,
  setHomeroomInput,
  setShouldSendEmail,
  getTicketColor,
  setEmailInput,
  setSelectedStudentIdInput,
  soldOutTicketsType,
  ticketsSoldPerType,
}: OrderInfoProps) => {
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [
    isConfirmingOrderAlertDialogOpen,
    setIsConfirmingOrderAlertDialogOpen,
  ] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const { open: isSidebarOpen } = useSidebar();

  // Memoized lookup map for ticket info by ticket type
  const ticketInfoMap = useMemo(() => {
    if (!ticketInfo?.offline) return new Map();
    return new Map(ticketInfo.offline.map((info) => [info.ticketName, info]));
  }, [ticketInfo]);

  // O(1) lookup function using the memoized map
  const getTicketInfo = (ticketType: string) => {
    return ticketInfoMap.get(ticketType);
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
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      localStorage.removeItem("currentOrderList"); // Clear saved order list after successful submission
      localStorage.removeItem("currentFormData"); // Clear saved form data after successful submission
      sucessToast({ message: "Chốt deal thành công!" });
      setIsConfirmingOrderAlertDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["sales_info"] });
    },
    onError: (error: Error) => {
      setIsConfirmingOrderAlertDialogOpen(false);
      refetchSales();
      errorToast({
        message: `Chốt deal thất bại, vui lòng thử lại! ${error.message}`,
      });
    },
  });

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setIsEditDialogOpen(true);
  };

  const isMobile = useIsMobile({ breakpoint: 1216 });

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

  const ticketsTypeAtOrUnderLimit = useMemo(() => {
    if (ticketInfo) {
      return (
        ticketInfo.offline?.filter(
          (value) =>
            value.maxQuantity < (ticketsSoldPerType[value.ticketName] || 0)
        ) ?? []
      );
    } else {
      return [];
    }
  }, [ticketInfo, ticketsSoldPerType]);

  // Check if any ticket in current order is sold out
  const hasSoldOutTicketInOrder = useMemo(() => {
    if (!ticketsTypeAtOrUnderLimit || ticketsTypeAtOrUnderLimit.length === 0)
      return false;

    const soldOutTicketNames = ticketsTypeAtOrUnderLimit.map(
      (ticket) => ticket.ticketName
    );
    return currentOrder.some((order) =>
      soldOutTicketNames.includes(order.ticketType)
    );
  }, [ticketsTypeAtOrUnderLimit, currentOrder]);

  // Helper function to check if a specific ticket is sold out
  const isTicketSoldOut = (ticketType: string) => {
    if (!ticketsTypeAtOrUnderLimit || ticketsTypeAtOrUnderLimit.length === 0)
      return false;
    return ticketsTypeAtOrUnderLimit.some(
      (ticket) => ticket.ticketName === ticketType
    );
  };

  useEffect(() => {
    setIsConfirmingOrderAlertDialogOpen(false);
  }, [isSalesInfoFetching]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 w-[90%]  min-w-full sm:min-w-[400px] max-w-[550px]",
        isSidebarOpen ? "w-[48%]" : " w-[35%]"
      )}
    >
      <div className="flex items-start h-max justify-between  w-full">
        <h2 className="font-semibold">Order information</h2>
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
          {soldOutTicketsType && soldOutTicketsType.length > 0 && (
            <div className="w-full p-3 mb-4 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-800 rounded-md flex justify-between gap-2 items-center">
              <div className="text-sm font-semibold flex-wrap whitespace-nowrap text-red-700 dark:text-red-400 mb-1 flex items-center gap-1">
                {isSalesInfoFetching ? (
                  <Loader2 className="animate-spin" size={15} />
                ) : (
                  "⚠️"
                )}
                <span className="mr-2"> Sold out ticket:</span>{" "}
                {soldOutTicketsType.map((ticket, index) => {
                  const soldCount = ticketsSoldPerType[ticket.ticketName] || 0;
                  const excess = soldCount - ticket.maxQuantity;
                  return (
                    <span
                      title={excess > 0 ? `Thừa ${excess} vé` : ""}
                      key={index}
                      className="inline-flex cursor-default items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full border border-red-300 dark:border-red-700"
                    >
                      {ticket.ticketName}
                      {excess > 0 && (
                        <span className="font-bold text-red-900 dark:text-red-200">
                          (+{excess})
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {currentOrder.length === 0 && (
            <h3 className="text-center mt-1">No orders yet!</h3>
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
                              Thông tin sẽ được đưa về form để chỉnh sửa và đơn
                              hàng hiện tại sẽ bị xóa khỏi danh sách.
                            </DialogDescription>
                          </DialogHeader>
                          {editingIndex !== null && (
                            <div className="p-2 border border-[#0084ff] rounded-md">
                              <div className="flex flex-row gap-2">
                                <p className="font-semibold">
                                  Student name & ID:
                                </p>
                                <p>
                                  {currentOrder[editingIndex].nameInput} -{" "}
                                  {currentOrder[editingIndex].studentIdInput}
                                </p>
                              </div>
                              <OrderItemInfo
                                order={currentOrder[editingIndex]}
                                price={
                                  getTicketInfo(
                                    currentOrder[editingIndex]?.ticketType
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
                              Bạn có chắc chắn muốn xóa đơn hàng này? Hành động
                              này không thể hoàn tác.
                            </DialogDescription>
                          </DialogHeader>
                          {deletingIndex !== null && (
                            <div className="p-2 border border-red-600 rounded-md">
                              <div className="flex flex-row gap-2">
                                <p className="font-semibold">
                                  Student name & ID:
                                </p>
                                <p>
                                  {currentOrder[deletingIndex].nameInput} -{" "}
                                  {currentOrder[deletingIndex].studentIdInput}
                                </p>
                              </div>
                              <OrderItemInfo
                                order={currentOrder[deletingIndex]}
                                price={
                                  getTicketInfo(
                                    currentOrder[deletingIndex]?.ticketType
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
                      price={getTicketInfo(order.ticketType)?.price ?? ""}
                      index={index}
                      order={order}
                      ticketColor={getTicketColor(order.ticketType)}
                      isSoldOut={isTicketSoldOut(order.ticketType)}
                    />
                  </div>
                  <Separator className="my-3" />
                </Fragment>
              ))}
            </Accordion>
          )}
        </ScrollArea>

        <div className="flex flex-row items-center justify-between flex-wrap w-full gap-4 ">
          {!isSidebarOpen && (
            <p className="font-semibold subtotal_text">
              Total: {formatVietnameseCurrency(orderSubtotal)}
            </p>
          )}
          <Dialog>
            <DialogTrigger
              asChild
              className={cn(
                " flex-1",
                isSidebarOpen && !isMobile ? "flex" : "hidden",
                isMobile && "!flex"
              )}
              title="Tính tiền"
            >
              <Button className="cursor-pointer" variant="outline">
                Total: {formatVietnameseCurrency(orderSubtotal)}
                <Calculator />
              </Button>
            </DialogTrigger>
            <DialogContent className="!py-2">
              <DialogTitle className="sr-only">Tính tiền</DialogTitle>
              <ScrollArea className="h-[84dvh]">
                <div className="flex-col items-center justify-center w-full flex gap-2 ">
                  <ChangeCalculator totalAmount={orderSubtotal} />
                </div>
              </ScrollArea>
              <DialogFooter className="w-full">
                <DialogClose asChild>
                  <Button variant="outline" className="w-full cursor-pointer">
                    Đóng
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            disabled={
              currentOrder.length === 0 ||
              hasSoldOutTicketInOrder ||
              isSalesInfoFetching
            }
            title={
              hasSoldOutTicketInOrder
                ? "Không thể chốt deal vì có vé đã hết trong đơn hàng"
                : undefined
            }
          >
            {isSalesInfoFetching && (
              <>
                Vui lòng đợi dữ liệu được làm mới
                <Loader2 className="animate-spin" />
              </>
            )}
            {!isSalesInfoFetching && !hasSoldOutTicketInOrder && (
              <>
                Close deal <WandSparkles />
              </>
            )}
            {hasSoldOutTicketInOrder && (
              <>
                Cannot close deal because there are tickets sold out in the
                order
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="py-3">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Save information to spreadsheet & send confirmation email
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please double-check the order information. Once you click close,
              the information will be saved to the spreadsheet and the customer
              will receive a confirmation email.
            </AlertDialogDescription>
            <div className="flex flex-row items-center gap-2">
              <Label htmlFor="send-email">Send confirmation email</Label>
              <Switch
                className="data-[state=checked]:border-[#0084ff] data-[state=checked]:bg-[#0084ff] data-[state=checked]:text-white dark:data-[state=checked]:border-[#0084ff] dark:data-[state=checked]:bg-[#0084ff] cursor-pointer"
                id="send-email"
                disabled={isOrderMutating}
                checked={shouldSendEmail}
                onCheckedChange={(checked) =>
                  setShouldSendEmail(checked === true)
                }
              />
            </div>
          </AlertDialogHeader>
          <ScrollArea className="h-[42vh] pr-4" type="always">
            <Accordion type="multiple">
              {currentOrder.map((order, index) => (
                <Fragment key={index}>
                  <OrderInfoAccordionItem
                    price={getTicketInfo(order.ticketType)?.price ?? ""}
                    index={index}
                    order={order}
                    ticketColor={getTicketColor(order.ticketType)}
                    isSoldOut={isTicketSoldOut(order.ticketType)}
                  />
                  <div className="my-4"></div>
                </Fragment>
              ))}
            </Accordion>
          </ScrollArea>
          <p className="text-center">
            I am sure I have received the full amount of{" "}
            <span className="text-green-700 font-semibold">
              {" "}
              {formatVietnameseCurrency(orderSubtotal)}
            </span>{" "}
            before clicking{" "}
            <span className="text-red-500 font-semibold">&quot;Chốt&quot;</span>
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
              Cancel
            </Button>
            <Button
              disabled={isOrderMutating || isSalesInfoFetching}
              className="w-full md:order-1 order-0 md:w-1/2 border cursor-pointer"
              onClick={() => {
                mutateOrder();
              }}
            >
              Close deal
              {!isOrderMutating && !isSalesInfoFetching && <Zap />}
              {isOrderMutating && !isSalesInfoFetching && (
                <Loader2 className="animate-spin" />
              )}
              {isSalesInfoFetching && (
                <>
                  Please wait for data to be refreshed
                  <Loader2 className="animate-spin" />
                </>
              )}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

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
            Delete all orders
            <Trash2 size={8} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm delete all orders</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all orders? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setIsDeleteAllDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                setCurrentOrders([]);
                localStorage.removeItem("currentOrderList"); // Clear saved order list when deleting all
                localStorage.removeItem("currentFormData"); // Clear saved form data when deleting all
                setIsDeleteAllDialogOpen(false);
              }}
            >
              Delete all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const OrderInfoAccordionItem = ({
  order,
  index,
  price,
  ticketColor,
  isSoldOut,
}: {
  order: StudentInput;
  index: number;
  price: string;
  ticketColor?: string;
  isSoldOut?: boolean;
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
          <span
            className={cn(
              isSoldOut && "text-red-600 dark:text-red-400 font-semibold"
            )}
          >
            {index + 1}
            {": "}
            {order.nameInput} - {order.studentIdInput}
            {isSoldOut && " ⚠️"}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <div
          className={cn(
            "flex w-full flex-col gap-4 p-2 text-balance border rounded-sm overflow-hidden",
            isSoldOut && "border-red-500 dark:border-red-700"
          )}
          style={{
            borderColor: isSoldOut ? undefined : ticketColor || "#0084ff",
            backgroundColor: isSoldOut
              ? "#fee2e2"
              : ticketColor
              ? `${ticketColor}08`
              : undefined,
          }}
        >
          <OrderItemInfo order={order} price={price} />
          {isSoldOut && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 -mt-2">
              ⚠️ Loại vé này đã hết! Vui lòng xóa đơn hàng này
            </p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default OrderInfo;
