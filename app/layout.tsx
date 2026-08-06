import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "БанкВики — аналитика вторичных продаж",
    template: "%s — БанкВики",
  },
  description:
    "Локальная учебная вики для аналитика вторичных продаж в управляющей компании.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
