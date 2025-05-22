"use client";

import { useEffect, useState } from "react";
import { UserPlus, UserRound, X } from "lucide-react";
import { makeGet } from "@/lib/api"; // Update path to where you have defined `makeGet`
import { useRouter } from "next/navigation";
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  // ✅ Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await makeGet("/admin/users");
        setUsers(data); // Ensure your API returns [{ id, name, phone, hotel: { name } }]
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Manage Users</h2>
        <button
          onClick={() => router.push("/admin/settings/users/add")}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shadow">
          <UserPlus size={16} className="mr-1" />
          Add User
        </button>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white p-4 rounded-xl shadow flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserRound className="text-blue-600" />
              <div>
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.phone}</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-medium">
              {user.hotel?.name || "No Hotel"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
