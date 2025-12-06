"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cn,
  formatVietnameseCurrency,
  parseVietnameseCurrency,
} from "@/lib/utils";

interface ChangeCalculatorProps {
  totalAmount: number;
  calculatorBodyClassName?: string;
}

const ChangeCalculator = ({
  totalAmount,
  calculatorBodyClassName,
}: ChangeCalculatorProps) => {
  const [customAmount, setCustomAmount] = useState("");

  // Preset amounts in VND
  const presetAmounts = [200000, 300000, 500000, 1000000];

  // Calculate change
  const change = useMemo(() => {
    let paidAmount = 0;

    if (customAmount) {
      // Parse custom amount - add 000 if user enters just numbers
      const cleanAmount = customAmount.replace(/[^\d]/g, "");
      if (cleanAmount) {
        paidAmount = parseInt(cleanAmount) * 1000; // Multiply by 1000 for convenience
      }
    }

    return paidAmount - totalAmount;
  }, [customAmount, totalAmount]);

  const handlePresetClick = (amount: number) => {
    // Only update custom amount with the selected preset amount
    setCustomAmount((amount / 1000).toString());
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
  };

  const clearAll = () => {
    setCustomAmount("");
  };

  return (
    <div className="flex-col items-center justify-start gap-2 w-full max-w-[300px]">
      <h2 className="font-semibold flex items-center justify-center gap-2">
        Calculate change
      </h2>

      <div
        className={cn(
          "flex flex-col gap-3 rounded-md p-4 w-full mt-2",
          calculatorBodyClassName
        )}
      >
        {/* Total Amount Display */}
        <div className="p-2 bg-blue-50 rounded-md">
          <Label className="text-sm font-medium text-blue-700">
            Total amount to pay:
          </Label>
          <p className="text-lg font-bold text-blue-900">
            {formatVietnameseCurrency(totalAmount)}
          </p>
        </div>

        {/* Preset Amount Buttons */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Select preset amount:
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {presetAmounts.map((amount) => (
              <Button
                key={amount}
                variant={
                  customAmount === (amount / 1000).toString()
                    ? "default"
                    : "outline"
                }
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
            Or enter another amount (in thousands):
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              id="custom-amount"
              placeholder="Example: 350 (= 350,000 ₫)"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              inputMode="numeric"
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

        {(parseInt(customAmount) ?? 0) > 0 && (
          <div className="p-3 bg-green-50 rounded-md border border-green-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">
                  Customer paid:
                </span>
                <span className="font-bold text-green-900 wrap-anywhere">
                  {formatVietnameseCurrency(
                    parseVietnameseCurrency(customAmount) * 1000
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">
                  Total amount:
                </span>
                <span className="font-bold text-green-900">
                  {formatVietnameseCurrency(totalAmount)}
                </span>
              </div>
              <hr className="border-green-300" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-green-700">
                  Change:
                </span>
                <span className="text-lg font-bold text-green-900 wrap-anywhere">
                  {change > 0 && formatVietnameseCurrency(change)}
                  {change === 0 && "No change"}
                  {change < 0 && "Not enough"}
                </span>
              </div>
            </div>
          </div>
        )}

        {customAmount && (
          <Button
            variant="outline"
            onClick={clearAll}
            className="w-full cursor-pointer"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChangeCalculator;
