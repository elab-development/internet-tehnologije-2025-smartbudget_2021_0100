"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    // TAMNA POZADINA ZA NAVBAR
    <nav className="sticky top-0 z-50 bg-gray-800/90 backdrop-blur-md border-b border-gray-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          <div className="flex items-center gap-8">
            <Link href="/wallets" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50 group-hover:scale-105 transition-transform">
                $
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SmartBudget</span>
            </Link>

            <div className="hidden md:flex gap-1">
              <Link 
                href="/wallets" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/wallets' 
                    ? 'bg-gray-700 text-blue-400' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Moji Novčanici
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
                href="/transactions/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition shadow-lg shadow-blue-900/20"
            >
                + Nova Transakcija
            </Link>

            <div className="h-6 w-px bg-gray-600 mx-1"></div>

            <div className="flex items-center gap-3">
               {user && <span className="text-sm font-semibold text-gray-300 hidden sm:block">{user.name}</span>}
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all duration-200 border border-red-500/20"
                >
                Odjavi se
                </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}