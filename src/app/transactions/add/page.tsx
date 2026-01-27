"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button"; // Proveri putanje, mozda je ../../../components
import Input from "@/components/ui/Input";

export default function AddTransactionPage() {
  const router = useRouter();
  
  // Podaci iz baze
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Podaci forme
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("EXPENSE"); // Default je trošak
  const [selectedWallet, setSelectedWallet] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Danas

  useEffect(() => {
    // 1. Provera da li je korisnik ulogovan
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(storedUser);

    // 2. Učitaj novčanike i kategorije paralelno
    const fetchData = async () => {
      try {
        const [resWallets, resCategories] = await Promise.all([
          fetch(`/api/wallets?userId=${user.id}`),
          fetch("/api/categories")
        ]);

        if (resWallets.ok) {
          const wData = await resWallets.json();
          setWallets(wData);
          if (wData.length > 0) setSelectedWallet(wData[0].id);
        }

        if (resCategories.ok) {
          const cData = await resCategories.json();
          setCategories(cData);
          // Ne setujemo odmah kategoriju jer zavisi od tipa (INCOME/EXPENSE)
        }
      } catch (error) {
        console.error("Greška pri učitavanju:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Kad se promeni tip (Prihod/Rashod), resetuj izabranu kategoriju na prvu dostupnu
  useEffect(() => {
    const filtered = categories.filter(c => c.type === type);
    if (filtered.length > 0) {
      setSelectedCategory(filtered[0].id);
    } else {
      setSelectedCategory("");
    }
  }, [type, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWallet || !selectedCategory) {
      alert("Moraš izabrati novčanik i kategoriju!");
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description,
          type,
          date,
          walletId: selectedWallet,
          categoryId: selectedCategory
        }),
      });

      if (res.ok) {
        router.push("/wallets"); // Vrati na listu novčanika
      } else {
        const err = await res.json();
        alert("Greška: " + err.error);
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  if (loading) return <p className="p-8">Učitavanje...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Nova Transakcija</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Dugmići za Tip */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`flex-1 py-3 rounded-lg font-bold transition ${
                type === "EXPENSE" 
                  ? "bg-red-500 text-white shadow-md" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Trošak (-)
            </button>
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className={`flex-1 py-3 rounded-lg font-bold transition ${
                type === "INCOME" 
                  ? "bg-green-500 text-white shadow-md" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Prihod (+)
            </button>
          </div>

          {/* Iznos */}
          <Input 
            label="Iznos (RSD)" 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            required 
            placeholder="0"
          />

          {/* Opis */}
          <Input 
            label="Opis (opciono)" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="npr. Ručak, Plata..."
          />
          
          {/* Izbor Novčanika */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Novčanik</label>
            <select 
                className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
            >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Trenutno: {w.balance} {w.currency})
                  </option>
                ))}
            </select>
          </div>

          {/* Izbor Kategorije */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorija</label>
            <select 
                className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                {/* Filtriramo kategorije da prikazujemo samo one koje odgovaraju tipu */}
                {categories
                  .filter(c => c.type === type)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                
                {categories.filter(c => c.type === type).length === 0 && (
                  <option disabled>Nema kategorija za ovaj tip</option>
                )}
            </select>
          </div>

          {/* Datum */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
             <input 
               type="date" 
               className="w-full p-2 border rounded-lg"
               value={date}
               onChange={(e) => setDate(e.target.value)}
             />
          </div>

          <div className="pt-4">
            <Button type="submit">Sačuvaj</Button>
            <button 
              type="button"
              onClick={() => router.back()}
              className="w-full mt-2 text-gray-500 text-sm hover:underline"
            >
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}