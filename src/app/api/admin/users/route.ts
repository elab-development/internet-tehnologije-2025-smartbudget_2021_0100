import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // OVO JE JEDNOSTAVNA PROVERA - U produkciji bi ovde čitali sesiju
    // Za sada vraćamo sve korisnike
    
    // SK18 - Pregled svih korisnika 
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true, // Vraćamo ulogu da vidimo ko je ko
        // NE VRAĆAMO password! [cite: 101]
      },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json(users);

  } catch (error) {
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}