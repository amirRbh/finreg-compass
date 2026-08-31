import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Chargement, Page, Section, Titre } from "@/components/finreg/Chrome";
import {
  BoutonLien,
  ChoixPuces,
  EtatVide,
  LigneVerification,
  Pastille,
  PastilleSeverite,
  Squelette,
  Tuile,
} from "@/components/finreg/Ui";
import {
  CATEGORIES_ECHEC,
  catalogueDefaillances,
  libelleCategorie,
  libelles,
  nb,
  texteAffiche,
  useQuestions,
  useResultats,
  type Defaillance,
} from "@/lib/finreg";
import { useLangue } from "@/lib/langue";

const TITRE = "Regulatory AI Failure Database — documented AI failures on financial regulation";
const DESCRIPTION =
  "A searchable database of documented AI failures on EU and French financial regulation: fabricated citations, unsupported legal conclusions and overconfident answers, each tied to a primary source.";

export const Route = createFileRoute("/failures")({
  head: () => ({
    meta: [
      { title: TITRE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Regulatory AI Failure Database" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: BaseDefaillances,
});

function Entree({ d }: { d: Defaillance }) {
  const [ouvert, setOuvert] = useState(false);
  const { langue, t } = useLangue();
  const L = libelles(langue);
  const inventee = d.reponse.flags.includes("hallucination_source");

  return (
    <article className="border-b border-rule last:border-b-0">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        className="grid w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-sunken lg:grid-cols-[5rem_minmax(0,1fr)_10rem_9rem_2rem] lg:items-center"
      >
        <span className="chiffre text-[12px] text-muted-foreground">{d.reference}</span>
        <span>
          <span className="block text-[14px] leading-snug font-medium">{d.question.question}</span>
          <span className="mt-1 block font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
            {L.domainesCourts[d.domaine] ?? d.domaine} · {d.nomModele} · score {nb(d.reponse.score)}
            /10
          </span>
        </span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-foreground uppercase">
          {libelleCategorie(d.categorie, langue)}
        </span>
        <span>
          <PastilleSeverite severite={d.severite} />
        </span>
        <span aria-hidden="true" className="font-mono text-[12px] text-muted-foreground lg:text-right">
          {ouvert ? "−" : "+"}
        </span>
      </button>

      {ouvert && (
        <div className="grid gap-px bg-border md:grid-cols-2">
          <div className="bg-surface px-5 py-4">
            <p className="etiquette">{t("What the AI answered", "Ce que l'IA a répondu")}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {texteAffiche(d.reponse.texte)}
            </p>
            {d.reponse.flags.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-1.5">
                {d.reponse.flags.map((f) => (
                  <Pastille key={f} ton="danger">
                    {L.flags[f] ?? f}
                  </Pastille>
                ))}
              </p>
            )}
          </div>
          <div className="bg-surface px-5 py-4">
            <p className="etiquette">{t("What the law says", "Ce que dit le texte")}</p>
            <p className="mt-2 text-[13px] leading-relaxed">{d.question.reponse_reference}</p>
            <ul className="mt-4 space-y-1.5 border-t border-rule pt-3">
              <LigneVerification ok>
                {t("Act", "Texte")} — {d.question.source.texte}
              </LigneVerification>
              <LigneVerification ok={!inventee}>
                {inventee
                  ? t(
                      "Article cited by the model could not be located",
                      "L'article cité par le modèle est introuvable",
                    )
                  : `Article — ${d.question.source.article}`}
              </LigneVerification>
            </ul>
            {d.reponse.analyse && (
              <p className="mt-4 border-l-2 border-danger/40 pl-3 text-[13px] leading-relaxed text-muted-foreground">
                {d.reponse.analyse.incorrect}
              </p>
            )}
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.1em] uppercase">
              <Link
                to="/question/$id"
                params={{ id: d.question.id }}
                className="text-accent hover:underline"
              >
                {t("Full case →", "Cas complet →")}
              </Link>
              <a
                href={d.question.source.url}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                {t("Primary source ↗", "Source officielle ↗")}
              </a>
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

function BaseDefaillances() {
  const { data: resultats, isPending } = useResultats();
  const { data: questions } = useQuestions();
  const { langue, t } = useLangue();
  const L = libelles(langue);

  const [domaines, setDomaines] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [severites, setSeverites] = useState<string[]>([]);
  const [recherche, setRecherche] = useState("");

  const catalogue = useMemo(
    () => (questions && resultats ? catalogueDefaillances(questions, resultats.modeles) : []),
    [questions, resultats],
  );

  const filtrees = catalogue.filter((d) => {
    if (domaines.length && !domaines.includes(L.domainesCourts[d.domaine] ?? d.domaine)) return false;
    if (categories.length && !categories.includes(d.categorie)) return false;
    if (severites.length && !severites.includes(d.severite)) return false;
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      const champ = `${d.question.question} ${d.question.source.texte} ${d.question.source.article} ${d.nomModele} ${d.reponse.texte}`;
      if (!champ.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const critiques = catalogue.filter((d) => d.severite === "critical").length;
  const inventees = catalogue.filter((d) => d.categorie === "Fabricated source").length;
  const optionsDomaines = resultats
    ? resultats.domaines.map((d) => L.domainesCourts[d] ?? d)
    : [];

  const bascule = (set: (f: (v: string[]) => string[]) => void) => (v: string) =>
    set((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  return (
    <Page large>
      <Titre
        etiquette="Regulatory AI Failure Database"
        titre={t(
          "Every failure below happened. None of them was written for this page.",
          "Chaque défaillance ci-dessous a eu lieu. Aucune n'a été écrite pour cette page.",
        )}
        chapeau={t(
          "Each entry pairs a real corpus item with an answer a system actually produced, the primary text it should have relied on, and why the answer fails. Search, filter, and open the full case.",
          "Chaque entrée associe un item réel du corpus à une réponse réellement produite par un système, le texte officiel sur lequel elle aurait dû s'appuyer, et la raison de l'échec. Cherchez, filtrez, ouvrez le cas complet.",
        )}
      />

      {isPending && (
        <div className="mt-10">
          <Chargement />
        </div>
      )}

      <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-3">
        <Tuile
          etiquette={t("Documented failures", "Défaillances documentées")}
          valeur={String(catalogue.length)}
          note={t(
            "answers carrying a disqualifying defect or a failing score.",
            "réponses portant un défaut disqualifiant ou une note insuffisante.",
          )}
        />
        <Tuile
          etiquette={t("Critical severity", "Gravité critique")}
          valeur={String(critiques)}
          ton="danger"
          note={t(
            "an answer a compliance team could have acted on, and should not have.",
            "une réponse qu'une équipe conformité aurait pu suivre, et n'aurait pas dû.",
          )}
        />
        <Tuile
          etiquette={t("Fabricated sources", "Sources inventées")}
          valeur={String(inventees)}
          note={t(
            "the cited article could not be located in the act.",
            "l'article cité est introuvable dans le texte.",
          )}
        />
      </div>

      <Section
        numero="01"
        titre={t("Filter the database", "Filtrer la base")}
        chapeau={t(
          "Filters combine. Search matches the question, the cited act and the answer text.",
          "Les filtres se combinent. La recherche porte sur la question, le texte cité et la réponse.",
        )}
      >
        <div className="mt-5 space-y-4 border border-border bg-surface p-5">
          <div>
            <p className="etiquette">{t("Regulation", "Réglementation")}</p>
            <div className="mt-2">
              <ChoixPuces
                options={optionsDomaines}
                valeurs={domaines}
                basculer={bascule(setDomaines)}
                nom={t("Regulation", "Réglementation")}
              />
            </div>
          </div>
          <div>
            <p className="etiquette">{t("Failure type", "Type de défaillance")}</p>
            <div className="mt-2">
              <ChoixPuces
                options={[...CATEGORIES_ECHEC]}
                libelles={(c) => libelleCategorie(c as never, langue)}
                valeurs={categories}
                basculer={bascule(setCategories)}
                nom={t("Failure type", "Type de défaillance")}
              />
            </div>
          </div>
          <div>
            <p className="etiquette">{t("Severity", "Gravité")}</p>
            <div className="mt-2">
              <ChoixPuces
                options={["critical", "high", "medium"]}
                libelles={(v) =>
                  langue === "fr"
                    ? { critical: "critique", high: "élevée", medium: "moyenne" }[v] ?? v
                    : v
                }
                valeurs={severites}
                basculer={bascule(setSeverites)}
                nom={t("Severity", "Gravité")}
              />
            </div>
          </div>
          <div>
            <label className="etiquette" htmlFor="recherche-defaillances">
              {t("Search", "Recherche")}
            </label>
            <input
              id="recherche-defaillances"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder={t(
                "article, act, obligation, system…",
                "article, texte, obligation, système…",
              )}
              className="mt-2 w-full border border-border bg-surface px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <p className="border-t border-rule pt-3 font-mono text-[11px] tabulaire text-muted-foreground">
            {t(
              `${filtrees.length} of ${catalogue.length} entries shown`,
              `${filtrees.length} entrées affichées sur ${catalogue.length}`,
            )}
          </p>
        </div>
      </Section>

      <Section numero="02" titre={t("Failures", "Défaillances")}>
        <div className="mt-5 border border-border bg-surface">
          {isPending && (
            <div className="p-5">
              <Squelette lignes={6} />
            </div>
          )}
          {!isPending && filtrees.length === 0 && (
            <div className="p-5">
              <EtatVide
                titre={t("No entry matches these filters", "Aucune entrée pour ces filtres")}
                detail={t(
                  "Clear a filter or broaden the search to see documented failures again.",
                  "Retirez un filtre ou élargissez la recherche pour revoir les défaillances documentées.",
                )}
              />
            </div>
          )}
          {filtrees.slice(0, 60).map((d) => (
            <Entree key={`${d.question.id}-${d.idModele}`} d={d} />
          ))}
        </div>
        {filtrees.length > 60 && (
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            {t(
              `Showing the 60 most severe of ${filtrees.length} matching entries.`,
              `Affichage des 60 plus graves sur ${filtrees.length} entrées correspondantes.`,
            )}
          </p>
        )}
      </Section>

      <section className="mt-16 flex flex-wrap items-center justify-between gap-4 border border-border bg-surface-sunken p-6">
        <div className="max-w-xl">
          <Pastille>{t("Your system", "Votre système")}</Pastille>
          <p className="mt-3 text-[16px] leading-snug font-medium">
            {t(
              "Would your AI produce any of these answers?",
              "Votre IA produirait-elle l'une de ces réponses ?",
            )}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {t(
              "The same evaluation can be run against your assistant, on the public corpus or on your own regulatory perimeter.",
              "La même évaluation peut être menée sur votre assistant, sur le corpus public ou sur votre propre périmètre réglementaire.",
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <BoutonLien to="/test">{t("Test your AI →", "Tester votre IA →")}</BoutonLien>
          <BoutonLien to="/methodology" variante="secondaire">
            {t("How scoring works", "Comment la notation fonctionne")}
          </BoutonLien>
        </div>
      </section>
    </Page>
  );
}
