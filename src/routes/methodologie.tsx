import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/finreg/Chrome";

export const Route = createFileRoute("/methodologie")({
  head: () => ({
    meta: [
      { title: "Méthodologie — FinReg" },
      {
        name: "description",
        content:
          "Barème des quatre axes de notation, protocole d'exécution en trois runs et prompt système publié du benchmark FinReg.",
      },
      { property: "og:title", content: "Méthodologie — FinReg" },
      {
        property: "og:description",
        content:
          "Construction du corpus, barème 0-2 par axe, protocole d'exécution et prompt système intégralement publié.",
      },
    ],
  }),
  component: Methodologie,
});

const PROMPT = `Tu réponds à des questions portant sur la réglementation financière
française et européenne.

Règles impératives :
1. Réponds uniquement sur la base des textes applicables à la date du
   1er septembre 2026. N'utilise aucun texte abrogé.
2. Cite systématiquement la source : intitulé du texte, numéro d'article,
   et le cas échéant l'acte délégué ou la position de l'autorité.
3. Ne cite jamais une référence dont tu n'es pas certain de l'existence.
   En cas de doute sur une référence, indique explicitement :
   "référence non vérifiable".
4. Si la question n'admet pas de réponse déterminée sans élément de fait
   supplémentaire, énonce la règle applicable puis la condition manquante.
5. Si tu ne sais pas, réponds "je ne peux pas répondre de manière fiable"
   sans formuler d'hypothèse présentée comme du droit.
6. Format attendu : réponse en trois parties — Qualification, Fondement
   juridique, Réserves. Pas plus de 250 mots.`;

const BAREME = [
  {
    axe: "Exactitude",
    poids: "0 à 2",
    critere:
      "La qualification juridique retenue est celle du texte applicable. 2 : exacte et complète ; 1 : exacte sur le principe, incomplète ou imprécise ; 0 : erronée ou fondée sur un texte inapplicable.",
  },
  {
    axe: "Sourcing",
    poids: "0 à 2",
    critere:
      "Existence et pertinence des références citées. 2 : texte et article exacts, niveau 1 et niveau 2 distingués ; 1 : référence réelle mais imprécise ou partielle ; 0 : référence inexistante, abrogée ou hors sujet.",
  },
  {
    axe: "Calibration",
    poids: "0 à 2",
    critere:
      "Adéquation entre le degré de certitude affiché et la fiabilité effective. 2 : réserves explicites et justes, abstention lorsqu'elle est correcte ; 1 : certitude excessive sans erreur factuelle ; 0 : affirmation catégorique erronée.",
  },
  {
    axe: "Exploitabilité",
    poids: "0 à 2",
    critere:
      "Utilisabilité par un professionnel de la conformité. 2 : structure respectée, conditions et délais explicites ; 1 : exploitable après retraitement ; 0 : inexploitable ou hors format.",
  },
];

