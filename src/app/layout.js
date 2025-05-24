'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from '@/context/AuthContext'
import FullScreenLoader from '@/components/FullScreenLoader'
import useTheme from '@/lib/useTheme';
import Script from 'next/script';

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
  const [theme] = useTheme();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              try {
                const saved = localStorage.getItem('theme');
                if (saved) {
                  document.documentElement.classList.add(saved);
                } else {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
                }
              } catch (e) {
                console.error('Theme initialization failed:', e);
              }
            })();
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black dark:bg-black dark:text-white transition-colors duration-300`}
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
