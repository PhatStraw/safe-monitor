import { Inter } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

import AuthProvider from '../components/SessionProvider'
import Nav from "../components/Nav";
import { Toaster } from "react-hot-toast";
import CustomHead from "@/components/CustomHead";


export default function RootLayout({
  children,
}) {
  return (
    <AuthProvider>
      <html lang="en">
        <CustomHead />
        <body className={`${inter.className} bg-white dark:bg-gray-900`}>
          <Nav />
          {children}
          <Analytics />
          <Toaster />
        </body>
      </html>
    </AuthProvider>
  );
}
