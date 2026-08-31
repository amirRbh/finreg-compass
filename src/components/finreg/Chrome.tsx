import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { dateFr, useResultats } from "@/lib/finreg";
import { BandeauJeuDeDonnees } from "@/components/finreg/Statuts";

const LIENS = [
  { to: "/", libelle: "Benchmark" },
  { to: "/questions", libelle: "Questions" },
  { to: "/methodology", libelle: "Methodology" },
  { to: "/private-benchmark", libelle: "Private benchmark" },
] as const;

export function Entete() {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="group flex items-center gap-3">
          <span className="flex size-8 items-center justify-center border border-foreground font-mono text-[11px] font-medium text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
            FR
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-[15px] font-semibold tracking-tight text-foreground">
              FinReg
            </span>
            <span className="etiquette block">regulatory accuracy benchmark</span>
          </span>
        </Link>
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
              {lien.libelle}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function PiedDePage() {
  const { data } = useResultats();
  return (
    <footer className="mt-24 border-t border-rule bg-surface-sunken">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 text-[11px] text-muted-foreground sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <p className="etiquette">FinReg</p>
          <p className="mt-2 leading-relaxed">
            FinReg publishes measurements, not advice. Neither the benchmark nor the expected answers
            constitute legal advice.
          </p>
        </div>
        <p className="font-mono tabulaire leading-relaxed sm:text-right">
          {data ? (
            <>
              {data.statut === "echantillon_demonstration" ? "Research preview" : "Measured run"} ·{" "}
              {dateFr(data.date_execution)}
              <br />
              {data.nb_questions} questions · {data.modeles.length} systems · {data.nb_runs} run
              {data.nb_runs > 1 ? "s" : ""} per question
            </>
          ) : (
            "Loading…"
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

export function Chargement({ libelle = "Loading…" }: { libelle?: string }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
      {libelle}
    </p>
  );
}

export function Erreur({ libelle = "Data unavailable." }: { libelle?: string }) {
  return (
    <p className="border-l-2 border-destructive pl-3 font-mono text-xs text-destructive">
      {libelle}
    </p>
  );
}

