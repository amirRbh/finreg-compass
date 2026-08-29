import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Chargement, Erreur, Page, Panneau, Section, Titre } from "@/components/finreg/Chrome";
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
  const meilleur = data ? trier(data.modeles, "score_global", false)[0] : undefined;
  const moyenneEcart = data
    ? data.modeles.reduce((s, m) => s + m.ecart_type, 0) / data.modeles.length
    : 0;

  return (
    <Page>
      <Titre
        etiquette="Exécution publique · France & Union européenne"
        titre="Fiabilité des modèles de langage sur la réglementation financière"
        chapeau="150 questions fermées issues des textes de niveau 1 et 2 applicables en France et dans l'Union européenne, exécutées trois fois par modèle et notées sur quatre axes."
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

      {data && median && meilleur && (
        <>
          <Panneau className="mt-10 grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-6">
              <p className="etiquette">Hallucination de source — modèle médian</p>
              <p className="mt-4 font-mono text-6xl leading-none tracking-tighter tabulaire text-accent">
                {nb(median.taux_hallucination_source)}
                <span className="align-top text-xl"> %</span>
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                des réponses citent une source inexistante, inapplicable ou abrogée.
              </p>
            </div>
            <div className="p-6">
              <p className="etiquette">Meilleur score global</p>
              <p className="mt-4 font-mono text-4xl leading-none tracking-tight tabulaire">
                {nb(meilleur.score_global)}
                <span className="text-base text-muted-foreground"> /100</span>
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                {meilleur.nom} — {meilleur.editeur}.
              </p>
            </div>
            <div className="p-6">
              <p className="etiquette">Écart-type moyen inter-runs</p>
              <p className="mt-4 font-mono text-4xl leading-none tracking-tight tabulaire">
                {nb(moyenneEcart)}
                <span className="text-base text-muted-foreground"> pts</span>
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                Instabilité résiduelle d'un même modèle entre trois exécutions.
              </p>
            </div>
          </Panneau>

          <Section
            numero="01"
            titre="Classement général"
            chapeau="Score global sur 100, rang établi sur le score global. Cliquez sur un en-tête pour trier."
          >
            <Panneau className="mt-4 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[46rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-rule bg-surface-sunken">
                      {COLONNES.map((c) => (
                        <th
                          key={c.cle}
                          scope="col"
                          className={`px-4 py-2.5 text-xs font-medium ${c.num ? "text-right" : "text-left"}`}
                          aria-sort={
                            cle === c.cle ? (ascendant ? "ascending" : "descending") : "none"
                          }
                        >
                          <button
                            type="button"
                            onClick={() => basculer(c.cle)}
                            className={`transition-colors hover:text-foreground ${
                              cle === c.cle ? "text-accent" : "text-muted-foreground"
                            }`}
                          >
                            {c.libelle}
                            {cle === c.cle ? (ascendant ? " ↑" : " ↓") : ""}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lignes.map((m) => {
                      const rang = rangDe(data.modeles, m.id);
                      return (
                        <tr
                          key={m.id}
                          className="border-b border-border transition-colors last:border-0 hover:bg-surface-sunken"
                        >
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex size-6 items-center justify-center font-mono text-[11px] ${
                                rang === 1
                                  ? "bg-foreground text-background"
                                  : "bg-surface-sunken text-muted-foreground"
                              }`}
                            >
                              {rang}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              to="/modele/$id"
                              params={{ id: m.id }}
                              className="font-medium underline decoration-border decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                            >
                              {m.nom}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{m.editeur}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-3">
                              <span
                                className="hidden h-1 bg-foreground/70 sm:block"
                                style={{ width: `${m.score_global * 0.9}px` }}
                                aria-hidden="true"
                              />
                              <span className="font-mono tabulaire">{nb(m.score_global)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabulaire text-accent">
                            {nb(m.taux_hallucination_source)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabulaire text-muted-foreground">
                            {nb(m.ecart_type)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panneau>
          </Section>

          <Section
            numero="02"
            titre="Scores par domaine"
            chapeau="Score sur 100 par domaine réglementaire, barres groupées par modèle."
          >
            <GraphiqueDomaines modeles={data.modeles} />
          </Section>
        </>
      )}
    </Page>
  );
}
