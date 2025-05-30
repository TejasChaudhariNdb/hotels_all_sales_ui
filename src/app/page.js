"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Smartphone, Power } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // Animated dots effect
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const who = localStorage.getItem('who');

    if (who === 'admin') {
      router.push('/admin');
    } else if (who === 'user') {
      router.push('/user');
    }
  }, [router, mounted]);

  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-6 py-8">
      
      {/* Main content */}
      <div className="text-center max-w-sm mx-auto w-full space-y-8">
        
        {/* Icon */}
        <div className="relative">
          <div className="inline-block p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl backdrop-blur-sm border border-blue-500/30">
            <Smartphone className="w-16 h-16 text-blue-400 animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2">
            <div className="p-2 bg-green-500/20 rounded-full border border-green-500/40">
              <RefreshCw className="w-5 h-5 text-green-400 animate-spin" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">
            Reopen App{dots}
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Please close and reopen the application to continue
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 space-y-4">
          <h3 className="text-white font-semibold text-lg mb-4">How to restart:</h3>
          
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm font-bold">1</span>
              </div>
              <p className="text-gray-300 text-sm">Close the app completely</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm font-bold">2</span>
              </div>
              <p className="text-gray-300 text-sm">Wait for 2-3 seconds</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm font-bold">3</span>
              </div>
              <p className="text-gray-300 text-sm">Open the app again</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            className="w-full group relative px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Try Refresh Instead
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/20 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-xl" />
          </button>
          
          <p className="text-gray-500 text-xs">
            If refresh doesn't work, please restart the app
          </p>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 text-xs">
            <Power className="w-3 h-3" />
            <span>App restart required</span>
          </div>
        </div>
      </div>
    </div>
  );
}