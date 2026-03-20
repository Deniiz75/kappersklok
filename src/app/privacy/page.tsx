import type { Metadata } from "next";
import { HeroBanner } from "@/components/hero-banner";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy van Kappersklok. Lees hoe wij omgaan met uw persoonsgegevens.",
};

const sections = [
  {
    title: "1) Waarborgen Privacy",
    content: "Het waarborgen van de privacy van bezoekers van Kappersklok is een belangrijke taak voor ons. Daarom beschrijven we in onze privacy policy welke informatie we verzamelen en hoe we deze informatie gebruiken.",
  },
  {
    title: "2) Toestemming",
    content: "Door de informatie en de diensten op Kappersklok te gebruiken, gaat u akkoord met onze privacy policy en de voorwaarden die wij hierin hebben opgenomen.",
  },
  {
    title: "3) Vragen",
    content: "Als u meer informatie wilt ontvangen, of vragen hebt over de privacy policy van Kappersklok, kun u ons benaderen via e-mail. Ons e-mailadres is info@kappersklok.nl.",
  },
  {
    title: "4) Monitoren gedrag bezoeker",
    content: "Kappersklok maakt gebruik van verschillende technieken om bij te houden wie de website bezoekt, hoe deze bezoeker zich op de website gedraagt en welke pagina's worden bezocht. Dat is een gebruikelijke manier van werken voor websites omdat het informatie oplevert die bijdraagt aan de kwaliteit van de gebruikerservaring. De informatie die we, via cookies, registreren, bestaat uit onder meer IP-adressen, het type browser en de bezochte pagina's. Tevens monitoren we waar bezoekers de website voor het eerst bezoeken en vanaf welke pagina ze vertrekken. Deze informatie houden we anoniem bij en is niet gekoppeld aan andere persoonlijke informatie.",
  },
  {
    title: "5) Gebruik van cookies",
    content: "Kappersklok plaatst cookies bij bezoekers. Dat doen we om informatie te verzamelen over de pagina's die gebruikers op onze website bezoeken, om bij te houden hoe vaak bezoekers terug komen en om te zien welke pagina's het goed doen op de website. Ook houden we bij welke informatie de browser deelt.",
  },
  {
    title: "6) Cookies uitschakelen",
    content: "U kunt er voor kiezen om cookies uit te schakelen. Dat doet u door gebruik te maken van de mogelijkheden van uw browser. U vindt meer informatie over deze mogelijkheden op de website van de aanbieder van uw browser.",
  },
  {
    title: "7) Cookies van derde partijen",
    content: "Het is mogelijk dat derde partijen, zoals Google, op onze website adverteren of dat wij gebruik maken van een andere dienst. Daarvoor plaatsen deze derde partijen in sommige gevallen cookies. Deze cookies zijn niet door Kappersklok te beïnvloeden.",
  },
  {
    title: "8) Privacy policy van adverteerders/derde partijen",
    content: "Voor meer informatie over de privacy policy van onze adverteerders en derde partijen die verbonden zijn aan deze website, kun u terecht op de websites van deze respectievelijke partijen. Kappersklok kan geen invloed uitoefenen op deze cookies en de privacy policy van door derden geplaatste cookies. Deze cookies vallen buiten het bereik van de privacy policy van Kappersklok.",
  },
  {
    title: "9) Google Data (enkel voor kappers)",
    content: "Onze applicatie/website biedt de functionaliteit aan om gebruik te maken van Google Agenda om afspraken te synchroniseren. Bij het inschakelen van deze functionaliteit zal: wanneer een afspraak wordt gemaakt, deze zelfde afspraak ook te zien zijn in uw Google Agenda. Voor authenticatie van een Google Account wordt er gebruik gemaakt van Google oAuth Access.",
  },
  {
    title: "10) Data verwijderen",
    content: "Indien je al je data verwijderd wilt hebben, kun je dit aanvragen door contact op te nemen via het contact formulier op onze website.",
  },
  {
    title: "11) Instagram/Meta data (enkel voor kappers)",
    content: "Onze applicatie/website maakt het mogelijk om te verbinden met Instagram/Meta zodat je je meest recente posts op je Kappersklok profiel kunt tonen. Behalve de access token om de connectie met Instagram/Meta in stand te houden, wordt er geen data vanuit Instagram/Meta opgeslagen in onze backend.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <HeroBanner title="Privacy Policy" />
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="space-y-8">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="text-lg font-bold">{s.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
