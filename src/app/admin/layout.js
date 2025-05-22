"use client"
import Navbar from '@/components/AdminNav';
import BottomNav from '@/components/AdminBottomNav';
import withRoleProtection from '@/hoc/withRoleProtection'
function AdminLayout({ children }) {

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">

<Navbar />
      <main className="flex-1 p-4 pb-16">{children}</main>
      <BottomNav />
    </div>
  )
}
export default withRoleProtection(AdminLayout, ['admin'])