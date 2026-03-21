"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/db";
import {
  barberCreateService,
  barberUpdateService,
  barberDeleteService,
} from "@/lib/barber-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Euro, Pencil, Trash2, Plus, X, Check } from "lucide-react";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
  sortOrder: number;
}

interface BusinessHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

function formatPrice(cents: number) {
  return `\u20AC${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const dayNames = [
  "Zondag",
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
];

export default function DienstenPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", duration: 0, price: 0, active: true });

  // New service state
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", duration: 30, price: 0 });

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Action loading
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShop() {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const me = await res.json();

      const { data: shop } = await supabase
        .from("Shop")
        .select("id")
        .eq("userId", me.userId)
        .single();

      if (shop) setShopId(shop.id);
    }
    loadShop();
  }, []);

  const loadData = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);

    const [servicesRes, hoursRes] = await Promise.all([
      supabase
        .from("Service")
        .select("id, name, duration, price, active, sortOrder")
        .eq("shopId", shopId)
        .order("sortOrder"),
      supabase
        .from("BusinessHours")
        .select("dayOfWeek, openTime, closeTime, closed")
        .eq("shopId", shopId)
        .order("dayOfWeek"),
    ]);

    setServices((servicesRes.data as Service[]) || []);
    setBusinessHours((hoursRes.data as BusinessHour[]) || []);
    setLoading(false);
  }, [shopId]);

  useEffect(() => {
    if (shopId) loadData();
  }, [shopId, loadData]);

  function startEdit(service: Service) {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      duration: service.duration,
      price: service.price / 100,
      active: service.active,
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
  }

  async function saveEdit(serviceId: string) {
    if (!editForm.name.trim()) return;
    setActionLoading(true);
    setError(null);

    const result = await barberUpdateService(serviceId, {
      name: editForm.name.trim(),
      duration: editForm.duration,
      price: Math.round(editForm.price * 100),
      active: editForm.active,
    });

    if (!result.success) {
      setError(result.error || "Er ging iets mis.");
    } else {
      setEditingId(null);
      loadData();
    }
    setActionLoading(false);
  }

  async function handleCreate() {
    if (!newForm.name.trim()) return;
    setActionLoading(true);
    setError(null);

    const result = await barberCreateService({
      name: newForm.name.trim(),
      duration: newForm.duration,
      price: Math.round(newForm.price * 100),
    });

    if (!result.success) {
      setError(result.error || "Er ging iets mis.");
    } else {
      setShowNew(false);
      setNewForm({ name: "", duration: 30, price: 0 });
      loadData();
    }
    setActionLoading(false);
  }

  async function handleDelete(serviceId: string) {
    setActionLoading(true);
    setError(null);

    const result = await barberDeleteService(serviceId);

    if (!result.success) {
      setError(result.error || "Er ging iets mis.");
      setDeletingId(null);
    } else {
      setDeletingId(null);
      loadData();
    }
    setActionLoading(false);
  }

  async function toggleActive(service: Service) {
    setActionLoading(true);
    await barberUpdateService(service.id, { active: !service.active });
    setActionLoading(false);
    loadData();
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold">Diensten & Openingstijden</h1>
        <p className="mt-4 text-sm text-muted-foreground">Laden...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Diensten & Openingstijden</h1>
      <p className="mt-1 text-muted-foreground">Beheer uw diensten en openingstijden</p>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Services */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Diensten ({services.length})</h2>
          {!showNew && (
            <Button
              size="sm"
              onClick={() => { setShowNew(true); setEditingId(null); setError(null); }}
              className="h-8 bg-gold/10 text-gold hover:bg-gold/20 text-xs px-3"
            >
              <Plus className="h-3 w-3 mr-1" /> Nieuwe dienst
            </Button>
          )}
        </div>

        {/* New service form */}
        {showNew && (
          <Card className="mt-3 border-gold/30 bg-surface">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium">Nieuwe dienst toevoegen</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs text-muted-foreground">Naam</label>
                  <input
                    type="text"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    placeholder="bijv. Knippen"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Duur (min)</label>
                  <input
                    type="number"
                    value={newForm.duration}
                    onChange={(e) => setNewForm({ ...newForm, duration: Number(e.target.value) })}
                    min={5}
                    step={5}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Prijs (euro)</label>
                  <input
                    type="number"
                    value={newForm.price || ""}
                    onChange={(e) => setNewForm({ ...newForm, price: Number(e.target.value) })}
                    min={0}
                    step={0.5}
                    placeholder="0,00"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:border-gold/50"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={actionLoading || !newForm.name.trim()}
                  onClick={handleCreate}
                  className="h-7 bg-gold/10 text-gold hover:bg-gold/20 text-xs px-3"
                >
                  <Check className="h-3 w-3 mr-1" /> Toevoegen
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowNew(false); setError(null); }}
                  className="h-7 text-xs px-3 border-border"
                >
                  <X className="h-3 w-3 mr-1" /> Annuleren
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service cards */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {services.map((service) => {
            const isEditing = editingId === service.id;
            const isDeleting = deletingId === service.id;

            if (isEditing) {
              return (
                <Card key={service.id} className="border-gold/30 bg-surface">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Naam</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:border-gold/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Duur (min)</label>
                        <input
                          type="number"
                          value={editForm.duration}
                          onChange={(e) => setEditForm({ ...editForm, duration: Number(e.target.value) })}
                          min={5}
                          step={5}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:border-gold/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Prijs (euro)</label>
                        <input
                          type="number"
                          value={editForm.price || ""}
                          onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                          min={0}
                          step={0.5}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:border-gold/50"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditForm({ ...editForm, active: !editForm.active })}
                        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                          editForm.active ? "bg-gold" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            editForm.active ? "translate-x-4" : "translate-x-0.5"
                          } mt-0.5`}
                        />
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {editForm.active ? "Actief" : "Inactief"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => saveEdit(service.id)}
                        className="h-7 bg-gold/10 text-gold hover:bg-gold/20 text-xs px-3"
                      >
                        <Check className="h-3 w-3 mr-1" /> Opslaan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        className="h-7 text-xs px-3 border-border"
                      >
                        <X className="h-3 w-3 mr-1" /> Annuleren
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={service.id} className="border-border bg-surface">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {service.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        service.active
                          ? "bg-gold/10 text-gold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {service.active ? "Actief" : "Inactief"}
                    </span>
                    <button
                      onClick={() => startEdit(service)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Bewerken"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {isDeleting ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleDelete(service.id)}
                          className="h-6 bg-destructive/10 text-destructive hover:bg-destructive/20 text-[10px] px-2"
                        >
                          Ja, verwijder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeletingId(null)}
                          className="h-6 text-[10px] px-2 border-border"
                        >
                          Nee
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setDeletingId(service.id); setError(null); }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Verwijderen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {services.length === 0 && !showNew && (
          <Card className="mt-3 border-border bg-surface">
            <CardContent className="p-6 text-center text-muted-foreground">
              Nog geen diensten. Voeg je eerste dienst toe.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Business Hours (read-only) */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Openingstijden</h2>
        <div className="mt-3">
          <Card className="border-border bg-surface">
            <CardContent className="p-0">
              {businessHours.map((h, i) => (
                <div
                  key={h.dayOfWeek}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < businessHours.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-sm font-medium w-28">{dayNames[h.dayOfWeek]}</span>
                  {h.closed ? (
                    <span className="text-sm text-muted-foreground">Gesloten</span>
                  ) : (
                    <span className="text-sm font-mono">
                      {h.openTime} — {h.closeTime}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
