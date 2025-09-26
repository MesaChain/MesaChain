import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "../components/providers/QueryClientProvider";
import AuthWrapper from "../components/auth/AuthWrapper";
import "./globals.css";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificatonUI from "@/components/notification/NotificatonUI";

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
        <NotificationProvider
          storageKey="demo-notifications"
          maxVisible={5}
          enableWebSocket={false}
        >
          <Providers>
            <AuthWrapper>
              {children}
            </AuthWrapper>
          </Providers>
        <NotificatonUI />
        </NotificationProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
