import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import localFont from "next/font/local";
import "./global.css";
import LayoutClient from "./(client)/layout";

const poppins = localFont({
  src: "../../public/fonts/poppins.ttf",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "JoyByte",
  description: "A social network",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body
        className={`${poppins.variable} dark:bg-black bg-orange-50 antialiased`}
      >
        <NextIntlClientProvider messages={messages}><LayoutClient>{children}</LayoutClient></NextIntlClientProvider>
      </body>
    </html>
  );
}
