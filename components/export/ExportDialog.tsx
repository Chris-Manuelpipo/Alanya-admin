"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Download, Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ANALYTICS_EXPORT_SECTIONS,
  type AnalyticsSectionId,
  type ExportFormat,
  type AdminExportParams,
  fetchAdminExport,
  triggerBlobDownload,
  buildUsersExportParams,
  buildAnalyticsExportParams,
  parseCsvPreview,
  formatExportSize,
} from "@/lib/admin-export";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type ExportKind = "users" | "analytics";
type Step = "configure" | "preview";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: ExportKind;
  filterParams: AdminExportParams;
  matchingTotal?: number;
}

export function ExportDialog({
  open,
  onOpenChange,
  kind,
  filterParams,
  matchingTotal,
}: ExportDialogProps) {
  const { addToast } = useToast();
  const [step, setStep] = useState<Step>("configure");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [exportAll, setExportAll] = useState(true);
  const [limit, setLimit] = useState("500");
  const [sections, setSections] = useState<Set<AnalyticsSectionId>>(
    () => new Set(ANALYTICS_EXPORT_SECTIONS.map((s) => s.id)),
  );
  const [loading, setLoading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewFilename, setPreviewFilename] = useState("");
  const [previewFormat, setPreviewFormat] = useState<ExportFormat>("pdf");
  const [csvPreview, setCsvPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);

  const clearPreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPreviewBlob(null);
    setPreviewFilename("");
    setCsvPreview(null);
  }, []);

  const resetDialog = useCallback(() => {
    setStep("configure");
    setFormat("pdf");
    setExportAll(true);
    setLimit("500");
    setSections(new Set(ANALYTICS_EXPORT_SECTIONS.map((s) => s.id)));
    clearPreview();
  }, [clearPreview]);

  useEffect(() => {
    if (!open) {
      resetDialog();
    }
  }, [open, kind, resetDialog]);

  function toggleSection(id: AnalyticsSectionId) {
    setSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllSections(select: boolean) {
    setSections(
      select ? new Set(ANALYTICS_EXPORT_SECTIONS.map((s) => s.id)) : new Set(),
    );
  }

  function buildExportParams(): {
    resource: 'users' | 'analytics';
    params: AdminExportParams;
    fallback: string;
    fmt: ExportFormat;
  } {
    if (kind === "users") {
      const parsedLimit = parseInt(limit, 10);
      const params = buildUsersExportParams(filterParams, {
        format,
        limit: exportAll ? "all" : parsedLimit,
      });
      return {
        resource: "users",
        params,
        fallback: `alanya_users.${format === "csv" ? "csv" : "pdf"}`,
        fmt: format,
      };
    }
    // Array.from plutôt que l'opérateur de décomposition : la cible TS du
    // projet n'autorise pas l'itération directe d'un Set (downlevelIteration).
    const params = buildAnalyticsExportParams(filterParams, { sections: Array.from(sections) });
    return {
      resource: "analytics",
      params,
      fallback: "alanya_analytics.pdf",
      fmt: "pdf",
    };
  }

  function validateConfigure(): string | null {
    if (kind === "users") {
      if (!exportAll) {
        const parsedLimit = parseInt(limit, 10);
        if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
          return "Indiquez un nombre positif ou cochez « Tous ».";
        }
      }
      return null;
    }
    if (sections.size === 0) return "Sélectionnez au moins une section.";
    return null;
  }

  async function handlePreview() {
    const err = validateConfigure();
    if (err) {
      addToast({ title: "Export impossible", description: err, variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const { resource, params, fallback, fmt } = buildExportParams();
      clearPreview();
      const result = await fetchAdminExport(resource, params, fallback);

      setPreviewBlob(result.blob);
      setPreviewFilename(result.filename);
      setPreviewFormat(fmt);

      if (fmt === "pdf") {
        setPreviewUrl(URL.createObjectURL(result.blob));
      } else {
        const text = await result.blob.text();
        setCsvPreview(parseCsvPreview(text));
      }

      setStep("preview");
    } catch (err) {
      addToast({
        title: "Génération échouée",
        description: err instanceof Error ? err.message : "Erreur inconnue",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!previewBlob || !previewFilename) return;
    triggerBlobDownload(previewBlob, previewFilename);
    addToast({ title: "Téléchargement lancé", description: previewFilename, variant: "success" });
    onOpenChange(false);
  }

  function handleBack() {
    clearPreview();
    setStep("configure");
  }

  const isPreview = step === "preview";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetDialog();
        onOpenChange(next);
      }}
    >
      <DialogContent className={cn(isPreview ? "sm:max-w-4xl max-h-[90vh] flex flex-col" : "sm:max-w-md")}>
        <DialogHeader>
          <DialogTitle>
            {isPreview
              ? "Aperçu de l'export"
              : kind === "users"
                ? "Exporter les utilisateurs"
                : "Exporter le rapport analytics"}
          </DialogTitle>
          <DialogDescription>
            {isPreview ? (
              <>
                Vérifiez le contenu avant de télécharger.
                {previewBlob ? (
                  <span className="block mt-1 font-medium text-foreground">
                    {previewFilename} · {formatExportSize(previewBlob.size)}
                  </span>
                ) : null}
              </>
            ) : kind === "users" ? (
              <>
                Les filtres actuellement appliqués à la liste seront repris.
                {matchingTotal != null ? (
                  <span className="block mt-1 font-medium text-foreground">
                    {matchingTotal.toLocaleString("fr-FR")} utilisateur(s) correspondant aux filtres
                  </span>
                ) : null}
              </>
            ) : (
              "La période affichée sera utilisée. Choisissez les sections à inclure."
            )}
          </DialogDescription>
        </DialogHeader>

        {isPreview ? (
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-zinc-100 dark:bg-zinc-900">
            {previewFormat === "pdf" && previewUrl ? (
              <iframe
                title="Aperçu PDF"
                src={previewUrl}
                className="h-[min(62vh,520px)] w-full bg-white"
              />
            ) : csvPreview ? (
              <div className="h-[min(62vh,520px)] overflow-auto p-3">
                <p className="text-xs text-zinc-500 mb-2">
                  Extrait des {csvPreview.rows.length} premières lignes (aperçu)
                </p>
                <div className="overflow-x-auto rounded-md border bg-card">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {csvPreview.headers.map((h) => (
                          <th key={h} className="px-2 py-1.5 text-left font-medium whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.rows.map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          {row.map((cell, j) => (
                            <td key={j} className="px-2 py-1.5 whitespace-nowrap max-w-[180px] truncate">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-zinc-500">
                Aperçu indisponible
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {kind === "users" ? (
              <>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <div className="flex gap-2">
                    {(["pdf", "csv"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormat(f)}
                        className={cn(
                          "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                          format === f
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                            : "border-input hover:bg-muted/50",
                        )}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nombre d&apos;utilisateurs</Label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportAll}
                      onChange={(e) => setExportAll(e.target.checked)}
                      className="rounded border-zinc-300 accent-indigo-600"
                    />
                    Tous (sans limite)
                  </label>
                  {!exportAll ? (
                    <Input
                      type="number"
                      min={1}
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      placeholder="Ex. 500"
                    />
                  ) : null}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Sections du rapport</Label>
                  <div className="flex gap-2 text-xs">
                    <button type="button" className="text-indigo-600 hover:underline" onClick={() => selectAllSections(true)}>
                      Tout
                    </button>
                    <button type="button" className="text-zinc-500 hover:underline" onClick={() => selectAllSections(false)}>
                      Aucun
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto rounded-lg border p-3">
                  {ANALYTICS_EXPORT_SECTIONS.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sections.has(s.id)}
                        onChange={() => toggleSection(s.id)}
                        className="rounded border-zinc-300 accent-indigo-600"
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-3">
          {isPreview ? (
            <>
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Modifier
              </Button>
              <Button onClick={handleDownload} disabled={!previewBlob}>
                <Download className="h-4 w-4 mr-1" /> Télécharger
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Annuler
              </Button>
              <Button onClick={handlePreview} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Eye className="h-4 w-4 mr-1" />}
                Aperçu
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
