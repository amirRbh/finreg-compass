import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Chargement, Erreur, Page, Panneau, Section } from "@/components/finreg/Chrome";
import { GraphiqueDomaines } from "@/components/finreg/GraphiqueDomaines";
import { PastilleVerification } from "@/components/finreg/Statuts";
import {
  LIBELLES_AXES,
  LIBELLES_FLAGS,
  NOMS_COURTS_DOMAINES,
  nb,
  rangDe,
  trier,
  useQuestions,
  useResultats,
  type CleTri,
} from "@/lib/finreg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinReg — Benchmarking AI on Regulatory Accuracy" },
      {
        name: "description",
        content:
          "Can you trust an AI with regulation? FinReg tests whether AI systems answer regulatory questions accurately, with every answer traceable to a primary legal source.",
      },
      { property: "og:title", content: "FinReg — Benchmarking AI on Regulatory Accuracy" },
      {
        property: "og:description",
        content:
          "AI can write regulation. Can it get regulation right? A public benchmark on SFDR, MiFID II, market abuse, DORA and AML/CFT — every score traceable to an article.",
      },
    ],
  }),
  component: Accueil,
});

const COLONNES: { cle: CleTri; libelle: string; num: boolean }[] = [
  { cle: "rang", libelle: "#", num: true },
  { cle: "nom", libelle: "System", num: false },
  { cle: "profil", libelle: "Profile", num: false },
  { cle: "score_global", libelle: "Regulatory accuracy", num: true },
  { cle: "taux_hallucination_source", libelle: "Invented source", num: true },
  { cle: "taux_abstention", libelle: "Declined", num: true },
];

/** Item mis en avant : il porte l'erreur la plus lisible du corpus. */
const ITEM_VITRINE = "AMF-0010";
const MODELE_VITRINE = "modele-d";

const CHAINE = [
  { etape: "Question", detail: "A closed regulatory question with a determinate answer." },
  { etape: "What the law says", detail: "The expected answer, drafted from the text itself." },
  { etape: "Source", detail: "The act, the article, the date, the official link." },
  { etape: "Verification", detail: "The citation is checked — or flagged as not yet established." },
  { etape: "Model answer", detail: "What the system replied, scored on four axes." },
];

