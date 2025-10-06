import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import {
  OFFLINE_SALES_SHEET_ID,
  ONLINE_SALES_SHEET_ID,
  CHECKIN_SHEET_ID,
  TEACHER_VERIFICATION_SHEET_ID,
} from "@/constants/constants";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ExternalLinkIcon } from "lucide-react";

const SpreadsheetQuickAccess = () => {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-full w-[50px] !p-2 cursor-pointer"
            >
              <Image
                src="/assets/sheet_logo.webp"
                className="w-[35px] h-[35px] object-contain"
                alt="Google Sheet logo"
                width={50}
                height={50}
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Sheet bán vé & checkin</TooltipContent>
      </Tooltip>
      <PopoverContent className="flex items-center justify-center flex-col text-md">
        <a
          target="_blank"
          rel="noopener"
          className="w-full flex items-center justify-start gap-4 hover:bg-muted p-2 rounded-md"
          href={`https://docs.google.com/spreadsheets/d/${OFFLINE_SALES_SHEET_ID}`}
        >
          1. <span>Sheet bán vé offline</span>
          <ExternalLinkIcon className="w-4 h-4 -ml-2" />
        </a>
        <Separator className="my-2" />
        <a
          target="_blank"
          rel="noopener"
          className="w-full flex items-center justify-start gap-4 hover:bg-muted p-2 rounded-md"
          href={`https://docs.google.com/spreadsheets/d/${ONLINE_SALES_SHEET_ID}`}
        >
          2. <span>Sheet bán vé online</span>
          <ExternalLinkIcon className="w-4 h-4 -ml-2" />
        </a>
        <Separator className="my-2" />
        <a
          target="_blank"
          rel="noopener"
          className="w-full flex items-center justify-start gap-4 hover:bg-muted p-2 rounded-md"
          href={`https://docs.google.com/spreadsheets/d/${CHECKIN_SHEET_ID}`}
        >
          3. <span>Sheet check-in</span>
          <ExternalLinkIcon className="w-4 h-4 -ml-2" />
        </a>
        <Separator className="my-2" />
        <a
          target="_blank"
          rel="noopener"
          className="w-full flex items-center justify-start gap-4 hover:bg-muted p-2 rounded-md"
          href={`https://docs.google.com/spreadsheets/d/${TEACHER_VERIFICATION_SHEET_ID}`}
        >
          4. <span>Sheet xác nhận GVCN</span>
          <ExternalLinkIcon className="w-4 h-4 -ml-2" />
        </a>
      </PopoverContent>
    </Popover>
  );
};

export default SpreadsheetQuickAccess;
