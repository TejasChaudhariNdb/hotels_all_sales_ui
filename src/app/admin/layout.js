"use client"
import Navbar from '@/components/AdminNav';
import BottomNav from '@/components/AdminBottomNav';
import withRoleProtection from '@/hoc/withRoleProtection'
import PinCheck from '@/components/PinCheck';
import { useState, useEffect } from 'react';
function AdminLayout({ children }) {
  const [pinVerified, setPinVerified] = useState(false);
  useEffect(() => {
    // Check if PIN is already verified in this session
    const isVerified = sessionStorage.getItem('pinVerified');
    if (isVerified === 'true') {
      setPinVerified(true);
    }
  }, []);

  const handlePinSuccess = () => {
    sessionStorage.setItem('pinVerified', 'true');
    setPinVerified(true);
  };

  if (!pinVerified) {
    return <PinCheck onSuccess={handlePinSuccess} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">

<Navbar />
      <main className="flex-1 p-4 pb-16">{children}</main>
      <BottomNav />
    </div>
  )
}
export default withRoleProtection(AdminLayout, ['admin'])