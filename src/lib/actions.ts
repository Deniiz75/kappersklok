"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { contactFormSchema, registrationSchema, loginSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

type ActionResult = { success: true } | { success: false; error: string };

export async function submitContactForm(data: unknown): Promise<ActionResult> {
  const parsed = contactFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function registerShop(data: unknown): Promise<ActionResult> {
  const parsed = registrationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;
  let slug = generateSlug(d.shopName);

  try {
    // Ensure unique slug
    const existing = await prisma.shop.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Check duplicate email
    const emailExists = await prisma.shop.findUnique({ where: { email: d.email } });
    if (emailExists) {
      return { success: false, error: "Dit e-mailadres is al geregistreerd." };
    }

    // Create user account
    const passwordHash = await bcrypt.hash(d.password, 10);
    const user = await prisma.user.create({
      data: {
        email: d.email,
        passwordHash,
        role: "BARBER",
      },
    });

    // Create shop linked to user
    await prisma.shop.create({
      data: {
        name: d.shopName,
        slug,
        contactName: d.contactName,
        email: d.email,
        phone: d.phone || null,
        privatePhone: d.privatePhone || null,
        kvkNumber: d.kvkNumber || null,
        country: d.country,
        street: d.street || null,
        houseNumber: d.houseNumber || null,
        city: d.city || null,
        postalCode: d.postalCode || null,
        instagram: d.instagram || null,
        howFoundUs: d.howFoundUs || null,
        language: d.language,
        digibox: d.digibox,
        privateDomain: d.privateDomain || null,
        barbersCount: d.barbersCount,
        welcomePackage: d.welcomePackage,
        userId: user.id,
      },
    });

    // Auto-login after registration
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { success: true };
  } catch {
    return { success: false, error: "Er ging iets mis bij de registratie." };
  }
}

export async function loginAction(data: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return { success: false, error: "Onjuist e-mailadres of wachtwoord." };
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Onjuist e-mailadres of wachtwoord." };
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { success: true };
  } catch {
    return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  }
}
