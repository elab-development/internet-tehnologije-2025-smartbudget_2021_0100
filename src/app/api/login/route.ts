/*import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Korisnik ne postoji.' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Pogrešna lozinka!' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Uspešna prijava!', 
        user: { id: user.id, email: user.email, name: user.name, role: user.role } 
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: 'Greška na serveru.' },
      { status: 500 }
    );
  }
}*/
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt"; // Proveri da li koristiš 'bcrypt' ili 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email i lozinka su obavezni." },
        { status: 400 }
      );
    }

    // 1. Tražimo korisnika u bazi
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Korisnik ne postoji." },
        { status: 401 }
      );
    }

    // 2. Provera lozinke
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Pogrešna lozinka." },
        { status: 401 }
      );
    }

    // 3. Vraćamo podatke (OVDE JE BIO PROBLEM VERIVATNO)
    // Moramo eksplicitno poslati 'role' da bi frontend znao da si Admin
    return NextResponse.json({
      message: "Uspešna prijava",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Login greška:", error);
    return NextResponse.json(
      { message: "Došlo je do greške na serveru." },
      { status: 500 }
    );
  }
}