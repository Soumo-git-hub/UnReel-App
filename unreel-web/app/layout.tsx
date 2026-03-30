import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UnReel | Video Intelligence and Analysis Platform",
  description: "Experience the next generation of video intelligence. UnReel uses advanced AI to analyze, transcribe, and chat with any video content from Instagram, YouTube, X, and LinkedIn instantly.",
  keywords: ["AI Video Analysis", "Video Transcription", "Reel Intelligence", "YouTube Shorts Analysis", "Video Chat AI", "UnReel AI"],
  authors: [{ name: "UnReel Team" }],
  openGraph: {
    title: "UnReel | Video Intelligence and Analysis Platform",
    description: "The most powerful way to extract insights from video content.",
    url: "https://unreel.com", // Replace with actual production URL if available
    siteName: "UnReel",
    images: [
      {
        url: "/UnReel-Logo.png",
        width: 1200,
        height: 630,
        alt: "UnReel - AI Video Intelligence",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UnReel | Video Intelligence and Analysis Platform",
    description: "Analyze and chat with any video link instantly.",
    images: ["/UnReel-Logo.png"],
  },
  appleWebApp: {
    title: "UnReel",
    statusBarStyle: "black-translucent",
  },
};



export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#10101C",
};



import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { LazyMotion, domAnimation } from "framer-motion";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <LazyMotion features={domAnimation}>
              {children}
            </LazyMotion>
          </AuthProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
