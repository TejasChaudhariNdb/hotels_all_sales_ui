"use client"
import Sales from '@/components/Sales';
import { useAuth } from "@/context/AuthContext"
export default function SalesPage() {
  const { user } = useAuth()
  return (
   <Sales role="user" hotel_type={user.hotel_type} />
  )
}