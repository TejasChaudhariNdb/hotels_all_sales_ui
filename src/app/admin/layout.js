"use client"

import withRoleProtection from '@/hoc/withRoleProtection'
function AdminLayout({ children }) {

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">

      <main className="flex-1 p-2">{children}</main>

    </div>
  )
}
export default withRoleProtection(AdminLayout, ['admin'])