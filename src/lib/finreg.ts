import { useQuery } from "@tanstack/react-query";

// Ordre d'affichage des domaines. Comme pour les types, un domaine absent de
// cette liste reste affiché, à la suite : les données publiées font foi.
export const ORDRE_DOMAINES: string[] = ["SFDR", "MIFID", "AMF", "DORA", "LCBFT"];

export const LIBELLES_DOMAINES: Record<string, string> = {
  SFDR: "SFDR — sustainability disclosure",
  MIFID: "MiFID II — investment services",
  AMF: "Market abuse & issuers",
  DORA: "DORA — operational resilience",
  LCBFT: "AML / CFT",
};

/** Nom court, pour les colonnes et les axes de graphique. */
export const NOMS_COURTS_DOMAINES: Record<string, string> = {
  SFDR: "SFDR",
  MIFID: "MiFID II",
  AMF: "Market abuse",
  DORA: "DORA",
  LCBFT: "AML/CFT",
};
export const AXES = ["exactitude", "sourcing", "calibration", "exploitabilite"] as const;

/** Libellés du barème, en langage compréhensible sans lire la méthodologie. */
export const LIBELLES_AXES: Record<string, string> = {
  exactitude: "Legal accuracy",
  sourcing: "Citation accuracy",
  calibration: "Calibration",
  exploitabilite: "Usability",
};

export const EXPLICATIONS_AXES: Record<string, string> = {
  exactitude: "Is the rule stated the one the applicable text actually lays down?",
  sourcing: "Does the cited article exist, and does it carry that rule?",
  calibration: "Does the confidence shown match how reliable the answer really is?",
  exploitabilite: "Can a compliance professional act on it as written?",
};

// Vocabulaire du harnais d'évaluation (dépôt amirRbh/FINREG, src/schema.py) : c'est
// lui qui fait foi, le site doit savoir afficher ce qu'il publie. Les libellés des
// anciennes valeurs sont conservés pour que les jeux de données antérieurs restent
// lisibles.
export const LIBELLES_TYPES: Record<string, string> = {
  fait: "Fact",
  qualification: "Qualification",
  calcul: "Calculation",
  piege: "Trap",
  abstention: "Abstention",
  procedure: "Procedure",
  perimetre: "Scope",
  datation: "Timing",
};

// Ordre d'affichage des types dans les filtres. Un type absent d'ici est affiché
// quand même, à la suite : mieux vaut une option en trop qu'un item introuvable.
export const ORDRE_TYPES: string[] = [
  "fait",
  "qualification",
  "calcul",
  "piege",
  "abstention",
  "procedure",
  "perimetre",
  "datation",
];

/**
 * Statut de vérification d'un item du corpus. Il porte sur la citation, pas sur
 * le fond : « source vérifiée » signifie que le texte et l'article cités ont été
 * contrôlés et qu'ils portent bien la règle énoncée. Ce n'est pas un avis
 * juridique, et un item non contrôlé n'est jamais présenté comme vérifié.
 */
export const LIBELLES_VERIFICATION: Record<string, string> = {
  source_verifiee: "Verified",
  en_revue: "Under review",
};

export const EXPLICATIONS_VERIFICATION: Record<string, string> = {
  source_verifiee:
    "The cited act and article were checked: they exist and carry the rule stated. This check covers the citation. It is not legal advice.",
  en_revue:
    "The rule has been identified, but it is not yet tied to a specific article. The item is published as it stands rather than presented as verified.",
};

export const LIBELLES_FLAGS: Record<string, string> = {
  hallucination_source: "Invented source",
  erreur_disqualifiante: "Disqualifying error",
  sourcing_incomplet: "Incomplete citation",
  surconfiance: "Overconfident",
  abstention: "Declined to answer",
};

export const LIBELLES_DIFFICULTE: Record<number, string> = {
  1: "Direct application",
  2: "Two provisions combined",
  3: "Scope or timing with an exception",
};

// Drapeaux qui signalent un défaut grave : ils sont mis en évidence et comptent
// comme échec significatif sur la fiche d'un modèle.
export const FLAGS_GRAVES = ["hallucination_source", "erreur_disqualifiante"] as const;

export function estGrave(flag: string): boolean {
  return (FLAGS_GRAVES as readonly string[]).includes(flag);
}

/**
 * Valeurs présentes dans les données, ordonnées selon `ordre` puis, pour celles
 * qu'il ne connaît pas, par ordre alphabétique. Sert à construire les filtres
 * depuis le corpus publié plutôt que depuis une liste figée dans le site : le
 * vocabulaire du harnais peut évoluer sans rendre des items introuvables.
 */
export function valeursPresentes(valeurs: string[], ordre: string[]): string[] {
  const uniques = [...new Set(valeurs)];
  return uniques.sort((a, b) => {
    const ia = ordre.indexOf(a);
    const ib = ordre.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, "fr");
  });
}

export type Modele = {
  id: string;
  nom: string;
  /** Archétype de système évalué. L'échantillon n'attribue aucune note à un produit nommé. */
  profil: string;
  score_global: number;
  taux_hallucination_source: number;
  taux_erreur_disqualifiante: number;
  taux_abstention: number;
  scores_domaines: Record<string, number>;
  /** Score moyen par type de question : lecture « par capacité ». */
  scores_types: Record<string, number>;
  scores_axes: Record<string, number>;
};

