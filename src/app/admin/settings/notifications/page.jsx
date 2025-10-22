"use client";

import React, { useState } from "react";
import {
  BellRing,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Users,
  ShieldCheck,
  Send,
  Sparkles,
} from "lucide-react";

export default function NotificationPage() {
  // --- Reminder Notification State ---
  const [loadingReminder, setLoadingReminder] = useState(false);
  const [reminderResponse, setReminderResponse] = useState(null);
  const [reminderError, setReminderError] = useState(null);

  // --- Custom Notification State ---
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [city, setCity] = useState("");
  const [target, setTarget] = useState("all");
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [customResponse, setCustomResponse] = useState(null);
  const [customError, setCustomError] = useState(null);

  // --- Send Sales Reminder (existing) ---
  const sendReminders = async () => {
    setLoadingReminder(true);
    setReminderError(null);
    setReminderResponse(null);

    try {
      // Simulated API call - replace with: const res = await makeGet("/send-push-all");
      await new Promise(resolve => setTimeout(resolve, 1500));
      const res = {
        message: "Notifications sent successfully!",
        users_notified: 147,
        admins_notified: 12
      };
      setReminderResponse(res);
    } catch (err) {
      console.error("Error sending reminders:", err);
      setReminderError("Failed to send notifications.");
    } finally {
      setLoadingReminder(false);
    }
  };

  // --- Send Custom Notification (new) ---
  const sendCustomNotification = async () => {
    if (!title || !message) {
      setCustomError("Please enter both title and message.");
      return;
    }

    setLoadingCustom(true);
    setCustomError(null);
    setCustomResponse(null);

    try {
      // Simulated API call - replace with: const res = await makePost("/send-custom-push", {...});
      await new Promise(resolve => setTimeout(resolve, 1500));
      const res = {
        message: "Custom notification sent!",
        users_notified: 89,
        admins_notified: 8
      };
      setCustomResponse(res);
      
      // Clear form on success
      setTimeout(() => {
        setTitle("");
        setMessage("");
        setCity("");
        setTarget("all");
      }, 2000);
    } catch (err) {
      console.error(err);
      setCustomError("Failed to send custom notification.");
    } finally {
      setLoadingCustom(false);
    }
  };

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
  

      <div className="px-1 space-y-4">
        {/* -------------------- Sales Reminder Card -------------------- */}
        <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Sparkles className="text-blue-600" size={22} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">Sales Reminder</h2>
              <p className="text-sm text-gray-500 mt-0.5">Quick broadcast to all users</p>
            </div>
          </div>

          <button
            onClick={sendReminders}
            disabled={loadingReminder}
            className={`w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-white font-semibold transition-all active:scale-95 ${
              loadingReminder
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md"
            }`}
          >
            {loadingReminder ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Send to Everyone</span>
              </>
            )}
          </button>

          {/* Error */}
          {reminderError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
              <span className="text-sm">{reminderError}</span>
            </div>
          )}

          {/* Success */}
          {reminderResponse && (
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <CheckCircle size={20} />
                <span>{reminderResponse.message}</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Users size={16} />
                    <span className="text-xs font-medium">Users</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {reminderResponse.users_notified}
                  </div>
                </div>
                <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <ShieldCheck size={16} />
                    <span className="text-xs font-medium">Admins</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {reminderResponse.admins_notified}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* -------------------- Custom Notification Card -------------------- */}
        <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4 ">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <BellRing className="text-orange-600" size={22} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">Custom Message</h2>
              <p className="text-sm text-gray-500 mt-0.5">Create personalized notification</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Heera Group wishes you Happy Diwali ✨"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Message
              </label>
              <textarea
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Dear {{username}}, wishing you light & success at {{hotelname}} 🪔"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
              />
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  💡 Use <code className="bg-amber-100 px-1.5 py-0.5 rounded">{"{{username}}"}</code> and{" "}
                  <code className="bg-amber-100 px-1.5 py-0.5 rounded">{"{{hotelname}}"}</code> for personalization
                </p>
              </div>
            </div>

            {/* Target & City in Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Target */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Target
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all appearance-none bg-white"
                >
                  <option value="all">All</option>
                  <option value="users">Users</option>
                  <option value="admins">Admins</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all appearance-none bg-white"
                >
                  <option value="">All</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Nandurbar">Nandurbar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={sendCustomNotification}
            disabled={loadingCustom}
            className={`w-full py-4 rounded-xl text-white font-semibold flex justify-center items-center gap-2 transition-all active:scale-95 ${
              loadingCustom
                ? "bg-green-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
            }`}
          >
            {loadingCustom ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Send Custom Notification</span>
              </>
            )}
          </button>

          {/* Error */}
          {customError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
              <span className="text-sm">{customError}</span>
            </div>
          )}

          {/* Success */}
          {customResponse && (
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <CheckCircle size={20} />
                <span>{customResponse.message}</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Users size={16} />
                    <span className="text-xs font-medium">Users</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {customResponse.users_notified}
                  </div>
                </div>
                <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <ShieldCheck size={16} />
                    <span className="text-xs font-medium">Admins</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {customResponse.admins_notified}
                  </div>
                </div>
              </div>
            </div>
          )}
        
        </div>

     <div className="mb-30">
<br />
<br />
<br />
<br />
<br />
     </div>
      </div>
    
  
    </div>
  );
}