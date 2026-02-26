/*import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// get metoda
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

// post metoda
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type } = body; // type mora biti income ili expense

    if (!name || !type) {
      return NextResponse.json({ error: "Ime i tip su obavezni" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        type,
        isSystem: true, // globalna kategorija
        userId: null    // nije vezana ni za jednog korisnika specificno
      }
    });

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}*/
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

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

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    // 1. Provera da li je korisnik uopšte ulogovan (da li ima kolačić)
    if (!userIdCookie || !userIdCookie.value) {
        return NextResponse.json({ error: "Neautorizovan pristup." }, { status: 401 });
    }

    // 2. Provera uloge korisnika direktno u bazi
    const user = await prisma.user.findUnique({
        where: { id: parseInt(userIdCookie.value) }
    });

    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Zabranjen pristup. Niste administrator." }, { status: 403 });
    }

    // 3. Glavna logika za kreiranje kategorije (izvšava se samo ako je korisnik ADMIN)
    const body = await req.json();
    const { name, type } = body; 

    if (!name || !type) {
      return NextResponse.json({ error: "Ime i tip su obavezni" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        type,
        isSystem: true, 
        userId: null    
      }
    });

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}