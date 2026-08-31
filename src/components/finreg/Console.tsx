import { Link } from "@tanstack/react-router";
import { libelles, texteAffiche, type Defaillance } from "@/lib/finreg";
import { LigneVerification, Pastille, Squelette } from "@/components/finreg/Ui";
import { useLangue } from "@/lib/langue";

/**
 * Console d'évaluation réglementaire.
 *
 * Elle ne met en scène rien : la question, la réponse, la source et le verdict
 * viennent d'un item réel du corpus et d'une réponse réellement mesurée.
 */
export function ConsoleEvaluation({ cas }: { cas: Defaillance | undefined }) {
  const { langue, t } = useLangue();
  const L = libelles(langue);
  const TITRE_CONSOLE = t("Regulatory AI evaluation console", "Console d'évaluation réglementaire");

  if (!cas) {
    return (
      <div className="border border-border bg-surface p-5 shadow-releve">
        <p className="etiquette">{TITRE_CONSOLE}</p>
        <div className="mt-4">
          <Squelette lignes={6} />
        </div>
      </div>
    );
  }

  const q = cas.question;
  const inventee = cas.reponse.flags.includes("hallucination_source");
  const reponse = texteAffiche(cas.reponse.texte).split("\n").filter(Boolean).slice(0, 3).join(" ");

  return (
    <div className="border border-border bg-surface shadow-releve">
      {/* Barre d'instrument */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-ink px-4 py-2.5">
        <p className="font-mono text-[10px] tracking-[0.14em] text-background/80 uppercase">
          {TITRE_CONSOLE}
        </p>
        <p className="font-mono text-[10px] tracking-[0.1em] text-background/60 tabulaire">
          {t("item", "item")} {q.id} · {L.domainesCourts[q.domaine] ?? q.domaine} ·{" "}
          {t("scored answer", "réponse notée")}
        </p>
      </div>

      <div className="divide-y divide-rule">
        <div className="px-5 py-4">
          <p className="etiquette">Question</p>
          <p className="mt-2 text-[14px] leading-relaxed text-foreground">{q.question}</p>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="etiquette">{t("AI answer", "Réponse de l'IA")}</p>
            <Pastille>{cas.nomModele}</Pastille>
          </div>
          <p className="mt-2 line-clamp-6 text-[13px] leading-relaxed text-muted-foreground">
            {reponse}
          </p>
        </div>

        <div className="px-5 py-4">
          <p className="etiquette">{t("Source verification", "Vérification de la source")}</p>
          <ul className="mt-2.5 space-y-1.5">
            <LigneVerification ok>
              {t("Regulation identified", "Texte identifié")} — {q.source.texte}
            </LigneVerification>
            <LigneVerification ok={!inventee}>
              {inventee
                ? t(
                    "Article cited by the model could not be located in the act",
                    "L'article cité par le modèle est introuvable dans le texte",
                  )
                : `${t("Article exists", "L'article existe")} — ${q.source.article}`}
            </LigneVerification>
            <LigneVerification ok={false}>
              {t(
                "Citation does not support the conclusion",
                "La citation ne soutient pas la conclusion",
              )}
            </LigneVerification>
          </ul>
        </div>

        <div className="bg-danger-soft px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Pastille ton="danger">
              {cas.severite === "critical"
                ? t("Critical failure", "Défaillance critique")
                : t("Regulatory failure", "Défaillance réglementaire")}
            </Pastille>
            <span className="font-mono text-[10px] tracking-[0.12em] text-danger uppercase">
              {cas.categorie}
            </span>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed font-medium text-foreground">
            {t("Unsupported legal conclusion", "Conclusion juridique non étayée")}
          </p>
          {cas.reponse.analyse && (
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {cas.reponse.analyse.incorrect}
            </p>
          )}
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-danger/20 pt-3 font-mono text-[10px] tracking-[0.1em] uppercase">
            <Link to="/question/$id" params={{ id: q.id }} className="text-accent hover:underline">
              {t("Open the full case →", "Ouvrir le cas complet →")}
            </Link>
            <a
              href={q.source.url}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              {t("Primary source ↗", "Source officielle ↗")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
