import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Chargement, Page, Panneau, Section, Titre } from "@/components/finreg/Chrome";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import {
  csvVersItems,
  erreursLisibles,
  importerItems,
  MODELE_CSV,
  schemaImport,
  useMesItems,
  viderMonCorpus,
  type ItemImporte,
} from "@/lib/corpus";
import {
  libelles,
  ORDRE_DOMAINES,
  ORDRE_TYPES,
  useResultats,
  AXES,
  LIBELLES_FLAGS,
} from "@/lib/finreg";
import { useLangue } from "@/lib/langue";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import corpus — FinReg" },
      {
        name: "description",
        content:
          "Import your own financial-regulation questions, reference answers, official sources and model answers, and replace the published FinReg corpus.",
      },
      { property: "og:title", content: "Import corpus — FinReg" },
      {
        property: "og:description",
        content:
          "Bulk JSON or CSV import plus item-by-item entry, with validation on every field before anything is published.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Import,
});

const CHAMP =
  "border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-accent";

function Import() {
  const { t } = useLangue();
  const { session, userId, pret } = useSession();

  if (!pret) {
    return (
      <Page>
        <Chargement />
      </Page>
    );
  }

  if (!session || !userId) {
    return (
      <Page>
        <Titre
          etiquette={t("Corpus maintenance", "Maintenance du corpus")}
          titre={t("Import your own corpus", "Importez votre propre corpus")}
          chapeau={t(
            "Sign in to replace the published items with your own questions, reference answers and official sources.",
            "Connectez-vous pour remplacer les items publiés par vos propres questions, réponses de référence et sources officielles.",
          )}
        />
        <Link
          to="/auth"
          className="mt-8 inline-block border border-foreground bg-foreground px-4 py-2 font-mono text-[11px] tracking-[0.08em] text-background uppercase"
        >
          {t("Sign in", "Se connecter")}
        </Link>
      </Page>
    );
  }

  return <Console userId={userId} email={session.user.email ?? ""} />;
}

