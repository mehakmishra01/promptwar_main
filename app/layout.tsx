import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], display: "swap", variable: "--font-display" });

export const metadata: Metadata = {
  title: "MindMirror — Wellness for Indian Students",
  description:
    "Reflective journaling and AI-powered insights for NEET, JEE, CUET, CAT, GATE, and UPSC aspirants.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <div className="sr-only">
          <a href="#main-content" className="sr-only-focusable" aria-label="Skip to main content">
            Skip to main content
          </a>
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
