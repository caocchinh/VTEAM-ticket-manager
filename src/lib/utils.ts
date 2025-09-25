import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getColumnNumber = (columnLetter: string): number => {
  return columnLetter.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
};

export const sucessToast = ({
  message,
  description,
}: {
  message: string;
  description?: string;
}) => {
  const toastId = toast.success(message, {
    description: description,
    duration: 1400,
    style: {
      backgroundColor: "#00a63e",
      color: "white",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    descriptionClassName: "!text-white font-medium",
    className: "flex items-center justify-center flex-col gap-5 w-[300px]",
    actionButtonStyle: {
      backgroundColor: "white",
      color: "black",
      border: "none",
      padding: "8px 16px",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      pointerEvents: "auto",
      zIndex: 9999,
    },
    action: {
      label: "Đóng",
      onClick: () => toast.dismiss(toastId),
    },
  });
  return toastId;
};

export const errorToast = ({
  message,
  description,
}: {
  message: string;
  description?: string;
}) => {
  const toastId = toast.error(message, {
    description: description,
    duration: 2300,
    style: {
      backgroundColor: "#e7000b",
      color: "white",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    descriptionClassName: "!text-white font-medium",
    className: "flex items-center justify-center flex-col gap-5 w-[300px]",
    actionButtonStyle: {
      backgroundColor: "white",
      color: "black",
      border: "none",
      padding: "8px 16px",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      pointerEvents: "auto",
      zIndex: 9999,
    },
    action: {
      label: "Đóng",
      onClick: () => toast.dismiss(toastId),
    },
  });
  return toastId;
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const fuzzySearch = (query: string, text: string): boolean => {
  try {
    if (!query) {
      return true;
    }
    if (!text) {
      return false;
    }
    const lowerQuery = query.toLowerCase();
    const lowerText = text.toLowerCase();
    let queryIndex = 0;
    let textIndex = 0;
    while (queryIndex < lowerQuery.length && textIndex < lowerText.length) {
      if (lowerQuery[queryIndex] === lowerText[textIndex]) {
        queryIndex++;
      }
      textIndex++;
    }
    return queryIndex === lowerQuery.length;
  } catch {
    return false;
  }
};

/**
 * Extracts the first numerical part from a string
 * @param str - The input string
 * @returns The first numerical part as a string, or null if no numerical part is found
 * @example
 * extractFirstNumber("12B3") // returns "12"
 * extractFirstNumber("1232B4221C22") // returns "1232"
 * extractFirstNumber("ABC123") // returns "123"
 * extractFirstNumber("ABC") // returns null
 */
export const extractFirstNumber = (str: string): number | null => {
  if (!str) return null;

  const match = str.match(/\d+/);
  return match ? parseInt(match[0]) : null;
};

/**
 * Parses Vietnamese currency string to number
 * @param priceStr - The price string like '259,000 ₫'
 * @returns The numerical value
 * @example
 * parseVietnameseCurrency('259,000 ₫') // returns 259000
 * parseVietnameseCurrency('1,500,000 ₫') // returns 1500000
 */
export const parseVietnameseCurrency = (priceStr: string | number): number => {
  if (typeof priceStr === "number") return priceStr;
  if (!priceStr) return 0;

  // Remove currency symbol and spaces, then remove commas
  return parseInt(priceStr.toString().replace(/[₫\s,]/g, "")) || 0;
};

/**
 * Formats number to Vietnamese currency string
 * @param amount - The numerical amount
 * @returns Formatted currency string
 * @example
 * formatVietnameseCurrency(259000) // returns '259,000 ₫'
 * formatVietnameseCurrency(1500000) // returns '1,500,000 ₫'
 */
export const formatVietnameseCurrency = (amount: number): string => {
  if (!amount && amount !== 0) return "0 ₫";

  return amount.toLocaleString("vi-VN") + " ₫";
};

/**
 * Safely trims a string, handling null/undefined values
 * @param str - The input string to trim
 * @returns The trimmed string, or empty string if input is null/undefined
 * @example
 * safeTrim("  hello  ") // returns "hello"
 * safeTrim(null) // returns ""
 * safeTrim(undefined) // returns ""
 * safeTrim("") // returns ""
 */
export const safeTrim = (str: string | null | undefined): string => {
  if (str == null || str == undefined) return "";
  if (typeof str !== "string") return "";
  return str.trim();
};

export const getCurrentTime = ({
  includeTime = true,
}: {
  includeTime: boolean;
}) => {
  const date = new Date();
  const bangkokDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
  );
  const day = String(bangkokDate.getDate()).padStart(2, "0");
  const month = String(bangkokDate.getMonth() + 1).padStart(2, "0");
  const year = bangkokDate.getFullYear();

  if (!includeTime) {
    return `${day}/${month}/${year}`;
  }

  const hours = String(bangkokDate.getHours()).padStart(2, "0");
  const minutes = String(bangkokDate.getMinutes()).padStart(2, "0");
  const seconds = String(bangkokDate.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
