import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live Clinic Queue Management",
  description: "Real-time patient count monitoring and management system.",
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
      </body>
    </html>
  );
}
