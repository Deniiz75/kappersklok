import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const shops = [
  { name: "The Gentlemen's Cut", city: "Amsterdam", street: "Haarlemmerstraat", houseNumber: "12", postalCode: "1013 ER", instagram: "gentlemenscut_ams" },
  { name: "Razor & Fade", city: "Rotterdam", street: "Witte de Withstraat", houseNumber: "45", postalCode: "3012 BL", instagram: "razorfade_rtm" },
  { name: "Kapsalon De Kroon", city: "Utrecht", street: "Oudegracht", houseNumber: "88", postalCode: "3511 AR", instagram: "dekroon_utrecht" },
  { name: "Barbershop Sultan", city: "Den Haag", street: "Grote Marktstraat", houseNumber: "22", postalCode: "2511 BJ", instagram: "sultan_barber" },
  { name: "Clip & Style", city: "Eindhoven", street: "Stratumseind", houseNumber: "7", postalCode: "5611 EN", instagram: "clipstyle_ehv" },
  { name: "El Patron Barbershop", city: "Tilburg", street: "Heuvelstraat", houseNumber: "33", postalCode: "5038 AA", instagram: "elpatron_tlb" },
  { name: "Fresh Cutz", city: "Groningen", street: "Oosterstraat", houseNumber: "51", postalCode: "9711 NR", instagram: "freshcutz_grn" },
  { name: "Barber Brothers", city: "Almere", street: "Stadshuisplein", houseNumber: "4", postalCode: "1315 HR", instagram: "barberbrothers" },
  { name: "The Blade Room", city: "Breda", street: "Ginnekenstraat", houseNumber: "19", postalCode: "4811 JC", instagram: "bladeroom_breda" },
  { name: "Kapsalon Vintage", city: "Haarlem", street: "Barteljorisstraat", houseNumber: "8", postalCode: "2012 JB", instagram: "vintage_haarlem" },
  { name: "Royal Barbers", city: "Arnhem", street: "Koningstraat", houseNumber: "65", postalCode: "6811 DG", instagram: "royalbarbers_arn" },
  { name: "Scissors & Comb", city: "Nijmegen", street: "Marikenstraat", houseNumber: "14", postalCode: "6511 PS", instagram: "scissorscomb_nij" },
  { name: "Don Barbero", city: "Dordrecht", street: "Voorstraat", houseNumber: "102", postalCode: "3311 ES", instagram: "donbarbero_dor" },
  { name: "Urban Cuts", city: "Leiden", street: "Haarlemmerstraat", houseNumber: "37", postalCode: "2312 DJ", instagram: "urbancuts_leiden" },
  { name: "Barber Kings", city: "Zoetermeer", street: "Dorpsstraat", houseNumber: "5", postalCode: "2712 AA", instagram: "barberkings_ztm" },
  { name: "The Sharp Edge", city: "Amersfoort", street: "Langestraat", houseNumber: "71", postalCode: "3811 NB", instagram: "sharpedge_amf" },
  { name: "Kapsalon Luxe", city: "Apeldoorn", street: "Hoofdstraat", houseNumber: "29", postalCode: "7311 KC", instagram: "luxe_apeldoorn" },
  { name: "Faded Glory", city: "Enschede", street: "Oude Markt", houseNumber: "16", postalCode: "7511 GB", instagram: "fadedglory_ens" },
  { name: "Maestro Barbers", city: "Zwolle", street: "Diezerstraat", houseNumber: "42", postalCode: "8011 RE", instagram: "maestro_zwolle" },
  { name: "Hair Empire", city: "Maastricht", street: "Grote Staat", houseNumber: "55", postalCode: "6211 CV", instagram: "hairempire_mst" },
  { name: "Bladez Barbershop", city: "Deventer", street: "Brink", houseNumber: "3", postalCode: "7411 BR", instagram: "bladez_deventer" },
  { name: "The Barber Lab", city: "Leeuwarden", street: "Nieuwestad", houseNumber: "28", postalCode: "8911 CP", instagram: "barberlab_lwn" },
  { name: "Primo Cuts", city: "Hilversum", street: "Kerkstraat", houseNumber: "60", postalCode: "1211 CT", instagram: "primocuts_hlvs" },
  { name: "Salon Prestige", city: "Delft", street: "Markt", houseNumber: "11", postalCode: "2611 GP", instagram: "prestige_delft" },
  { name: "Classy Cuts", city: "Gouda", street: "Kleiweg", houseNumber: "34", postalCode: "2801 JA", instagram: "classycuts_gouda" },
  { name: "The Grooming Spot", city: "Alkmaar", street: "Langestraat", houseNumber: "47", postalCode: "1811 JB", instagram: "groomingspot_alk" },
  { name: "Barber House", city: "Zaandam", street: "Gedempte Gracht", houseNumber: "9", postalCode: "1506 CJ", instagram: "barberhouse_zndm" },
  { name: "Kapsalon Nero", city: "Venlo", street: "Vleesstraat", houseNumber: "18", postalCode: "5911 JE", instagram: "nero_venlo" },
  { name: "Chop Shop Barbers", city: "Roosendaal", street: "Markt", houseNumber: "23", postalCode: "4701 PD", instagram: "chopshop_rsdl" },
  { name: "The Mane Room", city: "Hengelo", street: "Marktstraat", houseNumber: "6", postalCode: "7551 DL", instagram: "maneroom_hgl" },
  { name: "Barber & Co", city: "Amstelveen", street: "Stadshart", houseNumber: "15", postalCode: "1181 ZM", instagram: "barberandco_amv" },
  { name: "Kapsalon Atlas", city: "Vlaardingen", street: "Hoogstraat", houseNumber: "52", postalCode: "3131 BP", instagram: "atlas_vlrd" },
  { name: "Elite Barbers", city: "Schiedam", street: "Lange Haven", houseNumber: "31", postalCode: "3111 CA", instagram: "elite_schiedam" },
  { name: "The Cut Factory", city: "Oss", street: "Heschepad", houseNumber: "8", postalCode: "5342 CL", instagram: "cutfactory_oss" },
  { name: "Goldline Barbershop", city: "Alphen a/d Rijn", street: "Hooftstraat", houseNumber: "44", postalCode: "2406 GK", instagram: "goldline_alphen" },
  { name: "Barber District", city: "Spijkenisse", street: "Breestoep", houseNumber: "2", postalCode: "3201 EA", instagram: "barberdistrict" },
  { name: "Kapsalon Noir", city: "Capelle a/d IJssel", street: "Centrumpassage", houseNumber: "17", postalCode: "2903 HN", instagram: "noir_capelle" },
  { name: "Sharp & Clean", city: "Helmond", street: "Markt", houseNumber: "20", postalCode: "5701 RJ", instagram: "sharpclean_hlm" },
  { name: "The Fade Shop", city: "Purmerend", street: "Koemarkt", houseNumber: "13", postalCode: "1441 DA", instagram: "fadeshop_prmrnd" },
  { name: "Barber Supreme", city: "Rijswijk", street: "Herenstraat", houseNumber: "39", postalCode: "2282 BT", instagram: "supreme_rijswijk" },
  { name: "Kapsalon Cézanne", city: "Den Bosch", street: "Kerkstraat", houseNumber: "25", postalCode: "5211 KE", instagram: "cezanne_denbosch" },
  { name: "The Dapper Den", city: "Hoofddorp", street: "Kruisweg", houseNumber: "58", postalCode: "2132 NA", instagram: "dapperden_hfdp" },
  { name: "Ace Barbers", city: "Bergen op Zoom", street: "Fortuinstraat", houseNumber: "10", postalCode: "4611 NS", instagram: "ace_boz" },
  { name: "Kapsalon Ember", city: "Veenendaal", street: "Hoofdstraat", houseNumber: "76", postalCode: "3901 AH", instagram: "ember_veenendaal" },
  { name: "The Polished Look", city: "Nieuwegein", street: "Passage", houseNumber: "21", postalCode: "3431 EB", instagram: "polishedlook_nwg" },
  { name: "Crown Barbers", city: "Middelburg", street: "Lange Delft", houseNumber: "46", postalCode: "4331 AL", instagram: "crown_middelburg" },
  { name: "Kapsalon Onyx", city: "Hoorn", street: "Grote Noord", houseNumber: "33", postalCode: "1621 KC", instagram: "onyx_hoorn" },
  { name: "True Grit Barbers", city: "Goes", street: "Lange Kerkstraat", houseNumber: "7", postalCode: "4461 JC", instagram: "truegrit_goes" },
  { name: "Kapsalon Vogue", city: "Woerden", street: "Voorstraat", houseNumber: "62", postalCode: "3441 BH", instagram: "vogue_woerden" },
  { name: "The Finishing Touch", city: "Harderwijk", street: "Luttekepoortstraat", houseNumber: "14", postalCode: "3841 BE", instagram: "finishingtouch_hw" },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const contactNames = [
  "Ahmed K.", "Yusuf B.", "Kevin R.", "Mehmet A.", "Ricardo L.",
  "Ibrahim H.", "Danny V.", "Samir E.", "Patrick J.", "Hasan T.",
  "Mohamed S.", "Stefan D.", "Bilal N.", "Thomas W.", "Omar F.",
  "Nick P.", "Karim Z.", "Jesse M.", "Rachid C.", "Mike G.",
  "Amir O.", "Daan B.", "Jamal I.", "Lars K.", "Fouad H.",
  "Wesley R.", "Tariq M.", "Ruben S.", "Ismail D.", "Pieter V.",
  "Ali G.", "Dennis F.", "Younes B.", "Mark L.", "Farid A.",
  "Niels J.", "Hamza K.", "Sander H.", "Khalid E.", "Rob T.",
  "Said N.", "Jeroen W.", "Mustafa P.", "Vincent C.", "Zakaria M.",
  "Tim D.", "Nabil S.", "Martijn R.", "Ayoub F.", "Bas V.",
];

const phones = [
  "010", "020", "030", "070", "040", "013", "050", "036", "076", "023",
  "026", "024", "078", "071", "079", "033", "055", "053", "038", "043",
];

async function main() {
  console.log("Seeding 50 barbershops...\n");

  for (let i = 0; i < shops.length; i++) {
    const s = shops[i];
    const slug = generateSlug(s.name);
    const barbersCount = [4, 4, 6, 4, 8, 6, 4, 6, 4, 8][i % 10];
    const phone = `${phones[i % phones.length]}-${String(1000000 + Math.floor(Math.random() * 9000000)).slice(0, 7)}`;

    try {
      const created = await prisma.shop.upsert({
        where: { email: `info@${slug.replace(/-/g, "")}.nl` },
        update: {},
        create: {
          name: s.name,
          slug,
          contactName: contactNames[i],
          email: `info@${slug.replace(/-/g, "")}.nl`,
          phone,
          city: s.city,
          street: s.street,
          houseNumber: s.houseNumber,
          postalCode: s.postalCode,
          country: "Nederland",
          instagram: s.instagram,
          language: "nl_NL",
          barbersCount,
          status: "ACTIVE",
        },
      });

      // Add barbers
      const firstNames = ["Mo", "Yusuf", "Kevin", "Ali", "Danny", "Samir", "Rick", "Bilal", "Tom", "Omar"];
      const count = barbersCount;
      for (let b = 0; b < count; b++) {
        const barberName = firstNames[(i + b) % firstNames.length];
        await prisma.barber.upsert({
          where: { id: `${created.id}-${barberName.toLowerCase()}-${b}` },
          update: {},
          create: {
            id: `${created.id}-${barberName.toLowerCase()}-${b}`,
            name: barberName,
            shopId: created.id,
          },
        });
      }

      console.log(`${(i + 1).toString().padStart(2)}. ${s.name} (${s.city}) — ${count} kappers`);
    } catch (e) {
      console.log(`${(i + 1).toString().padStart(2)}. ${s.name} — SKIP (already exists)`);
    }
  }

  console.log("\nDone! 50 barbershops seeded.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
