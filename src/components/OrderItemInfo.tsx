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
        <p className="font-semibold">Class:</p>
        <p className="wrap-anywhere">{order.homeroomInput}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Email:</p>
        <p className="wrap-anywhere">{order.email}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Ticket type:</p>
        <p className="wrap-anywhere">{order.ticketType}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Ticket price:</p>
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
        <p className="font-semibold">Payment method:</p>
        <p className="wrap-anywhere">{order.paymentMedium}</p>
      </div>
      <div className="flex flex-row gap-2">
        <p className="font-semibold">Note:</p>
        <p className="whitespace-pre-wrap wrap-anywhere">
          {order.notice || "No note"}
        </p>
      </div>
    </>
  );
};
