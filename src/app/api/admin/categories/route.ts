import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET: Daj mi sve sistemske kategorije
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isSystem: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}

// POST: Admin pravi novu kategoriju
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type } = body; // type mora biti 'INCOME' ili 'EXPENSE'

    if (!name || !type) {
      return NextResponse.json({ error: "Ime i tip su obavezni" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        type,
        isSystem: true, // OVO JE KLJUČNO - ovo je globalna kategorija
        userId: null    // Nije vezana ni za jednog korisnika specifično
      }
    });

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}