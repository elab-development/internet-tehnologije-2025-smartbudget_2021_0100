"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function WalletsPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(storedUser);
    setUserId(user.id);
    fetchWallets(user.id);
  }, []);

  const fetchWallets = async (id: number) => {
    try {
      const res = await fetch(`/api/wallets?userId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setWallets(data);
      }
    } catch (error) {
      console.error("Greška:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, balance: parseFloat(balance) || 0, userId: userId }),
      });
      if (res.ok) {
        setName("");
        setBalance("");
        fetchWallets(userId);
      }
    } catch (error) {
      console.error("Greška pri kreiranju:", error);
    }
  };

  const totalBalance = wallets.reduce((acc, curr) => acc + parseFloat(curr.balance), 0);

  if (!userId) return <div className="p-10 text-center text-gray-400">Učitavanje...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-3xl p-8 text-white shadow-2xl shadow-blue-900/20 mb-10 flex flex-col md:flex-row justify-between items-center border border-blue-800">
        <div>
          <h1 className="text-3xl font-bold mb-2">Moji Novčanici</h1>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <p className="text-sm text-blue-300 font-medium uppercase tracking-wider">Ukupno raspoloživo</p>
          <p className="text-4xl font-bold">{totalBalance.toLocaleString()} RSD</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEVO: FORMA (Sada tamno siva bg-gray-800) */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-900/50 text-blue-400 p-2 rounded-lg text-sm border border-blue-800">＋</span>
              Novi novčanik
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Naziv računa" 
                placeholder="npr. Keš, Štednja..." 
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
              <Button type="submit">Kreiraj Novčanik</Button>
            </form>
          </div>
        </div>

        {/* DESNO: LISTA (Sada tamno siva bg-gray-800) */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-center text-gray-500">Učitavanje tvojih računa...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wallets.length === 0 && (
                <div className="col-span-2 bg-gray-800 p-8 rounded-2xl border border-dashed border-gray-600 text-center">
                  <p className="text-gray-400 mb-2">Nemaš nijedan novčanik.</p>
                  <p className="text-sm text-gray-500">Napravi prvi sa leve strane!</p>
                </div>
              )}
              
              {wallets.map((wallet) => (
                <div 
                  key={wallet.id} 
                  className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-750 transition-all group cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-700 text-blue-400 flex items-center justify-center text-lg font-bold border border-gray-600">
                      {wallet.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium">{wallet.name}</h3>
                    <p className="text-2xl font-bold text-white mt-1">
                      {wallet.balance.toLocaleString()} <span className="text-sm text-gray-500 font-normal">{wallet.currency}</span>
                    </p>
                  </div>

                  <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-blue-400 text-sm font-bold">Detalji →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}