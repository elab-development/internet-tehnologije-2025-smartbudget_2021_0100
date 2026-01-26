"use client"; 

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button"; 
import Input from "@/components/ui/Input";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State za formu
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  // 1. Učitavanje podataka (GET)
  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const res = await fetch("/api/wallets");
      const data = await res.json();
      setWallets(data);
      setLoading(false);
    } catch (error) {
      console.error("Greška:", error);
      setLoading(false);
    }
  };

  // 2. Slanje podataka (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          balance: parseFloat(balance) || 0 
        }),
      });

      if (res.ok) {
        setName("");
        setBalance("");
        fetchWallets(); 
      }
    } catch (error) {
      console.error("Greška pri kreiranju:", error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Moji Novčanici</h1>

      {/* Forma za dodavanje */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Kreiraj novi novčanik</h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <Input 
            label="Naziv novčanika" 
            placeholder="npr. Keš, Banka..." 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input 
            label="Početni iznos" 
            type="number"
            placeholder="0" 
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
          <div className="mb-4">
            <Button type="submit">Dodaj +</Button>
          </div>
        </form>
      </div>

      {/* Lista novčanika */}
      {loading ? (
        <p>Učitavanje...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg transition">
              <h3 className="text-lg font-bold text-gray-800">{wallet.name}</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {wallet.balance} {wallet.currency}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}