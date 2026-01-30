"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Forma state
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // 1. Učitavanje korisnika, budžeta i kategorija
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      window.location.href = "/login";
      return;
    }
    const userData = JSON.parse(userJson);
    setUser(userData);
    fetchData(userData.id);
  }, []);

  const fetchData = async (userId: number) => {
    try {
      // Učitaj budžete (GET)
      const resBudgets = await fetch(`/api/budgets?userId=${userId}`);
      const budgetsData = await resBudgets.json();
      
      // Učitaj kategorije (za dropdown u modalu) - koristimo postojeći API
      // Pretpostavljam da već imaš API za transakcije koji vraća kategorije, 
      // ili možemo napraviti novi. Za sad, ako ovo pukne, moramo napraviti rutu za kategorije.
      // Probaćemo da izvučemo kategorije iz transakcija ili ako imaš posebnu rutu.
      // AJDE DA KORISTIMO OVO: /api/categories ako postoji, ako ne, koristićemo hardkodovane za test.
      const resCats = await fetch(`/api/categories?userId=${userId}`); // Nadam se da ovo imaš
      if(resCats.ok) {
          const catsData = await resCats.json();
          setCategories(catsData);
      }
      
      if (Array.isArray(budgetsData)) {
        setBudgets(budgetsData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Kreiranje budžeta
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          categoryId: selectedCategory || null, // Ako je prazno, šaljemo null (Ukupan budžet)
          userId: user.id
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setAmount("");
        setSelectedCategory("");
        fetchData(user.id); // Osveži prikaz
      } else {
        const err = await res.json();
        alert(err.error || "Greška");
      }
    } catch (error) {
      alert("Greška na serveru");
    }
  };

  // 3. Brisanje budžeta
  // 3. Brisanje budžeta (POPRAVLJENO)
  const handleDelete = async (id: number) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj budžet?")) return;
    
    try {
        console.log("Šaljem zahtev za brisanje na: /api/budgets/" + id); // Provera
        
        const res = await fetch(`/api/budgets/${id}`, { 
            method: "DELETE" 
        });

        if (res.ok) {
            // Uspešno
            fetchData(user.id);
        } else {
            // Greška (npr. 404 ili 500)
            const errorData = await res.json();
            alert(`Greška: ${errorData.error || "Nepoznata greška"} (Status: ${res.status})`);
        }
    } catch (error) {
        console.error("Mrežna greška:", error);
        alert("Došlo je do greške u komunikaciji sa serverom.");
    }
  };

  // Helper za boju progress bara
  const getProgressColor = (percent: number) => {
    if (percent < 50) return "bg-green-500";
    if (percent < 85) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) return <div className="p-10 text-white text-center">Učitavanje budžeta...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mesečni Budžeti 📉</h1>
            <p className="text-gray-400">Pratite vaše limite potrošnje za ovaj mesec.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg flex items-center gap-2"
          >
            + Novi Limit
          </button>
        </div>

        {/* GRID KARTICA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.length === 0 ? (
            <div className="col-span-2 text-center py-10 bg-gray-800 rounded-2xl border border-gray-700 border-dashed">
                <p className="text-gray-400">Još niste postavili nijedan limit.</p>
            </div>
          ) : (
            budgets.map((budget) => (
              <div key={budget.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl relative overflow-hidden group">
                
                {/* Header Kartice */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {budget.category ? budget.category.name : "💰 UKUPAN BUDŽET"}
                        </h3>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Mesečni Limit</p>
                    </div>
                    <button 
                        onClick={() => handleDelete(budget.id)}
                        className="text-gray-500 hover:text-red-400 transition"
                    >
                        🗑️
                    </button>
                </div>

                {/* Iznosi */}
                <div className="flex justify-between items-end mb-2 relative z-10">
                    <div>
                        <span className="text-sm text-gray-400">Potrošeno:</span>
                        <div className="text-2xl font-bold text-white">{budget.spent.toLocaleString()} RSD</div>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-gray-400">Limit:</span>
                        <div className="text-lg font-medium text-gray-300">{Number(budget.amount).toLocaleString()}</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative z-10">
                    <div className="flex justify-between text-xs mb-1">
                        <span className={budget.percentage > 100 ? "text-red-400 font-bold" : "text-gray-400"}>
                            {budget.percentage.toFixed(1)}%
                        </span>
                        <span className="text-gray-400">
                            Preostalo: <span className="text-white font-bold">{budget.remaining.toLocaleString()} RSD</span>
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${getProgressColor(budget.percentage)}`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Dekoracija u pozadini */}
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 blur-xl ${getProgressColor(budget.percentage)}`}></div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL ZA DODAVANJE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-3xl w-full max-w-md border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Postavi novi limit</h2>
            <form onSubmit={handleCreate} className="space-y-4">
                
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Kategorija</label>
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">-- Ukupan Mesečni Budžet --</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Ostavite prazno ako želite limit za SVE troškove.</p>
                </div>

                <div>
                    <label className="block text-gray-400 text-sm mb-2">Maksimalni Iznos (RSD)</label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="npr. 20000"
                        required
                    />
                </div>

                <div className="flex gap-4 mt-8">
                    <button 
                        type="button" 
                        onClick={() => setShowModal(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition"
                    >
                        Otkaži
                    </button>
                    <button 
                        type="submit" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg"
                    >
                        Sačuvaj
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}