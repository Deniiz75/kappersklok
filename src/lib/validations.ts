import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Naam is verplicht"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().optional(),
  message: z.string().min(1, "Bericht is verplicht"),
});

export const registrationSchema = z.object({
  language: z.string().min(1, "Kies een taal"),
  contactName: z.string().min(1, "Naam is verplicht"),
  shopName: z.string().min(1, "Bedrijfsnaam is verplicht"),
  kvkNumber: z.string().optional(),
  country: z.string().min(1, "Kies een land"),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  privatePhone: z.string().optional(),
  email: z.string().email("Ongeldig e-mailadres"),
  instagram: z.string().optional(),
  howFoundUs: z.string().optional(),
  digibox: z.boolean().default(false),
  privateDomain: z.string().optional(),
  barbersCount: z.number().int().min(4).max(10).default(4),
  welcomePackage: z.boolean().default(false),
});

export const loginSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens zijn"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type RegistrationData = z.infer<typeof registrationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
