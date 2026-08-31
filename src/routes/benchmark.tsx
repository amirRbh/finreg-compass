import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Chargement, Erreur, Page, Section, Titre } from "@/components/finreg/Chrome";
import { GraphiqueDomaines } from "@/components/finreg/GraphiqueDomaines";
import { BandeauProvenance, BoutonLien, Pastille, Tuile } from "@/components/finreg/Ui";
import {
  DIMENSIONS,
  LIBELLES_DIMENSIONS,
  dateFr,
  fiabilite,
  libelles,
  nb,
  trier,
  useResultats,
  type CleTri,
} from "@/lib/finreg";

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

const COLONNES: Colonne[] = [
  { cle: "score_global", libelle: "Overall score" },
  { cle: "taux_hallucination_source", libelle: "Fabricated / unsupported citations", note: "lower is better" },
  { cle: "taux_erreur_disqualifiante", libelle: "Disqualifying errors", note: "lower is better" },
  { cle: "taux_abstention", libelle: "Abstention rate" },
];

function Benchmark() {
  const { data, isPending, isError } = useResultats();
  const [cle, setCle] = useState<CleTri>("score_global");
  const [ascendant, setAscendant] = useState(false);
  const L = libelles("en");

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
        titre="Which AI systems can be relied on for financial regulation?"
        chapeau="Every score below comes from a measured run: each answer was produced by the system itself and scored against the primary legal text, answer by answer, on the public corpus."
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
              ["Scored answers", String(data.synthese.nb_reponses)],
              ["Runs / question", String(data.nb_runs)],
              ["Judge", data.juge ?? "—"],
              ["Evaluated", dateFr(data.date_execution, "en")],
            ]}
          />

          <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            <Tuile
              etiquette="Regulatory accuracy"
              valeur={nb(data.synthese.exactitude_reglementaire)}
              unite="/100"
              note="mean score across every scored answer."
            />
            <Tuile
              etiquette="Answers not safe to rely on"
              valeur={nb(data.synthese.taux_reponse_non_fiable)}
              unite="%"
              ton="danger"
              note="carry at least one disqualifying defect."
            />
            <Tuile
              etiquette="Fabricated / unsupported citation"
              valeur={nb(data.synthese.taux_hallucination_source)}
              unite="%"
              note="the citation does not exist or does not support the claim."
            />
            <Tuile
              etiquette="Best minus worst system"
              valeur={nb(data.synthese.ecart_meilleur_moins_bon)}
              unite="pts"
              note="the choice of system is itself a compliance risk decision."
            />
          </div>

          <Section
            numero="01"
            titre="Reliability leaderboard"
            chapeau="Sort by any column. Overall score is the judged mean on 100; the reliability score aggregates the five measured dimensions."
          >
            <div className="mt-5 overflow-x-auto">
              <table className="zebre w-full min-w-[52rem] border border-border bg-surface text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="entete-col px-4 py-3 text-left">Rank</th>
                    <th className="entete-col px-4 py-3 text-left">System</th>
                    <th className="entete-col px-4 py-3 text-right">Reliability /100</th>
                    {COLONNES.map((c) => (
                      <th key={c.cle} className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => basculer(c.cle)}
                          className="entete-col inline-flex items-center gap-1 hover:text-foreground"
                          aria-label={`Sort by ${c.libelle}`}
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
                    <th className="entete-col px-4 py-3 text-right">Detail</th>
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
                        <td className="px-4 py-3 text-right chiffre">
                          {nb(m.taux_erreur_disqualifiante)}
                        </td>
                        <td className="px-4 py-3 text-right chiffre">{nb(m.taux_abstention)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to="/model/$id"
                            params={{ id: m.id }}
                            className="font-mono text-[11px] tracking-[0.1em] text-accent uppercase hover:underline"
                          >
                            Profile →
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
            titre="Reliability dimensions, system by system"
            chapeau="An overall score hides where a system breaks. These are the five dimensions FinReg scores separately."
          >
            <div className="mt-5 overflow-x-auto">
              <table className="zebre w-full min-w-[46rem] border border-border bg-surface text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="entete-col px-4 py-3 text-left">System</th>
                    {DIMENSIONS.map((d) => (
                      <th key={d} className="entete-col px-4 py-3 text-right">
                        {LIBELLES_DIMENSIONS[d]}
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
            titre="Performance by regulation"
            chapeau="No system is uniformly reliable. Coverage of a text is a separate question from overall quality."
          >
            <div className="mt-5">
              <GraphiqueDomaines resultats={data} />
            </div>
            <p className="mt-4 font-mono text-[11px] tabulaire text-muted-foreground">
              Domains: {data.domaines.map((d) => L.domaines[d] ?? d).join(" · ")}
            </p>
          </Section>

          <section className="mt-16 flex flex-wrap items-center justify-between gap-4 border border-border bg-surface-sunken p-6">
            <div className="max-w-xl">
              <Pastille>Next step</Pastille>
              <p className="mt-3 text-[16px] leading-snug font-medium">
                The public index measures public systems. Your AI is not in it.
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                Run the same evaluation on your own system, on the public corpus or on a private
                corpus built for your obligations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <BoutonLien to="/test">Test your AI →</BoutonLien>
              <BoutonLien to="/audit" variante="secondaire">
                Request an audit
              </BoutonLien>
            </div>
          </section>
        </>
      )}
    </Page>
  );
}
