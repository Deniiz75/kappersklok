"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Smartphone, Users, CheckCircle } from "lucide-react";

export default function PlatformPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/platform-settings")
      .then((res) => res.json())
      .then((data) => { setSettings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/platform-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const appGateEnabled = settings.app_gate_enabled === "true";

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Laden...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Platform instellingen</h1>
      </div>
      <p className="mt-1 text-muted-foreground">Beheer platform-brede instellingen</p>

      {/* App Gate Toggle */}
      <Card className="mt-6 border-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Smartphone className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">App-gate</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Wanneer ingeschakeld, worden klanten doorgestuurd naar de app download pagina in plaats van de booking wizard.
                  </p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, app_gate_enabled: appGateEnabled ? "false" : "true" })}
                  className={`relative h-7 w-12 rounded-full transition-colors ${appGateEnabled ? "bg-[#2ECC71]" : "bg-muted"}`}
                >
                  <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${appGateEnabled ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>

              {/* Status badge */}
              <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                appGateEnabled
                  ? "bg-[#2ECC71]/10 text-[#2ECC71]"
                  : "bg-muted text-muted-foreground"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${appGateEnabled ? "bg-[#2ECC71]" : "bg-muted-foreground"}`} />
                {appGateEnabled ? "Actief — klanten zien de app download" : "Uitgeschakeld — normale web booking"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store URLs */}
      <Card className="mt-4 border-border">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">App Store links</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Apple App Store URL</label>
              <Input
                value={settings.app_store_url || ""}
                onChange={(e) => setSettings({ ...settings, app_store_url: e.target.value })}
                placeholder="https://apps.apple.com/nl/app/kappersklok/..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Google Play Store URL</label>
              <Input
                value={settings.play_store_url || ""}
                onChange={(e) => setSettings({ ...settings, play_store_url: e.target.value })}
                placeholder="https://play.google.com/store/apps/details?id=..."
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="mt-6 flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground text-white hover:bg-foreground/90 rounded-xl px-6"
        >
          {saving ? "Opslaan..." : "Opslaan"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-[#2ECC71]">
            <CheckCircle className="h-4 w-4" />
            Opgeslagen
          </span>
        )}
      </div>
    </div>
  );
}
