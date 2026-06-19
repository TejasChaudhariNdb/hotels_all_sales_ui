"use client";
import {
  Bell,
  ShieldCheck,
  Users,
  LogOut,
  ArrowRight,
  Settings2,
  ScrollText,
  WalletCards,
  BetweenVerticalEnd
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
    <div className="max-w-4xl mx-auto space-y-3">
      <SettingItem 
        icon={<Bell size={18} />} 
        title="Notifications" 
        link="/admin/settings/notifications" 
        accentClass="bg-purple-50 text-purple-600"
      />
      <SettingItem 
        icon={<ShieldCheck size={18} />} 
        title="Privacy & Security" 
        link="/admin/settings/security" 
        accentClass="bg-indigo-50 text-indigo-600"
      />
      <SettingItem 
        icon={<ScrollText size={18} />} 
        title="Activity Logs" 
        link="/admin/settings/logs" 
        accentClass="bg-slate-100 text-slate-650"
      />
      <SettingItem 
        icon={<WalletCards size={18} />} 
        title="Monthly Expense" 
        link="/admin/exp/" 
        accentClass="bg-emerald-50 text-emerald-600"
      />
      <SettingItem 
        icon={<Settings2 size={18} />} 
        title="Manage Categories" 
        link="/admin/settings/categorys" 
        accentClass="bg-orange-50 text-orange-600"
      />
      
      <SettingItem 
        icon={<Users size={18} />} 
        title="Manage Users" 
        link="/admin/settings/users" 
        accentClass="bg-blue-50 text-blue-600"
      />

      <SettingItem 
        icon={<Users size={18} />} 
        title="Manage Managers" 
        link="/admin/settings/manager" 
        accentClass="bg-sky-50 text-sky-600"
      />

      <SettingItem 
        icon={<BetweenVerticalEnd size={18} />} 
        title="Compare Hotels" 
        link="/admin/compare-hotels" 
        accentClass="bg-teal-50 text-teal-600"
      />

      <button
        onClick={logout}
        className="w-full mt-6 py-3.5 text-center bg-rose-50 hover:bg-rose-100/70 text-rose-600 font-extrabold rounded-2xl shadow-sm transition-all active:scale-[0.98]"
      >
        <LogOut className="inline-block mr-2" size={16} />
        Sign Out
      </button>
    </div>
  );
}

function SettingItem({ icon, title, link, accentClass }) {
  return (
    <Link 
      href={link} 
      className="flex items-center justify-between p-3.5 bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-md hover:scale-[1.005] transition-all duration-200"
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-xl mr-3.5 ${accentClass}`}>
          {icon}
        </div>
        <span className="text-slate-850 font-bold text-sm tracking-wide">{title}</span>
      </div>
      <ArrowRight className="text-slate-400" size={16} />
    </Link>
  );
}
