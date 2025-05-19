'use client'

import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function withRoleProtection(WrappedComponent, allowedRoles = []) {
  return function ProtectedComponent(props) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        console.log(user)
      if (!loading) {
        if (!user) {
          router.push('/login')
        } else if (!allowedRoles.includes(user.role)) {
          router.push('/unauthorized')
        }
      }
    }, [user, loading])

    if (loading) return <div className="p-4 text-center">Loading...</div>

    if (!user || !allowedRoles.includes(user.role)) return null

    return <WrappedComponent {...props} />
  }
}
