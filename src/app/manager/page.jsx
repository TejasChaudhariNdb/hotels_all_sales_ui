'use client'
import ManagerSales from '@/components/manager/ManagerSales';
export default function UserPage() {
  return (
    <div className="p-1">
    <ManagerSales role="manager"  hotel_type={0} />
    </div>
  )
}
