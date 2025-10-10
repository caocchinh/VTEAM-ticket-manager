"use client";
import ChangeCalculator from "./ChangeCalculator";
import { useSidebar } from "./ui/sidebar";

const CalculatorWrapper = ({
  orderSubtotal,
  isSideBarTranisitioning,
}: {
  orderSubtotal: number;
  isSideBarTranisitioning: boolean;
}) => {
  const { open: isSidebarOpen } = useSidebar();

  return (
    !isSidebarOpen &&
    !isSideBarTranisitioning && (
      <div className="change_calculator">
        <ChangeCalculator
          totalAmount={orderSubtotal}
          calculatorBodyClassName="border shadow-sm"
        />
      </div>
    )
  );
};

export default CalculatorWrapper;
