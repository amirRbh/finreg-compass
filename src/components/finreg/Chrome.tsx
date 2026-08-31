import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { dateFr, useResultats } from "@/lib/finreg";
import { useLangue, type Langue } from "@/lib/langue";
import { BandeauJeuDeDonnees } from "@/components/finreg/Statuts";

const LIENS = [
  { to: "/", en: "Benchmark", fr: "Classement" },
  { to: "/questions", en: "Questions", fr: "Questions" },
  { to: "/methodology", en: "Methodology", fr: "Méthodologie" },
  { to: "/private-benchmark", en: "Private benchmark", fr: "Corpus privé" },
] as const;

/** Sélecteur de langue. La langue vit dans l'URL, jamais en stockage local. */
function SelecteurLangue() {
  const { langue, definir } = useLangue();
  const options: { v: Langue; l: string }[] = [
    { v: "en", l: "EN" },
    { v: "fr", l: "FR" },
  ];
  return (
    <div className="flex items-center border border-border" role="group" aria-label="Language">
      {options.map((o) => {
        const actif = o.v === langue;
        return (
          <button
            key={o.v}
            type="button"
            aria-pressed={actif}
            onClick={() => definir(o.v)}
            className={`px-2 py-1 font-mono text-[11px] tracking-[0.08em] transition-colors ${
              actif
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.l}
          </button>
        );
      })}
    </div>
  );
}

export function Entete() {
  const { langue, t } = useLangue();
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="group flex items-baseline gap-3">
          <span className="font-serif text-[19px] leading-none font-semibold tracking-[-0.015em] text-foreground transition-colors group-hover:text-accent">
            FinReg
          </span>
          <span className="hidden h-px w-6 bg-rule transition-colors group-hover:bg-accent sm:block" />
          <span className="etiquette hidden sm:block">
            {t("regulatory accuracy benchmark", "benchmark d'exactitude réglementaire")}
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <nav className="-mx-1 flex flex-wrap items-center gap-0.5">
            {LIENS.map((lien) => (
              <Link
                key={lien.to}
                to={lien.to}
                activeOptions={{ exact: lien.to === "/" }}
                className="border border-transparent px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:border-border hover:bg-surface hover:text-foreground"
                activeProps={{
                  className:
                    "border-foreground bg-foreground text-background hover:bg-foreground hover:text-background hover:border-foreground",
                }}
              >
                {langue === "fr" ? lien.fr : lien.en}
              </Link>
            ))}
          </nav>
          <SelecteurLangue />
        </div>
      </div>
    </header>
  );
}

export function PiedDePage() {
  const { data } = useResultats();
  const { langue, t } = useLangue();
  return (
    <footer className="mt-24 border-t border-rule bg-surface-sunken">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 text-[11px] text-muted-foreground sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <p className="etiquette">FinReg</p>
          <p className="mt-2 leading-relaxed">
            {t(
              "FinReg publishes measurements, not advice. Neither the benchmark nor the expected answers constitute legal advice.",
              "FinReg publie des mesures, pas des conseils. Ni le benchmark ni les réponses de référence ne constituent un avis juridique.",
            )}
          </p>
        </div>
        <p className="font-mono tabulaire leading-relaxed sm:text-right">
          {data ? (
            <>
              {data.statut === "echantillon_demonstration"
                ? t("Research preview", "Aperçu de recherche")
                : t("Measured run", "Exécution mesurée")}{" "}
              · {dateFr(data.date_execution, langue)}
              <br />
              {data.nb_questions} {t("questions", "questions")} · {data.modeles.length}{" "}
              {t("systems", "systèmes")} · {data.nb_runs}{" "}
              {t(
                `run${data.nb_runs > 1 ? "s" : ""} per question`,
                `exécution${data.nb_runs > 1 ? "s" : ""} par question`,
              )}
            </>
          ) : (
            t("Loading…", "Chargement…")
          )}
        </p>
      </div>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <Entete />
      <BandeauJeuDeDonnees />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:py-16">{children}</main>
      <PiedDePage />
    </div>
  );
}

export function Titre({
  etiquette,
  titre,
  chapeau,
}: {
  etiquette?: string;
  titre: string;
  chapeau?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      {etiquette && <p className="etiquette">{etiquette}</p>}
      <h1 className="mt-3 text-3xl leading-[1.12] tracking-tight sm:text-[2.6rem]">{titre}</h1>
      {chapeau && (
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {chapeau}
        </p>
      )}
    </div>
  );
}

export function Section({
  numero,
  titre,
  chapeau,
  children,
}: {
  numero?: string;
  titre: string;
  chapeau?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-16">
      <div className="flex items-baseline gap-4 border-b border-foreground/70 pb-2.5">
        {numero && (
          <span className="font-mono text-[11px] tracking-[0.08em] text-accent">{numero}</span>
        )}
        <h2 className="text-[1.35rem] leading-snug">{titre}</h2>
      </div>
      {chapeau && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{chapeau}</p>
      )}
      {children}
    </section>
  );
}

export function Panneau({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border border-border bg-surface shadow-panneau ${className}`}>{children}</div>
  );
}

export function Chargement({ libelle }: { libelle?: string }) {
  const { t } = useLangue();
  return (
    <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
      {libelle ?? t("Loading…", "Chargement…")}
    </p>
  );
}

export function Erreur({ libelle }: { libelle?: string }) {
  const { t } = useLangue();
  return (
    <p className="border-l-2 border-destructive pl-3 font-mono text-xs text-destructive">
      {libelle ?? t("Data unavailable.", "Données indisponibles.")}
    </p>
  );
}
