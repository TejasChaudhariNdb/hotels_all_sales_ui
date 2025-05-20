'use client';

import { useState } from 'react';
import withRoleProtection from '@/hoc/withRoleProtection';
import PinCheck from '@/components/PinCheck';

function AdminPage() {
  const [pinVerified, setPinVerified] = useState(false);

  if (!pinVerified) {
    return <PinCheck onSuccess={() => setPinVerified(true)} />;
  }

  return <div>Welcome Admin! Secure content here.</div>;
}

export default withRoleProtection(AdminPage, ['admin']);
