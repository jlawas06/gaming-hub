import type { Metadata } from "next";
import { alfaSlabOne, nunito } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "JL Gaming Hub - Classic Games Collection",
  description:
    "A carnival midway of browser games: BINGO caller, bingo card generator, color dice, and Deal or No Deal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${alfaSlabOne.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
