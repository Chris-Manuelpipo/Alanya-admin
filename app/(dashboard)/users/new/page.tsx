"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateUser, useReservedAlanyaPhones } from "@/hooks/useUsers";
import { ReservedPhoneSearchSkeleton, SelectFieldSkeleton } from "@/components/skeletons";
import { useCountries } from "@/hooks/useCountries";
import { useIsSuperAdmin } from "@/hooks/useAdminUser";
import { formatDisplay, formatLiveInput, normalize, validate } from "@/lib/alanya-phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import type { CreateUserPayload } from "@/types";

function randomPassword(length = 10): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function NewUserPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const isSuper = useIsSuperAdmin();
  const createMutation = useCreateUser();
  const { data: countries = [], isLoading: loadingCountries } = useCountries();

  const [nom, setNom] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneMode, setPhoneMode] = useState<"auto" | "manual">("auto");
  const [manualPhone, setManualPhone] = useState("");
  const [idPays, setIdPays] = useState(10);
  const [avatarGender, setAvatarGender] = useState<"male" | "female">("male");
  const [typeCompte, setTypeCompte] = useState(0);
  const [selectedReservedPhone, setSelectedReservedPhone] = useState("");
  const [reservedSearch, setReservedSearch] = useState("");
  const [debouncedReservedSearch, setDebouncedReservedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedReservedSearch(reservedSearch), 300);
    return () => clearTimeout(timer);
  }, [reservedSearch]);

  const { data: reservedData, isFetching: reservedFetching } = useReservedAlanyaPhones(
    {
      page: 1,
      limit: 20,
      q: debouncedReservedSearch || undefined,
      available: "1",
    },
    { enabled: debouncedReservedSearch.length > 0 },
  );
  const availableReservedPhones = reservedData?.items ?? [];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reserved = new URLSearchParams(window.location.search).get("reserved");
    if (!reserved) return;
    const canonical = normalize(reserved);
    setSelectedReservedPhone(canonical);
  }, []);

  useEffect(() => {
    if (countries.length === 0) return;
    setIdPays((current) =>
      countries.some((c) => c.idPays === current) ? current : countries[0].idPays,
    );
  }, [countries]);

  function handlePhoneInput(val: string) {
    setManualPhone(formatLiveInput(val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim() || !pseudo.trim() || !password) {
      addToast({ title: "Champs requis", description: "Nom, pseudo et mot de passe obligatoires", variant: "error" });
      return;
    }

    const payload: CreateUserPayload = {
      nom: nom.trim(),
      pseudo: pseudo.trim(),
      password,
      idPays,
      avatarGender,
    };

    if (email.trim()) payload.email = email.trim().toLowerCase();

    if (selectedReservedPhone) {
      payload.alanyaPhone = selectedReservedPhone;
    } else if (phoneMode === "manual") {
      const canonical = normalize(manualPhone);
      const err = validate(canonical);
      if (err) {
        addToast({ title: "Numéro invalide", description: err, variant: "error" });
        return;
      }
      payload.alanyaPhone = canonical;
    }

    if (isSuper) payload.type_compte = typeCompte;

    try {
      const user = await createMutation.mutateAsync(payload);
      addToast({ title: "Utilisateur créé", description: `Compte ${user.nom} créé avec succès` });
      router.push(`/users/${user.alanyaID}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Erreur création";
      addToast({ title: "Échec", description: msg, variant: "error" });
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/users")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Créer un utilisateur</h1>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Informations du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom *</label>
                <Input value={nom} onChange={(e) => setNom(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium">Pseudo *</label>
                <Input value={pseudo} onChange={(e) => setPseudo(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Obligatoire sauf compte 3 chiffres" />
            </div>

            <div>
              <label className="text-sm font-medium">Mot de passe *</label>
              <div className="flex gap-2">
                <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button type="button" variant="outline" size="icon" onClick={() => setPassword(randomPassword())} title="Générer">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Numéro Alanya</label>
              <div className="mb-3">
                <label className="text-sm text-zinc-500 block mb-1">Numéro réservé (optionnel)</label>
                {selectedReservedPhone ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono flex-1">
                      {formatDisplay(selectedReservedPhone)}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReservedPhone("")}
                    >
                      Effacer
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      value={reservedSearch}
                      onChange={(e) => setReservedSearch(e.target.value)}
                      placeholder="Rechercher un numéro libre…"
                      className="mb-2"
                    />
                    {reservedFetching ? (
                      <ReservedPhoneSearchSkeleton count={4} />
                    ) : availableReservedPhones.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto rounded-md border divide-y">
                        {availableReservedPhones.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                            onClick={() => {
                              setSelectedReservedPhone(item.phoneCanonical);
                              setReservedSearch("");
                            }}
                          >
                            <span className="font-mono">{formatDisplay(item.phoneCanonical)}</span>
                            <span className="text-zinc-500"> — {item.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : debouncedReservedSearch ? (
                      <p className="text-sm text-zinc-500">Aucun numéro libre trouvé</p>
                    ) : (
                      <p className="text-sm text-zinc-500">
                        Saisissez un numéro pour rechercher parmi les réservés libres
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className={`flex gap-4 mb-3 ${selectedReservedPhone ? "opacity-50 pointer-events-none" : ""}`}>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked={phoneMode === "auto"} onChange={() => setPhoneMode("auto")} />
                  Auto-générer
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked={phoneMode === "manual"} onChange={() => setPhoneMode("manual")} />
                  Saisie manuelle
                </label>
              </div>
              {phoneMode === "auto" ? (
                <p className={`text-sm text-zinc-500 ${selectedReservedPhone ? "opacity-50" : ""}`}>
                  8 chiffres (génération automatique, hors numéros réservés)
                </p>
              ) : (
                <Input
                  value={manualPhone}
                  onChange={(e) => handlePhoneInput(e.target.value)}
                  placeholder="007 / 12 34 / 00 00 00 00"
                  disabled={!!selectedReservedPhone}
                  className={selectedReservedPhone ? "opacity-50" : ""}
                />
              )}
              {selectedReservedPhone && (
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                  Numéro attribué : {formatDisplay(selectedReservedPhone)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {loadingCountries ? (
                <SelectFieldSkeleton />
              ) : (
              <div>
                <label className="text-sm font-medium">Pays</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background disabled:opacity-50"
                  value={idPays}
                  onChange={(e) => setIdPays(Number(e.target.value))}
                  disabled={countries.length === 0}
                  required
                >
                  {countries.map((country) => (
                    <option key={country.idPays} value={country.idPays}>
                      {country.libelle} ({country.prefix})
                    </option>
                  ))}
                </select>
              </div>
              )}
              <div>
                <label className="text-sm font-medium">Avatar</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  value={avatarGender}
                  onChange={(e) => setAvatarGender(e.target.value as "male" | "female")}
                >
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
              </div>
            </div>

            {isSuper && (
              <div>
                <label className="text-sm font-medium">Rôle</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  value={typeCompte}
                  onChange={(e) => setTypeCompte(Number(e.target.value))}
                >
                  <option value={0}>Utilisateur</option>
                  <option value={1}>Admin</option>
                  <option value={2}>Super-admin</option>
                </select>
              </div>
            )}

            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le compte"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
