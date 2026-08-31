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
  libelles,
  nb,
  texteAffiche,
  useQuestions,
  useResultats,
  type Defaillance,
} from "@/lib/finreg";

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
  const L = libelles("en");
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
          {d.categorie}
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
            <p className="etiquette">What the AI answered</p>
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
            <p className="etiquette">What the law says</p>
            <p className="mt-2 text-[13px] leading-relaxed">{d.question.reponse_reference}</p>
            <ul className="mt-4 space-y-1.5 border-t border-rule pt-3">
              <LigneVerification ok>Act — {d.question.source.texte}</LigneVerification>
              <LigneVerification ok={!inventee}>
                {inventee
                  ? "Article cited by the model could not be located"
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
                Full case →
              </Link>
              <a
                href={d.question.source.url}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                Primary source ↗
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
  const L = libelles("en");

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
        titre="Every failure below happened. None of them was written for this page."
        chapeau="Each entry pairs a real corpus item with an answer a system actually produced, the primary text it should have relied on, and why the answer fails. Search, filter, and open the full case."
      />

      {isPending && (
        <div className="mt-10">
          <Chargement />
        </div>
      )}

      <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-3">
        <Tuile
          etiquette="Documented failures"
          valeur={String(catalogue.length)}
          note="answers carrying a disqualifying defect or a failing score."
        />
        <Tuile
          etiquette="Critical severity"
          valeur={String(critiques)}
          ton="danger"
          note="an answer a compliance team could have acted on, and should not have."
        />
        <Tuile
          etiquette="Fabricated sources"
          valeur={String(inventees)}
          note="the cited article could not be located in the act."
        />
      </div>

      <Section
        numero="01"
        titre="Filter the database"
        chapeau="Filters combine. Search matches the question, the cited act and the answer text."
      >
        <div className="mt-5 space-y-4 border border-border bg-surface p-5">
          <div>
            <p className="etiquette">Regulation</p>
            <div className="mt-2">
              <ChoixPuces
                options={optionsDomaines}
                valeurs={domaines}
                basculer={bascule(setDomaines)}
                nom="Regulation"
              />
            </div>
          </div>
          <div>
            <p className="etiquette">Failure type</p>
            <div className="mt-2">
              <ChoixPuces
                options={[...CATEGORIES_ECHEC]}
                valeurs={categories}
                basculer={bascule(setCategories)}
                nom="Failure type"
              />
            </div>
          </div>
          <div>
            <p className="etiquette">Severity</p>
            <div className="mt-2">
              <ChoixPuces
                options={["critical", "high", "medium"]}
                valeurs={severites}
                basculer={bascule(setSeverites)}
                nom="Severity"
              />
            </div>
          </div>
          <div>
            <label className="etiquette" htmlFor="recherche-defaillances">
              Search
            </label>
            <input
              id="recherche-defaillances"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="article, act, obligation, system…"
              className="mt-2 w-full border border-border bg-surface px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <p className="border-t border-rule pt-3 font-mono text-[11px] tabulaire text-muted-foreground">
            {filtrees.length} of {catalogue.length} entries shown
          </p>
        </div>
      </Section>

      <Section numero="02" titre="Failures">
        <div className="mt-5 border border-border bg-surface">
          {isPending && (
            <div className="p-5">
              <Squelette lignes={6} />
            </div>
          )}
          {!isPending && filtrees.length === 0 && (
            <div className="p-5">
              <EtatVide
                titre="No entry matches these filters"
                detail="Clear a filter or broaden the search to see documented failures again."
              />
            </div>
          )}
          {filtrees.slice(0, 60).map((d) => (
            <Entree key={`${d.question.id}-${d.idModele}`} d={d} />
          ))}
        </div>
        {filtrees.length > 60 && (
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            Showing the 60 most severe of {filtrees.length} matching entries.
          </p>
        )}
      </Section>

      <section className="mt-16 flex flex-wrap items-center justify-between gap-4 border border-border bg-surface-sunken p-6">
        <div className="max-w-xl">
          <Pastille>Your system</Pastille>
          <p className="mt-3 text-[16px] leading-snug font-medium">
            Would your AI produce any of these answers?
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            The same evaluation can be run against your assistant, on the public corpus or on your
            own regulatory perimeter.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <BoutonLien to="/test">Test your AI →</BoutonLien>
          <BoutonLien to="/methodology" variante="secondaire">
            How scoring works
          </BoutonLien>
        </div>
      </section>
    </Page>
  );
}
