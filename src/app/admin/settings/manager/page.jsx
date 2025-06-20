"use client";

import { useEffect, useState } from "react";
import { UserPlus, UserRound } from "lucide-react";
import { makeGet } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ManagersPage() {
  const [managers, setManagers] = useState([]);
  const router = useRouter();

  // Fetch managers with their assigned hotels
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const data = await makeGet("/admin/managers"); // Adjust API path if needed
        setManagers(data);
      } catch (err) {
        console.error("Failed to fetch managers:", err);
      }
    };

    fetchManagers();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Manage Managers</h2>
        <button
          onClick={() => router.push("/admin/settings/manager/add")}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shadow">
          <UserPlus size={16} className="mr-1" />
          Add Manager
        </button>
      </div>

      {/* Managers List */}
      <div className="space-y-3">
        {managers.map((manager) => (
          <div
            key={manager.id}
            className="bg-white p-4 rounded-xl shadow flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            {/* Left: Manager Info */}
            <div className="flex items-center space-x-3">
              <UserRound className="text-blue-600" />
              <div>
                <p className="font-semibold text-gray-800">{manager.name}</p>
                <p className="text-sm text-gray-500">{manager.phone}</p>
              </div>
            </div>

            {/* Right: Assigned Hotels */}
            <div className="flex flex-wrap gap-1">
              {manager.managed_hotels?.length > 0 ? (
                manager.managed_hotels.map((hotel) => (
                  <span
                    key={hotel.id}
                    className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded-lg font-medium">
                    {hotel.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-rose-500 font-medium">No Hotels Assigned</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
