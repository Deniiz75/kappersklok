import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";

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
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.jpg"
              alt="Kappersklok logo"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="font-heading text-lg font-bold">Kappersklok</span>
          </Link>

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

          <a
            href="https://www.instagram.com/kappersklok/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            <Instagram className="h-4 w-4" />
            Volg ons op Instagram
          </a>
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
