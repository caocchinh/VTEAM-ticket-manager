import { StudentInput } from "@/constants/types";
import { formatVietnameseCurrency, parseVietnameseCurrency } from "@/lib/utils";

export const OrderItemInfo = ({
  order,
  price,
}: {
  order: StudentInput;
  price: string;
}) => {
  return (
    <>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Lớp:</p>
        <p className="wrap-anywhere">{order.homeroomInput}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Email:</p>
        <p className="wrap-anywhere">{order.email}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Hạng vé:</p>
        <p className="wrap-anywhere">{order.ticketType}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Giá vé:</p>
        <p className="wrap-anywhere">
          {formatVietnameseCurrency(parseVietnameseCurrency(price))}
        </p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Vé gồm concert:</p>
        <p className="wrap-anywhere">
          {order.concertIncluded ? "Có" : "Không"}
        </p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Hình thức:</p>
        <p className="wrap-anywhere">{order.paymentMedium}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Lưu ý của bạn:</p>
        <p className="whitespace-pre-wrap wrap-anywhere">
          {order.notice || "Không có lưu ý"}
        </p>
      </div>
    </>
  );
};
