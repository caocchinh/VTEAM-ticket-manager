"use client";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { ExternalLink, LinkIcon, TriangleAlert } from "lucide-react";
import { Button } from "./ui/button";

const EmbededBrowserWarning = () => {
  const [isEmbededBrowser, setIsEmbededBrowser] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator || !navigator.userAgent) {
      return;
    }
    setIsEmbededBrowser(isEmbeddedBrowser());
  }, []);

  function isEmbeddedBrowser() {
    const userAgent = navigator.userAgent || "";
    const embeddedBrowserPatterns = [
      "FBAN",
      "FBAV",
      "Instagram",
      "TikTok",
      "Snapchat",
      "Twitter",
      "Line",
      "WeChat",
      "QQBrowser",
    ];
    const embeddedBrowserRegex = new RegExp(
      embeddedBrowserPatterns.join("|"),
      "i"
    );
    return embeddedBrowserRegex.test(userAgent);
  }

  const isAppleDevice = () => {
    if (typeof window === "undefined") return false;

    const isAppleVendor = /apple/i.test(navigator.vendor);
    const isApplePlatform = /Mac|iPad|iPhone|iPod/.test(navigator.platform);
    const isAppleUserAgent = /Mac|iPad|iPhone|iPod/.test(navigator.userAgent);

    return (
      isAppleVendor ||
      isApplePlatform ||
      isAppleUserAgent ||
      navigator.platform === "MacIntel" ||
      navigator.userAgent.includes("Macintosh")
    );
  };

  const openInExternalBrowser = (url: string) => {
    // iOS
    if (isAppleDevice()) {
      window.location.href = `x-safari-${url}`;
      return;
    } else {
      window.location.href = `intent:${url}#Intent;package=com.android.chrome;end`;
      return;
    }
  };

  return (
    <AlertDialog open={isEmbededBrowser}>
      <AlertDialogContent className="flex flex-col items-center justify-center gap-3 !py-4 border border-red-500">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600 text-4xl font-semibold">
            Cảnh cáo
          </AlertDialogTitle>
        </AlertDialogHeader>
        <TriangleAlert className="text-red-500" size={60} />
        <AlertDialogDescription className="text-xl text-center">
          Vì lý do bảo mật, Google không cho phép đăng nhập bằng trình duyện
          nhúng qua link Messenger/Zalo ... Bạn hãy vào trình duyệt trên điện
          thoại/tablet nhé!
        </AlertDialogDescription>
        <AlertDialogFooter className="flex !flex-col items-center justify-center gap-3 w-full">
          <Button
            className="flex items-center justify-center gap-2 cursor-pointer w-full"
            onClick={(e) => {
              e.preventDefault();
              openInExternalBrowser(window.location.href);
            }}
          >
            {isAppleDevice() ? "Mở bằng Safari" : "Mở bằng Chrome"}
            <ExternalLink />
          </Button>
          <Button
            className="flex items-center justify-center gap-2 cursor-pointer w-full"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            }}
          >
            {copied ? "Đã sao chép!" : "Sao chép link"}
            <LinkIcon />
          </Button>

          <h5 className="font-light text-center text-red-500 text-sm w-full">
            {isAppleDevice()
              ? "Nếu bạn đang sử dụng iOS phiên bản 15 trở xuống, vui lòng mở trình duyệt ngoài thủ công!"
              : "Nếu Chrome chưa được cài đặt, vui lòng mở trình duyệt ngoài thủ công!"}
          </h5>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EmbededBrowserWarning;
