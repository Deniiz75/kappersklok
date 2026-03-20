"use server";

import { supabase } from "@/lib/db";
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
    const { error } = await supabase.from("ContactMessage").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    });
    if (error) throw error;
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
    // Check unique slug
    const { data: existing } = await supabase.from("Shop").select("id").eq("slug", slug).single();
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Check duplicate email
    const { data: emailExists } = await supabase.from("Shop").select("id").eq("email", d.email).single();
    if (emailExists) {
      return { success: false, error: "Dit e-mailadres is al geregistreerd." };
    }

    // Create user
    const passwordHash = await bcrypt.hash(d.password, 10);
    const { data: user, error: userError } = await supabase
      .from("User")
      .insert({ email: d.email, passwordHash, role: "BARBER" })
      .select("id, email, role")
      .single();
    if (userError || !user) throw userError;

    // Create shop
    const { error: shopError } = await supabase.from("Shop").insert({
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
    });
    if (shopError) throw shopError;

    await createSession({ userId: user.id, email: user.email, role: user.role });
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
    const { data: user, error } = await supabase
      .from("User")
      .select("id, email, passwordHash, role")
      .eq("email", parsed.data.email)
      .single();

    if (error || !user) {
      return { success: false, error: "Onjuist e-mailadres of wachtwoord." };
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Onjuist e-mailadres of wachtwoord." };
    }

    await createSession({ userId: user.id, email: user.email, role: user.role });
    return { success: true };
  } catch {
    return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  }
}
