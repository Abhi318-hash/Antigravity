import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";

export const metadata: Metadata = {
  title: "Q-PULSE | Skip the wait, stay in the pulse",
  description: "Real-time patient pulse monitoring and management system. Skip the wait, stay in the pulse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
