import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { dateFr, useResultats } from "@/lib/finreg";
import { BandeauJeuDeDonnees } from "@/components/finreg/Statuts";
import { CLASSES_CTA } from "@/components/finreg/Ui";

const LIENS = [
  { to: "/benchmark", label: "Benchmark" },
  { to: "/failures", label: "Failure Database" },
  { to: "/test", label: "Test Your AI" },
  { to: "/private-benchmark", label: "Private Benchmark" },
  { to: "/methodology", label: "Methodology" },
] as const;

const CLASSE_LIEN =
  "border-b-2 border-transparent px-1 py-1 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-foreground";

function Marque() {
  return (
    <Link to="/" className="group flex items-baseline gap-2.5">
      <span className="text-[17px] leading-none font-semibold tracking-[-0.03em] text-ink transition-colors group-hover:text-accent">
        FinReg
      </span>
      <span className="hidden font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase sm:block">
        Regulatory AI evaluation
      </span>
    </Link>
  );
}

export function Entete() {
  const [ouvert, setOuvert] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5">
        <Marque />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {LIENS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={CLASSE_LIEN}
              activeProps={{ className: "border-accent text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/audit" className={`${CLASSES_CTA.primaire} hidden px-4 py-2.5 lg:inline-flex`}>
            Request an audit →
          </Link>
          <button
            type="button"
            aria-expanded={ouvert}
            aria-controls="menu-mobile"
            onClick={() => setOuvert((v) => !v)}
            className="border border-border px-3 py-2 font-mono text-[11px] tracking-[0.1em] uppercase lg:hidden"
          >
            {ouvert ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {ouvert && (
        <div id="menu-mobile" className="border-t border-rule bg-surface lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-5 py-2" aria-label="Mobile">
            {LIENS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOuvert(false)}
                className="border-b border-rule py-3 font-mono text-[12px] tracking-[0.08em] uppercase last:border-b-0"
                activeProps={{ className: "text-accent" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/audit"
              onClick={() => setOuvert(false)}
              className={`${CLASSES_CTA.primaire} my-3`}
            >
              Request an audit →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function PiedDePage() {
  const { data } = useResultats();
  return (
    <footer className="mt-24 border-t border-rule bg-surface-sunken">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="text-[17px] font-semibold tracking-[-0.03em] text-ink">FinReg</p>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Independent regulatory AI evaluation.
          </p>
          {data && (
            <p className="mt-5 font-mono text-[11px] leading-relaxed tabulaire text-muted-foreground">
              Benchmark v1.0 · {data.nb_questions} questions · {data.domaines.length} regulatory
              domains
              <br />
              Evaluated {dateFr(data.date_execution, "en")} · {data.modeles.length} systems
            </p>
          )}
        </div>

        <nav aria-label="Product" className="text-[13px]">
          <p className="etiquette">Product</p>
          <ul className="mt-3 space-y-2">
            {[
              ["/benchmark", "Benchmark"],
              ["/failures", "Failure Database"],
              ["/test", "Test Your AI"],
              ["/private-benchmark", "Private Benchmark"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-muted-foreground hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Reference" className="text-[13px]">
          <p className="etiquette">Reference</p>
          <ul className="mt-3 space-y-2">
            {[
              ["/methodology", "Methodology"],
              ["/questions", "Public corpus"],
              ["/about", "About"],
              ["/audit", "Contact"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-muted-foreground hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-rule">
        <p className="mx-auto max-w-6xl px-5 py-5 text-[12px] leading-relaxed text-muted-foreground">
          FinReg provides AI evaluation and benchmarking services. FinReg does not provide legal
          advice and benchmark results should not be interpreted as legal opinions.
        </p>
      </div>
    </footer>
  );
}

export function Page({ children, large = false }: { children: ReactNode; large?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <Entete />
      <BandeauJeuDeDonnees />
      <main
        className={`mx-auto w-full flex-1 px-5 py-12 sm:py-16 ${large ? "max-w-7xl" : "max-w-6xl"}`}
      >
        {children}
      </main>
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
  titre: ReactNode;
  chapeau?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      {etiquette && <p className="etiquette">{etiquette}</p>}
      <h1 className="mt-3 text-3xl leading-[1.1] sm:text-[2.7rem]">{titre}</h1>
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
  titre: ReactNode;
  chapeau?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-16">
      <div className="flex items-baseline gap-4 border-b border-foreground/70 pb-2.5">
        {numero && (
          <span className="font-mono text-[11px] tracking-[0.08em] text-accent">{numero}</span>
        )}
        <h2 className="text-[1.3rem] leading-snug">{titre}</h2>
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
  return (
    <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
      {libelle ?? "Loading…"}
    </p>
  );
}

export function Erreur({ libelle }: { libelle?: string }) {
  return (
    <p className="border-l-2 border-destructive pl-3 font-mono text-xs text-destructive">
      {libelle ?? "Data unavailable."}
    </p>
  );
}
