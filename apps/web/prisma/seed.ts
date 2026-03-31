import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin user
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@kappersklok.nl" },
    update: {},
    create: {
      email: "admin@kappersklok.nl",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  // Example shops
  const shops = [
    {
      name: "Barbershop Qlippers",
      slug: "barbershop-qlippers",
      contactName: "Mohammed B.",
      email: "info@qlippers.nl",
      phone: "010-1234567",
      city: "Rotterdam",
      street: "Witte de Withstraat",
      houseNumber: "42",
      postalCode: "3012 BR",
      country: "Nederland",
      instagram: "qlippers",
      status: "ACTIVE" as const,
      language: "nl_NL",
      barbersCount: 4,
    },
    {
      name: "Chaci Barbershop",
      slug: "chaci-barbershop",
      contactName: "Achraf E.",
      email: "info@chaci.nl",
      phone: "020-7654321",
      city: "Amsterdam",
      street: "Ferdinand Bolstraat",
      houseNumber: "88",
      postalCode: "1072 LR",
      country: "Nederland",
      instagram: "chacibarbershop",
      status: "ACTIVE" as const,
      language: "nl_NL",
      barbersCount: 6,
    },
    {
      name: "Man Cave Barbers",
      slug: "man-cave-barbers",
      contactName: "Dennis K.",
      email: "info@mancavebarbers.nl",
      phone: "070-9876543",
      city: "Den Haag",
      street: "Grote Marktstraat",
      houseNumber: "15",
      postalCode: "2511 BH",
      country: "Nederland",
      instagram: "mancavebarbers",
      status: "ACTIVE" as const,
      language: "nl_NL",
      barbersCount: 4,
    },
  ];

  for (const shop of shops) {
    const created = await prisma.shop.upsert({
      where: { email: shop.email },
      update: {},
      create: shop,
    });
    console.log("Shop created:", created.name, `(/kapperszaak/${created.slug})`);

    // Add barbers
    const barberNames =
      created.slug === "barbershop-qlippers"
        ? ["Mohammed", "Youssef", "Ali", "Hassan"]
        : created.slug === "chaci-barbershop"
          ? ["Achraf", "Karim", "Omar", "Bilal", "Nabil", "Samir"]
          : ["Dennis", "Rick", "Kevin", "Tom"];

    for (const name of barberNames) {
      await prisma.barber.upsert({
        where: { id: `${created.id}-${name.toLowerCase()}` },
        update: {},
        create: { id: `${created.id}-${name.toLowerCase()}`, name, shopId: created.id },
      });
    }
    console.log(`  Added ${barberNames.length} barbers`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
