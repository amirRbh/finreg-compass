/** Contrôles des fonctions de présentation partagées par les pages. */
import { describe, expect, it } from "vitest";

import {
  dateFr,
  echecsSignificatifs,
  estGrave,
  nb,
  rangDe,
  trier,
  valeursPresentes,
  type Modele,
  type Question,
} from "@/lib/finreg";

const modele = (id: string, score: number, halluc: number): Modele => ({
  id,
  nom: id.toUpperCase(),
  profil: "Généraliste",
  score_global: score,
  taux_hallucination_source: halluc,
  taux_erreur_disqualifiante: 0,
  taux_abstention: 0,
  scores_domaines: {},
  scores_axes: {},
});

const MODELES = [modele("a", 80, 4), modele("b", 60, 12), modele("c", 70, 8)];

describe("mise en forme", () => {
  it("affiche un tiret plutôt qu'un zéro trompeur quand la valeur manque", () => {
    expect(nb(undefined)).toBe("—");
    expect(nb(null)).toBe("—");
    expect(nb(Number.NaN)).toBe("—");
  });

  it("formate les nombres avec une décimale", () => {
    expect(nb(72).replace(/[\u202f\u00a0]/g, " ")).toBe("72,0");
    expect(nb(6.35).replace(/[\u202f\u00a0]/g, " ")).toBe("6,4");
  });

  it("formate les dates ISO en jour/mois/année", () => {
    expect(dateFr("2026-08-24")).toBe("24/08/2026");
    expect(dateFr("date-invalide")).toBe("date-invalide");
  });
});

describe("classement", () => {
  it("range les systèmes par score global décroissant", () => {
    expect(rangDe(MODELES, "a")).toBe(1);
    expect(rangDe(MODELES, "c")).toBe(2);
    expect(rangDe(MODELES, "b")).toBe(3);
  });

  it("trie sur la colonne demandée dans les deux sens", () => {
    expect(trier(MODELES, "score_global", false).map((m) => m.id)).toEqual(["a", "c", "b"]);
    expect(trier(MODELES, "score_global", true).map((m) => m.id)).toEqual(["b", "c", "a"]);
    expect(trier(MODELES, "rang", true).map((m) => m.id)).toEqual(["a", "c", "b"]);
    expect(trier(MODELES, "nom", true).map((m) => m.id)).toEqual(["a", "b", "c"]);
  });

  it("ne modifie pas le tableau reçu", () => {
    const avant = MODELES.map((m) => m.id);
    trier(MODELES, "score_global", true);
    expect(MODELES.map((m) => m.id)).toEqual(avant);
  });
});

describe("vocabulaire des données", () => {
  it("affiche les valeurs inconnues à la suite plutôt que de les perdre", () => {
    // Le corpus fait foi : un type qu'il introduit doit rester filtrable même
    // si le site ne le connaît pas encore.
    expect(valeursPresentes(["inedit", "calcul", "fait"], ["fait", "calcul"])).toEqual([
      "fait",
      "calcul",
      "inedit",
    ]);
  });

  it("dédoublonne les valeurs", () => {
    expect(valeursPresentes(["fait", "fait"], ["fait"])).toEqual(["fait"]);
  });

  it("distingue les drapeaux graves des simples réserves", () => {
    expect(estGrave("hallucination_source")).toBe(true);
    expect(estGrave("erreur_disqualifiante")).toBe(true);
    expect(estGrave("sourcing_incomplet")).toBe(false);
  });
});

describe("échecs significatifs", () => {
  const question = (id: string, score: number, flags: string[]): Question => ({
    id,
    domaine: "SFDR",
    type: "fait",
    difficulte: 2,
    question: "Question de test",
    reponse_reference: "Réponse de référence de test",
    source: {
      texte: "Texte",
      article: "Article",
      url: "https://exemple.test",
      precision: "article",
    },
    verification: {
      statut: "source_verifiee",
      note: "Contrôle effectué pour les besoins du test.",
    },
    reponses_modeles: {
      a: { texte: "Réponse", axes: {}, score, flags },
    },
  });

  it("remonte d'abord les hallucinations de source, puis les scores les plus bas", () => {
    const corpus = [
      question("Q1", 3, []),
      question("Q2", 5, ["hallucination_source"]),
      question("Q3", 1, []),
      question("Q4", 9, []),
    ];
    expect(echecsSignificatifs(corpus, "a").map((e) => e.question.id)).toEqual(["Q3", "Q2", "Q1"]);
  });

  it("ne retient rien quand le système n'échoue nulle part", () => {
    expect(echecsSignificatifs([question("Q1", 9, [])], "a")).toEqual([]);
  });

  it("ignore les items auxquels le système n'a pas répondu", () => {
    expect(echecsSignificatifs([question("Q1", 1, [])], "inconnu")).toEqual([]);
  });
});
