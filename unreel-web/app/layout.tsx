import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UnReel | Next-Gen AI Video Intelligence",
  description: "Transform how you interact with video. UnReel uses advanced AI to analyze, transcribe, and chat with any video content instantly.",
  keywords: ["AI", "Video Analysis", "Video Intelligence", "Transcription", "Next.js", "Framer Motion"],
  authors: [{ name: "Soumo" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};



export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#10101C",
};



import { AuthProvider } from "@/lib/AuthContext";
import { LazyMotion, domAnimation } from "framer-motion";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LazyMotion features={domAnimation}>
            {children}
          </LazyMotion>
        </AuthProvider>
      </body>
    </html>
  );
}
