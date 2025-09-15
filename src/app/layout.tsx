// src/app/layout.tsx

import type { Metadata } from "next";


// SessionProvider එක import කරන්න
import { getServerSession } from "next-auth";
import { authOptions } from "./(auth)/authOptions";
import SessionProvider from "./(auth)/SessionProvider";
import { DrawerProvider } from "./components/UI/drawer/DrawerProvider";
import { Drawer } from "./components/UI/drawer/Drawer";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./globals.css";


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
        className={`antialiased`}
      >
        <DrawerProvider>
          <SessionProvider session={session}>
            <Theme>{children}</Theme>
            <Drawer />
          </SessionProvider>
        </DrawerProvider>
      </body>
    </html>
  );
}
