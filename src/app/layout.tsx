import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BeachScout } from "@/components/BeachScout";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Using Inter as primary font for now to avoid local file issues
const geistSans = Inter({ subsets: ["latin"], variable: "--font-geist-sans" }); // Fallback

export const metadata: Metadata = {
  title: {
    default: "BeachSeeker | Find Your Perfect Paradise",
    template: "%s | BeachSeeker",
  },
  description: "Discover the world's most beautiful beaches. Filter by vibe, activities, and more to find your perfect coastal getaway.",
  keywords: ["beaches", "travel", "vacation", "coastal", "paradise", "beach finder"],
  authors: [{ name: "BeachSeeker Team" }],
  creator: "BeachSeeker Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://best-beachs.vercel.app/",
    siteName: "BeachSeeker",
    title: "BeachSeeker | Find Your Perfect Paradise",
    description: "Discover the world's most beautiful beaches. Filter by vibe, activities, and more to find your perfect coastal getaway.",
    images: [
      {
        url: "https://best-beachs.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "BeachSeeker - Find your paradise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BeachSeeker | Find Your Perfect Paradise",
    description: "Discover the world's most beautiful beaches. Filter by vibe, activities, and more to find your perfect coastal getaway.",
    images: ["https://best-beachs.vercel.app/og-image.png"],
    creator: "@beachseeker",
  },
  robots: {
    index: true,
    follow: true,
  },
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
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
