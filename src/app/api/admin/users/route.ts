import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// (Da uvek povuče sveže podatke iz baze)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true, 
      },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}