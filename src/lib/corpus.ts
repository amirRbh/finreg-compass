import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AXES, type Question, type ReponseModele } from "@/lib/finreg";

/**
 * Corpus importé par l'utilisateur. Il vit en base (Lovable Cloud) et remplace
 * le corpus statique dès qu'au moins un item y est publié : le benchmark reste
 * vérifiable parce que la question, la source et le contrôle voyagent ensemble.
 */

const AXE_NOTE = z.coerce.number().int().min(0).max(2);

export const schemaReponse = z.object({
  texte: z.string().trim().max(20000).default(""),
  axes: z
    .object({
      exactitude: AXE_NOTE.default(0),
      sourcing: AXE_NOTE.default(0),
      calibration: AXE_NOTE.default(0),
      exploitabilite: AXE_NOTE.default(0),
    })
    .default({ exactitude: 0, sourcing: 0, calibration: 0, exploitabilite: 0 }),
  flags: z.array(z.string().trim().max(60)).max(10).default([]),
  analyse: z
    .object({ correct: z.string().trim().max(4000), incorrect: z.string().trim().max(4000) })
    .optional(),
});

export const schemaItem = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Identifiant requis")
    .max(40)
    .regex(/^[A-Za-z0-9._-]+$/, "Lettres, chiffres, point, tiret ou souligné uniquement"),
  domaine: z.string().trim().min(1, "Réglementation requise").max(40),
  type: z.string().trim().min(1, "Type requis").max(40),
  difficulte: z.coerce.number().int().min(1).max(3),
  question: z.string().trim().min(10, "Question trop courte").max(4000),
  reponse_reference: z.string().trim().min(10, "Réponse de référence trop courte").max(8000),
  source: z.object({
    texte: z.string().trim().max(300).default(""),
    article: z.string().trim().max(200).default(""),
    adopte: z.string().trim().max(60).default(""),
    url: z.union([z.string().trim().url("URL invalide"), z.literal("")]).default(""),
    juridiction: z.enum(["EU", "FR"]).default("EU"),
    langue_source: z.enum(["en", "fr"]).default("fr"),
    precision: z.enum(["article", "texte"]).default("article"),
  }),
  verification: z.object({
    statut: z.enum(["source_verifiee", "en_revue"]).default("en_revue"),
    note: z.string().trim().max(2000).default(""),
  }),
  reponses_modeles: z.record(schemaReponse).default({}),
});

export type ItemImporte = z.infer<typeof schemaItem>;

export const schemaImport = z.array(schemaItem).min(1, "Aucun item à importer").max(500);

/** Somme des quatre axes ramenée sur 10, jamais saisie à la main. */
export function scoreDepuisAxes(axes: Record<string, number>): number {
  const somme = AXES.reduce((t, a) => t + (axes[a] ?? 0), 0);
  return Math.round((somme / 8) * 100) / 10;
}

type LigneItem = {
  id: string;
  item_id: string;
  domaine: string;
  type: string;
  difficulte: number;
  question: string;
  reponse_reference: string;
  source_texte: string;
  source_article: string;
  source_adopte: string;
  source_url: string;
  source_juridiction: string;
  source_langue: string;
  source_precision: string;
  verification_statut: string;
  verification_note: string;
  created_by: string;
};

type LigneReponse = {
  item: string;
  modele_id: string;
  texte: string;
  axe_exactitude: number;
  axe_sourcing: number;
  axe_calibration: number;
  axe_exploitabilite: number;
  score: number;
  flags: string[];
  analyse_correct: string;
  analyse_incorrect: string;
};

