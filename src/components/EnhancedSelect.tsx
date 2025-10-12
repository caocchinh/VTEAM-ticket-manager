"use client";
import { ChevronsUpDown, XIcon } from "lucide-react";
import {
  SetStateAction,
  Dispatch,
  useRef,
  useState,
  useCallback,
  KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  cn,
  formatVietnameseCurrency,
  parseVietnameseCurrency,
} from "@/lib/utils";
import { fuzzySearch } from "../lib/utils";
import { TicketInfo } from "@/constants/types";
import { Badge } from "./ui/badge";
import { INVALID_TICKET_DUE_TO_INVALID_CLASS } from "@/constants/constants";

const EnhancedSelect = ({
  label,
  prerequisite,
  side,
  data,
  selectedValue,
  triggerClassName,
  setSelectedValue,
  popoverContentClassName,
  modal,
}: {
  label: string;
  prerequisite: string;
  side?: "left" | "right" | "bottom" | "top";
  data: TicketInfo[];
  popoverContentClassName?: string;
  selectedValue: string;
  triggerClassName?: string;
  setSelectedValue: Dispatch<SetStateAction<string>>;
  modal?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isBlockingInput, setIsBlockingInput] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMobileDevice = useIsMobile();
  const [inputValue, setInputValue] = useState<string>("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (e.key === "Escape") {
        if (inputValue) {
          setInputValue("");
          return;
        }
        inputRef.current?.blur();
        if (isOpen) {
          setIsOpen(false);
        }
      }
    },
    [inputValue, isOpen]
  );

  return (
    <div className="flex flex-col gap-1 w-full">
      <Popover modal={modal || isMobileDevice} open={isOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            aria-expanded={isOpen}
            className={cn(
              "h-max w-full justify-between whitespace-pre-wrap",
              triggerClassName
            )}
            disabled={!!prerequisite}
            variant="outline"
            onClick={() => {
              setIsOpen(!isOpen);
              setIsBlockingInput(true);
              setTimeout(() => {
                setIsBlockingInput(false);
              }, 0);
            }}
          >
            <div className="flex items-center gap-2">
              {selectedValue || prerequisite}
              {selectedValue !== INVALID_TICKET_DUE_TO_INVALID_CLASS &&
                !prerequisite && (
                  <div className="flex items-center gap-1">
                    <Badge className="bg-green-700">
                      {formatVietnameseCurrency(
                        parseVietnameseCurrency(
                          data.find((item) => item.ticketName === selectedValue)
                            ?.price ?? 0
                        )
                      )}
                    </Badge>
                    {data.find((item) => item.ticketName === selectedValue)
                      ?.includeConcert ? (
                      <Badge
                        variant="outline"
                        className="bg-[#0084ff] text-white"
                      >
                        Có concert
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Không concert</Badge>
                    )}
                  </div>
                )}
            </div>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          onInteractOutside={(e) => {
            if (triggerRef.current?.contains(e.target as Node)) {
              return;
            }
            setIsOpen(false);
            setInputValue("");
          }}
          align="center"
          className={cn(
            "z-[1000000000000000] w-[300px] p-0 sm:w-max",
            popoverContentClassName
          )}
          side={side || (isMobileDevice ? "bottom" : "right")}
          avoidCollisions={isMobileDevice ? false : true}
        >
          <Command shouldFilter={false} onKeyDown={handleKeyDown}>
            <div className="flex items-center gap-1 dark:bg-accent">
              <CommandInput
                className="h-9 border-none"
                placeholder={`Search ${label.toLowerCase()}`}
                readOnly={isBlockingInput}
                ref={inputRef}
                onClick={() => {
                  inputRef.current?.focus();
                }}
                value={inputValue}
                wrapperClassName="w-full p-4 border-b py-6 "
                onValueChange={(value) => {
                  setInputValue(value);
                }}
              />
              <XIcon
                className="!bg-transparent cursor-pointer mr-2 text-destructive"
                size={20}
                onClick={() => {
                  if (inputValue) {
                    setInputValue("");
                  } else {
                    setIsOpen(false);
                  }
                }}
              />
            </div>
            <ScrollArea viewPortClassName="max-h-[195px]" type="always">
              <CommandList className="dark:bg-accent">
                <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
                <CommandGroup>
                  {data
                    ?.filter((item) => fuzzySearch(inputValue, item.ticketName))
                    .map((item) => (
                      <EnhancedSelectItem
                        key={item.ticketName}
                        item={item}
                        search={inputValue}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        setInputValue={setInputValue}
                        setSelectedValue={setSelectedValue}
                        inputRef={inputRef}
                        setIsBlockingInput={setIsBlockingInput}
                        inputValue={inputValue}
                        selectedValue={selectedValue}
                      />
                    ))}
                </CommandGroup>
              </CommandList>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const EnhancedSelectItem = ({
  item,
  isOpen,
  setIsOpen,
  setInputValue,
  setSelectedValue,
  inputRef,
  setIsBlockingInput,
  inputValue,
  selectedValue,
}: {
  item: TicketInfo;
  search: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  setInputValue: (value: string) => void;
  setSelectedValue: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setIsBlockingInput: (value: boolean) => void;
  inputValue: string;
  selectedValue: string;
}) => {
  return (
    <CommandItem
      className={cn("cursor-pointer", !isOpen && "pointer-events-none")}
      key={item.ticketName}
      onSelect={(currentValue) => {
        setIsBlockingInput(true);
        setTimeout(() => {
          setIsBlockingInput(false);
        }, 0);
        setSelectedValue(currentValue);
        setIsOpen(false);
        setInputValue("");
      }}
      onTouchEnd={() => {
        setTimeout(() => {
          inputRef.current?.focus();
          setIsBlockingInput(false);
        }, 0);
      }}
      onTouchStart={() => {
        if (!inputValue) {
          setIsBlockingInput(true);
        }
      }}
      value={item.ticketName}
    >
      <Checkbox
        checked={selectedValue === item.ticketName}
        className="data-[state=checked]:border-[#0084ff] data-[state=checked]:bg-[#0084ff] text-white dark:data-[state=checked]:border-[#0084ff] dark:data-[state=checked]:bg-[#0084ff] rounded-full"
      />
      {item.ticketName}
      <span className="flex ml-1 items-center gap-1">
        <Badge className="bg-green-700">
          {formatVietnameseCurrency(parseVietnameseCurrency(item.price))}
        </Badge>
        {item.includeConcert ? (
          <Badge variant="outline" className="bg-[#0084ff] text-white">
            Có concert
          </Badge>
        ) : (
          <Badge variant="destructive">Không concert</Badge>
        )}
      </span>
    </CommandItem>
  );
};

export default EnhancedSelect;
