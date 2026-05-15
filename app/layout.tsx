
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prompta Flow",
  description: "Turn your expertise into authority and inbound clients on LinkedIn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
        <body className={`${jakarta.className} antialiased`}>
      
        {children}
        <Analytics />
      </body>
    </html>
  );
}
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});