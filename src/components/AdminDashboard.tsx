"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import AdminCategories from "@/components/AdminCategories"; // UVOZIMO NOVU KOMPONENTU

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // NOVO: Stanje za tabove
  const [activeTab, setActiveTab] = useState<"USERS" | "CATEGORIES">("USERS");

  // Funkcija za učitavanje korisnika (kopirana iz starog koda)
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlock = async (userId: number, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/users/block", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isBlocked: !currentStatus }),
      });

      if (res.ok) {
        // Optimistički update (odmah menjamo boju da ne čekamo refresh)
        setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !currentStatus } : u));
      } else {
        alert("Greška pri menjanju statusa.");
      }
    } catch (error) {
      alert("Greška na serveru.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard 🛡️</h1>

        {/* --- TABOVI --- */}
        <div className="flex gap-4 mb-8 border-b border-gray-700 pb-1">
          <button 
            onClick={() => setActiveTab("USERS")}
            className={`px-6 py-2 font-bold rounded-t-lg transition ${
              activeTab === "USERS" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            👥 Korisnici
          </button>
          <button 
            onClick={() => setActiveTab("CATEGORIES")}
            className={`px-6 py-2 font-bold rounded-t-lg transition ${
              activeTab === "CATEGORIES" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            📂 Kategorije
          </button>
        </div>

        {/* --- PRIKAZ SADRŽAJA --- */}
        {activeTab === "CATEGORIES" ? (
          // Ako je izabran tab Kategorije, prikaži novu komponentu
          <AdminCategories />
        ) : (
          // Ako je izabran tab Korisnici, prikaži tabelu (STARI KOD)
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Ime</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Uloga</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Akcija</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 text-sm">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-gray-500">#{user.id}</td>
                      <td className="px-6 py-4 font-bold">{user.name}</td>
                      <td className="px-6 py-4 text-gray-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${user.role === 'ADMIN' ? 'bg-purple-900 text-purple-200' : 'bg-gray-700 text-gray-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.isBlocked ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                          {user.isBlocked ? "BLOKIRAN ⛔" : "AKTIVAN ✅"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleBlock(user.id, user.isBlocked)}
                            className={`px-3 py-1 rounded text-xs font-bold transition ${
                              user.isBlocked 
                                ? "bg-green-600 hover:bg-green-700 text-white" 
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                          >
                            {user.isBlocked ? "Odblokiraj" : "Blokiraj"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}