import Link from "next/link";
import { BrandLink } from "@/components/brand-link";

const footerLinks = [
  { href: "/registreren", label: "Registreren informatie" },
  { href: "/voorwaarden", label: "Algemene voorwaarden" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <BrandLink logoSize={32} wordmarkSize="sm" />

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Kappersklok. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
}
