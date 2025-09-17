"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatVietnameseCurrency, parseVietnameseCurrency } from "@/lib/utils";

interface ChangeCalculatorProps {
  totalAmount: number;
}

const ChangeCalculator = ({ totalAmount }: ChangeCalculatorProps) => {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  // Preset amounts in VND
  const presetAmounts = [200000, 300000, 500000, 1000000];

  // Calculate change
  const change = useMemo(() => {
    let paidAmount = 0;

    if (selectedAmount) {
      paidAmount = selectedAmount;
    } else if (customAmount) {
      // Parse custom amount - add 000 if user enters just numbers
      const cleanAmount = customAmount.replace(/[^\d]/g, "");
      if (cleanAmount) {
        paidAmount = parseInt(cleanAmount) * 1000; // Multiply by 1000 for convenience
      }
    }

    return paidAmount > totalAmount ? paidAmount - totalAmount : 0;
  }, [customAmount, selectedAmount, totalAmount]);

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(""); // Clear custom input when preset is selected
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null); // Clear preset selection when custom amount is entered
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).blur();
    setTimeout(() => (e.target as HTMLInputElement).focus(), 0);
  };

  const clearAll = () => {
    setCustomAmount("");
    setSelectedAmount(null);
  };

  return (
    <div className="flex flex-col gap-2 items-center justify-center w-[300px]">
      <h2 className="font-semibold flex items-center justify-center gap-2">
        Tính tiền
      </h2>

      <div className="flex flex-col gap-4 border shadow-sm rounded-md p-4 w-full">
        {/* Total Amount Display */}
        <div className="p-3 bg-blue-50 rounded-md">
          <Label className="text-sm font-medium text-blue-700">
            Tổng tiền cần thanh toán:
          </Label>
          <p className="text-lg font-bold text-blue-900">
            {formatVietnameseCurrency(totalAmount)}
          </p>
        </div>

        {/* Preset Amount Buttons */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Chọn mệnh giá có sẵn:
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {presetAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "default" : "outline"}
                onClick={() => handlePresetClick(amount)}
                className="flex items-center gap-1"
              >
                {amount >= 1000000
                  ? `${amount / 1000000}M`
                  : `${amount / 1000}K`}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div>
          <Label htmlFor="custom-amount" className="text-sm font-medium">
            Hoặc nhập số tiền khác (nghìn đồng):
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              id="custom-amount"
              type="number"
              placeholder="Ví dụ: 350 (= 350,000 ₫)"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              onWheel={handleWheel}
              className="flex-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <span className="text-sm text-gray-500 min-w-fit">× 1,000 ₫</span>
          </div>
          {customAmount && (
            <p className="text-xs text-gray-600 mt-1 wrap-anywhere">
              ={" "}
              {formatVietnameseCurrency(
                parseVietnameseCurrency(customAmount) * 1000
              )}
            </p>
          )}
        </div>

        {((parseInt(customAmount) ?? 0) > 0 || selectedAmount) && (
          <div className="p-3 bg-green-50 rounded-md border border-green-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">
                  Khách đưa:
                </span>
                <span className="font-bold text-green-900 wrap-anywhere">
                  {selectedAmount
                    ? formatVietnameseCurrency(selectedAmount)
                    : formatVietnameseCurrency(
                        parseVietnameseCurrency(customAmount) * 1000
                      )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">
                  Tổng tiền:
                </span>
                <span className="font-bold text-green-900">
                  {formatVietnameseCurrency(totalAmount)}
                </span>
              </div>
              <hr className="border-green-300" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-green-700">
                  Tiền thối:
                </span>
                <span className="text-lg font-bold text-green-900 wrap-anywhere">
                  {change > 0
                    ? formatVietnameseCurrency(change)
                    : "Khách đưa thiếu"}
                </span>
              </div>
            </div>
          </div>
        )}

        {(selectedAmount || customAmount) && (
          <Button variant="outline" onClick={clearAll} className="w-full">
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChangeCalculator;
