// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";


// SessionProvider එක import කරන්න
import { getServerSession } from "next-auth";
import { authOptions } from "./(auth)/authOptions";
import SessionProvider from "./(auth)/SessionProvider";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
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
  title: "Next.js POS",
  description: "A multi-company POS system with Next.js and Prisma",
};

export default async function RootLayout({
  // RootLayout එක async කරන්න
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // getServerSession එකෙන් session data ගන්නවා
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          {" "}
          <Theme>{children}</Theme>
        </SessionProvider>
      </body>
    </html>
  );
}
