import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { dateFr, useResultats } from "@/lib/finreg";
import { BandeauJeuDeDonnees } from "@/components/finreg/Statuts";
import { CLASSES_CTA } from "@/components/finreg/Ui";
import { useLangue, type Langue } from "@/lib/langue";

const LIENS = [
  { to: "/benchmark", en: "Benchmark", fr: "Benchmark" },
  { to: "/failures", en: "Failure Database", fr: "Base des défaillances" },
  { to: "/test", en: "Test Your AI", fr: "Tester votre IA" },
  { to: "/private-benchmark", en: "Private Benchmark", fr: "Benchmark privé" },
  { to: "/methodology", en: "Methodology", fr: "Méthodologie" },
] as const;

function SelecteurLangue() {
  const { langue, definir } = useLangue();
  const options: { code: Langue; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
  ];
  return (
    <div
      className="flex items-center border border-border"
      role="group"
      aria-label="Language / Langue"
    >
      {options.map((o) => (
        <button
          key={o.code}
          type="button"
          aria-pressed={langue === o.code}
          onClick={() => definir(o.code)}
          className={`px-2 py-1.5 font-mono text-[10px] tracking-[0.14em] transition-colors ${
            langue === o.code
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const CLASSE_LIEN =
  "border-b-2 border-transparent px-1 py-1 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-foreground";

function Marque() {
  const { t } = useLangue();
  return (
    <Link to="/" className="group flex items-baseline gap-2.5">
      <span className="text-[17px] leading-none font-semibold tracking-[-0.03em] text-ink transition-colors group-hover:text-accent">
        FinReg
      </span>
      <span className="hidden font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase sm:block">
        {t("Regulatory AI evaluation", "Évaluation d'IA réglementaire")}
      </span>
    </Link>
  );
}

export function Entete() {
  const [ouvert, setOuvert] = useState(false);
  const { langue, t } = useLangue();
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
              {l[langue]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SelecteurLangue />
          <Link to="/audit" className={`${CLASSES_CTA.primaire} hidden px-4 py-2.5 lg:inline-flex`}>
            {t("Request an audit →", "Demander un audit →")}
          </Link>
          <button
            type="button"
            aria-expanded={ouvert}
            aria-controls="menu-mobile"
            onClick={() => setOuvert((v) => !v)}
            className="border border-border px-3 py-2 font-mono text-[11px] tracking-[0.1em] uppercase lg:hidden"
          >
            {ouvert ? t("Close", "Fermer") : "Menu"}
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
                {l[langue]}
              </Link>
            ))}
            <Link
              to="/audit"
              onClick={() => setOuvert(false)}
              className={`${CLASSES_CTA.primaire} my-3`}
            >
              {t("Request an audit →", "Demander un audit →")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function PiedDePage() {
  const { data } = useResultats();
  const { langue, t } = useLangue();
  return (
    <footer className="mt-24 border-t border-rule bg-surface-sunken">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="text-[17px] font-semibold tracking-[-0.03em] text-ink">FinReg</p>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            {t(
              "Independent regulatory AI evaluation.",
              "Évaluation indépendante des IA réglementaires.",
            )}
          </p>
          {data && (
            <p className="mt-5 font-mono text-[11px] leading-relaxed tabulaire text-muted-foreground">
              Benchmark v1.0 · {data.nb_questions} questions · {data.domaines.length}{" "}
              {t("regulatory domains", "domaines réglementaires")}
              <br />
              {t("Evaluated", "Évalué le")} {dateFr(data.date_execution, langue)} ·{" "}
              {data.modeles.length} {t("systems", "systèmes")}
            </p>
          )}
        </div>

        <nav aria-label="Product" className="text-[13px]">
          <p className="etiquette">{t("Product", "Produit")}</p>
          <ul className="mt-3 space-y-2 [&_a]:text-muted-foreground [&_a:hover]:text-foreground">
            <li>
              <Link to="/benchmark">Benchmark</Link>
            </li>
            <li>
              <Link to="/failures">{t("Failure Database", "Base des défaillances")}</Link>
            </li>
            <li>
              <Link to="/test">{t("Test Your AI", "Tester votre IA")}</Link>
            </li>
            <li>
              <Link to="/private-benchmark">{t("Private Benchmark", "Benchmark privé")}</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Reference" className="text-[13px]">
          <p className="etiquette">{t("Reference", "Références")}</p>
          <ul className="mt-3 space-y-2 [&_a]:text-muted-foreground [&_a:hover]:text-foreground">
            <li>
              <Link to="/methodology">{t("Methodology", "Méthodologie")}</Link>
            </li>
            <li>
              <Link to="/questions">{t("Public corpus", "Corpus public")}</Link>
            </li>
            <li>
              <Link to="/about">{t("About", "À propos")}</Link>
            </li>
            <li>
              <Link to="/audit">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-rule">
        <p className="mx-auto max-w-6xl px-5 py-5 text-[12px] leading-relaxed text-muted-foreground">
          {t(
            "FinReg provides AI evaluation and benchmarking services. FinReg does not provide legal advice and benchmark results should not be interpreted as legal opinions.",
            "FinReg fournit des services d'évaluation et de benchmark d'IA. FinReg ne délivre pas de conseil juridique et ses résultats ne constituent pas des opinions juridiques.",
          )}
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
