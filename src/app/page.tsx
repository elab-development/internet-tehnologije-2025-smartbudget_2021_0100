"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminDashboard from "@/components/AdminDashboard"; 
import TransactionHistory from "@/components/TransactionHistory";
import DashboardStats from "@/components/DashboardStats";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      const parsedUser = JSON.parse(userJson);
      setUser(parsedUser);
      // Odmah učitavamo transakcije
      fetchTransactions(parsedUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = async (userId: number) => {
    try {
      const res = await fetch(`/api/transactions?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Učitavanje...</div>;
  }

  // 2. SCENARIO: GOST (Nije ulogovan)
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

  // 3. SCENARIO: ADMIN
  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  // 4. SCENARIO: OBIČAN KORISNIK (USER)
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ZAGLAVLJE */}
        <header className="border-b border-gray-800 pb-6 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold">Zdravo, {user.name}! 👋</h1>
                <p className="text-gray-400 mt-1">Evo tvog finansijskog preseka.</p>
            </div>
            <Link href="/transactions/add" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition hidden sm:block">
                + Nova Transakcija
            </Link>
        </header>

        {/* GLAVNI SADRŽAJ - GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEVO: DASHBOARD*/}
          <div className="lg:col-span-1 h-full">
            <DashboardStats transactions={transactions} />
          </div>

          {/* DESNO: ISTORIJA TRANSAKCIJA */}
          <div className="lg:col-span-2">
            
            <TransactionHistory />
          </div>
        </div>
      </div>
    </div>
  );
}