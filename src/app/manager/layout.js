"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import ManagerNav from "@/components/manager/ManagerNav"
import ManagerBottomNav from "@/components/manager/ManagerBottomNav"
export default function UserLayout({ children }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (user.role !== "manager") {
      router.push("/unauthorized")
    }
  }, [user])

  if (!user || user.role !== "manager") return null

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      <ManagerNav user={user} />

      <main className="flex-1 p-2">{children}</main>
   <ManagerBottomNav />
    </div>
  )
}
