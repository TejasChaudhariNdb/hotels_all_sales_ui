"use client"
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
export default function SettingsLayout({ children }) {
  const router = useRouter();
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => router.push("/admin/settings")}
          className="p-2.5 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition active:scale-95 text-slate-700"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Settings</h1>
      </div>
      <div>{children}</div>
    </div>
  );
}
  