"use client";

import {
  Bell,
  Globe,
  ShieldCheck,
  Settings,
  UserPlus,
  Users,
  LogOut,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function SettingsPage() {
  const router = useRouter();

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/super");
  };

  return (
    <div className="space-y-3">
      <SettingItem icon={<Bell />} title="Notifications" />
      <SettingItem icon={<Globe />} title="Language" />
      <SettingItem icon={<ShieldCheck />} title="Privacy & Security" />
      <SettingItem icon={<Settings />} title="App Preferences" />
      <SettingItem icon={<UserPlus />} title="Invite a Friend" />

      <Link href="/admin/settings/users">
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow hover:bg-gray-50">
          <div className="flex items-center">
            <Users className="text-blue-600 mr-3" />
            <span className="text-gray-800 font-medium">Manage Users</span>
          </div>
          <ArrowRight className="text-gray-400" />
        </div>
      </Link>

      <button
        onClick={logout}
        className="w-full mt-10 py-3 text-center bg-red-50 text-red-600 font-medium rounded-xl shadow hover:bg-red-100">
        <LogOut className="inline-block mr-2" size={18} />
        Logout
      </button>
    </div>
  );
}

function SettingItem({ icon, title }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow hover:bg-gray-50">
      <div className="flex items-center">
        <div className="text-gray-600 mr-3">{icon}</div>
        <span className="text-gray-800 font-medium">{title}</span>
      </div>
      <ArrowRight className="text-gray-400" />
    </div>
  );
}
