import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Kappersklok — Online Kapper Afspraak Maken",
    template: "%s | Kappersklok",
  },
  description:
    "Makkelijk en snel een afspraak maken bij jouw kapper. Zonder registratie, binnen enkele seconden geboekt.",
  metadataBase: new URL("https://kappersklok.vercel.app"),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Kappersklok",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kappersklok — Online Kapper Afspraak Maken",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kappersklok — Online Kapper Afspraak Maken",
    description:
      "Makkelijk en snel een afspraak maken bij jouw kapper. Zonder registratie, binnen enkele seconden geboekt.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={dmSans.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
