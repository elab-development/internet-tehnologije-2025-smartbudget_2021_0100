import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const transactionId = parseInt(params.id);

    if (isNaN(transactionId)) {
      return NextResponse.json({ error: "Nevalidan ID" }, { status: 400 });
    }

    // 1. Prvo moramo naći transakciju da vidimo KOLIKO para i KOJI tip
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true } // Treba nam i novčanik da ažuriramo stanje
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transakcija ne postoji" }, { status: 404 });
    }

    // Sigurnosna provera: Transferi su komplikovani za brisanje (jer utiču na 2 novčanika)
    // Za sada ćemo dozvoliti samo brisanje Prihoda i Troškova.
    if (transaction.type === "TRANSFER") {
      return NextResponse.json(
        { error: "Transferi se ne mogu brisati. Napravite kontra-transakciju." }, 
        { status: 400 }
      );
    }

    // 2. KORISTIMO TRANSAKCIJU BAZE (Sve ili ništa)
    await prisma.$transaction(async (tx) => {
      
      // LOGIKA VRAĆANJA NOVCA
      if (transaction.type === "EXPENSE") {
        // Ako brišemo trošak, pare se VRAĆAJU u novčanik (+)
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: { increment: transaction.amount } }
        });
      } else if (transaction.type === "INCOME") {
        // Ako brišemo prihod, pare se ODUZIMAJU iz novčanika (-)
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: { decrement: transaction.amount } }
        });
      }

      // 3. Konačno brišemo zapis
      await tx.transaction.delete({
        where: { id: transactionId }
      });
    });

    return NextResponse.json({ message: "Transakcija uspešno obrisana i saldo ažuriran." }, { status: 200 });

  } catch (error) {
    console.error("Greška pri brisanju transakcije:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}