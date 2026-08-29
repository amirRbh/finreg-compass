import { useQuery } from "@tanstack/react-query";

export const DOMAINES = ["SFDR", "MIFID", "AMF", "DORA", "LCBFT"] as const;
export const AXES = ["exactitude", "sourcing", "calibration", "exploitabilite"] as const;

export const LIBELLES_AXES: Record<string, string> = {
  exactitude: "Exactitude",
  sourcing: "Sourcing",
  calibration: "Calibration",
  exploitabilite: "Exploitabilité",
};

// Vocabulaire du harnais d'évaluation (dépôt amirRbh/FINREG, src/schema.py) : c'est
// lui qui fait foi, le site doit savoir afficher ce qu'il publie. Les libellés des
// anciennes valeurs sont conservés pour que les jeux de données antérieurs restent
// lisibles.
export const LIBELLES_TYPES: Record<string, string> = {
  fait: "Fait",
  qualification: "Qualification",
  calcul: "Calcul",
  piege: "Piège",
  abstention: "Abstention",
  procedure: "Procédure",
  perimetre: "Périmètre",
  datation: "Datation",
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

export const LIBELLES_FLAGS: Record<string, string> = {
  hallucination_source: "Hallucination de source",
  erreur_disqualifiante: "Erreur disqualifiante",
  sourcing_incomplet: "Sourcing incomplet",
  surconfiance: "Surconfiance",
  abstention: "Abstention",
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
  editeur: string;
  score_global: number;
  taux_hallucination_source: number;
  taux_abstention_correcte: number;
  ecart_type: number;
  scores_domaines: Record<string, number>;
  scores_axes: Record<string, number>;
};

export type Resultats = {
  date_execution: string;
  nb_questions: number;
  nb_runs: number;
  modeles: Modele[];
};

export type ReponseModele = {
  texte: string;
  score: number;
  flags: string[];
};

export type Question = {
  id: string;
  domaine: string;
  type: string;
  difficulte: number;
  question: string;
  reponse_reference: string;
  source: { texte: string; article: string; url: string };
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

const formatNombre = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function nb(valeur: number | null | undefined): string {
  if (valeur === null || valeur === undefined || Number.isNaN(valeur)) return "—";
  return formatNombre.format(valeur);
}

export function dateFr(iso: string): string {
  const [a, m, j] = iso.split("-");
  if (!a || !m || !j) return iso;
  return `${j}/${m}/${a}`;
}

export function mediane(valeurs: number[]): number {
  if (valeurs.length === 0) return 0;
  const tri = [...valeurs].sort((x, y) => x - y);
  const milieu = Math.floor(tri.length / 2);
  return tri.length % 2 === 0 ? (tri[milieu - 1]! + tri[milieu]!) / 2 : tri[milieu]!;
}

export function modeleMedian(modeles: Modele[]): Modele | undefined {
  if (modeles.length === 0) return undefined;
  const tri = [...modeles].sort(
    (a, b) => a.taux_hallucination_source - b.taux_hallucination_source,
  );
  return tri[Math.floor((tri.length - 1) / 2)];
}

export type CleTri =
  | "rang"
  | "nom"
  | "editeur"
  | "score_global"
  | "taux_hallucination_source"
  | "ecart_type";

export function trier(modeles: Modele[], cle: CleTri, ascendant: boolean): Modele[] {
  const classement = [...modeles].sort((a, b) => b.score_global - a.score_global);
  const rang = new Map(classement.map((m, i) => [m.id, i + 1]));
  const copie = [...modeles];
  copie.sort((a, b) => {
    let d = 0;
    if (cle === "rang") d = (rang.get(a.id) ?? 0) - (rang.get(b.id) ?? 0);
    else if (cle === "nom") d = a.nom.localeCompare(b.nom, "fr");
    else if (cle === "editeur") d = a.editeur.localeCompare(b.editeur, "fr");
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
