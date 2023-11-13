import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

import AuthProvider from '../components/SessionProvider'
import Nav from "../components/Nav";
import { Toaster } from "react-hot-toast";


export default function RootLayout({
  children,
}) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={`${inter.className} bg-white dark:bg-gray-900`}>
          <Nav />
          {children}
          <Toaster />
        </body>
      </html>
    </AuthProvider>
  );
}
