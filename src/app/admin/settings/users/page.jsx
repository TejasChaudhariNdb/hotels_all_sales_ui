"use client";

import { useEffect, useState } from "react";
import { UserPlus, UserRound, Bell, BellOff, ChevronRight } from "lucide-react";
import { makeGet } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await makeGet("/admin/users");
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    router.push("/admin/settings/users/add");
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header with sticky positioning */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Users</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {users.length} {users.length === 1 ? 'user' : 'users'} total
            </p>
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg active:scale-95 transition-all">
            <UserPlus size={18} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className=" pt-4">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <UserRound className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-sm">No users yet</p>
            <p className="text-gray-400 text-xs mt-1">Tap "Add" to create your first user</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
               
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-98 active:shadow transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  {/* Left Side - User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-base">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* User Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-base truncate">
                        {user.name}
                      </p>
                      {/* <p className="text-sm text-gray-500 truncate">
                        {user.phone}
                        
                      </p> */}

                            {/* Hotel Name */}
                            <div className="flex items-center gap-1.5 mt-1">
                            <span  className="text-sm text-gray-500 truncate">{user.phone}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          user.hotel?.name 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {user.hotel?.name || "No Hotel"}
                        </span>
                      </div>

                
                    </div>
                  </div>

                  {/* Right Side - Notification Icon + Chevron */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    
                    {user.notification ? (
                      <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center">
                        <Bell className="text-blue-600" size={18} />
                      </div>
                    ) : (
                      <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center">
                        <BellOff className="text-gray-400" size={18} />
                      </div>
                    )}
                  
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}