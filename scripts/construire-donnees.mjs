/**
 * Construit les deux fichiers publiés dans /public/data à partir des sources
 * d'autorité du dépôt :
 *
 *   scripts/corpus-source.json      questions, sources et statut de vérification
 *   scripts/reponses-echantillon.json  réponses de l'échantillon de démonstration
 *
 * Règle du projet : aucun chiffre publié n'est saisi à la main. Tous les
 * agrégats du classement sont recalculés ici à partir des réponses item par
 * item, de sorte qu'une note affichée sur la page d'accueil soit toujours
 * reconstituable depuis le corpus public.
 *
 *   bun run donnees
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const lire = (chemin) => JSON.parse(readFileSync(join(racine, chemin), "utf8"));

/**
 * Métadonnées des systèmes évalués. L'échantillon de démonstration n'est pas
 * une exécution réelle : il ne nomme donc aucun éditeur et n'attribue aucune
 * note à un produit commercialisé. La colonne « profil » décrit un archétype,
 * pas une entreprise.
 */
const MODELES = [
  { id: "modele-a", nom: "Modèle A", profil: "Généraliste, très grande taille" },
  { id: "modele-b", nom: "Modèle B", profil: "Généraliste, très grande taille" },
  { id: "modele-c", nom: "Modèle C", profil: "Généraliste, taille moyenne" },
  { id: "modele-d", nom: "Modèle D", profil: "Généraliste, taille moyenne" },
  { id: "modele-e", nom: "Modèle E", profil: "Ouvert, poids publiés" },
];

const AXES = ["exactitude", "sourcing", "calibration", "exploitabilite"];
const DATE_EXECUTION = "2026-08-24";

const corpus = lire("scripts/corpus-source.json");
const reponses = lire("scripts/reponses-echantillon.json");

/** Score sur 10 déduit des quatre axes notés de 0 à 2, soit 8 points ramenés sur 10. */
const scoreDepuisAxes = (axes) =>
  Math.round((AXES.reduce((s, a) => s + axes[a], 0) / 8) * 10 * 10) / 10;

const questions = corpus.map((question) => {
  const brutes = reponses[question.id];
  if (!brutes) throw new Error(`Aucune réponse d'échantillon pour ${question.id}`);
  const reponses_modeles = {};
  for (const [idModele, texte, notes, flags] of brutes) {
    if (!MODELES.some((m) => m.id === idModele)) {
      throw new Error(`${question.id} : modèle inconnu ${idModele}`);
    }
    const axes = Object.fromEntries(AXES.map((a, i) => [a, notes[i]]));
    reponses_modeles[idModele] = { texte, axes, score: scoreDepuisAxes(axes), flags };
  }
  return { ...question, reponses_modeles };
});

const moyenne = (xs) => (xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length);
const arrondi = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
const part = (xs, predicat) =>
  xs.length === 0 ? 0 : (xs.filter(predicat).length / xs.length) * 100;

const domaines = [...new Set(questions.map((q) => q.domaine))];

const modeles = MODELES.map((modele) => {
  const items = questions
    .map((q) => ({ question: q, reponse: q.reponses_modeles[modele.id] }))
    .filter((e) => e.reponse);

  const scores = items.map((e) => e.reponse.score);
  const flags = items.map((e) => e.reponse.flags);

  return {
    ...modele,
    score_global: arrondi(moyenne(scores) * 10),
    taux_hallucination_source: arrondi(part(flags, (f) => f.includes("hallucination_source"))),
    taux_erreur_disqualifiante: arrondi(part(flags, (f) => f.includes("erreur_disqualifiante"))),
    taux_abstention: arrondi(part(flags, (f) => f.includes("abstention"))),
    scores_domaines: Object.fromEntries(
      domaines.map((d) => [
        d,
        arrondi(
          moyenne(items.filter((e) => e.question.domaine === d).map((e) => e.reponse.score)) * 10,
        ),
      ]),
    ),
    scores_axes: Object.fromEntries(
      AXES.map((a) => [a, arrondi(moyenne(items.map((e) => e.reponse.axes[a])), 2)]),
    ),
  };
});

/**
 * Synthèse sur l'ensemble des réponses évaluées, tous systèmes confondus.
 *
 * Le chiffre mis en avant sur l'accueil se lit ici plutôt que sur un système
 * médian : dès que la moitié des systèmes évalués ne commet aucune faute d'un
 * type donné, la médiane vaut zéro et n'apprend plus rien au lecteur.
 */
const toutesLesReponses = questions.flatMap((q) => Object.values(q.reponses_modeles));
const tousLesFlags = toutesLesReponses.map((r) => r.flags);
const scoresGlobaux = modeles.map((m) => m.score_global);

const synthese = {
  nb_reponses: toutesLesReponses.length,
  taux_hallucination_source: arrondi(part(tousLesFlags, (f) => f.includes("hallucination_source"))),
  taux_erreur_disqualifiante: arrondi(
    part(tousLesFlags, (f) => f.includes("erreur_disqualifiante")),
  ),
  taux_abstention: arrondi(part(tousLesFlags, (f) => f.includes("abstention"))),
  ecart_meilleur_moins_bon: arrondi(Math.max(...scoresGlobaux) - Math.min(...scoresGlobaux)),
};

const resultats = {
  // Nature du jeu de données publié. Le site s'appuie sur ce champ pour ne
  // jamais présenter un échantillon comme une exécution mesurée.
  statut: "echantillon_demonstration",
  date_execution: DATE_EXECUTION,
  nb_questions: questions.length,
  nb_runs: 1,
  domaines,
  synthese,
  modeles,
};

const ecrire = (chemin, valeur) =>
  writeFileSync(join(racine, chemin), JSON.stringify(valeur, null, 2) + "\n", "utf8");

ecrire("public/data/questions.json", questions);
ecrire("public/data/results.json", resultats);

console.log(
  `public/data écrit : ${questions.length} questions, ${modeles.length} modèles, ` +
    `${questions.filter((q) => q.verification.statut === "source_verifiee").length} sources vérifiées.`,
);
for (const m of modeles) {
  console.log(
    `  ${m.id}  score ${m.score_global.toFixed(1).padStart(5)}  ` +
      `halluc. ${m.taux_hallucination_source.toFixed(1).padStart(5)}%  ` +
      `abst. ${m.taux_abstention.toFixed(1).padStart(5)}%`,
  );
}
