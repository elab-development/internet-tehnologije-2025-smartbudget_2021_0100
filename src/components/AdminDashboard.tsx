"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);

  // Učitavamo sve korisnike (SK18)
  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleBlock = async (userId: number) => {
    // Ovde ćemo kasnije dodati logiku za blokiranje (SK19)
    alert(`Blokiranje korisnika ID: ${userId} - Uskoro!`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-red-500">Admin Panel 🛡️</h1>
          <p className="text-gray-400">Upravljanje korisnicima i sistemom</p>
        </header>

        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">Lista Korisnika</h2>
            <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">
              Ukupno: {users.length}
            </span>
          </div>
          
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/50 uppercase text-xs text-gray-500">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Ime</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Uloga</th>
                <th className="px-6 py-3 text-right">Akcija</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4">#{u.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs border ${
                      u.role === "ADMIN" 
                        ? "bg-red-900/30 text-red-400 border-red-900" 
                        : "bg-green-900/30 text-green-400 border-green-900"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== "ADMIN" && (
                      <button 
                        onClick={() => handleBlock(u.id)}
                        className="text-red-400 hover:text-red-300 hover:underline"
                      >
                        Blokiraj
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}