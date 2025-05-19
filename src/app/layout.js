'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider ,useAuth} from '@/context/AuthContext'
import FullScreenLoader from '@/components/FullScreenLoader'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



function AuthWrapper({ children }) {
  const { loading } = useAuth()

  if (loading) return <FullScreenLoader />
  return children
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <AuthProvider>
          <AuthWrapper>
          {children}
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
