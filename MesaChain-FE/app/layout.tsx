import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "../components/providers/QueryClientProvider";
import AuthWrapper from "../components/auth/AuthWrapper";
import NotificationHub from "../components/NotificationHub";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MesaChain",
  description: "MesaChain - Blockchain Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-x-hidden`}>
        <Providers>
          <AuthWrapper>
            {children}
          </AuthWrapper>
          <NotificationHub />
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
