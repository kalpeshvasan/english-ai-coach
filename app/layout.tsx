import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "English AI Coach",
  description: "Practice spoken English with an AI coach",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}