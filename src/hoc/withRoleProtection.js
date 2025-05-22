'use client'

import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function withRoleProtection(WrappedComponent, allowedRoles = []) {
  return function ProtectedComponent(props) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
      if (!loading) {
        if (!user) {
          // Redirect based on the current pathname
          if (pathname.startsWith('/user')) {
            router.push('/login')
          } else if (pathname.startsWith('/admin')) {
            router.push('/super')
          } else {
            router.push('/login') // default fallback
          }
        } else if (!allowedRoles.includes(user.role)) {
          router.push('/unauthorized')
        }
      }
    }, [user, loading, pathname])

    if (loading) return <div className="p-4 text-center">Loading...</div>

    if (!user || !allowedRoles.includes(user.role)) return null

    return <WrappedComponent {...props} />
  }
}
