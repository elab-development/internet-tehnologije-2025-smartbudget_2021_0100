"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function WalletsPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null); // Ovde čuvamo tvoj ID
  
  // State za formu
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  // 1. Provera da li si ulogovan čim se učita stranica
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (!storedUser) {
      // Ako nisi ulogovan, marš na login
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    setUserId(user.id); // Sačuvali smo ID
    fetchWallets(user.id); // Odmah tražimo novčanike za taj ID
  }, []);

  const fetchWallets = async (id: number) => {
    try {
      // Šaljemo ID kroz URL
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
    if (!userId) return; // Sigurnosna provera
    
    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          balance: parseFloat(balance) || 0,
          userId: userId // Šaljemo tvoj ID backendu
        }),
      });

      if (res.ok) {
        setName("");
        setBalance("");
        fetchWallets(userId); // Osveži listu
      }
    } catch (error) {
      console.error("Greška pri kreiranju:", error);
    }
  };

  if (!userId) return <p className="p-8">Provera korisnika...</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Moji Novčanici</h1>
        <Button onClick={() => {
            localStorage.removeItem("user");
            router.push("/login");
        }} variant="danger">Odjavi se</Button>
      </div>

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

      {loading ? (
        <p>Učitavanje...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.length === 0 && <p className="text-gray-500">Još uvek nemaš novčanike.</p>}
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