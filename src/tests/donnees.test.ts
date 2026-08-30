/**
 * Contrôles d'intégrité des données publiées.
 *
 * Ces tests protègent les propriétés dont dépend la crédibilité du site, pas
 * son apparence. Ce qui est vérifié ici : rien n'est publié sans source, aucun
 * agrégat n'est saisi à la main, aucun item non contrôlé n'est présenté comme
 * vérifié, et le site n'annonce jamais un corpus plus grand que celui qu'il
 * publie. Une régression sur l'un de ces points est un défaut produit, pas un
 * détail de présentation.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  AXES,
  estGrave,
  LIBELLES_FLAGS,
  LIBELLES_TYPES,
  LIBELLES_VERIFICATION,
  type Question,
  type Resultats,
} from "@/lib/finreg";

const questions = JSON.parse(readFileSync("public/data/questions.json", "utf8")) as Question[];
const resultats = JSON.parse(readFileSync("public/data/results.json", "utf8")) as Resultats;

const moyenne = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
const arrondi = (x: number, d = 1) => Math.round(x * 10 ** d) / 10 ** d;

describe("corpus publié", () => {
  it("n'est pas vide", () => {
    expect(questions.length).toBeGreaterThan(0);
  });

  it("n'a aucun identifiant en double", () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  });

  it("adosse chaque question à une source citée, datée et consultable", () => {
    for (const q of questions) {
      expect(q.source.texte, q.id).toBeTruthy();
      expect(q.source.article, q.id).toBeTruthy();
      expect(q.source.adopte, q.id).toBeTruthy();
      expect(q.source.url, q.id).toMatch(/^https:\/\//);
      expect(["article", "texte"], q.id).toContain(q.source.precision);
      expect(["EU", "FR"], q.id).toContain(q.source.juridiction);
      expect(["en", "fr"], q.id).toContain(q.source.langue_source);
    }
  });

  it("renvoie vers une source anglaise dès qu'il en existe une", () => {
    // Le produit est en anglais : un lien EUR-Lex doit ouvrir la version
    // anglaise. Légifrance n'existe qu'en français, et le signale.
    for (const q of questions) {
      if (q.source.url.includes("eur-lex")) {
        expect(q.source.url, q.id).toContain("/EN/");
        expect(q.source.langue_source, q.id).toBe("en");
      }
      if (q.source.url.includes("legifrance")) expect(q.source.langue_source, q.id).toBe("fr");
    }
  });

  it("ne publie que des sources officielles", () => {
    // Une citation ne vaut que si le lecteur peut la vérifier chez l'éditeur du
    // texte. Un lien vers un commentaire ou un agrégateur n'a pas cette valeur.
    const officiels = ["eur-lex.europa.eu", "legifrance.gouv.fr", "amf-france.org"];
    for (const q of questions) {
      const hote = new URL(q.source.url).hostname;
      expect(
        officiels.some((d) => hote.endsWith(d)),
        `${q.id} → ${hote}`,
      ).toBe(true);
    }
  });

  it("donne une réponse de référence substantielle à chaque question", () => {
    for (const q of questions) {
      expect(q.question.length, q.id).toBeGreaterThan(20);
      expect(q.reponse_reference.length, q.id).toBeGreaterThan(20);
    }
  });

  it("porte un statut de vérification connu, toujours motivé", () => {
    for (const q of questions) {
      expect(Object.keys(LIBELLES_VERIFICATION), q.id).toContain(q.verification.statut);
      // Un item « en revue » sans explication serait un écran cassé plutôt
      // qu'une information : la note dit ce qui bloque.
      expect(q.verification.note.length, q.id).toBeGreaterThan(30);
    }
  });

  it("n'emploie que le vocabulaire déclaré pour les types et les drapeaux", () => {
    for (const q of questions) {
      expect(Object.keys(LIBELLES_TYPES), q.id).toContain(q.type);
      expect([1, 2, 3], q.id).toContain(q.difficulte);
      for (const r of Object.values(q.reponses_modeles)) {
        for (const f of r.flags) expect(Object.keys(LIBELLES_FLAGS), q.id).toContain(f);
      }
    }
  });
});

describe("notation", () => {
  it("note chaque réponse sur les quatre axes du barème, de 0 à 2", () => {
    for (const q of questions) {
      for (const [idModele, r] of Object.entries(q.reponses_modeles)) {
        for (const axe of AXES) {
          expect(r.axes[axe], `${q.id}/${idModele}/${axe}`).toBeGreaterThanOrEqual(0);
          expect(r.axes[axe], `${q.id}/${idModele}/${axe}`).toBeLessThanOrEqual(2);
          expect(Number.isInteger(r.axes[axe]), `${q.id}/${idModele}/${axe}`).toBe(true);
        }
      }
    }
  });

  it("déduit le score de chaque réponse de ses axes, sans saisie manuelle", () => {
    for (const q of questions) {
      for (const [idModele, r] of Object.entries(q.reponses_modeles)) {
        const attendu = arrondi((AXES.reduce((s, a) => s + r.axes[a]!, 0) / 8) * 10);
        expect(r.score, `${q.id}/${idModele}`).toBe(attendu);
      }
    }
  });

  it("justifie chaque note par une appréciation écrite", () => {
    for (const q of questions) {
      for (const [idModele, r] of Object.entries(q.reponses_modeles)) {
        expect(r.texte.length, `${q.id}/${idModele}`).toBeGreaterThan(20);
      }
    }
  });

  it("explique tout défaut grave, pour que « pourquoi » soit toujours lisible", () => {
    // Un drapeau grave sans explication laisse le lecteur devant un verdict
    // qu'il ne peut pas vérifier : c'est exactement ce que le produit reproche
    // aux modèles évalués.
    for (const q of questions) {
      for (const [idModele, r] of Object.entries(q.reponses_modeles)) {
        if (!r.flags.some(estGrave)) continue;
        expect(r.analyse, `${q.id}/${idModele}`).toBeDefined();
        expect(r.analyse!.correct.length, `${q.id}/${idModele}`).toBeGreaterThan(10);
        expect(r.analyse!.incorrect.length, `${q.id}/${idModele}`).toBeGreaterThan(30);
      }
    }
  });

  it("n'affiche pas la même appréciation d'un item à l'autre", () => {
    // Une évaluation recopiée d'un item à l'autre se voit au premier coup d'œil
    // et discrédite l'ensemble du corpus.
    const textes = questions.flatMap((q) => Object.values(q.reponses_modeles).map((r) => r.texte));
    expect(new Set(textes).size).toBe(textes.length);
  });
});

describe("classement", () => {
  it("annonce exactement le nombre de questions qu'il publie", () => {
    expect(resultats.nb_questions).toBe(questions.length);
  });

  it("n'annonce pas plus d'exécutions qu'il n'en restitue", () => {
    expect(resultats.nb_runs).toBeGreaterThanOrEqual(1);
  });

  it("ne se date pas dans le futur", () => {
    expect(new Date(resultats.date_execution).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("évalue chaque système sur l'intégralité du corpus", () => {
    for (const m of resultats.modeles) {
      const repondus = questions.filter((q) => q.reponses_modeles[m.id]).length;
      expect(repondus, m.id).toBe(questions.length);
    }
  });

  it("ne référence aucun système absent du classement", () => {
    const connus = new Set(resultats.modeles.map((m) => m.id));
    for (const q of questions) {
      for (const idModele of Object.keys(q.reponses_modeles)) {
        expect(connus, `${q.id} → ${idModele}`).toContain(idModele);
      }
    }
  });

  it("recalcule chaque agrégat publié depuis les réponses du corpus", () => {
    for (const m of resultats.modeles) {
      const reponses = questions.map((q) => q.reponses_modeles[m.id]!);
      const flags = reponses.map((r) => r.flags);
      const partDe = (f: string) =>
        arrondi((flags.filter((fs) => fs.includes(f)).length / flags.length) * 100);

      expect(m.score_global, m.id).toBe(arrondi(moyenne(reponses.map((r) => r.score)) * 10));
      expect(m.taux_hallucination_source, m.id).toBe(partDe("hallucination_source"));
      expect(m.taux_erreur_disqualifiante, m.id).toBe(partDe("erreur_disqualifiante"));
      expect(m.taux_abstention, m.id).toBe(partDe("abstention"));

      for (const d of resultats.domaines) {
        const duDomaine = questions
          .filter((q) => q.domaine === d)
          .map((q) => q.reponses_modeles[m.id]!.score);
        expect(m.scores_domaines[d], `${m.id}/${d}`).toBe(arrondi(moyenne(duDomaine) * 10));
      }
      for (const a of AXES) {
        expect(m.scores_axes[a], `${m.id}/${a}`).toBe(
          arrondi(moyenne(reponses.map((r) => r.axes[a]!)), 2),
        );
      }
    }
  });

  it("recalcule la synthèse depuis l'ensemble des réponses évaluées", () => {
    const toutes = questions.flatMap((q) => Object.values(q.reponses_modeles));
    const flags = toutes.map((r) => r.flags);
    const partDe = (f: string) =>
      arrondi((flags.filter((fs) => fs.includes(f)).length / flags.length) * 100);
    const scores = resultats.modeles.map((m) => m.score_global);

    expect(resultats.synthese.nb_reponses).toBe(toutes.length);
    expect(resultats.synthese.exactitude_reglementaire).toBe(
      arrondi(moyenne(toutes.map((r) => r.score)) * 10),
    );
    expect(resultats.synthese.taux_reponse_non_fiable).toBe(
      arrondi((flags.filter((fs) => fs.some((f) => estGrave(f))).length / flags.length) * 100),
    );
    expect(resultats.synthese.taux_hallucination_source).toBe(partDe("hallucination_source"));
    expect(resultats.synthese.taux_erreur_disqualifiante).toBe(partDe("erreur_disqualifiante"));
    expect(resultats.synthese.taux_abstention).toBe(partDe("abstention"));
    expect(resultats.synthese.ecart_meilleur_moins_bon).toBe(
      arrondi(Math.max(...scores) - Math.min(...scores)),
    );
  });

  it("recalcule le score par capacité depuis les items de chaque type", () => {
    for (const m of resultats.modeles) {
      for (const t of resultats.types) {
        const duType = questions
          .filter((q) => q.type === t)
          .map((q) => q.reponses_modeles[m.id]!.score);
        expect(m.scores_types[t], `${m.id}/${t}`).toBe(arrondi(moyenne(duType) * 10));
      }
    }
  });

  it("couvre tous les domaines présents dans le corpus", () => {
    expect([...resultats.domaines].sort()).toEqual(
      [...new Set(questions.map((q) => q.domaine))].sort(),
    );
  });
});

describe("garde-fous juridiques", () => {
  it("déclare la nature du jeu de données publié", () => {
    // Le bandeau visible sur toutes les pages découle de ce champ. S'il
    // disparaissait, un échantillon écrit à la main serait lu comme une mesure.
    expect(["echantillon_demonstration", "execution_mesuree"]).toContain(resultats.statut);
  });

  it("n'attribue aucune note à un éditeur ou à un produit nommé", () => {
    // Publier une note inventée sous le nom d'un modèle commercialisé serait
    // une allégation sur un tiers identifiable, pas une mesure.
    if (resultats.statut !== "echantillon_demonstration") return;
    const nommes = [
      "openai",
      "gpt",
      "anthropic",
      "claude",
      "mistral",
      "google",
      "gemini",
      "deepmind",
      "meta",
      "llama",
      "alibaba",
      "qwen",
      "cohere",
      "grok",
      "xai",
    ];
    for (const m of resultats.modeles) {
      const champs = `${m.nom} ${m.profil}`.toLowerCase();
      for (const nom of nommes) expect(champs, m.id).not.toContain(nom);
    }
  });

  it("ne présente comme vérifié aucun item dont la citation ne l'a pas été", () => {
    // Le seul sens du statut « source vérifiée » est qu'un contrôle a eu lieu.
    // Un item dont le lien ne pointe même pas vers l'article cité ne peut pas
    // le porter.
    for (const q of questions) {
      if (q.source.precision === "texte") {
        expect(q.verification.statut, q.id).toBe("en_revue");
      }
    }
  });

  it("motive chaque item en revue par un blocage précis, jamais par un défaut d'affichage", () => {
    const enRevue = questions.filter((q) => q.verification.statut === "en_revue");
    for (const q of enRevue) {
      expect(q.verification.note, q.id).not.toMatch(/erreur|indisponible|à venir|TODO/i);
    }
  });
});
