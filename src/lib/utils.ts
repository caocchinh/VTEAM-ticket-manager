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
