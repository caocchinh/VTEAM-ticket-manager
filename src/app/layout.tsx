import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/context/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bán vé VTEAM",
  description: "Exclusively for VTEAM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="/assets/favicon.ico" rel="icon" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
        <footer className="w-full bg-black mt-4 flex items-center justify-center text-white text-center p-2">
          <Image
            src="/assets/logo.webp"
            width={26}
            height={26}
            className="invert -mt-[2px]"
            alt="VTEAM Logo"
          />
          VTEAM - Vinschool Central Park
        </footer>
      </body>
    </html>
  );
}
