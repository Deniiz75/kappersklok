import { getSession } from "@/lib/auth";
import { getShopByUserId, getAppointmentsForShop } from "@/lib/db";
import { redirect } from "next/navigation";
import { DigiboxDisplay } from "./digibox-display";

export const dynamic = "force-dynamic";

export default async function DigiboxPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "ADMIN") redirect("/dashboard");

  const shop = await getShopByUserId(session.userId);
  if (!shop) redirect("/dashboard");
  if (!shop.digibox) redirect("/dashboard");

  const today = new Date().toISOString().split("T")[0];
  const appointments = await getAppointmentsForShop(shop.id, today);

  const activeBarbers = (shop.barbers || []).filter(
    (b: { active: boolean }) => b.active
  );

  return (
    <DigiboxDisplay
      shopId={shop.id}
      shopName={shop.name}
      barbers={activeBarbers}
      initialAppointments={appointments}
    />
  );
}
