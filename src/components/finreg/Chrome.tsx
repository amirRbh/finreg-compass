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
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between">
        <Link to="/" className="font-mono text-sm font-semibold tracking-tight text-foreground">
          FinReg
          <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
            benchmark de fiabilité réglementaire
          </span>
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
          {LIENS.map((lien) => (
            <Link
              key={lien.to}
              to={lien.to}
              activeOptions={{ exact: lien.to === "/" }}
              className="text-muted-foreground underline-offset-4 hover:text-accent hover:underline"
              activeProps={{ className: "text-accent underline" }}
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
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-5 font-mono text-[11px] text-muted-foreground">
        {data ? (
          <p>
            Dernière exécution : {dateFr(data.date_execution)} — {data.nb_questions} questions —{" "}
            {data.nb_runs} runs par question
          </p>
        ) : (
          <p>Chargement des métadonnées d'exécution…</p>
        )}
        <p className="mt-1">
          FinReg publie des mesures, pas des conseils. Les résultats ne constituent pas un avis
          juridique.
        </p>
      </div>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Entete />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <PiedDePage />
    </div>
  );
}

export function Chargement({ libelle = "Chargement des données…" }: { libelle?: string }) {
  return <p className="font-mono text-xs text-muted-foreground">{libelle}</p>;
}

export function Erreur({ libelle = "Données indisponibles." }: { libelle?: string }) {
  return <p className="font-mono text-xs text-destructive">{libelle}</p>;
}
