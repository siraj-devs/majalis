import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  weight: ["200", "300", "400", "500", "700"],
  subsets: ["arabic"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مجالس",
  description: "سجل الاجتماعات — إدارة المجالس والمشاركين.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="مجالس" />
      </head>
      <body
        className="flex min-h-full flex-col bg-background font-tajawal text-foreground"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
