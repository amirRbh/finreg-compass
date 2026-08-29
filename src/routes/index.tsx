import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Chargement, Erreur, Page } from "@/components/finreg/Chrome";
import { GraphiqueDomaines } from "@/components/finreg/GraphiqueDomaines";
import {
  modeleMedian,
  nb,
  rangDe,
  trier,
  useResultats,
  type CleTri,
} from "@/lib/finreg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinReg — Classement de fiabilité des modèles de langage" },
      {
        name: "description",
        content:
          "Classement public de la fiabilité des modèles de langage sur la réglementation financière française et européenne : SFDR, MIF 2, AMF, DORA, LCB-FT.",
      },
      { property: "og:title", content: "FinReg — Classement de fiabilité des modèles de langage" },
      {
        property: "og:description",
        content:
          "Mesure indépendante de l'exactitude, du sourcing et de la calibration des modèles sur la réglementation financière.",
      },
    ],
  }),
  component: Accueil,
});

const COLONNES: { cle: CleTri; libelle: string; num: boolean }[] = [
  { cle: "rang", libelle: "Rang", num: true },
  { cle: "nom", libelle: "Modèle", num: false },
  { cle: "editeur", libelle: "Éditeur", num: false },
  { cle: "score_global", libelle: "Score global", num: true },
  { cle: "taux_hallucination_source", libelle: "Halluc. source (%)", num: true },
  { cle: "ecart_type", libelle: "Écart-type", num: true },
];

function Accueil() {
  const { data, isPending, isError } = useResultats();
  const [cle, setCle] = useState<CleTri>("rang");
  const [ascendant, setAscendant] = useState(true);

  const basculer = (nouvelle: CleTri) => {
    if (nouvelle === cle) setAscendant((v) => !v);
    else {
      setCle(nouvelle);
      setAscendant(nouvelle === "rang" || nouvelle === "nom" || nouvelle === "editeur");
    }
  };

  const median = data ? modeleMedian(data.modeles) : undefined;
  const lignes = data ? trier(data.modeles, cle, ascendant) : [];

  return (
    <Page>
      <h1 className="text-lg font-semibold tracking-tight">
        Fiabilité des modèles de langage sur la réglementation financière
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        150 questions fermées issues des textes de niveau 1 et 2 applicables en France et dans
        l'Union européenne, exécutées trois fois par modèle et notées sur quatre axes.
      </p>

      {isPending && (
        <div className="mt-8">
          <Chargement />
        </div>
      )}
      {isError && (
        <div className="mt-8">
          <Erreur />
        </div>
      )}

      {data && median && (
        <>
          <section className="mt-10 border-y border-border py-8">
            <p className="font-mono text-6xl leading-none tracking-tighter sm:text-8xl">
              {nb(median.taux_hallucination_source)}
              <span className="text-3xl sm:text-4xl"> %</span>
            </p>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              des réponses du modèle médian citent une source inexistante, inapplicable ou abrogée.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-sm font-semibold tracking-tight">Classement général</h2>
            <div className="mt-3 -mx-4 overflow-x-auto px-4">
              <table className="w-full min-w-[46rem] border-collapse text-sm">
                <thead>
                  <tr className="border-y border-border">
                    {COLONNES.map((c) => (
                      <th
                        key={c.cle}
                        scope="col"
                        className={`py-2 pr-4 text-xs font-medium ${c.num ? "text-right" : "text-left"}`}
                      >
                        <button
                          type="button"
                          onClick={() => basculer(c.cle)}
                          className={`underline-offset-4 hover:underline ${
                            cle === c.cle ? "text-accent" : "text-muted-foreground"
                          }`}
                          aria-sort={cle === c.cle ? (ascendant ? "ascending" : "descending") : "none"}
                        >
                          {c.libelle}
                          {cle === c.cle ? (ascendant ? " ↑" : " ↓") : ""}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((m) => (
                    <tr key={m.id} className="border-b border-border">
                      <td className="py-2 pr-4 text-right font-mono text-xs text-muted-foreground">
                        {rangDe(data.modeles, m.id)}
                      </td>
                      <td className="py-2 pr-4">
                        <Link
                          to="/modele/$id"
                          params={{ id: m.id }}
                          className="text-accent underline-offset-4 hover:underline"
                        >
                          {m.nom}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">{m.editeur}</td>
                      <td className="py-2 pr-4 text-right font-mono">{nb(m.score_global)}</td>
                      <td className="py-2 pr-4 text-right font-mono">
                        {nb(m.taux_hallucination_source)}
                      </td>
                      <td className="py-2 pr-4 text-right font-mono text-muted-foreground">
                        {nb(m.ecart_type)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              Score global sur 100. Rang établi sur le score global.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-sm font-semibold tracking-tight">Scores par domaine</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Score sur 100 par domaine réglementaire, barres groupées par modèle.
            </p>
            <GraphiqueDomaines modeles={data.modeles} />
          </section>
        </>
      )}
    </Page>
  );
}
