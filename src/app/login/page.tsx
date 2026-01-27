"use client"; // <--- OVO JE OBAVEZNO NA PRVOJ LINIJI

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// OVO JE ONO STO JE FALILO - "export default function"
export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setSuccess(true);
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        router.push("/"); 
      }, 1000);

    } catch (err) {
      setError("Došlo je do greške.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Prijava</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-100 text-green-600 p-3 rounded mb-4 text-sm">Uspešno! Ulazite...</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Lozinka</label>
            <input
              type="password"
              required
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Uloguj se
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Nemaš nalog?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Registruj se
          </Link>
        </p>
      </div>
    </div>
  );
}