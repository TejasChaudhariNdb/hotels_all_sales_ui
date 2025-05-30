'use client';

import { useState, useEffect, useRef } from 'react';
import { makePost } from '@/lib/api'
export default function PinCheck({onSuccess}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakingError, setShakingError] = useState(false);
  const inputRef = useRef(null);
  const correctPin = '123456'; // In production, use secure verification

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle individual PIN digits display
  const pinDisplay = Array(6).fill('').map((_, i) => (
    <div
      key={i}
      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
        pin.length > i
          ? 'border-blue-500 bg-blue-500'
          : 'border-gray-600 bg-transparent'
      }`}
    >
      {pin.length > i && (
        <div className="w-2 h-2 rounded-full bg-white"></div>
      )}
    </div>
  ));

  const handleNumpadClick = (num) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);

      // Auto-submit when 6 digits are entered
      if (newPin.length === 6) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const verifyPin = async (pinToCheck) => {
    setIsVerifying(true);
    setError('');

    try {
      // Simulate delay for API verification
      await new Promise(resolve => setTimeout(resolve, 100));

      const res = await makePost('/admin/pin', { pin: pinToCheck });
      if (res.status) {
        setIsSuccess(true);

        // Simulate redirection after successful verification
        setTimeout(() => {
          setIsSuccess(false);
          setPin('');
          setIsVerifying(false);
          onSuccess();
        }, 10);
      } else {
        throw new Error('Incorrect PIN');
      }

    } catch (err) {
      setError(err.message || 'Invalid credentials. Try again.');
      setShakingError(true);
      setPin('');
      setTimeout(() => setShakingError(false), 10600);
      setIsVerifying(false);
    }
  };


  // Create numpad buttons
  const renderNumpad = () => {
    // Create buttons for numbers 1-9
    const numButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
      <button
        key={num}
        type="button"
        onClick={() => handleNumpadClick(num.toString())}
        disabled={isVerifying || isSuccess || pin.length >= 6}
        className="w-16 h-16 rounded-full bg-gray-800 text-white text-2xl font-medium flex items-center justify-center hover:bg-gray-700 active:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
      >
        {num}
      </button>
    ));

    // Add zero button separately
    return [...numButtons];
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col justify-center items-center z-50 p-4">
      <div className={`bg-gray-900 rounded-3xl p-8 w-full max-w-sm flex flex-col items-center shadow-2xl border border-gray-800 ${
        shakingError ? 'animate-shake' : ''
      }`}>

        {/* App Logo */}
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mb-6 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-white text-xl mb-8 font-semibold">Enter App PIN</h2>

        {/* Hidden actual input for accessibility */}
        <input
          ref={inputRef}
          type="password"
          className="sr-only"
          value={pin}
          readOnly
          aria-hidden="true"
        />

        {/* PIN Dots Display */}
        <div className="flex gap-3 mb-8">
          {pinDisplay}
        </div>

        {/* Error Message */}
        <div className="h-6 mb-6">
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          {isSuccess && <p className="text-green-500 text-sm font-medium">PIN verified successfully!</p>}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {renderNumpad()}
          <div className="col-span-1"></div> {/* Empty space for alignment */}
          <button
            type="button"
            onClick={() => handleNumpadClick('0')}
            disabled={isVerifying || isSuccess || pin.length >= 6}
            className="w-16 h-16 rounded-full bg-gray-800 text-white text-2xl font-medium flex items-center justify-center hover:bg-gray-700 active:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            0
          </button>
          <div className="col-span-1"></div> {/* Empty space for alignment */}
        </div>

        {/* Backspace Button */}
        <div className="flex justify-center mt-2">
          <button
            type="button"
            onClick={handleBackspace}
            disabled={pin.length === 0 || isVerifying || isSuccess}
            className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 active:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
          </button>
        </div>

        {/* Status Indicator */}
        {isVerifying && (
          <div className="mt-6">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      <div className="text-gray-500 text-xs mt-8">
        Secure PIN Authentication
      </div>
    </div>
  );
}