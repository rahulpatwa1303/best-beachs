import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BeachScout } from "@/components/BeachScout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Using Inter as primary font for now to avoid local file issues
const geistSans = Inter({ subsets: ["latin"], variable: "--font-geist-sans" }); // Fallback

export const metadata: Metadata = {
  title: "BeachSeeker",
  description: "Find your paradise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          geistSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <BeachScout />
        </ThemeProvider>
      </body>
    </html>
  );
}
