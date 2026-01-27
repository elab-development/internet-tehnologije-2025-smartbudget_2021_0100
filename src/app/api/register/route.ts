import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Koristimo onaj tvoj singleton
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    // 1. Čitamo podatke koje je korisnik poslao
    const body = await req.json();
    const { email, name, password } = body;

    // 2. Provera: Da li su sva polja tu?
    if (!email || !name || !password) {
      return NextResponse.json(
        { message: 'Nedostaju podaci (email, ime ili lozinka)' },
        { status: 400 }
      );
    }

    // 3. Provera: Da li email već postoji u bazi?
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Korisnik sa ovim email-om već postoji!' },
        { status: 409 } // 409 Conflict
      );
    }

    // 4. "Soljenje" lozinke (Hashing) - Sigurnosni zahtev profesora
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Upis u bazu
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'USER', // Po defaultu je običan korisnik
      },
    });

    // 6. Vraćamo uspeh (bez slanja lozinke nazad!)
    return NextResponse.json(
      { message: 'Uspešna registracija!', user: { email: newUser.email, name: newUser.name } },
      { status: 201 }
    );

  } catch (error) {
    console.error('Greška pri registraciji:', error);
    return NextResponse.json(
      { message: 'Došlo je do greške na serveru.' },
      { status: 500 }
    );
  }
}