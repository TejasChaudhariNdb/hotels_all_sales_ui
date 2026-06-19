"use client"
import Navbar from '@/components/AdminNav';
import BottomNav from '@/components/AdminBottomNav';
import Sidebar from '@/components/AdminSidebar';
import withRoleProtection from '@/hoc/withRoleProtection'
import PinCheck from '@/components/PinCheck';
import { useState, useEffect } from 'react';

function AdminLayout({ children }) {
  const [pinVerified, setPinVerified] = useState(false);
  const [loadingLockState, setLoadingLockState] = useState(true);

  useEffect(() => {
    // Check if biometric app lock is active on this device
    const isLockEnabled = localStorage.getItem('heera_admin_lock_enabled') === 'true';
    const isVerified = sessionStorage.getItem('pinVerified') === 'true';

    if (!isLockEnabled || isVerified) {
      setPinVerified(true);
    }
    setLoadingLockState(false);
  }, []);

  const handlePinSuccess = () => {
    sessionStorage.setItem('pinVerified', 'true');
    setPinVerified(true);
  };

  if (loadingLockState) {
    return null;
  }

  if (!pinVerified) {
    return <PinCheck onSuccess={handlePinSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop / Laptop (hidden on mobile) */}
      <Sidebar />

      <div className="flex-1 flex flex-col md:min-h-screen">
        {/* Top Navbar for Mobile (hidden on desktop) */}
        <div className="md:hidden">
          <Navbar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 px-2 py-2 pb-24 md:pb-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Bottom Nav for Mobile (hidden on desktop) */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
export default withRoleProtection(AdminLayout, ['admin'])