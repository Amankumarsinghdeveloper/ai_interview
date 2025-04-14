import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepWise",
  description: "An AI-powered platform for preparing for mock interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${monaSans.className} antialiased pattern min-h-screen`}
      >
        <div className="relative z-0 min-h-screen">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-200/5 via-transparent to-transparent z-[-1]" />
          {children}
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "hsl(var(--dark-200))",
              color: "hsl(var(--light-100))",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
            },
          }}
        />
      </body>
    </html>
  );
}
