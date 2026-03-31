"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, User } from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function GebruikersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("User")
        .select("id, email, role, createdAt")
        .order("createdAt", { ascending: false });
      setUsers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Gebruikers</h1>
      <p className="mt-1 text-muted-foreground">Alle geregistreerde gebruikers ({users.length})</p>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Laden...</p>
      ) : (
        <div className="mt-6 space-y-2">
          {users.map((user) => (
            <Card key={user.id} className="border-border bg-surface">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    user.role === "ADMIN" ? "bg-gold/10" : "bg-muted"
                  }`}>
                    {user.role === "ADMIN" ? (
                      <ShieldCheck className="h-4 w-4 text-gold" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("nl-NL")}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  user.role === "ADMIN" ? "bg-gold/10 text-gold" : "bg-muted text-muted-foreground"
                }`}>
                  {user.role === "ADMIN" ? "Beheerder" : "Kapper"}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
