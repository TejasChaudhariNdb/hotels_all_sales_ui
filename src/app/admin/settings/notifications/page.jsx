"use client";

import React, { useState } from "react";
import { makeGet } from "@/lib/api";
import {
  BellRing,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Users,
  ShieldCheck,
} from "lucide-react";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const sendReminders = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await makeGet("/send-push-all");
      setResponse(res);
    } catch (err) {
      console.error("Error sending reminders:", err);
      setError("Failed to send notifications.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6 space-y-6 border border-gray-100">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <BellRing className="text-blue-600" size={28} />
          <h2 className="text-xl font-semibold text-gray-800">
            Send Sales Reminder Notifications
          </h2>
        </div>

        {/* Button */}
        <button
          onClick={sendReminders}
          disabled={loading}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-xl text-white font-semibold transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Sending...
            </>
          ) : (
            <>
              <BellRing className="mr-2" size={20} />
              Send Notification to All
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {/* Success Block */}
        {response && (
          <div className="p-4 bg-green-50 text-green-700 border border-green-100 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle size={18} />
              {response.message}
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                <span className="text-gray-700">
                  Users Notified:
                </span>
                <span className="font-semibold text-blue-700">
                  {response.users_notified}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-purple-600" />
                <span className="text-gray-700">
                  Admins Notified:
                </span>
                <span className="font-semibold text-purple-700">
                  {response.admins_notified}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
