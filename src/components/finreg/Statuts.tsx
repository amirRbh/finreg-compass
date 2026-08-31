import { Link } from "@tanstack/react-router";
import { libelles, useResultats, type Verification } from "@/lib/finreg";
import { useLangue } from "@/lib/langue";

/**
 * Pastille de statut de vérification d'un item du corpus.
 *
 * Le produit repose sur une distinction qui ne doit jamais s'effacer : un item
 * dont la citation a été contrôlée et un item dont elle ne l'a pas encore été
 * n'ont pas la même valeur. Un item « en revue » est affiché comme tel, jamais
 * masqué et jamais présenté comme vérifié.
 */
export function PastilleVerification({
  statut,
  taille = "normale",
}: {
  statut: Verification["statut"];
  taille?: "normale" | "petite";
}) {
  const { langue } = useLangue();
  const L = libelles(langue);
  const verifiee = statut === "source_verifiee";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-mono uppercase tracking-[0.08em] ${
        taille === "petite" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]"
      } ${
        verifiee
          ? "border-foreground/25 bg-surface-sunken text-foreground"
          : "border-accent/40 bg-accent-soft text-accent"
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block size-1.5 ${verifiee ? "bg-foreground" : "bg-accent"}`}
      />
      {L.verification[statut] ?? statut}
    </span>
  );
}

/** Bloc dépliant l'explication du statut, pour les pages de détail. */
export function ExplicationVerification({ verification }: { verification: Verification }) {
  const { langue } = useLangue();
  const L = libelles(langue);
  return (
    <div className="border border-border bg-surface p-4">
      <PastilleVerification statut={verification.statut} />
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {L.explicationsVerification[verification.statut]}
      </p>
      {verification.note !== L.explicationsVerification[verification.statut] && (
        <p className="mt-2 border-t border-rule pt-2 text-sm leading-relaxed">
          {verification.note}
        </p>
      )}
    </div>
  );
}

/**
 * Bandeau permanent rappelant la nature du jeu de données affiché.
 *
 * Tant que le site publie un échantillon écrit à la main plutôt qu'une
 * exécution mesurée, aucune page portant un chiffre ne doit pouvoir être lue,
 * ni capturée, sans cette mention.
 */
export function BandeauJeuDeDonnees() {
  const { data } = useResultats();
  const { t } = useLangue();
  if (!data || data.statut !== "echantillon_demonstration") return null;

  return (
    <div className="border-b border-accent/30 bg-accent-soft">
      <p className="mx-auto max-w-5xl px-5 py-2 text-[12px] leading-relaxed text-accent">
        <span className="font-mono text-[11px] tracking-[0.08em] uppercase">
          {t("Research preview", "Aperçu de recherche")}
        </span>{" "}
        {t(
          "— the corpus, sources and verification are real. The scores illustrate the rubric and come from no measured run: no commercial model is named or scored.",
          "— le corpus, les sources et la vérification sont réels. Les notes illustrent le barème et ne proviennent d'aucune exécution mesurée : aucun modèle commercial n'est nommé ni noté.",
        )}{" "}
        <Link to="/methodology" hash="dataset" className="underline underline-offset-2">
          {t("What this means", "Ce que cela signifie")}
        </Link>
        .
      </p>
    </div>
  );
}
