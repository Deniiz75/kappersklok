import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createRegistrationPayment } from "@/lib/mollie";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { shopId, shopName } = await request.json();
    if (!shopId || !shopName) {
      return NextResponse.json({ error: "Ontbrekende gegevens" }, { status: 400 });
    }

    const { checkoutUrl } = await createRegistrationPayment(
      shopId,
      shopName,
      session.email
    );

    return NextResponse.json({ checkoutUrl });
  } catch {
    return NextResponse.json(
      { error: "Kon geen betaling aanmaken. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}
