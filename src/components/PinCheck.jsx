'use client';

import { useState, useEffect } from 'react';
import { Lock, Fingerprint, ScanFace } from 'lucide-react';

export default function PinCheck({ onSuccess }) {
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(true);

  // Trigger biometric prompt immediately on load
  useEffect(() => {
    if (typeof window !== "undefined" && window.PublicKeyCredential) {
      setIsBiometricSupported(true);
      const timer = setTimeout(() => {
        authenticateBiometrics();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsBiometricSupported(false);
      setError("Native lock screen is not supported on this browser or device.");
    }
  }, []);

  const authenticateBiometrics = async () => {
    setError('');
    setIsAuthenticating(true);

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Trigger OS biometric / passcode prompt
      await navigator.credentials.get({
        publicKey: {
          challenge,
          userVerification: "required",
        },
      });

      // Verification successful
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsAuthenticating(false);
        onSuccess();
      }, 200);

    } catch (err) {
      console.error("Biometric authentication failed:", err);
      setError("Authentication failed. Tap the button to retry.");
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 to-slate-900 flex flex-col justify-center items-center z-50 p-4">
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-8 w-full max-w-sm flex flex-col items-center shadow-2xl border border-slate-800/80 transition-all duration-300">
        
        {/* App Logo / Biometric Indicator */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-blue-600/10 rounded-3xl border border-blue-500/30 flex items-center justify-center shadow-inner shadow-blue-500/5">
            {isSuccess ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : isAuthenticating ? (
              <Fingerprint className="w-10 h-10 text-blue-500 animate-pulse" />
            ) : (
              <Lock className="w-10 h-10 text-blue-500" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-white text-xl mb-2 font-bold tracking-tight">App Locked</h2>
        <p className="text-slate-400 text-xs text-center mb-8 max-w-[240px] leading-relaxed">
          Please verify your identity using your device Face ID, Touch ID, or lockscreen passcode to unlock the Admin Panel.
        </p>

        {/* Biometrics Action Panel */}
        <div className="w-full flex flex-col items-center space-y-4">
          <button
            onClick={authenticateBiometrics}
            disabled={isAuthenticating || isSuccess || !isBiometricSupported}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/40 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 text-sm"
          >
            {isAuthenticating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <ScanFace size={18} />
                <span>Unlock App</span>
              </>
            )}
          </button>
        </div>

        {/* Error / Status Messages */}
        <div className="h-6 mt-6 text-center">
          {error && <p className="text-rose-500 text-xs font-bold leading-relaxed">{error}</p>}
          {isSuccess && <p className="text-emerald-500 text-sm font-bold">Identity verified!</p>}
        </div>

      </div>

      <div className="text-slate-500 text-xs mt-8 font-semibold tracking-wider uppercase">
        Secure Device Authentication
      </div>
    </div>
  );
}