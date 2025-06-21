"use client"
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
export default function SettingsLayout({ children }) {
  const router = useRouter();
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className=" px-4 py-6">
        <Link href="/admin/settings/">
          <div className="flex items-center space-x-3  mb-6">
          <button
            onClick={() => router.push("/admin/settings")}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
          >
            <ArrowLeft className="text-gray-700" size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        </div>

          </Link>
          <div>{children}</div>
        </div>
      </div>
    );
  }
  