function Accueil() {
  const { data, isPending, isError } = useResultats();
  const { data: questions } = useQuestions();
  const [cle, setCle] = useState<CleTri>("rang");
  const [ascendant, setAscendant] = useState(true);

  const basculer = (nouvelle: CleTri) => {
    if (nouvelle === cle) setAscendant((v) => !v);
    else {
      setCle(nouvelle);
      setAscendant(nouvelle === "rang" || nouvelle === "nom" || nouvelle === "profil");
    }
  };

  const lignes = data ? trier(data.modeles, cle, ascendant) : [];
  const meilleur = data ? trier(data.modeles, "score_global", false)[0] : undefined;
  const pire = data ? trier(data.modeles, "score_global", true)[0] : undefined;

  // Cas vitrine : on retombe sur n'importe quelle erreur analysée si l'item
  // désigné venait à disparaître du corpus.
  const vitrine =
    questions?.find((q) => q.id === ITEM_VITRINE && q.reponses_modeles[MODELE_VITRINE]?.analyse) ??
    questions?.find((q) => Object.values(q.reponses_modeles).some((r) => r.analyse));
  const reponseVitrine = vitrine
    ? vitrine.reponses_modeles[MODELE_VITRINE]?.analyse
      ? { id: MODELE_VITRINE, r: vitrine.reponses_modeles[MODELE_VITRINE]! }
      : Object.entries(vitrine.reponses_modeles)
          .map(([id, r]) => ({ id, r }))
          .find((e) => e.r.analyse)
    : undefined;
  const nomVitrine = data?.modeles.find((m) => m.id === reponseVitrine?.id)?.nom ?? "The model";
  const verifiees =
    questions?.filter((q) => q.verification.statut === "source_verifiee").length ?? 0;

  return (
    <Page>
      {/* ── Écran 1 : cinq secondes pour comprendre ───────────────────────── */}
      <div className="max-w-3xl">
        <p className="etiquette">Public benchmark · EU &amp; French financial regulation</p>
        <h1 className="mt-3 text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          AI can write regulation.
          <br />
          <span className="text-accent">Can it get regulation right?</span>
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed">
          FinReg tests AI systems on real regulatory questions and checks every answer against the
          primary legal text.
        </p>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          An assistant that cites an article which does not exist is unusable in compliance: its
          answer cannot be checked, relied on, or filed.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Link
            to="/questions"
            className="border border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            Explore the benchmark
          </Link>
          {vitrine && (
            <Link
              to="/question/$id"
              params={{ id: vitrine.id }}
              className="border border-border px-5 py-2.5 text-sm transition-colors hover:bg-surface-sunken"
            >
              See a question
            </Link>
          )}
        </div>
      </div>

      {/* ── Le chiffre qui pose le problème ───────────────────────────────── */}
      {data && (
        <Panneau className="mt-16 grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="bg-surface-sunken/60 p-6">
            <p className="etiquette">Answers not safe to rely on</p>
            <p className="mt-5 font-mono text-7xl leading-none tracking-tighter tabulaire text-accent">
              {nb(data.synthese.taux_reponse_non_fiable)}
              <span className="align-top text-xl"> %</span>
            </p>
            <p className="mt-5 border-t border-rule pt-3 text-[13px] leading-relaxed text-muted-foreground">
              of the {data.synthese.nb_reponses} evaluated answers invent a source or state a rule
              the text does not contain.
            </p>
          </div>
          <div className="p-6">
            <p className="etiquette">Average regulatory accuracy</p>
            <p className="mt-5 font-mono text-4xl leading-none tracking-tight tabulaire">
              {nb(data.synthese.exactitude_reglementaire)}
              <span className="text-base text-muted-foreground"> /100</span>
            </p>
            <p className="mt-5 border-t border-rule pt-3 text-[13px] leading-relaxed text-muted-foreground">
              across all systems and all items. Best {nb(meilleur?.score_global)}, worst{" "}
              {nb(pire?.score_global)} — the system you pick matters more than the prompt.
            </p>
          </div>
          <div className="p-6">
            <p className="etiquette">Benchmark corpus</p>
            <p className="mt-5 font-mono text-4xl leading-none tracking-tight tabulaire">
              {verifiees}
              <span className="text-base text-muted-foreground"> / {data.nb_questions}</span>
            </p>
            <p className="mt-5 border-t border-rule pt-3 text-[13px] leading-relaxed text-muted-foreground">
              items whose citation has been checked. The rest are published as under review, never
              as verified.
            </p>
          </div>
        </Panneau>
      )}


      {isPending && (
        <div className="mt-10">
          <Chargement />
        </div>
      )}
      {isError && (
        <div className="mt-10">
          <Erreur />
        </div>
      )}

      {/* ── L'erreur, en entier ───────────────────────────────────────────── */}
      {vitrine && reponseVitrine?.r.analyse && (
        <Section
          numero="01"
          titre="The model sounds confident. The law says otherwise."
          chapeau="One item from the corpus, in full. This is what the benchmark catches."
        >
          <Panneau className="mt-4">
            <div className="border-b border-rule p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[11px] text-muted-foreground">{vitrine.id}</span>
                <PastilleVerification statut={vitrine.verification.statut} taille="petite" />
              </div>
              <p className="mt-3 max-w-2xl text-[17px] leading-snug font-medium">
                {vitrine.question}
              </p>
            </div>

            <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="p-5 sm:p-6">
                <p className="etiquette">What the law says</p>
                <p className="mt-3 text-sm leading-relaxed">{vitrine.reponse_reference}</p>
                <p className="mt-4 border-t border-rule pt-3 text-[13px] leading-relaxed text-muted-foreground">
                  {vitrine.source.texte}
                  <br />
                  {vitrine.source.article} · {vitrine.source.adopte}
                </p>
              </div>
              <div className="bg-surface-sunken/50 p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="etiquette">{nomVitrine} answered</p>
                  <p className="font-mono text-lg tabulaire text-accent">
                    {nb(reponseVitrine.r.score)}
                    <span className="text-xs text-muted-foreground"> /10</span>
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed">{reponseVitrine.r.texte}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {reponseVitrine.r.flags.map((f) => (
                    <li
                      key={f}
                      className="border border-accent/40 bg-accent-soft px-2 py-0.5 font-mono text-[10px] tracking-[0.06em] text-accent uppercase"
                    >
                      {LIBELLES_FLAGS[f] ?? f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-rule p-5 sm:p-6">
              <p className="etiquette">Why it fails</p>
              <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Got right</dt>
                  <dd className="mt-1 text-sm leading-relaxed">
                    {reponseVitrine.r.analyse.correct}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-accent">Got wrong</dt>
                  <dd className="mt-1 text-sm leading-relaxed">
                    {reponseVitrine.r.analyse.incorrect}
                  </dd>
                </div>
              </dl>
              <Link
                to="/question/$id"
                params={{ id: vitrine.id }}
                className="mt-5 inline-block border border-border px-3 py-1.5 text-sm transition-colors hover:bg-surface-sunken"
              >
                See all five systems on this question →
              </Link>
            </div>
          </Panneau>
        </Section>
      )}

      {/* ── La chaîne ─────────────────────────────────────────────────────── */}
      <Section
        numero="02"
        titre="Every score traces back to an article"
        chapeau="A score is worth nothing if you cannot get back to what produced it. Each item in the corpus carries the whole chain."
      >
        <ol className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-5">
          {CHAINE.map((maillon, i) => (
            <li key={maillon.etape} className="bg-surface p-4">
              <p className="font-mono text-[11px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 text-sm font-medium">{maillon.etape}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {maillon.detail}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Le classement ─────────────────────────────────────────────────── */}
      {data && (
        <>
          <Section
            numero="03"
            titre="Results"
            chapeau="Regulatory accuracy out of 100 — the average score across every item in the corpus. Click a header to sort."
          >
            <Panneau className="mt-4 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="zebre w-full min-w-[48rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-foreground/60 bg-surface-sunken">
                      {COLONNES.map((c) => (
                        <th
                          key={c.cle}
                          scope="col"
                          className={`px-4 py-2.5 ${c.num ? "text-right" : "text-left"}`}
                          aria-sort={
                            cle === c.cle ? (ascendant ? "ascending" : "descending") : "none"
                          }
                        >
                          <button
                            type="button"
                            onClick={() => basculer(c.cle)}
                            className={`entete-col transition-colors hover:text-foreground ${
                              cle === c.cle ? "text-accent" : ""
                            }`}
                          >
                            {c.libelle}
                            {cle === c.cle ? (ascendant ? " ↑" : " ↓") : ""}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {lignes.map((m) => {
                      const rang = rangDe(data.modeles, m.id);
                      return (
                        <tr
                          key={m.id}
                          className="border-b border-border transition-colors last:border-0 hover:bg-surface-sunken"
                        >
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex size-6 items-center justify-center font-mono text-[11px] ${
                                rang === 1
                                  ? "bg-foreground text-background"
                                  : "bg-surface-sunken text-muted-foreground"
                              }`}
                            >
                              {rang}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              to="/model/$id"
                              params={{ id: m.id }}
                              className="font-medium underline decoration-border decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                            >
                              {m.nom}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{m.profil}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-3">
                              <span
                                className="hidden h-1 bg-foreground/70 sm:block"
                                style={{ width: `${m.score_global * 0.9}px` }}
                                aria-hidden="true"
                              />
                              <span className="font-mono tabulaire">{nb(m.score_global)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabulaire text-accent">
                            {nb(m.taux_hallucination_source)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabulaire text-muted-foreground">
                            {nb(m.taux_abstention)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panneau>
            <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
              A high decline rate is not a flaw in itself: a system that refuses to answer rather
              than inventing an article is still usable. The last two columns are read together.
            </p>
          </Section>

          <Section
            numero="04"
            titre="What the score is made of"
            chapeau="Each answer is scored 0 to 2 on four axes. Shown here as an average out of 100."
          >
            <Panneau className="mt-4 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="zebre w-full min-w-[40rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-foreground/60 bg-surface-sunken">
                      <th scope="col" className="entete-col px-4 py-2.5 text-left">
                        System
                      </th>
                      {Object.keys(LIBELLES_AXES).map((a) => (
                        <th key={a} scope="col" className="entete-col px-4 py-2.5 text-right">

                          {LIBELLES_AXES[a]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trier(data.modeles, "score_global", false).map((m) => (
                      <tr key={m.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">{m.nom}</td>
                        {Object.keys(LIBELLES_AXES).map((a) => (
                          <td key={a} className="px-4 py-3 text-right font-mono tabulaire">
                            {nb((m.scores_axes[a] ?? 0) * 50)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panneau>
          </Section>

          <Section
            numero="05"
            titre="By regulation"
            chapeau={`Regulatory accuracy out of 100, per domain. ${data.domaines
              .map((d) => NOMS_COURTS_DOMAINES[d] ?? d)
              .join(" · ")}.`}
          >
            <GraphiqueDomaines modeles={data.modeles} domaines={data.domaines} />
          </Section>
        </>
      )}
    </Page>
  );
}
