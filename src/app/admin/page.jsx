'use client';
import withRoleProtection from '@/hoc/withRoleProtection';

function AdminPage() {


  return <div>Welcome Admin! Secure content here.</div>;
}

export default withRoleProtection(AdminPage, ['admin']);
