import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BerichtenPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Only admin can see all messages
  const isAdmin = session.role === "ADMIN";

  const { data: messages } = await supabase
    .from("ContactMessage")
    .select("*")
    .order("createdAt", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Berichten</h1>
      <p className="mt-1 text-muted-foreground">
        {isAdmin
          ? `Alle contactberichten (${messages?.length || 0})`
          : "Contactberichten zijn alleen zichtbaar voor beheerders."}
      </p>

      {!isAdmin ? (
        <Card className="mt-6 border-border bg-surface">
          <CardContent className="p-6 text-center text-muted-foreground">
            U heeft geen toegang tot berichten. Neem contact op met de beheerder.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {(!messages || messages.length === 0) ? (
            <Card className="border-border bg-surface">
              <CardContent className="p-6 text-center text-muted-foreground">
                Nog geen berichten ontvangen.
              </CardContent>
            </Card>
          ) : (
            messages.map((msg) => (
              <Card key={msg.id} className={`border-border ${msg.read ? "bg-surface" : "bg-surface border-gold/20"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Mail className={`mt-0.5 h-4 w-4 shrink-0 ${msg.read ? "text-muted-foreground" : "text-gold"}`} />
                      <div>
                        <p className="text-sm font-medium">{msg.name}</p>
                        <p className="text-xs text-muted-foreground">{msg.email}</p>
                        {msg.phone && <p className="text-xs text-muted-foreground">{msg.phone}</p>}
                        <p className="mt-2 text-sm text-muted-foreground">{msg.message}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString("nl-NL")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
