"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import UserNav from "@/components/UserNav"
import BottomNav from "@/components/BottomNav"
export default function UserLayout({ children }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (user.role !== "user") {
      router.push("/unauthorized")
    }
  }, [user])

  if (!user || user.role !== "user") return null

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      <UserNav user={user} />

      <main className="flex-1 p-2">{children}</main>
      <BottomNav />
    </div>
  )
}