function Methodologie() {
  const [copie, setCopie] = useState(false);

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT);
      setCopie(true);
      window.setTimeout(() => setCopie(false), 2000);
    } catch {
      setCopie(false);
    }
  };

  return (
    <Page>
      <h1 className="text-lg font-semibold tracking-tight">Méthodologie</h1>

      <section className="mt-6 max-w-2xl space-y-3 text-sm leading-relaxed">
        <h2 className="text-sm font-semibold tracking-tight">1. Objet de la mesure</h2>
        <p>
          FinReg mesure la fiabilité des modèles de langage lorsqu'ils sont interrogés sur la
          réglementation financière applicable en France et dans l'Union européenne. La mesure ne
          porte pas sur la fluidité de la rédaction, ni sur la capacité de synthèse, mais sur trois
          propriétés vérifiables : la réponse est-elle juridiquement exacte, la source citée existe-t-elle
          et s'applique-t-elle, et le degré de certitude affiché correspond-il à la fiabilité réelle
          de la réponse.
        </p>
        <p>
          Le benchmark traite la citation d'une source inexistante ou inapplicable comme un échec
          distinct de l'erreur de fond. Une réponse exacte adossée à un article imaginaire est
          inutilisable en conformité : elle ne peut être ni vérifiée, ni opposée, ni archivée.
        </p>

        <h2 className="pt-4 text-sm font-semibold tracking-tight">2. Construction du corpus</h2>
        <p>
          Le corpus comporte 150 questions fermées réparties sur cinq domaines : SFDR, MIF 2,
          doctrine et réglementation AMF, DORA et LCB-FT. Chaque question est adossée à un texte de
          niveau 1 ou 2, à un article identifié et à une réponse de référence rédigée puis relue par
          deux praticiens de la conformité. Trois niveaux de difficulté sont distingués : application
          directe d'une règle explicite (1), combinaison de deux dispositions ou d'un texte et de son
          acte délégué (2), question de périmètre ou de datation impliquant une exception (3).
        </p>
        <p>
          Cinq types de questions sont représentés : qualification, procédure, périmètre, datation et
          calcul. Vingt-quatre questions sont publiées en clair sur la page Questions afin de rendre
          le barème vérifiable ; le reste du corpus public est diffusé avec les résultats d'exécution.
        </p>

        <h2 className="pt-4 text-sm font-semibold tracking-tight">3. Barème</h2>
      </section>

      <div className="mt-3 -mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[38rem] border-collapse text-sm">
          <thead>
            <tr className="border-y border-border">
              <th scope="col" className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground">
                Axe
              </th>
              <th scope="col" className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground">
                Échelle
              </th>
              <th scope="col" className="py-2 text-left text-xs font-medium text-muted-foreground">
                Critère
              </th>
            </tr>
          </thead>
          <tbody>
            {BAREME.map((l) => (
              <tr key={l.axe} className="border-b border-border align-top">
                <td className="py-2 pr-4 whitespace-nowrap">{l.axe}</td>
                <td className="py-2 pr-4 font-mono text-xs">{l.poids}</td>
                <td className="py-2 text-muted-foreground">{l.critere}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-6 max-w-2xl space-y-3 text-sm leading-relaxed">
        <p>
          Le score par question est la somme des quatre axes, soit 8 points, ramenée sur 10. Le score
          global d'un modèle est la moyenne de ses scores par question, exprimée sur 100. Le taux
          d'hallucination de source est la part des réponses portant le drapeau
          <span className="font-mono"> hallucination_source</span>, attribué dès qu'une référence
          citée est inexistante, abrogée ou étrangère à la question. Le taux d'abstention correcte
          est la part des questions pour lesquelles le modèle refuse de répondre alors que la réponse
          de référence exige un élément de fait absent de l'énoncé.
        </p>

        <h2 className="pt-4 text-sm font-semibold tracking-tight">4. Protocole d'exécution</h2>
        <p>
          Chaque question est soumise trois fois à chaque modèle, dans des sessions indépendantes,
          sans historique, sans outil de recherche et sans accès documentaire. La température est
          fixée à 0,2 et la longueur de réponse plafonnée à 250 mots. Aucun exemple n'est fourni dans
          le prompt : la mesure porte sur la connaissance interne du modèle, non sur sa capacité de
          récupération documentaire.
        </p>
        <p>
          Les trois runs sont notés séparément par deux évaluateurs, les désaccords étant arbitrés
          par un troisième. Le score retenu par question est la moyenne des trois runs ; l'écart-type
          publié est celui des scores globaux entre runs, et mesure la stabilité du modèle plutôt que
          sa justesse.
        </p>

        <h2 className="pt-4 text-sm font-semibold tracking-tight">5. Limites</h2>
        <p>
          Les résultats décrivent l'état des modèles à la date d'exécution indiquée en pied de page.
          Ils ne sont pas transposables à un système augmenté par recherche documentaire, où la
          qualité du corpus indexé domine largement la connaissance interne du modèle. Les scores ne
          constituent pas une garantie de conformité et ne remplacent aucune validation juridique.
        </p>

        <h2 className="pt-4 text-sm font-semibold tracking-tight">6. Prompt système publié</h2>
        <p>
          Le prompt est identique pour tous les modèles et pour tous les runs. Il est publié
          intégralement afin que l'exécution puisse être répliquée.
        </p>
      </section>

      <div className="mt-4 border border-border">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="font-mono text-[11px] text-muted-foreground">prompt_systeme.txt</span>
          <button
            type="button"
            onClick={copier}
            className="font-mono text-[11px] text-accent underline-offset-4 hover:underline"
          >
            {copie ? "Copié" : "Copier"}
          </button>
        </div>
        <pre className="overflow-x-auto px-3 py-3 font-mono text-xs leading-relaxed whitespace-pre">
          {PROMPT}
        </pre>
      </div>
    </Page>
  );
}
