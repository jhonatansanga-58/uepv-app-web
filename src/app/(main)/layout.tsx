import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import { MainLayoutShell } from "@/components/MainLayoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UEPV",
  description: "Unidad Educativa Plenitud de Vida",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSessionProvider>
          <MainLayoutShell>{children}</MainLayoutShell>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
