interface HeroBannerProps {
  title: string;
  subtitle?: string;
}

export function HeroBanner({ title, subtitle }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden bg-surface py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
