import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Vraća listu budžeta sa IZRAČUNATOM potrošnjom za trenutni mesec
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Nedostaje userId" }, { status: 400 });
    }

    // 1. Odredi početak i kraj trenutnog meseca
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 2. Učitaj budžete korisnika
    const budgets = await prisma.budget.findMany({
      where: { userId: Number(userId) },
      include: { category: true } // Da vidimo ime kategorije
    });

    // 3. ZA SVAKI BUDŽET: Izračunaj koliko je već potrošeno
    // Ovo je ključno za progress bar!
    const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
      
      const spentAgg = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId: Number(userId),
          type: "EXPENSE", // Gledamo samo troškove
          date: {
            gte: startOfMonth, // Od prvog u mesecu
            lte: endOfMonth    // Do kraja meseca
          },
          // Ako je budžet za specifičnu kategoriju, filtriraj po njoj.
          // Ako je budget.categoryId null, to znači "Ukupan budžet" (sve kategorije).
          ...(budget.categoryId ? { categoryId: budget.categoryId } : {})
        }
      });

      const spent = Number(spentAgg._sum.amount || 0);
      const limit = Number(budget.amount);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      return {
        ...budget,
        spent,       // Koliko je potrošeno
        remaining: limit - spent, // Koliko je ostalo
        percentage   // Procenat za progress bar
      };
    }));

    return NextResponse.json(budgetsWithSpent);

  } catch (error) {
    console.error("Greška pri učitavanju budžeta:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}

// POST: Kreira novi budžet
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, categoryId, userId } = body;

    if (!amount || !userId) {
      return NextResponse.json({ error: "Iznos i korisnik su obavezni" }, { status: 400 });
    }

    // Provera da li već postoji budžet za tu kategoriju
    const existingBudget = await prisma.budget.findFirst({
        where: {
            userId: Number(userId),
            categoryId: categoryId ? Number(categoryId) : null // null znači "Ukupan budžet"
        }
    });

    if (existingBudget) {
        return NextResponse.json({ error: "Budžet za ovu kategoriju već postoji." }, { status: 400 });
    }

    const newBudget = await prisma.budget.create({
      data: {
        amount: parseFloat(amount),
        period: "monthly", // Podrazumevano
        userId: Number(userId),
        categoryId: categoryId ? Number(categoryId) : null
      }
    });

    return NextResponse.json(newBudget, { status: 201 });

  } catch (error) {
    console.error("Greška pri kreiranju budžeta:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}