import { ButtonLink } from "@/components/button-link";

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center py-24">
      <div className="mx-auto max-w-md px-4 text-center">
        <p className="font-heading text-6xl font-bold text-gold">404</p>
        <h1 className="mt-4 font-heading text-2xl font-bold">
          Pagina niet gevonden
        </h1>
        <p className="mt-3 text-muted-foreground">
          Deze pagina bestaat niet of is verplaatst.
        </p>
        <ButtonLink
          href="/"
          className="mt-6 bg-gold text-background hover:bg-gold-hover font-semibold"
        >
          Terug naar home
        </ButtonLink>
      </div>
    </section>
  );
}
