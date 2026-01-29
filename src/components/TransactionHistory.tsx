"use client";

import { useEffect, useState } from "react";

// Definišemo kako izgleda transakcija (TypeScript tipovi)
interface Transaction {
  id: number;
  amount: number;
  description: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  category?: { name: string; icon?: string }; // Upitnik znači da možda nema kategoriju
  wallet: { name: string };
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return;
    
    const user = JSON.parse(userJson);

    // Zovemo API
    fetch(`/api/transactions?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        // PROVERA: Da li je ovo stvarno niz?
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          // Ako nije niz (nego npr. greška), stavimo praznu listu da ne pukne sajt
          console.error("API nije vratio niz:", data);
          setTransactions([]); 
        }
      })
      .catch((err) => {
        console.error("Greška:", err);
        setTransactions([]); // U slučaju greške, prazna lista
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-400 text-center">Učitavanje transakcija...</p>;

  if (transactions.length === 0) {
    return <p className="text-gray-400 text-center">Nema zabeleženih transakcija.</p>;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white">Istorija Transakcija</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-700 text-gray-100 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Opis</th>
              <th className="px-6 py-3">Kategorija</th>
              <th className="px-6 py-3">Novčanik</th>
              <th className="px-6 py-3">Datum</th>
              <th className="px-6 py-3 text-right">Iznos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {Array.isArray(transactions) && transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-750 transition">
                <td className="px-6 py-4 font-medium text-white">
                  {tx.description || "Bez opisa"}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-gray-600 text-xs text-white">
                    {tx.category?.name || "Ostalo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{tx.wallet.name}</td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(tx.date).toLocaleDateString("sr-RS")}
                </td>
                <td className={`px-6 py-4 text-right font-bold ${
                  tx.type === "INCOME" ? "text-green-400" : "text-red-400"
                }`}>
                  {tx.type === "INCOME" ? "+" : "-"}{tx.amount} RSD
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}