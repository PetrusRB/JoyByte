import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Ubuntu } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Loader } from "@/components/Loader";

import "./global.css";
import "@mantine/core/styles.css";
import "@mantine/nprogress/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

import LayoutClient from "./(client)/layout";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "JoyByte",
  description: "A social network",
};

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  return (
    <html lang={locale} {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`${ubuntu.className} dark:bg-black bg-orange-50 antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <MantineProvider>
            <LayoutClient>
              <Loader.Progress />
              <Navbar />
              {modal}
              {children}
            </LayoutClient>
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
