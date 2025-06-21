"use client";

import { ArrowLeft, Bell, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { registerPush } from "@/lib/registerPush";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("❌ Your browser does not support notifications.");
      return;
    }

    const result = await Notification.requestPermission();

    if (result === "granted") {
      setPermission("granted");
      await registerPush();
      alert("✅ Notifications enabled successfully!");
    } else if (result === "denied") {
      alert("❌ You blocked notifications. Please enable them from browser or phone settings.");
    } else {
      alert("Notification permission was dismissed.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/user/settings")}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
          >
            <ArrowLeft className="text-gray-700" size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <Bell className="text-blue-500" size={22} />
            <h2 className="text-lg font-medium text-gray-800">Stay Updated</h2>
          </div>
          <p className="text-gray-600 text-sm">
            We will remind you every day at <strong>10:00 PM</strong> and <strong>11:00 PM</strong> to add your hotel sales.
            Please enable notifications to stay on track.
          </p>
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <Clock size={16} className="mr-1" />
            Scheduled daily reminders
          </div>

          {permission === "granted" ? (
            <div className="text-green-600 font-medium">✅ Notifications are enabled!</div>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
              🔔 Enable Notifications
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
