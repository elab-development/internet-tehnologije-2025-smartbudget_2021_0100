"use client";

import { useEffect, useState } from "react";
import Button from "./ui/Button";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Učitaj sve korisnike
  const fetchUsers = async () => {
    try {
      // 👇 DODAJ OVO 'cache: no-store'
      const res = await fetch("/api/admin/users", { cache: "no-store" }); 
      if (res.ok) {
        const data = await res.json();
        console.log("Stigli korisnici:", data); // Proveri u konzoli šta stiže
        setUsers(data);
      }
    } catch (error) {
      console.error("Greška:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Funkcija za blokiranje
  // 2. Funkcija za blokiranje (POPRAVLJENA)
  const toggleBlockStatus = async (userId: number, currentStatus: boolean) => {
    // Odmah sačuvamo novu vrednost
    const newStatus = !currentStatus;

    try {
      const res = await fetch("/api/admin/users/block", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            userId, 
            isBlocked: newStatus 
        }),
      });

      if (res.ok) {
        // --- KLJUČNA IZMENA ---
        // Umesto da čekamo spori fetchUsers(), mi ručno ažuriramo tabelu ODMAH:
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, isBlocked: newStatus } : user
          )
        );
        // -----------------------
      } else {
        alert("Greška pri promeni statusa! (Server vratio grešku)");
      }
    } catch (error) {
      console.error(error);
      alert("Greška u komunikaciji sa serverom.");
    }
  };

  if (loading) return <div className="p-8 text-white">Učitavanje korisnika...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Panel - Upravljanje korisnicima</h1>
      
      <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Ime</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Uloga</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Akcija</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700/50 transition">
                <td className="px-6 py-4 font-mono text-sm">{user.id}</td>
                <td className="px-6 py-4 font-semibold text-white">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                    {user.isBlocked ? (
                        <span className="text-red-400 font-bold flex items-center gap-1">⛔ Blokiran</span>
                    ) : (
                        <span className="text-green-400 font-bold flex items-center gap-1">✅ Aktivan</span>
                    )}
                </td>
                <td className="px-6 py-4">
                  {/* Ne dozvoljavamo da admin blokira samog sebe */}
                  {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => toggleBlockStatus(user.id, user.isBlocked)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                            user.isBlocked 
                            ? "bg-green-600 hover:bg-green-500 text-white" // Dugme za odblokiranje
                            : "bg-red-600 hover:bg-red-500 text-white"     // Dugme za blokiranje
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
  );
}