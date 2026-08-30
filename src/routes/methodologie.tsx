import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/finreg/Chrome";
import { useQuestions, useResultats } from "@/lib/finreg";

export const Route = createFileRoute("/methodologie")({
  head: () => ({
    meta: [
      { title: "Méthodologie — FinReg" },
      {
        name: "description",
        content:
          "Barème des quatre axes de notation, statut de vérification des sources, protocole d'exécution et prompt système publié du benchmark FinReg.",
      },
      { property: "og:title", content: "Méthodologie — FinReg" },
      {
        property: "og:description",
        content:
          "Construction du corpus, statut de vérification des citations, barème 0-2 par axe et prompt système intégralement publié.",
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
  const { data: questions } = useQuestions();
  const { data: resultats } = useResultats();

  // Les effectifs cités dans le texte sont lus dans les données publiées : une
  // méthodologie qui annoncerait un corpus plus large que celui qu'elle publie
  // se réfuterait elle-même.
  const nbQuestions = questions?.length ?? resultats?.nb_questions ?? 0;
  const nbEnRevue = questions?.filter((q) => q.verification.statut === "en_revue").length ?? 0;

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
      <p className="etiquette">Protocole · version publique</p>
      <h1 className="text-3xl leading-tight sm:text-4xl">Méthodologie</h1>

      <section className="mt-6 max-w-2xl space-y-3 text-sm leading-relaxed">
        <h2 className="border-b border-rule pb-2 text-lg">1. Objet de la mesure</h2>
        <p>
          FinReg mesure la fiabilité des modèles de langage lorsqu'ils sont interrogés sur la
          réglementation financière applicable en France et dans l'Union européenne. La mesure ne
          porte pas sur la fluidité de la rédaction, ni sur la capacité de synthèse, mais sur trois
          propriétés vérifiables : la réponse est-elle juridiquement exacte, la source citée
          existe-t-elle et s'applique-t-elle, et le degré de certitude affiché correspond-il à la
          fiabilité réelle de la réponse.
        </p>
        <p>
          Le benchmark traite la citation d'une source inexistante ou inapplicable comme un échec
          distinct de l'erreur de fond. Une réponse exacte adossée à un article imaginaire est
          inutilisable en conformité : elle ne peut être ni vérifiée, ni opposée, ni archivée.
        </p>

        <h2 className="mt-10 border-b border-rule pb-2 text-lg">2. Construction du corpus</h2>
        <p>
          Le corpus public compte aujourd'hui {nbQuestions} questions fermées réparties sur cinq
          domaines : SFDR, MIF 2, doctrine et réglementation AMF, DORA et LCB-FT. Chaque question
          est adossée à un texte de niveau 1 ou 2, à un article identifié et à une réponse de
          référence rédigée à partir de ce texte. Trois niveaux de difficulté sont distingués :
          application directe d'une règle explicite (1), combinaison de deux dispositions ou d'un
          texte et de son acte délégué (2), question de périmètre ou de datation impliquant une
          exception (3).
        </p>
        <p>
          Le corpus est publié intégralement, question par question et source par source. C'est une
          contrainte assumée : un barème dont on ne peut pas lire les items ne se vérifie pas. Elle
          a une contrepartie, la contamination — un modèle entraîné sur ces pages peut les avoir
          vues. C'est la raison d'être du corpus privé décrit sur sa propre page.
        </p>

        <h2 className="mt-10 border-b border-rule pb-2 text-lg">
          3. Statut de vérification d'un item
        </h2>
        <p>
          Chaque item porte un statut qui décrit l'état du contrôle de sa citation, et rien d'autre.
        </p>
        <p>
          <span className="font-medium">Source vérifiée</span> — le texte et l'article cités ont été
          contrôlés : ils existent et portent la règle énoncée par la réponse de référence. Le
          contrôle porte sur la citation. Il ne vaut pas avis juridique et ne préjuge pas de
          l'application de la règle à un cas d'espèce.
        </p>
        <p>
          <span className="font-medium">En cours de vérification</span> — la règle a été identifiée
          et la réponse de référence est publiée, mais son rattachement à un article précis n'est
          pas établi : la disposition relève d'un acte délégué non encore identifié, d'une partie
          réglementaire dont la numérotation reste à confirmer, ou d'une transposition nationale à
          vérifier. Sur les {nbQuestions} items publiés, {nbEnRevue} sont dans ce cas. Ils restent
          affichés, avec la raison exacte du blocage, plutôt que retirés ou promus au rang de
          vérifiés.
        </p>
        <p>
          Aucun item ne franchit la première catégorie sans que le contrôle ait été fait. Un corpus
          qui présenterait des citations non contrôlées comme vérifiées mesurerait l'hallucination
          des modèles avec un instrument qui hallucine lui-même.
        </p>

        <h2 className="mt-10 border-b border-rule pb-2 text-lg">4. Barème</h2>
      </section>

      <div className="mt-3 -mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[38rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-rule bg-surface-sunken">
              <th
                scope="col"
                className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground"
              >
                Axe
              </th>
              <th
                scope="col"
                className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground"
              >
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
          Le score par question est la somme des quatre axes, soit 8 points, ramenée sur 10. Le
          score global d'un modèle est la moyenne de ses scores par question, exprimée sur 100. Le
          taux d'hallucination de source est la part des réponses portant le drapeau
          <span className="font-mono"> hallucination_source</span>, attribué dès qu'une référence
          citée est inexistante, abrogée ou étrangère à la question. Le taux d'abstention correcte
          est la part des questions pour lesquelles le modèle refuse de répondre alors que la
          réponse de référence exige un élément de fait absent de l'énoncé.
        </p>

        <h2 className="mt-10 border-b border-rule pb-2 text-lg">5. Protocole d'exécution</h2>
        <p>
          Chaque question est soumise au modèle dans une session indépendante, sans historique, sans
          outil de recherche et sans accès documentaire. La température est fixée à 0,2 et la
          longueur de réponse plafonnée à 250 mots. Aucun exemple n'est fourni dans le prompt : la
          mesure porte sur la connaissance interne du modèle, non sur sa capacité de récupération
          documentaire. Le prompt système, identique pour tous les modèles, est publié en fin de
          page afin que l'exécution puisse être répliquée.
        </p>

        <h2 id="jeu-de-donnees" className="mt-10 scroll-mt-24 border-b border-rule pb-2 text-lg">
          6. Le jeu de données actuellement publié
        </h2>
        <div className="border border-accent/40 bg-accent-soft p-4 text-accent">
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase">
            Échantillon de démonstration
          </p>
          <p className="mt-2 leading-relaxed">
            Le classement affiché sur ce site ne provient d'aucune exécution mesurée. Les cinq
            systèmes « Modèle A » à « Modèle E » sont des archétypes, et leurs réponses ont été
            écrites à la main pour illustrer ce que chaque axe du barème mesure. Aucun modèle
            commercialisé n'est nommé, noté ni classé.
          </p>
        </div>
        <p>
          Ce que cet échantillon montre est en revanche réel : le corpus, les réponses de référence,
          les sources citées et leur statut de vérification. C'est l'instrument qui est publié, avec
          un jeu d'essai qui permet de le lire, en attendant une exécution mesurée.
        </p>
        <p>
          Deux garanties tiennent cette distinction. D'abord, chaque chiffre du classement — score
          global, taux de source inventée, taux d'abstention, scores par domaine et par axe — est
          recalculé à partir des réponses item par item : aucun agrégat n'est saisi à la main, et
          n'importe quelle note affichée peut être reconstituée depuis les pages du corpus. Ensuite,
          le fichier de résultats porte son propre statut, et le bandeau visible en haut de chaque
          page en découle : le jour où une exécution mesurée remplacera cet échantillon, la mention
          disparaîtra d'elle-même, et pas avant.
        </p>

        <h2 className="mt-10 border-b border-rule pb-2 text-lg">7. Limites</h2>
        <p>
          Les résultats d'une exécution décrivent l'état des modèles à sa date, indiquée en pied de
          page. Ils ne sont pas transposables à un système augmenté par recherche documentaire, où
          la qualité du corpus indexé domine largement la connaissance interne du modèle. Les scores
          ne constituent pas une garantie de conformité, et ni le classement ni les réponses de
          référence ne remplacent une validation juridique.
        </p>
        <p>
          La taille du corpus est la limite la plus directe : {nbQuestions} items ne couvrent pas la
          réglementation financière française et européenne, et un écart de quelques points entre
          deux systèmes n'y est pas significatif. Ce qui se lit à cette échelle, ce sont les écarts
          de nature — un système qui invente des articles contre un système qui s'abstient.
        </p>

        <h2 className="mt-10 border-b border-rule pb-2 text-lg">8. Prompt système publié</h2>
        <p>
          Le prompt est identique pour tous les modèles et toutes les exécutions. Il est publié
          intégralement.
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
