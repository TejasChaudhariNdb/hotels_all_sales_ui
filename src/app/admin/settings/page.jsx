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
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/super");
  };

  const settingsGroups = [
    {
      title: "Analytics & Finance",
      items: [
        {
          icon: <WalletCards size={18} />,
          title: "Monthly Expense",
          description: "View and track operational hotel costs",
          link: "/admin/exp/",
          accentClass: "bg-emerald-50 text-emerald-600 border-emerald-100/50",
        },
        {
          icon: <BetweenVerticalEnd size={18} />,
          title: "Compare Hotels",
          description: "Analyze metrics and performance across properties",
          link: "/admin/compare-hotels",
          accentClass: "bg-teal-50 text-teal-600 border-teal-100/50",
        },
      ],
    },
    {
      title: "System Administration",
      items: [
        {
          icon: <Settings2 size={18} />,
          title: "Manage Categories",
          description: "Configure sales and business categories",
          link: "/admin/settings/categorys",
          accentClass: "bg-orange-50 text-orange-600 border-orange-100/50",
        },
        {
          icon: <Users size={18} />,
          title: "Manage Users",
          description: "Add, edit, or manage hotel receptionist roles",
          link: "/admin/settings/users",
          accentClass: "bg-blue-50 text-blue-600 border-blue-100/50",
        },
        {
          icon: <Users size={18} />,
          title: "Manage Managers",
          description: "Oversee hotel manager account profiles",
          link: "/admin/settings/manager",
          accentClass: "bg-sky-50 text-sky-600 border-sky-100/50",
        },
        {
          icon: <ScrollText size={18} />,
          title: "Activity Logs",
          description: "Audit action trails and system logs",
          link: "/admin/settings/logs",
          accentClass: "bg-slate-100 text-slate-700 border-slate-200/50",
        },
      ],
    },
    {
      title: "Account & Preferences",
      items: [
        {
          icon: <Bell size={18} />,
          title: "Notifications",
          description: "Manage system push notifications and alerts",
          link: "/admin/settings/notifications",
          accentClass: "bg-purple-50 text-purple-600 border-purple-100/50",
        },
        {
          icon: <ShieldCheck size={18} />,
          title: "Privacy & Security",
          description: "Update password and secure configurations",
          link: "/admin/settings/security",
          accentClass: "bg-indigo-50 text-indigo-600 border-indigo-100/50",
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 px-2 md:px-0">
      {/* Header Profile Summary */}
      {user && (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100/80 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/10">
            {user.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800">{user.name || "Administrator"}</h2>
            <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {user.role || "Admin"}
              </span>
              <span>•</span>
              <span>{user.phone}</span>
            </p>
          </div>
        </div>
      )}

      {/* Settings Grid / Group List */}
      <div className="space-y-6">
        {settingsGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1.5">
              {group.title}
            </h3>
            <div className="bg-white border border-slate-100/80 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-50">
              {group.items.map((item, iIdx) => (
                <Link
                  key={iIdx}
                  href={item.link}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${item.accentClass}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-slate-800 font-bold text-sm md:text-base leading-snug">
                        {item.title}
                      </span>
                      <span className="block text-xs text-slate-400 font-medium truncate max-w-[220px] sm:max-w-md md:max-w-lg mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0"
                    size={16}
                  />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout Action Button */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full py-4 text-center bg-rose-50 hover:bg-rose-100/60 text-rose-600 font-extrabold rounded-2xl shadow-sm border border-rose-100/50 hover:border-rose-200/50 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
