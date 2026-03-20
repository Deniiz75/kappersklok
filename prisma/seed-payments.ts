import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const shops = await prisma.shop.findMany({ where: { status: "ACTIVE" } });
  console.log(`Generating payments for ${shops.length} shops...\n`);

  const months = ["2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03"];

  for (const shop of shops) {
    const existing = await prisma.payment.findFirst({ where: { shopId: shop.id } });
    if (existing) {
      console.log(`  ${shop.name}: payments exist, skip`);
      continue;
    }

    // Eenmalige setup fee
    await prisma.payment.create({
      data: {
        shopId: shop.id,
        amount: 3000,
        description: "Eenmalige setupkosten",
        status: "PAID",
        period: "2025-09",
        paidAt: new Date("2025-09-15"),
      },
    });

    // Monthly payments
    for (const month of months) {
      const [y, m] = month.split("-");
      const paid = Math.random() > 0.08; // 92% betaald
      await prisma.payment.create({
        data: {
          shopId: shop.id,
          amount: 2900,
          description: `Maandelijks abonnement ${month}`,
          status: paid ? "PAID" : "PENDING",
          period: month,
          paidAt: paid ? new Date(`${y}-${m}-03`) : new Date(`${y}-${m}-01`),
        },
      });
    }
    console.log(`  ${shop.name}: 7 payments added`);
  }

  console.log("\nDone!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
