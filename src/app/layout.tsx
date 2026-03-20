import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";

/* ------------------ FONTS ------------------ */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* ------------------ METADATA ------------------ */

export const metadata: Metadata = {
  title: "BirdieFund — Play, Win, Give Back",
  description:
    "A modern golf charity platform where performance meets impact.",
};

/* ------------------ LAYOUT ------------------ */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      {/* ❌ removed hardcoded bg-white / black */}
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">

        {/* 🌈 GLOBAL BACKGROUND (premium feel) */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.06),_transparent_30%)]" />

        <Providers>

          {/* 🔥 NAVBAR */}
          <Navbar />

          {/* 🔥 MAIN CONTENT */}
          <main className="flex-grow pt-24">
            {children}
          </main>

          {/* 🔥 FOOTER */}
          <Footer />

          {/* 🔥 TOASTER */}
          <Toaster />

        </Providers>
      </body>
    </html>
  );
}