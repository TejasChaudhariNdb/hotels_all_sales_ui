'use client';

import { useState, useEffect } from 'react';
import withRoleProtection from '@/hoc/withRoleProtection';
import PinCheck from '@/components/PinCheck';

function AdminPage() {
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

  return <div>Welcome Admin! Secure content here.</div>;
}

export default withRoleProtection(AdminPage, ['admin']);
