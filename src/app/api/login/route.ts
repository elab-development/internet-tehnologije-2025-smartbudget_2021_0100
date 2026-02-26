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
      return NextResponse.json({ message: 'Korisnik ne postoji.' }, { status: 401 });
    }

    // proveravamo da li je korisnik blokiran
    if (user.isBlocked) {
      return NextResponse.json(
        { message: 'Vaš nalog je blokiran. Kontaktirajte administratora.' }, 
        { status: 403 } // 403 znaci zabranjeno
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Pogrešna lozinka!' }, { status: 401 });
    }

    return NextResponse.json(
      { 
        message: 'Uspešna prijava!', 
        user: { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role // Vracamo i ulogu
        } 
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json({ message: 'Greška na serveru.' }, { status: 500 });
  }
}*/

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return NextResponse.json({ message: 'Korisnik ne postoji.' }, { status: 401 });
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { message: 'Vaš nalog je blokiran. Kontaktirajte administratora.' }, 
        { status: 403 } 
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Pogrešna lozinka!' }, { status: 401 });
    }

    // Postavljanje kolačića za autentifikaciju
    const cookieStore = await cookies();
    cookieStore.set('userId', user.id.toString(), {
        httpOnly: true, // Klijentski JS ne može da pristupi kolačiću, što je sigurnije
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // Kolačić traje 7 dana
        path: '/',
    });

    return NextResponse.json(
      { 
        message: 'Uspešna prijava!', 
        user: { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role 
        } 
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json({ message: 'Greška na serveru.' }, { status: 500 });
  }
}