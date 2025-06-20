import Link from 'next/link';
export default function SettingsLayout({ children }) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className=" px-4 py-6">
          <div>{children}</div>
        </div>
      </div>
    );
  }
  