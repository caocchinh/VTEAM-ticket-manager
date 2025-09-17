import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getColumnNumber = (columnLetter: string): number => {
  return columnLetter.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
};

export const sucessToast = (message: string, description?: string) => {
  toast.success(message, {
    description: description,
    duration: 6000,
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
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    action: {
      label: "Close",
      onClick: () => toast.dismiss(),
    },
  });
};

export const errorToast = (message: string, description?: string) => {
  toast.error(message, {
    description: description,
    duration: 3000,
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
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    action: {
      label: "Close",
      onClick: () => toast.dismiss(),
    },
  });
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

export const removeVietnameseAccents = (str: string): string => {
  const accentsMap: { [key: string]: string } = {
    à: "a",
    á: "a",
    ạ: "a",
    ả: "a",
    ã: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ậ: "a",
    ẩ: "a",
    ẫ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ặ: "a",
    ẳ: "a",
    ẵ: "a",
    è: "e",
    é: "e",
    ẹ: "e",
    ẻ: "e",
    ẽ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ệ: "e",
    ể: "e",
    ễ: "e",
    ì: "i",
    í: "i",
    ị: "i",
    ỉ: "i",
    ĩ: "i",
    ò: "o",
    ó: "o",
    ọ: "o",
    ỏ: "o",
    õ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ộ: "o",
    ổ: "o",
    ỗ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ợ: "o",
    ở: "o",
    ỡ: "o",
    ù: "u",
    ú: "u",
    ụ: "u",
    ủ: "u",
    ũ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ự: "u",
    ử: "u",
    ữ: "u",
    ỳ: "y",
    ý: "y",
    ỵ: "y",
    ỷ: "y",
    ỹ: "y",
    đ: "d",
    À: "A",
    Á: "A",
    Ạ: "A",
    Ả: "A",
    Ã: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ậ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ặ: "A",
    Ẳ: "A",
    Ẵ: "A",
    È: "E",
    É: "E",
    Ẹ: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ệ: "E",
    Ể: "E",
    Ễ: "E",
    Ì: "I",
    Í: "I",
    Ị: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ò: "O",
    Ó: "O",
    Ọ: "O",
    Ỏ: "O",
    Õ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ộ: "O",
    Ổ: "O",
    Ỗ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ợ: "O",
    Ở: "O",
    Ỡ: "O",
    Ù: "U",
    Ú: "U",
    Ụ: "U",
    Ủ: "U",
    Ũ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ự: "U",
    Ử: "U",
    Ữ: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỵ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Đ: "D",
  };

  return str
    .split("")
    .map((char) => accentsMap[char] || char)
    .join("")
    .toLowerCase();
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

export const getCurrentTime = () => {
  const date = new Date();
  const bangkokDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
  );
  const day = String(bangkokDate.getDate()).padStart(2, "0");
  const month = String(bangkokDate.getMonth() + 1).padStart(2, "0");
  const year = bangkokDate.getFullYear();
  const hours = String(bangkokDate.getHours()).padStart(2, "0");
  const minutes = String(bangkokDate.getMinutes()).padStart(2, "0");
  const seconds = String(bangkokDate.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
