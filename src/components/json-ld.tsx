interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  // JSON.stringify produces safe output for script[type=application/ld+json]
  // as it cannot contain </script> or execute code in this context
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Kappersklok",
        url: "https://kappersklok.vercel.app",
        logo: "https://kappersklok.vercel.app/og-image.jpg",
        description:
          "Makkelijk en snel een afspraak maken bij jouw kapper. Zonder registratie, binnen enkele seconden geboekt.",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          url: "https://kappersklok.vercel.app/contact",
        },
      }}
    />
  );
}

export function FAQPageSchema({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}

export function LocalBusinessSchema({
  name,
  city,
  street,
  postalCode,
  phone,
  slug,
}: {
  name: string;
  city?: string | null;
  street?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  slug: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BarberShop",
        name,
        url: `https://kappersklok.vercel.app/kapperszaak/${slug}`,
        ...(phone && { telephone: phone }),
        ...(city && {
          address: {
            "@type": "PostalAddress",
            streetAddress: street || undefined,
            addressLocality: city,
            postalCode: postalCode || undefined,
            addressCountry: "NL",
          },
        }),
      }}
    />
  );
}
