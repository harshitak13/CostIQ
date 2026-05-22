import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Cost IQ — AI Spend Audit for Startups',
  description: 'Find out if you\'re overpaying for AI tools. Get a free instant audit of your AI stack and see exactly where you can save.',
  openGraph: {
    title: 'Cost IQ — AI Spend Audit for Startups',
    description: 'Find out if you\'re overpaying for AI tools. Free instant audit.',
    siteName: 'Cost IQ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cost IQ — AI Spend Audit for Startups',
    description: 'Find out if you\'re overpaying for AI tools. Free instant audit.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
