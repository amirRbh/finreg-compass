import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Chargement, Erreur, Page, Section, Titre } from "@/components/finreg/Chrome";
import { GraphiqueDomaines } from "@/components/finreg/GraphiqueDomaines";
import { BandeauProvenance, BoutonLien, Pastille, Tuile } from "@/components/finreg/Ui";
import {
  DIMENSIONS,
  dimensionsLib,
  dateFr,
  fiabilite,
  libelles,
  nb,
  trier,
  useResultats,
  type CleTri,
} from "@/lib/finreg";
import { useLangue } from "@/lib/langue";

const TITRE = "FinReg Regulatory AI Index — reliability leaderboard";
const DESCRIPTION =
  "The FinReg Regulatory AI Index ranks AI systems on legal accuracy, citation integrity, hallucination resistance, calibration and operational usability across EU and French financial regulation.";

export const Route = createFileRoute("/benchmark")({
  head: () => ({
    meta: [
      { title: TITRE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "FinReg Regulatory AI Index" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Benchmark,
});

type Colonne = { cle: CleTri; libelle: string; note?: string };

function Benchmark() {
  const { data, isPending, isError } = useResultats();
  const [cle, setCle] = useState<CleTri>("score_global");
  const [ascendant, setAscendant] = useState(false);
  const { langue, t } = useLangue();
  const L = libelles(langue);
  const D = dimensionsLib(langue);

  const COLONNES: Colonne[] = [
    { cle: "score_global", libelle: t("Overall score", "Score global") },
    {
      cle: "taux_hallucination_source",
      libelle: t("Fabricated / unsupported citations", "Citations inventées / non étayées"),
      note: t("lower is better", "plus bas est meilleur"),
    },
    { cle: "taux_abstention", libelle: t("Abstention rate", "Taux d'abstention") },
  ];

  const classement = data ? trier(data.modeles, cle, ascendant) : [];
  const parScore = data ? trier(data.modeles, "score_global", false) : [];

  function basculer(c: CleTri) {
    if (c === cle) setAscendant((v) => !v);
    else {
      setCle(c);
      setAscendant(c !== "score_global");
    }
  }

  return (
    <Page large>
      <Titre
        etiquette="FinReg Regulatory AI Index"
        titre={t(
          "Which AI systems can be relied on for financial regulation?",
          "Sur quelles IA peut-on s'appuyer en réglementation financière ?",
        )}
        chapeau={t(
          "Every score below comes from a measured run: each answer was produced by the system itself and scored against the primary legal text, answer by answer, on the public corpus.",
          "Chaque score provient d'une exécution mesurée : chaque réponse a été produite par le système lui-même puis notée face au texte officiel, réponse par réponse, sur le corpus public.",
        )}
      />

      {isPending && (
        <div className="mt-10">
          <Chargement />
        </div>
      )}
      {isError && (
        <div className="mt-10">
          <Erreur />
        </div>
      )}

      {data && (
        <>
          <BandeauProvenance
            className="mt-8"
            entrees={[
              ["Benchmark", "v1.0"],
              ["Questions", String(data.nb_questions)],
              [t("Scored answers", "Réponses notées"), String(data.synthese.nb_reponses)],
              [t("Runs / question", "Passages / question"), String(data.nb_runs)],
              [t("Judge", "Juge"), data.juge ?? "—"],
              [t("Evaluated", "Évalué le"), dateFr(data.date_execution, langue)],
            ]}
          />

          <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            <Tuile
              etiquette={t("Regulatory accuracy", "Exactitude réglementaire")}
              valeur={nb(data.synthese.exactitude_reglementaire)}
              unite="/100"
              note={t(
                "mean score across every scored answer.",
                "score moyen sur l'ensemble des réponses notées.",
              )}
            />
            <Tuile
              etiquette={t("Answers not safe to rely on", "Réponses non fiables")}
              valeur={nb(data.synthese.taux_reponse_non_fiable)}
              unite="%"
              ton="danger"
              note={t(
                "carry at least one disqualifying defect.",
                "portent au moins un défaut disqualifiant.",
              )}
            />
            <Tuile
              etiquette={t("Fabricated / unsupported citation", "Citation inventée / non étayée")}
              valeur={nb(data.synthese.taux_hallucination_source)}
              unite="%"
              note={t(
                "the citation does not exist or does not support the claim.",
                "la citation n'existe pas ou ne soutient pas l'affirmation.",
              )}
            />
            <Tuile
              etiquette={t("Best minus worst system", "Écart meilleur / moins bon")}
              valeur={nb(data.synthese.ecart_meilleur_moins_bon)}
              unite="pts"
              note={t(
                "the choice of system is itself a compliance risk decision.",
                "le choix du système est en soi une décision de risque de conformité.",
              )}
            />
          </div>

          <Section
            numero="01"
            titre={t("Reliability leaderboard", "Classement de fiabilité")}
            chapeau={t(
              "Sort by any column. Overall score is the judged mean on 100; the reliability score aggregates the five measured dimensions.",
              "Triable par colonne. Le score global est la moyenne notée sur 100 ; le score de fiabilité agrège les cinq dimensions mesurées.",
            )}
          >
            <div className="mt-5 overflow-x-auto">
              <table className="zebre w-full min-w-[52rem] border border-border bg-surface text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="entete-col px-4 py-3 text-left">{t("Rank", "Rang")}</th>
                    <th className="entete-col px-4 py-3 text-left">{t("System", "Système")}</th>
                    <th className="entete-col px-4 py-3 text-right">
                      {t("Reliability /100", "Fiabilité /100")}
                    </th>
                    {COLONNES.map((c) => (
                      <th key={c.cle} className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => basculer(c.cle)}
                          className="entete-col inline-flex items-center gap-1 hover:text-foreground"
                          aria-label={`${t("Sort by", "Trier par")} ${c.libelle}`}
                        >
                          {c.libelle}
                          <span aria-hidden="true">{cle === c.cle ? (ascendant ? "↑" : "↓") : "·"}</span>
                        </button>
                        {c.note && (
                          <span className="mt-1 block font-mono text-[9px] tracking-[0.1em] text-muted-foreground/80 uppercase">
                            {c.note}
                          </span>
                        )}
                      </th>
                    ))}
                    <th className="entete-col px-4 py-3 text-right">{t("Detail", "Fiche")}</th>
                  </tr>
                </thead>
                <tbody>
                  {classement.map((m) => {
                    const f = fiabilite(m);
                    const rang = parScore.findIndex((x) => x.id === m.id) + 1;
                    return (
                      <tr key={m.id} className="border-b border-rule last:border-b-0">
                        <td className="px-4 py-3 chiffre text-[13px] text-muted-foreground">
                          {rang}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{m.nom}</p>
                          <p className="mt-0.5 text-[12px] text-muted-foreground">{m.profil}</p>
                        </td>
                        <td className="px-4 py-3 text-right chiffre font-medium">{nb(f.global)}</td>
                        <td className="px-4 py-3 text-right chiffre">{nb(m.score_global)}</td>
                        <td className="px-4 py-3 text-right chiffre text-danger">
                          {nb(m.taux_hallucination_source)}
                        </td>
                        <td className="px-4 py-3 text-right chiffre">{nb(m.taux_abstention)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to="/model/$id"
                            params={{ id: m.id }}
                            className="font-mono text-[11px] tracking-[0.1em] text-accent uppercase hover:underline"
                          >
                            {t("Profile →", "Fiche →")}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            numero="02"
            titre={t(
              "Reliability dimensions, system by system",
              "Dimensions de fiabilité, système par système",
            )}
            chapeau={t(
              "An overall score hides where a system breaks. These are the five dimensions FinReg scores separately.",
              "Un score global masque l'endroit où un système casse. Voici les cinq dimensions que FinReg note séparément.",
            )}
          >
            <div className="mt-5 overflow-x-auto">
              <table className="zebre w-full min-w-[46rem] border border-border bg-surface text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="entete-col px-4 py-3 text-left">{t("System", "Système")}</th>
                    {DIMENSIONS.map((d) => (
                      <th key={d} className="entete-col px-4 py-3 text-right">
                        {D.libelles[d]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parScore.map((m) => {
                    const f = fiabilite(m);
                    return (
                      <tr key={m.id} className="border-b border-rule last:border-b-0">
                        <td className="px-4 py-3 font-medium">{m.nom}</td>
                        {DIMENSIONS.map((d) => (
                          <td key={d} className="px-4 py-3 text-right chiffre">
                            {nb(f.dimensions[d])}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            numero="03"
            titre={t("Performance by regulation", "Performance par réglementation")}
            chapeau={t(
              "No system is uniformly reliable. Coverage of a text is a separate question from overall quality.",
              "Aucun système n'est uniformément fiable. La couverture d'un texte est une question distincte de la qualité globale.",
            )}
          >
            <div className="mt-5">
              <GraphiqueDomaines modeles={data.modeles} domaines={data.domaines} />
            </div>
            <p className="mt-4 font-mono text-[11px] tabulaire text-muted-foreground">
              {t("Domains", "Domaines")} : {data.domaines.map((d) => L.domaines[d] ?? d).join(" · ")}
            </p>
          </Section>

          <section className="mt-16 flex flex-wrap items-center justify-between gap-4 border border-border bg-surface-sunken p-6">
            <div className="max-w-xl">
              <Pastille>{t("Next step", "Étape suivante")}</Pastille>
              <p className="mt-3 text-[16px] leading-snug font-medium">
                {t(
                  "The public index measures public systems. Your AI is not in it.",
                  "L'index public mesure des systèmes publics. Votre IA n'y figure pas.",
                )}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {t(
                  "Run the same evaluation on your own system, on the public corpus or on a private corpus built for your obligations.",
                  "Faites tourner la même évaluation sur votre système, sur le corpus public ou sur un corpus privé bâti pour vos obligations.",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <BoutonLien to="/test">{t("Test your AI →", "Tester votre IA →")}</BoutonLien>
              <BoutonLien to="/audit" variante="secondaire">
                {t("Request an audit", "Demander un audit")}
              </BoutonLien>
            </div>
          </section>
        </>
      )}
    </Page>
  );
}
