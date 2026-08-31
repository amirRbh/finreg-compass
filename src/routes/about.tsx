import { createFileRoute } from "@tanstack/react-router";
import { Page, Section, Titre } from "@/components/finreg/Chrome";
import { BoutonLien, LigneVerification } from "@/components/finreg/Ui";
import { useLangue } from "@/lib/langue";

const TITRE = "About FinReg — independent regulatory AI evaluation";
const DESCRIPTION =
  "FinReg is an independent evaluator of AI systems on financial regulation. It publishes its methodology, verifies every source and takes no fee from the systems it ranks publicly.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITRE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "About FinReg" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: APropos,
});

function APropos() {
  const { langue, t } = useLangue();
  const fr = langue === "fr";
  return (
    <Page>
      <Titre
        etiquette={t("About", "À propos")}
        titre={t(
          "Independent, because the measurement is worthless otherwise.",
          "Indépendant, sinon la mesure ne vaut rien.",
        )}
        chapeau={t(
          "FinReg evaluates how AI systems handle EU and French financial regulation. It exists because “the model sounds confident” is not evidence, and because a compliance function cannot audit what nobody measures.",
          "FinReg évalue la façon dont les systèmes d'IA traitent la réglementation financière européenne et française. Il existe parce que « le modèle a l'air sûr de lui » n'est pas une preuve, et parce qu'une fonction conformité ne peut auditer ce que personne ne mesure.",
        )}
      />

      <Section
        numero="01"
        titre={t("Independence rules we hold ourselves to", "Nos règles d'indépendance")}
      >
        <ul className="mt-5 space-y-3 border border-border bg-surface p-6">
          <LigneVerification ok>
            {t(
              "No vendor pays to appear in, or to be removed from, the public index.",
              "Aucun éditeur ne paie pour figurer dans l'index public, ni pour en sortir.",
            )}
          </LigneVerification>
          <LigneVerification ok>
            {t(
              "The public corpus, its sources and the scoring rubric are published.",
              "Le corpus public, ses sources et le barème de notation sont publiés.",
            )}
          </LigneVerification>
          <LigneVerification ok>
            {t(
              "Every cited act and article in the corpus is checked against the primary text.",
              "Chaque texte et article cité dans le corpus est vérifié à la source.",
            )}
          </LigneVerification>
          <LigneVerification ok>
            {t(
              "Private engagement results are never published without written agreement.",
              "Les résultats des missions privées ne sont jamais publiés sans accord écrit.",
            )}
          </LigneVerification>
          <LigneVerification ok={false}>
            {t(
              "FinReg does not provide legal advice, and no score is a legal opinion.",
              "FinReg ne délivre pas de conseil juridique, et aucun score n'est une opinion juridique.",
            )}
          </LigneVerification>
        </ul>
      </Section>

      <Section
        numero="02"
        titre={t("What FinReg is not", "Ce que FinReg n'est pas")}
        chapeau={t(
          "Clarity here protects the value of the measurement.",
          "La clarté sur ce point protège la valeur de la mesure.",
        )}
      >
        <div className="mt-5 grid gap-px border border-border bg-border md:grid-cols-3">
          {(fr
            ? [
                [
                  "Pas un cabinet d'avocats",
                  "Aucune interprétation n'est vendue comme un conseil. Les scores mesurent des réponses face au texte publié.",
                ],
                [
                  "Pas un éditeur de modèles",
                  "FinReg ne construit aucun assistant réglementaire et n'en revend aucun.",
                ],
                [
                  "Pas un organisme de certification",
                  "FinReg Verified est une évaluation de fiabilité, pas un agrément réglementaire.",
                ],
              ]
            : [
                [
                  "Not a law firm",
                  "No interpretation is sold as advice. Scores measure answers against published text.",
                ],
                ["Not a model vendor", "FinReg builds no regulatory assistant and resells none."],
                [
                  "Not a certification body",
                  "FinReg Verified is a reliability assessment, not a regulatory approval.",
                ],
              ]
          ).map(([titre, d]) => (
            <div key={titre} className="bg-surface p-6">
              <p className="text-[15px] font-medium">{titre}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section numero="03" titre={t("Work with us", "Travailler avec nous")}>
        <div className="mt-5 flex flex-wrap gap-3">
          <BoutonLien to="/audit">{t("Request an audit →", "Demander un audit →")}</BoutonLien>
          <BoutonLien to="/methodology" variante="secondaire">
            {t("Read the methodology", "Lire la méthodologie")}
          </BoutonLien>
        </div>
      </Section>
    </Page>
  );
}
