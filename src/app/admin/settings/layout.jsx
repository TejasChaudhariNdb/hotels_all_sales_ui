import Link from 'next/link';
export default function SettingsLayout({ children }) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className=" px-4 py-6">
        <Link href="/admin/settings/">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
          </Link>
          <div>{children}</div>
        </div>
      </div>
    );
  }
  