function Console({ userId, email }: { userId: string; email: string }) {
  const { langue, t } = useLangue();
  const L = libelles(langue);
  const client = useQueryClient();
  const { data: mes, isPending } = useMesItems(userId);
  const { data: resultats } = useResultats();
  const modeles = resultats?.modeles ?? [];

  const rafraichir = () => {
    client.invalidateQueries({ queryKey: ["corpus-mes-items"] });
    client.invalidateQueries({ queryKey: ["questions"] });
  };

  const publier = async (items: ItemImporte[], remplacer: boolean) => {
    const bilan = await importerItems(items, userId, remplacer);
    rafraichir();
    toast.success(
      t(
        `${bilan.items} item(s) published, ${bilan.reponses} model answer(s).`,
        `${bilan.items} item(s) publié(s), ${bilan.reponses} réponse(s) de systèmes.`,
      ),
    );
  };

  return (
    <Page>
      <Titre
        etiquette={t("Corpus maintenance", "Maintenance du corpus")}
        titre={t("Import your own corpus", "Importez votre propre corpus")}
        chapeau={t(
          "As soon as one item is published here, the whole site reads your corpus instead of the items shipped with the benchmark. Every field is validated before anything is written, and each item keeps its citation and verification status.",
          "Dès qu'un item est publié ici, tout le site lit votre corpus au lieu des items livrés avec le benchmark. Chaque champ est validé avant écriture, et chaque item conserve sa citation et son statut de vérification.",
        )}
      />

      <p className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
        <span>{email}</span>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="underline decoration-rule underline-offset-4 hover:text-accent"
        >
          {t("Sign out", "Se déconnecter")}
        </button>
      </p>

      <ImportEnMasse onPublier={publier} />
      <FormulaireUnitaire onPublier={publier} modeles={modeles.map((m) => ({ id: m.id, nom: m.nom }))} />

      <Section
        numero="03"
        titre={t("Published corpus", "Corpus publié")}
        chapeau={t(
          "The items currently served to every visitor. Deleting the last one brings the original corpus back.",
          "Les items servis actuellement à chaque visiteur. Supprimer le dernier fait revenir le corpus d'origine.",
        )}
      >
        {isPending && (
          <div className="mt-4">
            <Chargement />
          </div>
        )}
        {mes && mes.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t(
              "Nothing imported yet — the site still shows the published corpus.",
              "Rien d'importé pour l'instant — le site affiche encore le corpus publié.",
            )}
          </p>
        )}
        {mes && mes.length > 0 && (
          <>
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="entete-col">{t("Item", "Item")}</th>
                  <th className="entete-col">{t("Regulation", "Réglementation")}</th>
                  <th className="entete-col">{t("Type", "Type")}</th>
                  <th className="entete-col text-right">{t("Level", "Niveau")}</th>
                  <th className="entete-col" />
                </tr>
              </thead>
              <tbody className="zebre">
                {mes.map((i) => (
                  <tr key={i.id} className="border-b border-border">
                    <td className="px-2 py-2 font-mono text-[11px] tabulaire">{i.item_id}</td>
                    <td className="px-2 py-2">{L.domainesCourts[i.domaine] ?? i.domaine}</td>
                    <td className="px-2 py-2">{L.types[i.type] ?? i.type}</td>
                    <td className="px-2 py-2 text-right font-mono tabulaire">{i.difficulte}</td>
                    <td className="px-2 py-2 text-right">
                      <button
                        type="button"
                        onClick={async () => {
                          await supabase.from("corpus_items").delete().eq("id", i.id);
                          rafraichir();
                        }}
                        className="font-mono text-[11px] text-muted-foreground underline decoration-rule underline-offset-4 hover:text-destructive"
                      >
                        {t("Delete", "Supprimer")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={async () => {
                await viderMonCorpus(userId);
                rafraichir();
                toast.success(
                  t("Imported corpus cleared.", "Corpus importé vidé."),
                );
              }}
              className="mt-4 border border-border px-3 py-2 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors hover:border-destructive hover:text-destructive"
            >
              {t("Clear imported corpus", "Vider le corpus importé")}
            </button>
          </>
        )}
      </Section>
    </Page>
  );
}

const EXEMPLE_JSON = `[
  {
    "id": "SFDR-0001",
    "domaine": "SFDR",
    "type": "qualification",
    "difficulte": 2,
    "question": "…",
    "reponse_reference": "…",
    "source": {
      "texte": "Règlement (UE) 2019/2088",
      "article": "Article 8",
      "adopte": "2019-11-27",
      "url": "https://eur-lex.europa.eu/…",
      "juridiction": "EU",
      "langue_source": "fr",
      "precision": "article"
    },
    "verification": { "statut": "source_verifiee", "note": "…" },
    "reponses_modeles": {
      "gpt-5-4": {
        "texte": "…",
        "axes": { "exactitude": 2, "sourcing": 1, "calibration": 1, "exploitabilite": 2 },
        "flags": ["sourcing_incomplet"]
      }
    }
  }
]`;

function ImportEnMasse({
  onPublier,
}: {
  onPublier: (items: ItemImporte[], remplacer: boolean) => Promise<void>;
}) {
  const { t } = useLangue();
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [texte, setTexte] = useState("");
  const [remplacer, setRemplacer] = useState(true);
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [enCours, setEnCours] = useState(false);

  const lireFichier = async (fichier: File) => {
    const contenu = await fichier.text();
    setTexte(contenu);
    setFormat(fichier.name.toLowerCase().endsWith(".csv") ? "csv" : "json");
  };

  const valider = (): ItemImporte[] | null => {
    setErreurs([]);
    let brut: unknown;
    try {
      brut = format === "csv" ? csvVersItems(texte) : JSON.parse(texte);
    } catch (erreur) {
      setErreurs([erreur instanceof Error ? erreur.message : String(erreur)]);
      return null;
    }
    const resultat = schemaImport.safeParse(Array.isArray(brut) ? brut : [brut]);
    if (!resultat.success) {
      setErreurs(erreursLisibles(resultat.error));
      return null;
    }
    const ids = resultat.data.map((i) => i.id);
    const doublons = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (doublons.length > 0) {
      setErreurs([
        t(
          `Duplicate item ids: ${[...new Set(doublons)].join(", ")}`,
          `Identifiants en doublon : ${[...new Set(doublons)].join(", ")}`,
        ),
      ]);
      return null;
    }
    return resultat.data;
  };

  const soumettre = async () => {
    const items = valider();
    if (!items) return;
    setEnCours(true);
    try {
      await onPublier(items, remplacer);
      setTexte("");
    } catch (erreur) {
      toast.error(erreur instanceof Error ? erreur.message : String(erreur));
    } finally {
      setEnCours(false);
    }
  };

  return (
    <Section
      numero="01"
      titre={t("Bulk import", "Import en masse")}
      chapeau={t(
        "Paste or upload the whole corpus at once. JSON carries model answers as well; CSV carries the questions and their sources.",
        "Collez ou déposez tout le corpus d'un coup. Le JSON porte aussi les réponses des systèmes ; le CSV porte les questions et leurs sources.",
      )}
    >
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(["json", "csv"] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={format === f}
            onClick={() => setFormat(f)}
            className={`border px-2.5 py-1 font-mono text-[11px] tracking-[0.06em] uppercase transition-colors ${
              format === f
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <label className="border border-border px-2.5 py-1 font-mono text-[11px] tracking-[0.06em] uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
          {t("Upload a file", "Déposer un fichier")}
          <input
            type="file"
            accept=".json,.csv,text/csv,application/json"
            className="hidden"
            onChange={(e) => {
              const fichier = e.target.files?.[0];
              if (fichier) void lireFichier(fichier);
            }}
          />
        </label>
      </div>

      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        spellCheck={false}
        rows={14}
        placeholder={format === "json" ? EXEMPLE_JSON : `${MODELE_CSV}\nSFDR-0001,SFDR,qualification,2,…,…`}
        className="mt-4 w-full border border-border bg-surface-sunken px-3 py-3 font-mono text-[12px] leading-relaxed outline-none focus-visible:border-accent"
      />

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={remplacer}
          onChange={(e) => setRemplacer(e.target.checked)}
          className="size-4 accent-accent"
        />
        {t(
          "Replace the corpus I already imported",
          "Remplacer le corpus que j'ai déjà importé",
        )}
      </label>

      {erreurs.length > 0 && (
        <ul className="mt-4 border-l-2 border-destructive pl-3 font-mono text-[12px] text-destructive">
          {erreurs.map((e, i) => (
            <li key={i} className="py-0.5">
              {e}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={enCours || texte.trim().length === 0}
        onClick={soumettre}
        className="mt-4 border border-foreground bg-foreground px-4 py-2 font-mono text-[11px] tracking-[0.08em] text-background uppercase disabled:opacity-50"
      >
        {t("Validate and publish", "Valider et publier")}
      </button>
    </Section>
  );
}

type Brouillon = {
  id: string;
  domaine: string;
  type: string;
  difficulte: string;
  question: string;
  reponse_reference: string;
  source_texte: string;
  source_article: string;
  source_adopte: string;
  source_url: string;
  source_juridiction: "EU" | "FR";
  source_langue: "en" | "fr";
  source_precision: "article" | "texte";
  verification_statut: "source_verifiee" | "en_revue";
  verification_note: string;
};

const VIDE: Brouillon = {
  id: "",
  domaine: "SFDR",
  type: "qualification",
  difficulte: "2",
  question: "",
  reponse_reference: "",
  source_texte: "",
  source_article: "",
  source_adopte: "",
  source_url: "",
  source_juridiction: "EU",
  source_langue: "fr",
  source_precision: "article",
  verification_statut: "en_revue",
  verification_note: "",
};

type BrouillonReponse = {
  modele: string;
  texte: string;
  axes: Record<string, string>;
  flags: string[];
};

function FormulaireUnitaire({
  onPublier,
  modeles,
}: {
  onPublier: (items: ItemImporte[], remplacer: boolean) => Promise<void>;
  modeles: { id: string; nom: string }[];
}) {
  const { langue, t } = useLangue();
  const L = libelles(langue);
  const [b, setB] = useState<Brouillon>(VIDE);
  const [reponses, setReponses] = useState<BrouillonReponse[]>([]);
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [enCours, setEnCours] = useState(false);

  const set = (cle: keyof Brouillon, valeur: string) =>
    setB((precedent) => ({ ...precedent, [cle]: valeur }) as Brouillon);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurs([]);
    const reponses_modeles: Record<string, unknown> = {};
    for (const r of reponses) {
      if (!r.modele.trim()) continue;
      reponses_modeles[r.modele.trim()] = {
        texte: r.texte,
        axes: Object.fromEntries(AXES.map((a) => [a, r.axes[a] ?? "0"])),
        flags: r.flags,
      };
    }
    const resultat = schemaImport.safeParse([
      {
        id: b.id,
        domaine: b.domaine,
        type: b.type,
        difficulte: b.difficulte,
        question: b.question,
        reponse_reference: b.reponse_reference,
        source: {
          texte: b.source_texte,
          article: b.source_article,
          adopte: b.source_adopte,
          url: b.source_url,
          juridiction: b.source_juridiction,
          langue_source: b.source_langue,
          precision: b.source_precision,
        },
        verification: { statut: b.verification_statut, note: b.verification_note },
        reponses_modeles,
      },
    ]);
    if (!resultat.success) {
      setErreurs(erreursLisibles(resultat.error as z.ZodError));
      return;
    }
    setEnCours(true);
    try {
      await onPublier(resultat.data, false);
      setB(VIDE);
      setReponses([]);
    } catch (erreur) {
      toast.error(erreur instanceof Error ? erreur.message : String(erreur));
    } finally {
      setEnCours(false);
    }
  };

  return (
    <Section
      numero="02"
      titre={t("Add one item", "Ajouter un item")}
      chapeau={t(
        "Field by field, for a single question. Model answers are optional: leave them out and the item is published as a question with its source.",
        "Champ par champ, pour une seule question. Les réponses des systèmes sont facultatives : sans elles, l'item est publié comme question avec sa source.",
      )}
    >
      <Panneau className="mt-4 p-5">
        <form onSubmit={soumettre} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <label className="grid gap-1.5">
              <span className="etiquette">{t("Item id", "Identifiant")}</span>
              <input
                value={b.id}
                onChange={(e) => set("id", e.target.value)}
                placeholder="SFDR-0025"
                className={`${CHAMP} font-mono`}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="etiquette">{t("Regulation", "Réglementation")}</span>
              <input
                value={b.domaine}
                onChange={(e) => set("domaine", e.target.value)}
                list="domaines"
                className={CHAMP}
              />
              <datalist id="domaines">
                {ORDRE_DOMAINES.map((d) => (
                  <option key={d} value={d}>
                    {L.domainesCourts[d] ?? d}
                  </option>
                ))}
              </datalist>
            </label>
            <label className="grid gap-1.5">
              <span className="etiquette">{t("Type", "Type")}</span>
              <select value={b.type} onChange={(e) => set("type", e.target.value)} className={CHAMP}>
                {ORDRE_TYPES.map((x) => (
                  <option key={x} value={x}>
                    {L.types[x] ?? x}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="etiquette">{t("Difficulty", "Difficulté")}</span>
              <select
                value={b.difficulte}
                onChange={(e) => set("difficulte", e.target.value)}
                className={CHAMP}
              >
                {[1, 2, 3].map((d) => (
                  <option key={d} value={d}>
                    {d} — {L.difficulte[d]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-1.5">
            <span className="etiquette">{t("Question", "Question")}</span>
            <textarea
              rows={3}
              value={b.question}
              onChange={(e) => set("question", e.target.value)}
              className={CHAMP}
            />
          </label>

          <label className="grid gap-1.5">
            <span className="etiquette">{t("What the law says", "Ce que dit le texte")}</span>
            <textarea
              rows={4}
              value={b.reponse_reference}
              onChange={(e) => set("reponse_reference", e.target.value)}
              className={CHAMP}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="etiquette">{t("Act", "Texte")}</span>
              <input
                value={b.source_texte}
                onChange={(e) => set("source_texte", e.target.value)}
                placeholder="Règlement (UE) 2019/2088"
                className={CHAMP}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="etiquette">{t("Article", "Article")}</span>
              <input
                value={b.source_article}
                onChange={(e) => set("source_article", e.target.value)}
                placeholder="Article 8, paragraphe 1"
                className={CHAMP}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="etiquette">{t("Adopted", "Adopté le")}</span>
              <input
                value={b.source_adopte}
                onChange={(e) => set("source_adopte", e.target.value)}
                placeholder="2019-11-27"
                className={`${CHAMP} font-mono`}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="etiquette">{t("Official URL", "URL officielle")}</span>
              <input
                value={b.source_url}
                onChange={(e) => set("source_url", e.target.value)}
                placeholder="https://eur-lex.europa.eu/…"
                className={`${CHAMP} font-mono`}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="etiquette">{t("Jurisdiction", "Juridiction")}</span>
              <select
                value={b.source_juridiction}
                onChange={(e) => set("source_juridiction", e.target.value)}
                className={CHAMP}
              >
                <option value="EU">EU</option>
                <option value="FR">FR</option>
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="etiquette">{t("Source language", "Langue de la source")}</span>
              <select
                value={b.source_langue}
                onChange={(e) => set("source_langue", e.target.value)}
                className={CHAMP}
              >
                <option value="fr">FR</option>
                <option value="en">EN</option>
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="etiquette">{t("Link precision", "Précision du lien")}</span>
              <select
                value={b.source_precision}
                onChange={(e) => set("source_precision", e.target.value)}
                className={CHAMP}
              >
                <option value="article">{t("Article", "Article")}</option>
                <option value="texte">{t("Whole act", "Texte entier")}</option>
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="etiquette">{t("Verification", "Vérification")}</span>
              <select
                value={b.verification_statut}
                onChange={(e) => set("verification_statut", e.target.value)}
                className={CHAMP}
              >
                {Object.entries(L.verification).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-1.5">
            <span className="etiquette">{t("Verification note", "Note de vérification")}</span>
            <textarea
              rows={2}
              value={b.verification_note}
              onChange={(e) => set("verification_note", e.target.value)}
              className={CHAMP}
            />
          </label>

          <div className="border-t border-rule pt-4">
            <p className="etiquette">{t("Model answers (optional)", "Réponses des systèmes (facultatif)")}</p>
            {reponses.map((r, index) => (
              <div key={index} className="mt-4 border border-border p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="etiquette">{t("System", "Système")}</span>
                    <input
                      value={r.modele}
                      onChange={(e) =>
                        setReponses((p) =>
                          p.map((x, i) => (i === index ? { ...x, modele: e.target.value } : x)),
                        )
                      }
                      list="modeles"
                      placeholder="gpt-5-4"
                      className={`${CHAMP} font-mono`}
                    />
                    <datalist id="modeles">
                      {modeles.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nom}
                        </option>
                      ))}
                    </datalist>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {AXES.map((a) => (
                      <label key={a} className="grid gap-1.5">
                        <span
                          className="etiquette truncate"
                          title={L.axes[a]}
                        >
                          {L.axes[a]}
                        </span>
                        <select
                          value={r.axes[a] ?? "0"}
                          onChange={(e) =>
                            setReponses((p) =>
                              p.map((x, i) =>
                                i === index ? { ...x, axes: { ...x.axes, [a]: e.target.value } } : x,
                              ),
                            )
                          }
                          className={`${CHAMP} font-mono`}
                        >
                          {[0, 1, 2].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </div>
                <label className="mt-4 grid gap-1.5">
                  <span className="etiquette">{t("Answer given", "Réponse donnée")}</span>
                  <textarea
                    rows={3}
                    value={r.texte}
                    onChange={(e) =>
                      setReponses((p) =>
                        p.map((x, i) => (i === index ? { ...x, texte: e.target.value } : x)),
                      )
                    }
                    className={CHAMP}
                  />
                </label>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Object.keys(LIBELLES_FLAGS).map((f) => {
                    const actif = r.flags.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        aria-pressed={actif}
                        onClick={() =>
                          setReponses((p) =>
                            p.map((x, i) =>
                              i === index
                                ? {
                                    ...x,
                                    flags: actif
                                      ? x.flags.filter((v) => v !== f)
                                      : [...x.flags, f],
                                  }
                                : x,
                            ),
                          )
                        }
                        className={`border px-2 py-1 font-mono text-[11px] uppercase transition-colors ${
                          actif
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                      >
                        {L.flags[f] ?? f}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setReponses((p) => p.filter((_, i) => i !== index))}
                  className="mt-3 font-mono text-[11px] text-muted-foreground underline decoration-rule underline-offset-4 hover:text-destructive"
                >
                  {t("Remove this answer", "Retirer cette réponse")}
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setReponses((p) => [
                  ...p,
                  { modele: "", texte: "", axes: {}, flags: [] },
                ])
              }
              className="mt-4 border border-border px-3 py-2 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors hover:border-foreground"
            >
              {t("Add a model answer", "Ajouter une réponse de système")}
            </button>
          </div>

          {erreurs.length > 0 && (
            <ul className="border-l-2 border-destructive pl-3 font-mono text-[12px] text-destructive">
              {erreurs.map((e, i) => (
                <li key={i} className="py-0.5">
                  {e}
                </li>
              ))}
            </ul>
          )}

          <button
            type="submit"
            disabled={enCours}
            className="justify-self-start border border-foreground bg-foreground px-4 py-2 font-mono text-[11px] tracking-[0.08em] text-background uppercase disabled:opacity-50"
          >
            {t("Publish this item", "Publier cet item")}
          </button>
        </form>
      </Panneau>
    </Section>
  );
}
