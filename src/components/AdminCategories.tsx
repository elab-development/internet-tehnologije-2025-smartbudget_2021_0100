"use client";

import { useEffect, useState } from "react";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State za formu
  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE"); // Default je trošak

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories", { cache: "no-store" });
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type }),
    });

    if (res.ok) {
      setName(""); // Resetuj polje
      fetchCategories(); // Osveži listu
    } else {
      alert("Greška pri dodavanju");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Da li ste sigurni?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6">Upravljanje Sistemskim Kategorijama</h2>

      {/* FORMA ZA DODAVANJE */}
      <form onSubmit={handleAdd} className="flex gap-4 mb-8 bg-gray-900 p-4 rounded-xl border border-gray-700">
        <input 
          type="text" 
          placeholder="Naziv kategorije (npr. Hrana)" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-gray-800 text-white p-2 rounded-lg border border-gray-600 outline-none focus:border-blue-500"
          required
        />
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded-lg border border-gray-600 outline-none"
        >
          <option value="EXPENSE">Trošak (-)</option>
          <option value="INCOME">Prihod (+)</option>
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold">
          Dodaj
        </button>
      </form>

      {/* LISTA KATEGORIJA */}
      {loading ? <p className="text-gray-400">Učitavanje...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg border border-gray-600">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${cat.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-white font-medium">{cat.name}</span>
              </div>
              <button 
                onClick={() => handleDelete(cat.id)}
                className="text-gray-400 hover:text-red-400 transition"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}