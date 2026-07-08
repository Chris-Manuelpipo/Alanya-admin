"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useReservedAlanyaPhones,
  useAddReservedPhone,
  useRemoveReservedPhone,
} from "@/hooks/useUsers";
import { formatDisplay, formatLiveInput, normalize, validate } from "@/lib/alanya-phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ReservedPhoneListSkeleton,
  ReservedPhonesListSectionSkeleton,
} from "@/components/skeletons";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Search, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";

function handleAssign(router: ReturnType<typeof useRouter>, phoneCanonical: string) {
  router.push(`/users/new?reserved=${encodeURIComponent(phoneCanonical)}`);
}

export default function ReservedAlanyaPhonesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const addMutation = useAddReservedPhone();
  const removeMutation = useRemoveReservedPhone();

  const [phone, setPhone] = useState("");
  const [label, setLabel] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [availableFilter, setAvailableFilter] = useState<"" | "1" | "0">("");

  const limit = 20;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, availableFilter]);

  const { data, isLoading, isFetching, isError, error } = useReservedAlanyaPhones({
    page,
    limit,
    q: debouncedSearch || undefined,
    available: availableFilter,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const canonical = normalize(phone);
    const err = validate(canonical);
    if (err || !label.trim()) {
      addToast({ title: "Invalid", description: err || "Libellé requis", variant: "error" });
      return;
    }
    try {
      await addMutation.mutateAsync({ phone: canonical, label: label.trim() });
      setPhone("");
      setLabel("");
      addToast({ title: "Ajouté", description: `${formatDisplay(canonical)} réservé` });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Erreur";
      addToast({ title: "Échec", description: msg, variant: "error" });
    }
  }

  async function handleRemove(canonical: string) {
    try {
      await removeMutation.mutateAsync(canonical);
      addToast({ title: "Retiré", description: formatDisplay(canonical) });
    } catch {
      addToast({ title: "Échec", variant: "error" });
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Numéros réservés</h1>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Ajouter un numéro réservé</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <Input
              value={phone}
              onChange={(e) => setPhone(formatLiveInput(e.target.value))}
              placeholder="Numéro (ex. 00 00 00 00)"
            />
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Libellé (ex. Opérateur)" />
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            Liste {isLoading ? "" : `(${total.toLocaleString("fr-FR")})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par numéro ou libellé…"
                className="pl-9"
              />
            </div>
            <select
              className="rounded-md border px-3 py-2 text-sm bg-background"
              value={availableFilter}
              onChange={(e) => {
                setAvailableFilter(e.target.value as "" | "1" | "0");
                setPage(1);
              }}
            >
              <option value="">Tous</option>
              <option value="1">Libres</option>
              <option value="0">Utilisés</option>
            </select>
          </div>

          {isError ? (
            <p className="text-sm text-red-600">
              {(error as { message?: string })?.message || "Impossible de charger la liste"}
            </p>
          ) : isLoading ? (
            <ReservedPhonesListSectionSkeleton count={8} />
          ) : items.length === 0 && !isFetching ? (
            <p className="text-sm text-zinc-500">Aucun numéro réservé</p>
          ) : isFetching ? (
            <ReservedPhoneListSkeleton count={6} />
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono font-medium">{formatDisplay(item.phoneCanonical)}</p>
                      {item.isUsed ? (
                        <Badge variant="secondary">Utilisé</Badge>
                      ) : (
                        <Badge variant="outline">Libre</Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">{item.label}</p>
                    {item.isUsed && item.usedByAlanyaId ? (
                      <p className="text-sm text-zinc-500 mt-0.5">
                        Assigné à{" "}
                        <Link
                          href={`/users/${item.usedByAlanyaId}`}
                          className="text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {item.usedByNom || item.usedByPseudo || `Utilisateur #${item.usedByAlanyaId}`}
                        </Link>
                      </p>
                    ) : (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Non assigné à un compte
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!item.isUsed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssign(router, item.phoneCanonical)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Attribuer
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(item.phoneCanonical)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {total > limit && (
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-zinc-500">
                Page {page} sur {pageCount} ({total.toLocaleString("fr-FR")} résultats)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pageCount || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
