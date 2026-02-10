import { NextResponse } from 'next/server';
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
}