/**
 * Nature du jeu publié. `echantillon_demonstration` désigne un jeu écrit à la
 * main pour montrer ce que le barème mesure : il ne provient d'aucune exécution
 * et le site doit le dire partout où il en affiche un chiffre.
 */
export type StatutJeu = "echantillon_demonstration" | "execution_mesuree";

/** Agrégats calculés sur l'ensemble des réponses évaluées, tous systèmes confondus. */
export type Synthese = {
  nb_reponses: number;
  /** Score moyen sur 100, toutes réponses confondues. Chiffre de tête du produit. */
  exactitude_reglementaire: number;
  /** Part des réponses portant au moins un défaut grave. */
  taux_reponse_non_fiable: number;
  taux_hallucination_source: number;
  taux_erreur_disqualifiante: number;
  taux_abstention: number;
  ecart_meilleur_moins_bon: number;
};

export type Resultats = {
  statut: StatutJeu;
  date_execution: string;
  nb_questions: number;
  nb_runs: number;
  /** Modèle juge de l'exécution mesurée. Absent des jeux antérieurs. */
  juge?: string;
  domaines: string[];
  types: string[];
  synthese: Synthese;
  modeles: Modele[];
};

/** Ce que le système a vu juste, et où il a basculé. Renseignée sur les défauts graves. */
export type Analyse = { correct: string; incorrect: string };

export type ReponseModele = {
  texte: string;
  /** Notes de 0 à 2 sur chacun des quatre axes du barème. */
  axes: Record<string, number>;
  /** Somme des axes ramenée sur 10. Recalculée à la construction, jamais saisie. */
  score: number;
  flags: string[];
  analyse?: Analyse;
};

export type Verification = {
  statut: "source_verifiee" | "en_revue";
  note: string;
};

export type Question = {
  id: string;
  domaine: string;
  type: string;
  difficulte: number;
  question: string;
  reponse_reference: string;
  source: {
    texte: string;
    article: string;
    /** Date d'adoption de l'acte, ou mention de version pour un code consolidé. */
    adopte: string;
    url: string;
    juridiction: "EU" | "FR";
    /** Langue de la source officielle liée. Légifrance n'existe qu'en français. */
    langue_source: "en" | "fr";
    /** `article` : le lien pointe vers l'article cité. `texte` : vers le texte entier. */
    precision: "article" | "texte";
  };
  verification: Verification;
  reponses_modeles: Record<string, ReponseModele>;
};

async function lire<T>(chemin: string): Promise<T> {
  const reponse = await fetch(chemin);
  if (!reponse.ok) throw new Error(`Lecture impossible : ${chemin}`);
  return (await reponse.json()) as T;
}

export function useResultats() {
  return useQuery({
    queryKey: ["resultats"],
    queryFn: () => lire<Resultats>("/data/results.json"),
    staleTime: Infinity,
  });
}

export function useQuestions() {
  return useQuery({
    queryKey: ["questions"],
    queryFn: () => lire<Question[]>("/data/questions.json"),
    staleTime: Infinity,
  });
}

const formatNombre = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function nb(valeur: number | null | undefined): string {
  if (valeur === null || valeur === undefined || Number.isNaN(valeur)) return "—";
  return formatNombre.format(valeur);
}

const MOIS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Date ISO rendue en anglais : « 24 August 2026 ». */
export function dateFr(iso: string): string {
  const [a, m, j] = iso.split("-");
  const mois = MOIS[Number(m) - 1];
  if (!a || !m || !j || !mois) return iso;
  return `${Number(j)} ${mois} ${a}`;
}

export type CleTri =
  "rang" | "nom" | "profil" | "score_global" | "taux_hallucination_source" | "taux_abstention";

export function trier(modeles: Modele[], cle: CleTri, ascendant: boolean): Modele[] {
  const classement = [...modeles].sort((a, b) => b.score_global - a.score_global);
  const rang = new Map(classement.map((m, i) => [m.id, i + 1]));
  const copie = [...modeles];
  copie.sort((a, b) => {
    let d = 0;
    if (cle === "rang") d = (rang.get(a.id) ?? 0) - (rang.get(b.id) ?? 0);
    else if (cle === "nom") d = a.nom.localeCompare(b.nom, "fr");
    else if (cle === "profil") d = a.profil.localeCompare(b.profil, "fr");
    else d = a[cle] - b[cle];
    return ascendant ? d : -d;
  });
  return copie;
}

export function rangDe(modeles: Modele[], id: string): number {
  return (
    [...modeles].sort((a, b) => b.score_global - a.score_global).findIndex((m) => m.id === id) + 1
  );
}

export type Echec = { question: Question; reponse: ReponseModele };

export function echecsSignificatifs(questions: Question[], idModele: string, n = 5): Echec[] {
  return questions
    .map((question) => ({ question, reponse: question.reponses_modeles[idModele] }))
    .filter((e): e is Echec => Boolean(e.reponse))
    .filter((e) => e.reponse.flags.some(estGrave) || e.reponse.score <= 4)
    .sort((a, b) => {
      const pa = a.reponse.score - (a.reponse.flags.some(estGrave) ? 3 : 0);
      const pb = b.reponse.score - (b.reponse.flags.some(estGrave) ? 3 : 0);
      if (pa !== pb) return pa - pb;
      return b.question.difficulte - a.question.difficulte;
    })
    .slice(0, n);
}
