"use client";
import {
  Bell,
  ShieldCheck,
  Users,
  LogOut,
  ArrowRight,
  Settings2,
  ScrollText
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
      <SettingItem icon={<Bell />} title="Notifications" link="/admin/settings/notifications" />
      <SettingItem icon={<ShieldCheck />} title="Privacy & Security" link="/admin/settings/security" />
      <SettingItem icon={<ScrollText />} title="Activity Logs" link="/admin/settings/logs" />
      <SettingItem icon={<Settings2 />} title="Manage Categories" link="/admin/settings/categorys" />

      <Link href="/admin/settings/users"  className="flex items-center justify-between p-4 bg-white rounded-xl shadow hover:bg-gray-50">
       
          <div className="flex items-center">
            <Users className="text-blue-600 mr-3" />
            <span className="text-gray-800 font-medium">Manage Users</span>
          </div>
          <ArrowRight className="text-gray-400" />
       
      </Link>

      <Link href="/admin/settings/manager"  className="flex items-center justify-between p-4 bg-white rounded-xl shadow hover:bg-gray-50">
      
          <div className="flex items-center">
            <Users className="text-blue-600 mr-3" />
            <span className="text-gray-800 font-medium">Manage Managers</span>
          </div>
          <ArrowRight className="text-gray-400" />
    
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

function SettingItem({ icon, title ,link}) {
  return (
    <Link href={link} className="flex items-center justify-between p-4 bg-white rounded-xl shadow hover:bg-gray-50">

      <div className="flex items-center">
        <div className="text-gray-600 mr-3">{icon}</div>
        <span className="text-gray-800 font-medium">{title}</span>
      </div>
        <ArrowRight className="text-gray-400" />

    </Link>
  );
}
