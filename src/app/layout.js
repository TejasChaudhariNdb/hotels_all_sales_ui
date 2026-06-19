'use client'
import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from '@/context/AuthContext'
import FullScreenLoader from '@/components/FullScreenLoader'
import useTheme from '@/lib/useTheme';
import Script from 'next/script';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  useEffect(() => {
    // Automatically unregister stale service workers in development mode to prevent Workbox caching errors
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'development') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <title>HP APP</title>
      <link rel="manifest" href="/manifest.json" />
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black  transition-colors duration-300`}
        suppressHydrationWarning
      >
         <AuthProvider>
          <AuthWrapper>
          <ToastContainer position="top-right" autoClose={3000} />;
          {children}
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
