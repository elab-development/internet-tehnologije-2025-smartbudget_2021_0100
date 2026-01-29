"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// 👇 OVO JE BITNO: Uvozimo Admin komponentu
import AdminDashboard from "@/components/AdminDashboard"; 
import TransactionHistory from "@/components/TransactionHistory";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      const parsedUser = JSON.parse(userJson);
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  // 1. DOK SE UČITAVA
  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Učitavanje...</div>;
  }

  // 2. SCENARIO: GOST (Nije ulogovan) -> Prikazujemo Landing Page
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
        <h1 className="text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          SmartBudget 💰
        </h1>
        <p className="text-xl mb-12 text-gray-300 max-w-2xl leading-relaxed">
          Preuzmite kontrolu nad svojim novcem.
        </p>
        <div className="flex gap-6">
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full transition shadow-lg">
            Prijavi se
          </Link>
          <Link href="/register" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-10 rounded-full transition">
            Registracija
          </Link>
        </div>
      </div>
    );
  }

  // 3. SCENARIO: ADMIN 🛡️ (OVO JE FALILO ILI BILO NA POGREŠNOM MESTU)
  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  // 4. SCENARIO: OBIČAN KORISNIK (USER) -> Prikazujemo Dashboard
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ZAGLAVLJE */}
        <header className="border-b border-gray-800 pb-6">
            <h1 className="text-3xl font-bold">Zdravo, {user.name}! 👋</h1>
            <p className="text-gray-400 mt-1">Dobrodošli na vašu kontrolnu tablu.</p>
        </header>

        {/* GLAVNI SADRŽAJ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-xl font-bold mb-2">Brza Akcija ⚡</h3>
                 <p className="text-blue-100 mb-6 text-sm">Dodaj novi trošak ili prihod odmah.</p>
                 <Link href="/transactions/add" className="block w-full text-center bg-white text-blue-900 font-bold py-3 rounded-xl hover:bg-blue-50 transition shadow-lg">
                   + Nova Transakcija
                 </Link>
               </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <TransactionHistory />
          </div>
        </div>
      </div>
    </div>
  );
}