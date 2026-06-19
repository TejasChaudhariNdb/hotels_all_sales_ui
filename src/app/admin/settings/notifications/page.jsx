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
    <div className="min-h-screen pb-6 px-1 space-y-4">
      {/* -------------------- Push Status Card -------------------- */}
      {permission !== "granted" && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 rounded-2xl p-5 space-y-3 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <BellRing className="text-amber-700" size={22} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-amber-900">Enable Push Notifications</h2>
              <p className="text-sm text-amber-800 mt-0.5">
                Enable push notifications to receive real-time alerts when new sales are added.
              </p>
            </div>
          </div>
          <button
            onClick={handleEnableNotifications}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 text-center text-sm"
          >
            🔔 Enable Real-Time Alerts
          </button>
        </div>
      )}

      {/* -------------------- Sales Notification Preferences -------------------- */}
      <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <BellRing className="text-purple-600" size={22} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">Sales Notification Preferences</h2>
            <p className="text-sm text-gray-500 mt-0.5">Choose which sales entry notifications you want to receive</p>
          </div>
        </div>

        {loadingPref ? (
          <div className="flex items-center justify-center py-6 gap-2">
            <Loader2 className="animate-spin text-purple-600" size={24} />
            <span className="text-sm text-gray-500">Loading settings...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label
                className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  preferenceType === "all"
                    ? "border-purple-600 bg-purple-50/30"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="prefType"
                    value="all"
                    checked={preferenceType === "all"}
                    onChange={() => setPreferenceType("all")}
                    className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <span className="font-semibold text-gray-800 text-sm">Every Sale</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Get notified whenever sales are entered for any hotel.
                </span>
              </label>

              <label
                className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  preferenceType === "specific"
                    ? "border-purple-600 bg-purple-50/30"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="prefType"
                    value="specific"
                    checked={preferenceType === "specific"}
                    onChange={() => setPreferenceType("specific")}
                    className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <span className="font-semibold text-gray-800 text-sm">Specific Hotels</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Choose specific hotels to receive notifications for.
                </span>
              </label>

              <label
                className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  preferenceType === "none"
                    ? "border-purple-600 bg-purple-50/30"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="prefType"
                    value="none"
                    checked={preferenceType === "none"}
                    onChange={() => setPreferenceType("none")}
                    className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <span className="font-semibold text-gray-800 text-sm">Disabled</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Turn off all sales entry push notifications.
                </span>
              </label>
            </div>

            {/* Specific Hotels List */}
            {preferenceType === "specific" && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="text-sm font-semibold text-gray-700">Select Hotels:</div>
                {hotels.length === 0 ? (
                  <p className="text-xs text-gray-500">No hotels available.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {hotels.map((hotel) => {
                      const isChecked = selectedHotels.includes(hotel.id);
                      return (
                        <label
                          key={hotel.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-sm cursor-pointer transition-all ${
                            isChecked
                              ? "bg-purple-100/50 border-purple-300 text-purple-900"
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
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
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className="truncate">{hotel.name}</span>
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
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold transition-all active:scale-95 ${
                savingPref
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-md"
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
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
                <CheckCircle size={18} />
                <span>Preferences saved successfully!</span>
              </div>
            )}

            {/* Error */}
            {prefError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                <span>{prefError}</span>
              </div>
            )}
          </div>
        )}
      </div>

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
      <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">
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

          {/* Target & City */}
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

      <div className="mb-30"><br /><br /><br /><br /><br /></div>
    </div>
  );
}
