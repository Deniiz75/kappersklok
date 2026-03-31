import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const defaultServices = [
  { name: "Knippen", duration: 30, price: 2500, sortOrder: 0 },
  { name: "Knippen + baard", duration: 45, price: 3500, sortOrder: 1 },
  { name: "Baard trimmen", duration: 20, price: 1500, sortOrder: 2 },
  { name: "Scheren", duration: 30, price: 2000, sortOrder: 3 },
  { name: "Knippen kind (t/m 12)", duration: 20, price: 1800, sortOrder: 4 },
];

const defaultHours = [
  { dayOfWeek: 0, openTime: "00:00", closeTime: "00:00", closed: true },   // zondag
  { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", closed: false },  // maandag
  { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", closed: false },  // dinsdag
  { dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", closed: false },  // woensdag
  { dayOfWeek: 4, openTime: "09:00", closeTime: "20:00", closed: false },  // donderdag (koopavond)
  { dayOfWeek: 5, openTime: "09:00", closeTime: "18:00", closed: false },  // vrijdag
  { dayOfWeek: 6, openTime: "09:00", closeTime: "17:00", closed: false },  // zaterdag
];

async function main() {
  const shops = await prisma.shop.findMany({ where: { status: "ACTIVE" } });
  console.log(`Adding services + business hours to ${shops.length} shops...\n`);

  for (const shop of shops) {
    // Services
    const existingServices = await prisma.service.findFirst({ where: { shopId: shop.id } });
    if (!existingServices) {
      for (const svc of defaultServices) {
        await prisma.service.create({
          data: { ...svc, shopId: shop.id },
        });
      }
      console.log(`  ${shop.name}: ${defaultServices.length} services added`);
    } else {
      console.log(`  ${shop.name}: services already exist, skip`);
    }

    // Business hours
    const existingHours = await prisma.businessHours.findFirst({ where: { shopId: shop.id } });
    if (!existingHours) {
      for (const h of defaultHours) {
        await prisma.businessHours.create({
          data: { ...h, shopId: shop.id },
        });
      }
      console.log(`  ${shop.name}: business hours added`);
    } else {
      console.log(`  ${shop.name}: hours already exist, skip`);
    }
  }

  console.log("\nDone!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
