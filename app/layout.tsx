import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Toaster } from "react-hot-toast";
import TanStackProvider from "@/Config/TanStackProvider";
import ProviderWrapper from "@/Config/AppProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TomatoAI Admin Dashboard",
  description: "AI-powered tomato disease detection system",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TanStackProvider>
            <ProviderWrapper>
              <AuthProvider>
                {children}
                <Toaster position="top-right" />
              </AuthProvider>
            </ProviderWrapper>
          </TanStackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
