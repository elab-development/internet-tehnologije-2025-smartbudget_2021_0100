"use client";

import { useEffect, useState } from "react";
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";

interface Transaction {
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  category?: { name: string };
}

// Boje za kružni dijagram (Pie Chart)
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560"];

export default function DashboardCharts() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return;
    const user = JSON.parse(userJson);

    fetch(`/api/transactions?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTransactions(data);
      })
      .finally(() => setLoading(false));
  }, []);

  // 1. PRIPREMA PODATAKA ZA PIE CHART (Troškovi po kategorijama)
  const expenseData = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc: any[], curr) => {
      const catName = curr.category?.name || "Ostalo";
      const existing = acc.find(item => item.name === catName);
      if (existing) {
        existing.value += Number(curr.amount);
      } else {
        acc.push({ name: catName, value: Number(curr.amount) });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // 2. PRIPREMA PODATAKA ZA BAR CHART (Prihodi vs Troškovi)
  const totalIncome = transactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const totalExpense = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const barData = [
    { name: "Prihodi", iznos: totalIncome },
    { name: "Troškovi", iznos: totalExpense }
  ];

  if (loading) return <p className="text-center text-gray-500">Učitavanje grafika...</p>;
  if (transactions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      
      {/* --- LEVI GRAFIK: TROŠKOVI PO KATEGORIJAMA --- */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 text-center">🏆 Gde odlazi novac?</h3>
        <div className="h-64 w-full">
            {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                        // 👇 OVDE JE BILA GREŠKA: Promenili smo (value: number) u (value: any)
                        formatter={(value: any) => `${Number(value).toLocaleString()} RSD`}
                    />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-gray-500 text-center mt-20">Nema troškova za prikaz.</p>
            )}
        </div>
      </div>

      {/* --- DESNI GRAFIK: PRIHODI VS TROŠKOVI --- */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 text-center">📊 Bilans Stanja</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                    // 👇 I OVDE: Promenjeno u (value: any)
                    formatter={(value: any) => `${Number(value).toLocaleString()} RSD`}
                />
                <Bar dataKey="iznos" radius={[10, 10, 0, 0]}>
                    {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === "Prihodi" ? "#10B981" : "#EF4444"} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}