function versQuestion(ligne: LigneItem, reponses: LigneReponse[]): Question {
  const reponses_modeles: Record<string, ReponseModele> = {};
  for (const r of reponses) {
    const axes = {
      exactitude: r.axe_exactitude,
      sourcing: r.axe_sourcing,
      calibration: r.axe_calibration,
      exploitabilite: r.axe_exploitabilite,
    };
    reponses_modeles[r.modele_id] = {
      texte: r.texte,
      axes,
      score: scoreDepuisAxes(axes),
      flags: r.flags ?? [],
      ...(r.analyse_correct || r.analyse_incorrect
        ? { analyse: { correct: r.analyse_correct, incorrect: r.analyse_incorrect } }
        : {}),
    };
  }
  return {
    id: ligne.item_id,
    domaine: ligne.domaine,
    type: ligne.type,
    difficulte: ligne.difficulte,
    question: ligne.question,
    reponse_reference: ligne.reponse_reference,
    source: {
      texte: ligne.source_texte,
      article: ligne.source_article,
      adopte: ligne.source_adopte,
      url: ligne.source_url,
      juridiction: ligne.source_juridiction === "FR" ? "FR" : "EU",
      langue_source: ligne.source_langue === "en" ? "en" : "fr",
      precision: ligne.source_precision === "texte" ? "texte" : "article",
    },
    verification: {
      statut: ligne.verification_statut === "source_verifiee" ? "source_verifiee" : "en_revue",
      note: ligne.verification_note,
    },
    reponses_modeles,
  };
}

/**
 * Corpus publié en base, ordonné par identifiant d'item. Tableau vide quand
 * rien n'a été importé : le site retombe alors sur le corpus statique.
 */
export async function lireCorpusPublie(): Promise<Question[]> {
  const { data: items, error } = await supabase
    .from("corpus_items")
    .select("*")
    .order("item_id", { ascending: true });
  if (error || !items || items.length === 0) return [];

  const { data: reponses } = await supabase
    .from("corpus_answers")
    .select("*")
    .in(
      "item",
      items.map((i) => i.id),
    );

  const parItem = new Map<string, LigneReponse[]>();
  for (const r of (reponses ?? []) as LigneReponse[]) {
    const liste = parItem.get(r.item) ?? [];
    liste.push(r);
    parItem.set(r.item, liste);
  }
  return (items as LigneItem[]).map((i) => versQuestion(i, parItem.get(i.id) ?? []));
}

