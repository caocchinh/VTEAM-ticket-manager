import { OrderInfoProps, StudentInput } from "@/constants/types";
import React, { Fragment, useState } from "react";
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

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 w-[90%]  min-w-full sm:min-w-[400px]",
        isSidebarOpen ? "w-[48%]" : " w-[35%]"
      )}
    >
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
                              Thông tin sẽ được đưa về form để chỉnh sửa và đơn
                              hàng hiện tại sẽ bị xóa khỏi danh sách.
                            </DialogDescription>
                          </DialogHeader>
                          {editingIndex !== null && (
                            <div className="p-2 border border-[#0084ff] rounded-md">
                              <div className="flex flex-row gap-2">
                                <p className="font-semibold">Tên & Mã số HS:</p>
                                <p>
                                  {currentOrder[editingIndex].nameInput} -{" "}
                                  {currentOrder[editingIndex].studentIdInput}
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
                              Bạn có chắc chắn muốn xóa đơn hàng này? Hành động
                              này không thể hoàn tác.
                            </DialogDescription>
                          </DialogHeader>
                          {deletingIndex !== null && (
                            <div className="p-2 border border-red-600 rounded-md">
                              <div className="flex flex-row gap-2">
                                <p className="font-semibold">Tên & Mã số HS:</p>
                                <p>
                                  {currentOrder[deletingIndex].nameInput} -{" "}
                                  {currentOrder[deletingIndex].studentIdInput}
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

        <div className="flex flex-row items-center justify-between flex-wrap w-full gap-4 ">
          {!isSidebarOpen && (
            <p className="font-semibold subtotal_text">
              Thành tiền: {formatVietnameseCurrency(orderSubtotal)}
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
                Thành tiền: {formatVietnameseCurrency(orderSubtotal)}
                <Calculator />
              </Button>
            </DialogTrigger>
            <DialogContent className="!py-2">
              <DialogTitle className="sr-only">Tính tiền</DialogTitle>
              <ScrollArea className="h-[83dvh]">
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
              Kiểm tra kỹ lại thông tin order nhé!! 1 khi bấm chốt, thông tin sẽ
              được lưu về spreadsheet và khách hàng sẽ nhận được email xác nhận.
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
              Bạn có chắc chắn muốn xóa hết order hiện tại này? Hành động này
              không thể hoàn tác.
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
  );
};

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

export default OrderInfo;
