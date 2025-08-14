import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "../components/providers/QueryClientProvider";
import AuthWrapper from "../components/auth/AuthWrapper";
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
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