/** Items importés par le compte connecté, pour la page d'import. */
export function useMesItems(userId: string | null) {
  return useQuery({
    queryKey: ["corpus-mes-items", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("corpus_items")
        .select("id, item_id, domaine, type, difficulte, question, verification_statut")
        .order("item_id", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/**
 * Écrit les items validés. `remplacer` supprime d'abord le corpus importé par
 * ce compte : c'est ce qui permet de substituer les 24 items publiés d'origine.
 */
export async function importerItems(
  items: ItemImporte[],
  userId: string,
  remplacer: boolean,
): Promise<{ items: number; reponses: number }> {
  if (remplacer) {
    const { error } = await supabase.from("corpus_items").delete().eq("created_by", userId);
    if (error) throw error;
  }

  const lignes = items.map((i) => ({
    item_id: i.id,
    domaine: i.domaine,
    type: i.type,
    difficulte: i.difficulte,
    question: i.question,
    reponse_reference: i.reponse_reference,
    source_texte: i.source.texte,
    source_article: i.source.article,
    source_adopte: i.source.adopte,
    source_url: i.source.url,
    source_juridiction: i.source.juridiction,
    source_langue: i.source.langue_source,
    source_precision: i.source.precision,
    verification_statut: i.verification.statut,
    verification_note: i.verification.note,
    created_by: userId,
  }));

  const { data: inseres, error } = await supabase
    .from("corpus_items")
    .upsert(lignes, { onConflict: "item_id" })
    .select("id, item_id");
  if (error) throw error;

  const cle = new Map((inseres ?? []).map((r) => [r.item_id, r.id]));
  const reponses = items.flatMap((i) =>
    Object.entries(i.reponses_modeles).map(([modele_id, r]) => ({
      item: cle.get(i.id)!,
      modele_id,
      texte: r.texte,
      axe_exactitude: r.axes.exactitude,
      axe_sourcing: r.axes.sourcing,
      axe_calibration: r.axes.calibration,
      axe_exploitabilite: r.axes.exploitabilite,
      score: scoreDepuisAxes(r.axes),
      flags: r.flags,
      analyse_correct: r.analyse?.correct ?? "",
      analyse_incorrect: r.analyse?.incorrect ?? "",
      created_by: userId,
    })),
  );

  if (reponses.length > 0) {
    const { error: e2 } = await supabase
      .from("corpus_answers")
      .upsert(reponses, { onConflict: "item,modele_id" });
    if (e2) throw e2;
  }

  return { items: lignes.length, reponses: reponses.length };
}

export async function supprimerItem(id: string) {
  const { error } = await supabase.from("corpus_items").delete().eq("id", id);
  if (error) throw error;
}

export async function viderMonCorpus(userId: string) {
  const { error } = await supabase.from("corpus_items").delete().eq("created_by", userId);
  if (error) throw error;
}

/** Découpe une ligne CSV en respectant les guillemets doubles. */
function champsCsv(ligne: string, sep: string): string[] {
  const champs: string[] = [];
  let courant = "";
  let entreGuillemets = false;
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i];
    if (c === '"') {
      if (entreGuillemets && ligne[i + 1] === '"') {
        courant += '"';
        i++;
      } else entreGuillemets = !entreGuillemets;
    } else if (c === sep && !entreGuillemets) {
      champs.push(courant);
      courant = "";
    } else courant += c;
  }
  champs.push(courant);
  return champs.map((c) => c.trim());
}

const COLONNES_CSV = [
  "id",
  "domaine",
  "type",
  "difficulte",
  "question",
  "reponse_reference",
  "source_texte",
  "source_article",
  "source_adopte",
  "source_url",
  "source_juridiction",
  "source_langue",
  "source_precision",
  "verification_statut",
  "verification_note",
] as const;

export const MODELE_CSV = COLONNES_CSV.join(",");

/**
 * CSV → items bruts. Le CSV ne porte que les questions et leurs sources ; les
 * réponses des systèmes passent par le JSON ou le formulaire unitaire.
 */
export function csvVersItems(csv: string): unknown[] {
  const lignes = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lignes.length < 2) throw new Error("CSV vide : une ligne d'en-tête puis une ligne par item.");
  const sep = (lignes[0]!.match(/;/g)?.length ?? 0) > (lignes[0]!.match(/,/g)?.length ?? 0) ? ";" : ",";
  const entete = champsCsv(lignes[0]!, sep).map((c) => c.toLowerCase());
  return lignes.slice(1).map((ligne, index) => {
    const valeurs = champsCsv(ligne, sep);
    const v = (nom: string) => {
      const i = entete.indexOf(nom);
      return i === -1 ? "" : (valeurs[i] ?? "");
    };
    if (!v("id")) throw new Error(`Ligne ${index + 2} : colonne « id » manquante ou vide.`);
    return {
      id: v("id"),
      domaine: v("domaine"),
      type: v("type"),
      difficulte: v("difficulte") || 1,
      question: v("question"),
      reponse_reference: v("reponse_reference"),
      source: {
        texte: v("source_texte"),
        article: v("source_article"),
        adopte: v("source_adopte"),
        url: v("source_url"),
        juridiction: v("source_juridiction") === "FR" ? "FR" : "EU",
        langue_source: v("source_langue") === "en" ? "en" : "fr",
        precision: v("source_precision") === "texte" ? "texte" : "article",
      },
      verification: {
        statut: v("verification_statut") === "source_verifiee" ? "source_verifiee" : "en_revue",
        note: v("verification_note"),
      },
      reponses_modeles: {},
    };
  });
}

/** Messages d'erreur lisibles, item par item, plutôt qu'un dump Zod. */
export function erreursLisibles(erreur: z.ZodError): string[] {
  return erreur.issues.slice(0, 40).map((i) => {
    const chemin = i.path.join(" › ");
    return chemin ? `${chemin} : ${i.message}` : i.message;
  });
}
