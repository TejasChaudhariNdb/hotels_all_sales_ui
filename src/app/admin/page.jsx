'use client'

import withRoleProtection from '@/hoc/withRoleProtection'

function AdminPage() {
  return <div>Welcome Admin!</div>
}

export default withRoleProtection(AdminPage, ['admin'])
