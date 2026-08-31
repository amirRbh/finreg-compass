import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import {
  bandeFiabiliteL,
  libelleSeverite,
  nb,
  type Dimension,
  type Fiabilite,
  type Severite,
} from "@/lib/finreg";
import { useLangue } from "@/lib/langue";

/* ── Étiquettes ──────────────────────────────────────────────────────────── */

type TonPastille = "neutre" | "accent" | "succes" | "danger" | "attention";

const TONS: Record<TonPastille, string> = {
  neutre: "border-border bg-surface-sunken text-muted-foreground",
  accent: "border-accent/35 bg-accent-soft text-accent",
  succes: "border-success/35 bg-success-soft text-success",
  danger: "border-danger/35 bg-danger-soft text-danger",
  attention: "border-chart-4/40 bg-chart-4/10 text-chart-4",
};

export function Pastille({
  children,
  ton = "neutre",
  className = "",
}: {
  children: ReactNode;
  ton?: TonPastille;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase ${TONS[ton]} ${className}`}
    >
      {children}
    </span>
  );
}

const TONS_SEVERITE: Record<Severite, TonPastille> = {
  critical: "danger",
  high: "attention",
  medium: "neutre",
};

export function PastilleSeverite({ severite }: { severite: Severite }) {
  const { langue } = useLangue();
  return (
    <Pastille ton={TONS_SEVERITE[severite]}>
      <span
        aria-hidden="true"
        className={`inline-block size-1.5 ${
          severite === "critical"
            ? "bg-danger"
            : severite === "high"
              ? "bg-chart-4"
              : "bg-muted-foreground"
        }`}
      />
      {libelleSeverite(severite, langue)}
    </Pastille>
  );
}

/** Marqueur de données de démonstration. Jamais optionnel là où il s'applique. */
export function PastilleDemo({ children }: { children?: ReactNode }) {
  const { t } = useLangue();
  return (
    <Pastille ton="attention" className="font-medium">
      {children ?? t("Demo data", "Données de démonstration")}
    </Pastille>
  );
}

/* ── Boutons ─────────────────────────────────────────────────────────────── */

const BASE_CTA =
  "inline-flex items-center justify-center gap-2 border px-5 py-3 font-mono text-[11px] font-medium tracking-[0.14em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export const CLASSES_CTA = {
  primaire: `${BASE_CTA} border-foreground bg-foreground text-background hover:border-accent hover:bg-accent`,
  secondaire: `${BASE_CTA} border-border bg-surface text-foreground hover:border-foreground hover:bg-surface-sunken`,
  discret: `${BASE_CTA} border-transparent px-0 text-accent hover:text-foreground`,
};

export function BoutonLien({
  variante = "primaire",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variante?: keyof typeof CLASSES_CTA }) {
  return <Link {...props} className={`${CLASSES_CTA[variante]} ${className}`} />;
}

export function Bouton({
  variante = "primaire",
  className = "",
  ...props
}: ComponentProps<"button"> & { variante?: keyof typeof CLASSES_CTA }) {
  return <button {...props} className={`${CLASSES_CTA[variante]} ${className}`} />;
}

/* ── Bandeau de provenance : version, date, périmètre, taille ────────────── */

export function BandeauProvenance({
  entrees,
  className = "",
}: {
  entrees: [string, string][];
  className?: string;
}) {
  return (
    <dl
      className={`flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-rule py-2.5 ${className}`}
    >
      {entrees.map(([k, v]) => (
        <div key={k} className="flex items-baseline gap-2">
          <dt className="etiquette">{k}</dt>
          <dd className="font-mono text-[11px] tabulaire text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ── Tuiles de chiffres ──────────────────────────────────────────────────── */

export function Tuile({
  etiquette,
  valeur,
  unite,
  note,
  ton = "neutre",
}: {
  etiquette: string;
  valeur: string;
  unite?: string;
  note?: ReactNode;
  ton?: "neutre" | "accent" | "danger";
}) {
  return (
    <div className="bg-surface px-5 py-4">
      <p className="etiquette">{etiquette}</p>
      <p
        className={`mt-3 chiffre text-3xl leading-none ${
          ton === "danger" ? "text-danger" : ton === "accent" ? "text-accent" : "text-ink"
        }`}
      >
        {valeur}
        {unite && <span className="ml-1 text-sm tracking-normal text-muted-foreground">{unite}</span>}
      </p>
      {note && <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{note}</p>}
    </div>
  );
}

/* ── Barre de dimension ──────────────────────────────────────────────────── */

export function BarreScore({
  valeur,
  max = 100,
  ton = "accent",
}: {
  valeur: number;
  max?: number;
  ton?: "accent" | "encre";
}) {
  const pct = Math.max(0, Math.min(100, (valeur / max) * 100));
  return (
    <div className="h-1.5 w-full bg-surface-sunken" role="presentation">
      <div
        className={`h-full ${ton === "accent" ? "bg-accent" : "bg-foreground"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ── Score de fiabilité, présenté comme une métrique de risque ───────────── */

export function CarteFiabilite({
  score,
  dimensions,
  titre,
  sousTitre,
  libellesDimensions,
}: {
  score: number;
  dimensions: Record<Dimension, number>;
  titre?: string;
  sousTitre?: ReactNode;
  libellesDimensions: Record<Dimension, string>;
}) {
  const { langue } = useLangue();
  const bande = bandeFiabiliteL(score, langue);
  const ordre = Object.keys(dimensions) as Dimension[];
  return (
    <div className="border border-border bg-surface shadow-panneau">
      <div className="grid gap-px bg-border md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <div className="flex flex-col justify-between bg-surface-sunken px-6 py-6">
          <div>
            <p className="etiquette">{titre ?? "Regulatory Reliability Score™"}</p>
            <p className="mt-5 chiffre text-[4.25rem] leading-none text-ink">
              {nb(score)}
              <span className="text-lg tracking-normal text-muted-foreground"> /100</span>
            </p>
            <p className="mt-3">
              <Pastille
                ton={bande.ton === "haut" ? "succes" : bande.ton === "moyen" ? "attention" : "danger"}
              >
                {bande.libelle}
              </Pastille>
            </p>
          </div>
          {sousTitre && (
            <p className="mt-6 border-t border-rule pt-3 text-[12px] leading-relaxed text-muted-foreground">
              {sousTitre}
            </p>
          )}
        </div>
        <div className="bg-surface px-6 py-6">
          <ul className="space-y-4">
            {ordre.map((d) => (
              <li key={d}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[13px] font-medium">{libellesDimensions[d]}</span>
                  <span className="chiffre text-[13px] text-muted-foreground">
                    {nb(dimensions[d])}
                  </span>
                </div>
                <div className="mt-2">
                  <BarreScore valeur={dimensions[d]} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function fiabiliteVersDimensions(f: Fiabilite) {
  return f.dimensions;
}

/* ── Ligne de vérification ✓ / ✕ ─────────────────────────────────────────── */

export function LigneVerification({
  ok,
  children,
}: {
  ok: boolean;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5 text-[13px] leading-relaxed">
      <span
        aria-hidden="true"
        className={`mt-0.5 font-mono text-[13px] ${ok ? "text-success" : "text-danger"}`}
      >
        {ok ? "✓" : "✕"}
      </span>
      <span className={ok ? "text-foreground" : "font-medium text-foreground"}>{children}</span>
      <span className="sr-only">{ok ? "pass" : "fail"}</span>
    </li>
  );
}

/* ── États ───────────────────────────────────────────────────────────────── */

export function EtatVide({ titre, detail }: { titre: string; detail?: string }) {
  return (
    <div className="border border-dashed border-border bg-surface px-6 py-10 text-center">
      <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-foreground">{titre}</p>
      {detail && (
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          {detail}
        </p>
      )}
    </div>
  );
}

export function Squelette({ lignes = 3 }: { lignes?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lignes }).map((_, i) => (
        <div key={i} className="h-9 w-full animate-pulse bg-surface-sunken" />
      ))}
    </div>
  );
}

/* ── Champs de formulaire ────────────────────────────────────────────────── */

export function Champ({
  label,
  obligatoire,
  aide,
  erreur,
  children,
}: {
  label: string;
  obligatoire?: boolean;
  aide?: string;
  erreur?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="etiquette">
        {label}
        {obligatoire && <span className="ml-1 text-accent">*</span>}
      </span>
      <div className="mt-2">{children}</div>
      {aide && !erreur && <span className="mt-1.5 block text-[12px] text-muted-foreground">{aide}</span>}
      {erreur && <span className="mt-1.5 block text-[12px] text-danger">{erreur}</span>}
    </label>
  );
}

export const CLASSE_INPUT =
  "w-full border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none";

/** Choix multiple en puces, accessible au clavier. */
export function ChoixPuces({
  options,
  valeurs,
  basculer,
  nom,
  libelles,
}: {
  options: string[];
  valeurs: string[];
  basculer: (v: string) => void;
  nom: string;
  libelles?: (v: string) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={nom}>
      {options.map((o) => {
        const actif = valeurs.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={actif}
            onClick={() => basculer(o)}
            className={`border px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] transition-colors ${
              actif
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {libelles ? libelles(o) : o}
          </button>
        );
      })}
    </div>
  );
}
