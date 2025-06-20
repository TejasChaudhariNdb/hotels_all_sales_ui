'use client';



export default function ManagerNav() {


  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 bg-white/80 border-gray-200 text-gray-900 ">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className=" ">
          {/* <div className="p-2 rounded-xl transition-colors bg-gradient-to-br from-blue-500 to-indigo-600"> */}
            {/* <Hotel className="w-6 h-6 text-white" /> */}
            <img className=" h-10 text-white" src="/logo.png" />
          </div>
          <div>
            <h1 className="text-xl bg-slate-700 font-bold bg-clip-text text-transparent">
             HP Sales
            </h1>
            <p>
              Manager  Dashboard
            </p>
          </div>
        </div>

     
      </div>
    </header>
  );
}