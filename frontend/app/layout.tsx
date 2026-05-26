import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SGIPC Club of KUET",
    template: "%s · SGIPC",
  },
  description: "Where contest programmers knot ties together. The official competitive programming club of KUET CSE.",
  keywords: [
    "SGIPC", "KUET", "competitive programming", "ICPC", "ACM",
    "Codeforces", "programming contest", "KUET CSE",
  ],
  openGraph: {
    type: "website",
    siteName: "SGIPC Club of KUET",
    title: "SGIPC Club of KUET",
    description: "Where contest programmers knot ties together.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "SGIPC Club of KUET",
    description: "Where contest programmers knot ties together.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
