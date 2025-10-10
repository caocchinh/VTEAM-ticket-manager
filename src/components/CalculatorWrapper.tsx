"use client";
import ChangeCalculator from "./ChangeCalculator";
import { useSidebar } from "./ui/sidebar";
import { motion } from "framer-motion";

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
      <motion.div 
        className="change_calculator"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <ChangeCalculator
          totalAmount={orderSubtotal}
          calculatorBodyClassName="border shadow-sm"
        />
      </motion.div>
    )
  );
};

export default CalculatorWrapper;
