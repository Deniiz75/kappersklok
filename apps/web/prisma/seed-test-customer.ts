import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const TEST_EMAIL = "test@kappersklok.nl";
const TEST_NAME = "Test Klant";
const TEST_PHONE = "06-12345678";

const BARBER_EMAIL = "kapper@kappersklok.nl";
const BARBER_PASSWORD = "kapper123";

async function main() {
  // 1. Find an active shop with barbers and services
  const shop = await prisma.shop.findFirst({
    where: { status: "ACTIVE" },
    include: {
      barbers: { where: { active: true }, take: 1 },
      services: { where: { active: true }, take: 3 },
    },
  });

  if (!shop) {
    console.error("Geen actieve shop gevonden. Run eerst: npm run db:seed");
    process.exit(1);
  }
  console.log(`Shop: ${shop.name} (${shop.id})`);

  if (!shop.barbers.length) {
    console.error("Geen actieve kapper gevonden.");
    process.exit(1);
  }
  const barber = shop.barbers[0];
  console.log(`Kapper: ${barber.name}`);

  if (!shop.services.length) {
    console.error("Geen diensten gevonden. Maak eerst diensten aan via het dashboard.");
    process.exit(1);
  }
  console.log(`Diensten: ${shop.services.map((s) => s.name).join(", ")}`);

  // 2. Upsert test customer
  await prisma.customer.upsert({
    where: { email: TEST_EMAIL },
    update: { name: TEST_NAME, phone: TEST_PHONE },
    create: { email: TEST_EMAIL, name: TEST_NAME, phone: TEST_PHONE },
  });
  console.log(`Klant: ${TEST_EMAIL}`);

  // 3. Delete existing test appointments (clean slate)
  await prisma.appointment.deleteMany({
    where: { customerEmail: TEST_EMAIL },
  });

  // 4. Create appointments
  const today = new Date();
  const svc0 = shop.services[0];
  const svc1 = shop.services[Math.min(1, shop.services.length - 1)];

  function addDays(d: Date, n: number): string {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r.toISOString().split("T")[0];
  }

  function endTime(start: string, durationMin: number): string {
    const [h, m] = start.split(":").map(Number);
    const total = h * 60 + m + durationMin;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  const appointments = [
    // Vandaag — komende afspraak
    {
      shopId: shop.id,
      barberId: barber.id,
      serviceId: svc0.id,
      date: new Date(addDays(today, 0)),
      startTime: "15:00",
      endTime: endTime("15:00", svc0.duration),
      customerName: TEST_NAME,
      customerEmail: TEST_EMAIL,
      customerPhone: TEST_PHONE,
      status: "CONFIRMED" as const,
    },
    // Morgen
    {
      shopId: shop.id,
      barberId: barber.id,
      serviceId: svc0.id,
      date: new Date(addDays(today, 1)),
      startTime: "11:00",
      endTime: endTime("11:00", svc0.duration),
      customerName: TEST_NAME,
      customerEmail: TEST_EMAIL,
      customerPhone: TEST_PHONE,
      status: "CONFIRMED" as const,
    },
    // Vorige week (geschiedenis)
    {
      shopId: shop.id,
      barberId: barber.id,
      serviceId: svc1.id,
      date: new Date(addDays(today, -7)),
      startTime: "14:00",
      endTime: endTime("14:00", svc1.duration),
      customerName: TEST_NAME,
      customerEmail: TEST_EMAIL,
      customerPhone: TEST_PHONE,
      status: "CONFIRMED" as const,
    },
    // Twee weken geleden
    {
      shopId: shop.id,
      barberId: barber.id,
      serviceId: svc0.id,
      date: new Date(addDays(today, -14)),
      startTime: "10:30",
      endTime: endTime("10:30", svc0.duration),
      customerName: TEST_NAME,
      customerEmail: TEST_EMAIL,
      customerPhone: TEST_PHONE,
      status: "CONFIRMED" as const,
    },
    // Drie weken geleden (geannuleerd)
    {
      shopId: shop.id,
      barberId: barber.id,
      serviceId: svc0.id,
      date: new Date(addDays(today, -21)),
      startTime: "16:00",
      endTime: endTime("16:00", svc0.duration),
      customerName: TEST_NAME,
      customerEmail: TEST_EMAIL,
      customerPhone: TEST_PHONE,
      status: "CANCELLED" as const,
    },
  ];

  for (const apt of appointments) {
    await prisma.appointment.create({ data: apt });
  }

  console.log(`\n${appointments.length} afspraken aangemaakt:`);
  for (const apt of appointments) {
    const dateStr = apt.date instanceof Date ? apt.date.toISOString().split("T")[0] : apt.date;
    console.log(`  ${apt.status === "CANCELLED" ? "✗" : "✓"} ${dateStr} om ${apt.startTime} — ${apt.status}`);
  }

  // ── Test kapper account ──
  console.log(`\n── Kapper account ──`);

  const passwordHash = await bcrypt.hash(BARBER_PASSWORD, 10);
  const barberUser = await prisma.user.upsert({
    where: { email: BARBER_EMAIL },
    update: { passwordHash },
    create: { email: BARBER_EMAIL, passwordHash, role: "BARBER" },
  });
  console.log(`User: ${BARBER_EMAIL} (${barberUser.id})`);

  // Link user to shop (if not already linked)
  if (!shop.userId) {
    await prisma.shop.update({
      where: { id: shop.id },
      data: { userId: barberUser.id },
    });
    console.log(`Shop "${shop.name}" gekoppeld aan kapper account`);
  } else if (shop.userId !== barberUser.id) {
    // Shop already linked to another user — find/create an unlinked shop
    const unlinkedShop = await prisma.shop.findFirst({
      where: { status: "ACTIVE", userId: null },
    });
    if (unlinkedShop) {
      await prisma.shop.update({
        where: { id: unlinkedShop.id },
        data: { userId: barberUser.id },
      });
      console.log(`Shop "${unlinkedShop.name}" gekoppeld aan kapper account`);
    } else {
      console.log(`⚠ Shop "${shop.name}" is al gekoppeld aan een andere user — kapper account heeft geen shop`);
    }
  } else {
    console.log(`Shop "${shop.name}" was al gekoppeld`);
  }

  console.log(`\n✅ Test accounts gereed!`);
  console.log(`\n   KLANT:`);
  console.log(`   E-mail: ${TEST_EMAIL}`);
  console.log(`   Login: /login → tab "Klant" → vul e-mail in`);
  console.log(`   Portaal: /mijn-afspraken`);
  console.log(`\n   KAPPER:`);
  console.log(`   E-mail: ${BARBER_EMAIL}`);
  console.log(`   Wachtwoord: ${BARBER_PASSWORD}`);
  console.log(`   Login: /login → tab "Kapper" → vul e-mail + wachtwoord in`);
  console.log(`   Dashboard: /dashboard`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
