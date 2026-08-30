/**
 * Builds the two files published under /public/data from the repository's
 * authoring sources:
 *
 *   scripts/corpus-source.json         questions, legal sources, verification status
 *   scripts/reponses-echantillon.json  sample model answers
 *
 * Project rule: no published figure is typed by hand. Every aggregate in the
 * benchmark is recomputed here from the item-level answers, so that any number
 * shown on the site can be traced back to the public corpus.
 *
 *   bun run donnees
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const lire = (chemin) => JSON.parse(readFileSync(join(racine, chemin), "utf8"));

/**
 * Systems under evaluation. The demonstration sample is not a real run: it
 * therefore names no vendor and attributes no score to any product on the
 * market. `profil` describes an archetype, not a company.
 */
const MODELES = [
  { id: "modele-a", nom: "Model A", profil: "General purpose, very large" },
  { id: "modele-b", nom: "Model B", profil: "General purpose, very large" },
  { id: "modele-c", nom: "Model C", profil: "General purpose, mid-size" },
  { id: "modele-d", nom: "Model D", profil: "General purpose, mid-size" },
  { id: "modele-e", nom: "Model E", profil: "Open weights" },
];

const AXES = ["exactitude", "sourcing", "calibration", "exploitabilite"];
const DATE_EXECUTION = "2026-08-24";

const corpus = lire("scripts/corpus-source.json");
const reponses = lire("scripts/reponses-echantillon.json");

/** Score out of 10 derived from the four axes scored 0-2, i.e. 8 points rebased to 10. */
const scoreDepuisAxes = (axes) =>
  Math.round((AXES.reduce((s, a) => s + axes[a], 0) / 8) * 10 * 10) / 10;

const questions = corpus.map((question) => {
  const brutes = reponses[question.id];
  if (!brutes) throw new Error(`No sample answer for ${question.id}`);
  const reponses_modeles = {};
  for (const [idModele, texte, notes, flags, analyse] of brutes) {
    if (!MODELES.some((m) => m.id === idModele)) {
      throw new Error(`${question.id}: unknown model ${idModele}`);
    }
    const axes = Object.fromEntries(AXES.map((a, i) => [a, notes[i]]));
    reponses_modeles[idModele] = {
      texte,
      axes,
      score: scoreDepuisAxes(axes),
      flags,
      ...(analyse ? { analyse } : {}),
    };
  }
  return { ...question, reponses_modeles };
});

const moyenne = (xs) => (xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length);
const arrondi = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
const part = (xs, predicat) =>
  xs.length === 0 ? 0 : (xs.filter(predicat).length / xs.length) * 100;

const domaines = [...new Set(questions.map((q) => q.domaine))];
const types = [...new Set(questions.map((q) => q.type))];

const modeles = MODELES.map((modele) => {
  const items = questions
    .map((q) => ({ question: q, reponse: q.reponses_modeles[modele.id] }))
    .filter((e) => e.reponse);

  const scores = items.map((e) => e.reponse.score);
  const flags = items.map((e) => e.reponse.flags);
  const parGroupe = (predicat) =>
    arrondi(moyenne(items.filter(predicat).map((e) => e.reponse.score)) * 10);

  return {
    ...modele,
    score_global: arrondi(moyenne(scores) * 10),
    taux_hallucination_source: arrondi(part(flags, (f) => f.includes("hallucination_source"))),
    taux_erreur_disqualifiante: arrondi(part(flags, (f) => f.includes("erreur_disqualifiante"))),
    taux_abstention: arrondi(part(flags, (f) => f.includes("abstention"))),
    scores_domaines: Object.fromEntries(
      domaines.map((d) => [d, parGroupe((e) => e.question.domaine === d)]),
    ),
    // Une capacité par type de question : c'est la lecture que comprend un
    // lecteur qui n'a pas encore ouvert la page méthodologie.
    scores_types: Object.fromEntries(
      types.map((t) => [t, parGroupe((e) => e.question.type === t)]),
    ),
    scores_axes: Object.fromEntries(
      AXES.map((a) => [a, arrondi(moyenne(items.map((e) => e.reponse.axes[a])), 2)]),
    ),
  };
});

/**
 * Aggregates over every evaluated answer, all systems combined.
 *
 * The headline figure on the landing page reads from here rather than from a
 * median system: as soon as half the systems make no error of a given kind, a
 * median collapses to zero and tells the reader nothing.
 */
const toutesLesReponses = questions.flatMap((q) => Object.values(q.reponses_modeles));
const tousLesFlags = toutesLesReponses.map((r) => r.flags);
const scoresGlobaux = modeles.map((m) => m.score_global);

const synthese = {
  nb_reponses: toutesLesReponses.length,
  // Exactitude réglementaire moyenne, tous systèmes et tous items confondus.
  exactitude_reglementaire: arrondi(moyenne(toutesLesReponses.map((r) => r.score)) * 10),
  taux_hallucination_source: arrondi(part(tousLesFlags, (f) => f.includes("hallucination_source"))),
  taux_erreur_disqualifiante: arrondi(
    part(tousLesFlags, (f) => f.includes("erreur_disqualifiante")),
  ),
  taux_abstention: arrondi(part(tousLesFlags, (f) => f.includes("abstention"))),
  ecart_meilleur_moins_bon: arrondi(Math.max(...scoresGlobaux) - Math.min(...scoresGlobaux)),
  // Part des réponses portant au moins un défaut grave : c'est le chiffre qui
  // dit à un responsable conformité ce qu'il risque à laisser passer.
  taux_reponse_non_fiable: arrondi(
    part(
      tousLesFlags,
      (f) => f.includes("hallucination_source") || f.includes("erreur_disqualifiante"),
    ),
  ),
};

const resultats = {
  // Nature of the published dataset. The site relies on this field so that a
  // sample is never presented as a measured run.
  statut: "echantillon_demonstration",
  date_execution: DATE_EXECUTION,
  nb_questions: questions.length,
  nb_runs: 1,
  domaines,
  types,
  synthese,
  modeles,
};

const ecrire = (chemin, valeur) =>
  writeFileSync(join(racine, chemin), JSON.stringify(valeur, null, 2) + "\n", "utf8");

ecrire("public/data/questions.json", questions);
ecrire("public/data/results.json", resultats);

console.log(
  `public/data written: ${questions.length} questions, ${modeles.length} systems, ` +
    `${questions.filter((q) => q.verification.statut === "source_verifiee").length} verified sources, ` +
    `${toutesLesReponses.filter((r) => r.analyse).length} error analyses.`,
);
console.log(
  `  regulatory accuracy ${synthese.exactitude_reglementaire}%  ·  unreliable answers ${synthese.taux_reponse_non_fiable}%`,
);
for (const m of modeles) {
  console.log(
    `  ${m.id}  score ${m.score_global.toFixed(1).padStart(5)}  ` +
      `invented source ${m.taux_hallucination_source.toFixed(1).padStart(5)}%  ` +
      `abstained ${m.taux_abstention.toFixed(1).padStart(5)}%`,
  );
}
