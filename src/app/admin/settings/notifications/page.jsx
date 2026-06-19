"use client";

import React, { useState, useEffect } from "react";
import { makeGet, makePost } from "@/lib/api";
import { registerPush } from "@/lib/registerPush";
import {
  BellRing,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Users,
  ShieldCheck,
  Send,
  Sparkles,
  ChevronDown
} from "lucide-react";

export default function NotificationPage() {
  // --- Push Permission State ---
  const [permission, setPermission] = useState("default");

  // --- Preference Settings State ---
  const [hotels, setHotels] = useState([]);
  const [preferenceType, setPreferenceType] = useState("all"); // 'all', 'none', 'specific'
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [loadingPref, setLoadingPref] = useState(true);
  const [savingPref, setSavingPref] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);
  const [prefError, setPrefError] = useState(null);

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

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }

    const fetchData = async () => {
      try {
        setLoadingPref(true);
        // Fetch hotels
        const hotelsRes = await makeGet("/admin/hotels");
        setHotels(hotelsRes.data || []);

        // Fetch settings
        const settingsRes = await makeGet("/admin/notification-settings");
        const val = settingsRes.notify_hotel_ids;
        if (val === null) {
          setPreferenceType("all");
          setSelectedHotels([]);
        } else if (Array.isArray(val) && val.length === 0) {
          setPreferenceType("none");
          setSelectedHotels([]);
        } else if (Array.isArray(val)) {
          setPreferenceType("specific");
          setSelectedHotels(val);
        }
      } catch (err) {
        console.error("Failed to load settings or hotels", err);
        setPrefError("Failed to load notification settings.");
      } finally {
        setLoadingPref(false);
      }
    };

    fetchData();
  }, []);

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("❌ Your browser does not support notifications.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      try {
        await registerPush();
        alert("✅ Notifications enabled successfully!");
      } catch (err) {
        console.error("Failed to register push", err);
        alert("❌ Failed to register push subscription on backend.");
      }
    } else if (result === "denied") {
      alert("❌ You blocked notifications. Please enable them from browser or phone settings.");
    }
  };

  const savePreferences = async () => {
    setSavingPref(true);
    setPrefError(null);
    setPrefSuccess(false);

    let payloadIds = null;
    if (preferenceType === "none") {
      payloadIds = [];
    } else if (preferenceType === "specific") {
      if (selectedHotels.length === 0) {
        setPrefError("Please select at least one hotel, or choose another option.");
        setSavingPref(false);
        return;
      }
      payloadIds = selectedHotels;
    }

    try {
      await makePost("/admin/notification-settings", {
        notify_hotel_ids: payloadIds,
      });
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving notification preferences", err);
      setPrefError("Failed to save preferences. Please try again.");
    } finally {
      setSavingPref(false);
    }
  };

  // --- Send Sales Reminder (existing) ---
  const sendReminders = async () => {
    setLoadingReminder(true);
    setReminderError(null);
    setReminderResponse(null);

    try {
      // Real API call
      const res = await makeGet("/send-push-all");
      setReminderResponse(res);
    } catch (err) {
      console.error("Error sending reminders:", err);
      setReminderError("Failed to send notifications.");
    } finally {
      setLoadingReminder(false);
    }
  };

  // --- Send Custom Notification ---
  const sendCustomNotification = async () => {
    if (!title || !message) {
      setCustomError("Please enter both title and message.");
      return;
    }

    setLoadingCustom(true);
    setCustomError(null);
    setCustomResponse(null);

    try {
      // Real API call
      const res = await makePost("/send-custom-push", {
        title,
        message,
        city,
        target,
      });
      setCustomResponse(res);

      // Clear form on success after 2s
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
    <div className="max-w-4xl mx-auto pb-12 px-1 space-y-6">
      {/* -------------------- Push Status Card -------------------- */}
      {permission !== "granted" && (
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100/80 rounded-2xl shadow-inner">
              <BellRing className="text-amber-800" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-amber-900">Enable Push Notifications</h2>
              <p className="text-sm text-amber-800/90 mt-1 leading-relaxed">
                Enable push notifications to receive real-time alerts on your device whenever new sales are uploaded.
              </p>
            </div>
          </div>
          <button
            onClick={handleEnableNotifications}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transition-all active:scale-95 text-center text-sm"
          >
            🔔 Enable Real-Time Alerts
          </button>
        </div>
      )}

      {/* -------------------- Sales Notification Preferences -------------------- */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-50 rounded-2xl">
            <BellRing className="text-purple-600" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Sales Notification Preferences</h2>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">Choose which sales entry notifications you want to receive</p>
          </div>
        </div>

        {loadingPref ? (
          <div className="flex items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-purple-600" size={26} />
            <span className="text-sm text-gray-500 font-semibold">Loading settings...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label
                className={`flex flex-col p-5 rounded-2xl cursor-pointer transition-all duration-300 ${preferenceType === "all"
                    ? "bg-purple-50/60 shadow-sm shadow-purple-500/5 ring-2 ring-purple-600/20 scale-[1.01]"
                    : "bg-slate-50 hover:bg-slate-100/80 text-gray-700"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="prefType"
                    value="all"
                    checked={preferenceType === "all"}
                    onChange={() => setPreferenceType("all")}
                    className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <span className="font-extrabold text-gray-800 text-sm tracking-wide">Every Sale</span>
                </div>
                <span className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Get notified whenever sales are entered for any hotel.
                </span>
              </label>

              <label
                className={`flex flex-col p-5 rounded-2xl cursor-pointer transition-all duration-300 ${preferenceType === "specific"
                    ? "bg-purple-50/60 shadow-sm shadow-purple-500/5 ring-2 ring-purple-600/20 scale-[1.01]"
                    : "bg-slate-50 hover:bg-slate-100/80 text-gray-700"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="prefType"
                    value="specific"
                    checked={preferenceType === "specific"}
                    onChange={() => setPreferenceType("specific")}
                    className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <span className="font-extrabold text-gray-800 text-sm tracking-wide">Specific Hotels</span>
                </div>
                <span className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Choose specific hotels to receive notifications for.
                </span>
              </label>

              <label
                className={`flex flex-col p-5 rounded-2xl cursor-pointer transition-all duration-300 ${preferenceType === "none"
                    ? "bg-purple-50/60 shadow-sm shadow-purple-500/5 ring-2 ring-purple-600/20 scale-[1.01]"
                    : "bg-slate-50 hover:bg-slate-100/80 text-gray-700"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="prefType"
                    value="none"
                    checked={preferenceType === "none"}
                    onChange={() => setPreferenceType("none")}
                    className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <span className="font-extrabold text-gray-800 text-sm tracking-wide">Disabled</span>
                </div>
                <span className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Turn off all sales entry push notifications.
                </span>
              </label>
            </div>

            {/* Specific Hotels List */}
            {preferenceType === "specific" && (
              <div className="p-5 bg-slate-50/60 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-sm font-extrabold text-gray-700 tracking-wide">Select Hotels:</div>
                {hotels.length === 0 ? (
                  <p className="text-xs text-gray-400 font-semibold">No hotels available.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {hotels.map((hotel) => {
                      const isChecked = selectedHotels.includes(hotel.id);
                      return (
                        <label
                          key={hotel.id}
                          className={`flex items-center gap-3 p-3.5 rounded-xl text-sm cursor-pointer transition-all duration-200 ${isChecked
                              ? "bg-purple-100/40 text-purple-950 font-bold shadow-sm"
                              : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedHotels([...selectedHotels, hotel.id]);
                              } else {
                                setSelectedHotels(selectedHotels.filter((id) => id !== hotel.id));
                              }
                            }}
                            className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                          />
                          <span className="truncate tracking-wide">{hotel.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={savePreferences}
              disabled={savingPref}
              className={`w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-white font-extrabold tracking-wide transition-all active:scale-[0.98] ${savingPref
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-600/10"
                }`}
            >
              {savingPref ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Saving Preferences...</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>

            {/* Success */}
            {prefSuccess && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-200">
                <CheckCircle size={18} className="text-emerald-600" />
                <span>Preferences saved successfully!</span>
              </div>
            )}

            {/* Error */}
            {prefError && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 text-rose-800 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-200">
                <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-rose-600" />
                <span>{prefError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* -------------------- Sales Reminder Card -------------------- */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Sparkles className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Sales Reminder</h2>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">Broadcast quick push notifications to all users</p>
          </div>
        </div>

        <button
          onClick={sendReminders}
          disabled={loadingReminder}
          className={`w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-white font-extrabold tracking-wide transition-all active:scale-[0.98] ${loadingReminder
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-600/10"
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
          <div className="flex items-start gap-3 p-4 bg-rose-50 text-rose-800 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-rose-600" />
            <span>{reminderError}</span>
          </div>
        )}

        {/* Success */}
        {reminderResponse && (
          <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
              <CheckCircle size={20} className="text-emerald-600" />
              <span>{reminderResponse.message}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Users size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Users</span>
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {reminderResponse.users_notified}
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Admins</span>
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {reminderResponse.admins_notified}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* -------------------- Custom Notification Card -------------------- */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-50 rounded-2xl">
            <BellRing className="text-orange-600" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Custom Message</h2>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">Create and send custom push notifications</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
              Notification Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Heera Group wishes you Happy Diwali ✨"
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-2xl px-4.5 py-3.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-slate-800 font-medium"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
              Message Content
            </label>
            <textarea
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Dear {{username}}, wishing you light & success at {{hotelname}} 🪔"
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-2xl px-4.5 py-3.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all resize-none text-slate-800 font-medium leading-relaxed"
            />
            <div className="mt-3 p-3 bg-amber-50/70 rounded-2xl">
              <p className="text-xs text-amber-800 flex items-center gap-1.5 font-medium leading-relaxed">
                💡 Hint: Use <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono font-bold text-amber-900">{"{{username}}"}</code> and{" "}
                <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono font-bold text-amber-900">{"{{hotelname}}"}</code> for personalization
              </p>
            </div>
          </div>

          {/* Target & City */}
          <div className="grid grid-cols-2 gap-4">
            {/* Target */}
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
                Target Group
              </label>
              <div className="relative">
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all appearance-none text-slate-800 font-bold"
                >
                  <option value="all">All</option>
                  <option value="users">Users Only</option>
                  <option value="admins">Admins Only</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
                City Filter
              </label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all appearance-none text-slate-800 font-bold"
                >
                  <option value="">All Cities</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Nandurbar">Nandurbar</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={sendCustomNotification}
          disabled={loadingCustom}
          className={`w-full py-4 rounded-2xl text-white font-extrabold tracking-wide flex justify-center items-center gap-2 transition-all active:scale-[0.98] ${loadingCustom
              ? "bg-emerald-400 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/10"
            }`}
        >
          {loadingCustom ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Sending Custom Message...</span>
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
          <div className="flex items-start gap-3 p-4 bg-rose-50 text-rose-800 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-rose-600" />
            <span>{customError}</span>
          </div>
        )}

        {/* Success */}
        {customResponse && (
          <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
              <CheckCircle size={20} className="text-emerald-600" />
              <span>{customResponse.message}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Users size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Users</span>
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {customResponse.users_notified}
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Admins</span>
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {customResponse.admins_notified}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-10"></div>
    </div>
  );
}
