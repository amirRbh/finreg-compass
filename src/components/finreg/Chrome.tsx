import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { dateFr, useResultats } from "@/lib/finreg";

const LIENS = [
  { to: "/", libelle: "Classement" },
  { to: "/methodologie", libelle: "Méthodologie" },
  { to: "/questions", libelle: "Questions" },
  { to: "/corpus-prive", libelle: "Corpus privé" },
] as const;

export function Entete() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center bg-foreground font-mono text-[11px] font-medium text-background">
            FR
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight text-foreground">
              FinReg
            </span>
            <span className="block text-[11px] text-muted-foreground">
              benchmark de fiabilité réglementaire
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-xs">
          {LIENS.map((lien) => (
            <Link
              key={lien.to}
              to={lien.to}
              activeOptions={{ exact: lien.to === "/" }}
              className="px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground"
              activeProps={{
                className: "bg-foreground text-background hover:bg-foreground hover:text-background",
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
    <footer className="mt-20 border-t border-border bg-surface-sunken">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-6 text-[11px] text-muted-foreground sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-md leading-relaxed">
          FinReg publie des mesures, pas des conseils. Les résultats ne constituent pas un avis
          juridique.
        </p>
        <p className="font-mono tabulaire sm:text-right">
          {data ? (
            <>
              Dernière exécution&nbsp;: {dateFr(data.date_execution)}
              <br />
              {data.nb_questions} questions — {data.nb_runs} runs par question
            </>
          ) : (
            "Chargement des métadonnées d'exécution…"
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
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-14">{children}</main>
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
      <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">{titre}</h1>
      {chapeau && (
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{chapeau}</p>
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
    <section className="mt-14">
      <div className="flex items-baseline gap-3 border-b border-rule pb-2">
        {numero && <span className="font-mono text-[11px] text-muted-foreground">{numero}</span>}
        <h2 className="text-lg">{titre}</h2>
      </div>
      {chapeau && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{chapeau}</p>}
      {children}
    </section>
  );
}

export function Panneau({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-border bg-surface shadow-panneau ${className}`}>{children}</div>
  );
}

export function Chargement({ libelle = "Chargement des données…" }: { libelle?: string }) {
  return <p className="font-mono text-xs text-muted-foreground">{libelle}</p>;
}

export function Erreur({ libelle = "Données indisponibles." }: { libelle?: string }) {
  return <p className="font-mono text-xs text-destructive">{libelle}</p>;
}
