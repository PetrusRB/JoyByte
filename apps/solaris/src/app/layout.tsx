import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Ubuntu } from "next/font/google";
import { Loader } from "@/components/Loader";

import "./global.css";
import "@mantine/core/styles.css";
import "@mantine/nprogress/styles.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";

import LayoutClient from "@/layouts/layout.client";
import { Providers } from "@/providers";

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
          <Providers>
            <LayoutClient>
              <Loader.Progress />
              {modal}
              {children}
            </LayoutClient>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
