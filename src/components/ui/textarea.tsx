import * as React from "react";

import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

function Textarea({
  className,
  autoResize,
  onInput,
  value,
  defaultValue,
  ...props
}: TextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const resizeToFitContent = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  React.useEffect(() => {
    if (autoResize) {
      resizeToFitContent();
    }
  }, [autoResize, value, defaultValue, resizeToFitContent]);

  return (
    <textarea
      ref={textareaRef}
      data-slot="textarea"
      style={{
        wordBreak: "break-word",
        overflowWrap: "break-word",
        whiteSpace: "pre-wrap",
        scrollbarGutter: "stable",
      }}
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-hidden",
        className
      )}
      onInput={(e) => {
        if (autoResize) {
          resizeToFitContent();
        }
        onInput?.(e);
      }}
      value={value}
      defaultValue={defaultValue}
      {...props}
    />
  );
}

export { Textarea };
