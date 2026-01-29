"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = () => {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        setUser(JSON.parse(userJson));
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/"; 
  };

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LEVO: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white">
              $
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
              SmartBudget
            </span>
          </Link>

          {/* DESNO: Linkovi - OVDE JE PROMENA */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-gray-400 text-sm hidden sm:block">
                  {user.name} {user.role === 'ADMIN' && <span className="text-red-400 font-bold">(Admin)</span>}
                </span>
                
                {/* Prikazujemo "Moji Novčanici" SAMO ako NIJE Admin */}
                {user.role !== 'ADMIN' && (
                  <Link 
                    href="/wallets" 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      pathname === "/wallets" 
                        ? "bg-blue-900 text-blue-200" 
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    Moji Novčanici
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition"
                >
                  Odjavi se
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium">
                  Prijavi se
                </Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                  Registracija
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}