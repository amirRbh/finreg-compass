import { createFileRoute, Link } from "@tanstack/react-router";
import { Chargement, Erreur, Page, Panneau } from "@/components/finreg/Chrome";
import { ConsoleEvaluation } from "@/components/finreg/Console";
import {
  BandeauProvenance,
  BoutonLien,
  CarteFiabilite,
  Pastille,
  Squelette,
  Tuile,
} from "@/components/finreg/Ui";
import {
  DIMENSIONS,
  LIBELLES_DIMENSIONS,
  NUMEROS_DIMENSIONS,
  QUESTIONS_DIMENSIONS,
  ECHECS_TYPES_DIMENSIONS,
  casVitrine,
  dateFr,
  fiabilite,
  libelles,
  nb,
  trier,
  useQuestions,
  useResultats,
} from "@/lib/finreg";

const TITRE = "FinReg — The independent benchmark for regulatory AI";
const DESCRIPTION =
  "FinReg independently tests regulatory AI for legal accuracy, citation integrity, hallucinations and calibration. Test your own AI against real EU and French financial regulation.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITRE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Can your AI be trusted with regulation?" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Accueil,
});

const PROBLEMES = [
  {
    titre: "Fabricated source",
    resume: "The AI cites an article that does not exist.",
    detail:
      "“Article 14(3) of Regulation (EU) 2019/2088 requires…” — SFDR has no Article 14(3). The obligation is invented, and so is the number that supports it.",
  },
  {
    titre: "Wrong citation",
    resume: "The cited article exists — but does not support the answer.",
    detail:
      "An answer on suitability assessments cites a MiFID II article that governs best execution. The reference is checkable, and it checks out false.",
  },
  {
    titre: "Overconfident answer",
    resume: "The AI should have abstained but provides a definitive legal conclusion.",
    detail:
      "Where the text leaves scope or timing open, the system answers “yes, the firm may rely on it” with no condition, no exception and no caveat.",
  },
];

function Accueil() {
  const { data, isPending, isError } = useResultats();
  const { data: questions } = useQuestions();

  const L = libelles("en");
  const cas = questions && data ? casVitrine(questions, data.modeles) : undefined;
  const classement = data ? trier(data.modeles, "score_global", false) : [];
  const tete = classement[0];
  const f = tete ? fiabilite(tete) : undefined;
  const verifiees = questions?.filter((q) => q.verification.statut === "source_verifiee").length;

  return (
    <div className="flex min-h-dvh flex-col">
      <Page>
        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section className="relative -mx-5 -mt-12 border-b border-rule bg-surface px-5 pt-12 pb-14 sm:-mt-16 sm:pt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 quadrillage opacity-40"
          />
          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-center lg:gap-16">
            <div>
              <p className="etiquette">
                Independent evaluation • Financial regulation • Reproducible methodology
              </p>
              <h1 className="mt-5 text-[2.5rem] leading-[1.05] text-balance sm:text-[3.4rem]">
                Can your AI be trusted with regulation?
              </h1>
              <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-muted-foreground">
                FinReg independently tests regulatory AI for legal accuracy, citation integrity,
                hallucinations and calibration.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <BoutonLien to="/test">Test your AI →</BoutonLien>
                <BoutonLien to="/benchmark" variante="secondaire">
                  Explore the benchmark
                </BoutonLien>
              </div>
              {data && (
                <BandeauProvenance
                  className="mt-10 max-w-xl"
                  entrees={[
                    ["Benchmark", "v1.0"],
                    ["Questions", String(data.nb_questions)],
                    ["Domains", String(data.domaines.length)],
                    ["Evaluated", dateFr(data.date_execution, "en")],
                  ]}
                />
              )}
            </div>
            <ConsoleEvaluation cas={cas} />
          </div>
        </section>

        {/* ── CE QUE LES MESURES DISENT DÉJÀ ─────────────────────────────── */}
        {isPending && (
          <div className="mt-14">
            <Chargement />
          </div>
        )}
        {isError && (
          <div className="mt-14">
            <Erreur />
          </div>
        )}
        {data && (
          <section className="mt-14">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-[1.3rem]">What we measured on the public benchmark</h2>
              <Pastille ton="succes">Measured run · not demo data</Pastille>
            </div>
            <Panneau className="mt-4 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              <Tuile
                etiquette="Answers not safe to rely on"
                valeur={nb(data.synthese.taux_reponse_non_fiable)}
                unite="%"
                ton="danger"
                note={`of the ${data.synthese.nb_reponses} scored answers invent a source or state a rule the text does not contain.`}
              />
              <Tuile
                etiquette="Fabricated or unsupported citation"
                valeur={nb(data.synthese.taux_hallucination_source)}
                unite="%"
                note="of answers cite an article that does not exist, or one that says something else."
              />
              <Tuile
                etiquette="Declined to answer"
                valeur={nb(data.synthese.taux_abstention)}
                unite="%"
                note="systems almost never abstain — even where the applicable text leaves the point open."
              />
              <Tuile
                etiquette="Verified sources in corpus"
                valeur={`${verifiees ?? "—"}`}
                unite={`/ ${data.nb_questions}`}
                note="items whose cited act and article were checked against the primary text."
              />
            </Panneau>
          </section>
        )}

        {/* ── LE PROBLÈME ────────────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="max-w-3xl">
            <p className="etiquette">The problem</p>
            <h2 className="mt-3 text-[2rem] leading-[1.12] sm:text-[2.4rem]">
              AI can sound right and still be wrong.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              A regulatory hallucination isn't just a bad answer. It can mean a fabricated citation,
              an incorrect legal interpretation or a false statement about an obligation — delivered
              in the register of a compliance memo, which is exactly what makes it dangerous.
            </p>
          </div>
          <div className="mt-8 grid gap-px border border-border bg-border md:grid-cols-3">
            {PROBLEMES.map((p, i) => (
              <article key={p.titre} className="flex flex-col bg-surface p-6">
                <p className="font-mono text-[10px] tracking-[0.14em] text-danger uppercase">
                  {String(i + 1).padStart(2, "0")} — {p.titre}
                </p>
                <p className="mt-4 text-[15px] leading-snug font-medium">{p.resume}</p>
                <p className="mt-3 border-t border-rule pt-3 text-[13px] leading-relaxed text-muted-foreground">
                  {p.detail}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-[12px] text-muted-foreground">
            Illustrative failure patterns. Every real case in the{" "}
            <Link to="/failures" className="text-accent underline underline-offset-2">
              failure database
            </Link>{" "}
            is tied to a measured answer and a primary source.
          </p>
        </section>

        {/* ── CE QUE FINREG MESURE ───────────────────────────────────────── */}
        <section className="mt-20">
          <div className="max-w-3xl">
            <p className="etiquette">What FinReg measures</p>
            <h2 className="mt-3 text-[1.9rem] leading-[1.15]">Five dimensions, scored per answer</h2>
          </div>
          <div className="mt-8 border border-border bg-surface">
            {DIMENSIONS.map((d) => {
              const valeur = f?.dimensions[d];
              return (
                <div
                  key={d}
                  className="grid gap-4 border-b border-rule px-6 py-5 last:border-b-0 lg:grid-cols-[3rem_minmax(0,14rem)_minmax(0,1fr)_10rem] lg:items-center"
                >
                  <span className="font-mono text-[11px] tracking-[0.12em] text-accent">
                    {NUMEROS_DIMENSIONS[d]}
                  </span>
                  <div>
                    <p className="text-[15px] font-medium">{LIBELLES_DIMENSIONS[d]}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                      {QUESTIONS_DIMENSIONS[d]}
                    </p>
                  </div>
                  <p className="border-l-2 border-danger/40 pl-3 text-[12.5px] leading-relaxed text-muted-foreground">
                    <span className="font-mono text-[10px] tracking-[0.12em] text-danger uppercase">
                      Example failure
                    </span>
                    <br />
                    {ECHECS_TYPES_DIMENSIONS[d]}
                  </p>
                  <div className="lg:text-right">
                    <p className="chiffre text-2xl text-ink">
                      {valeur !== undefined ? nb(valeur) : "—"}
                    </p>
                    <p className="mt-1 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
                      best system
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SCORE DE FIABILITÉ ─────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="etiquette">Regulatory Reliability Score™</p>
              <h2 className="mt-3 text-[1.9rem] leading-[1.15]">
                One number a risk committee can read
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                Derived from the five measured dimensions, on a 0–100 scale. It is a reliability
                indicator for an AI system, not a compliance certificate and not a legal opinion.
              </p>
            </div>
            {tete && (
              <p className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                shown for {tete.nom} · leading system
              </p>
            )}
          </div>
          <div className="mt-6">
            {f && tete ? (
              <CarteFiabilite
                score={f.global}
                dimensions={f.dimensions}
                libellesDimensions={LIBELLES_DIMENSIONS}
                sousTitre={`${tete.nom} · ${data?.nb_questions} questions · ${data?.domaines.length} regulatory domains · judged answer by answer against the primary text.`}
              />
            ) : (
              <Squelette lignes={6} />
            )}
          </div>
        </section>

        {/* ── APERÇU DU CLASSEMENT ───────────────────────────────────────── */}
        {data && (
          <section className="mt-20">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-foreground/70 pb-2.5">
              <h2 className="text-[1.3rem]">FinReg Regulatory AI Index</h2>
              <Link
                to="/benchmark"
                className="font-mono text-[11px] tracking-[0.12em] text-accent uppercase hover:underline"
              >
                Full leaderboard →
              </Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="zebre w-full min-w-[36rem] border border-border bg-surface text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="entete-col px-4 py-2.5 text-left">#</th>
                    <th className="entete-col px-4 py-2.5 text-left">System</th>
                    <th className="entete-col px-4 py-2.5 text-right">Reliability</th>
                    <th className="entete-col px-4 py-2.5 text-right">Legal accuracy</th>
                    <th className="entete-col px-4 py-2.5 text-right">Citation integrity</th>
                  </tr>
                </thead>
                <tbody>
                  {classement.slice(0, 4).map((m, i) => {
                    const fm = fiabilite(m);
                    return (
                      <tr key={m.id} className="border-b border-rule last:border-b-0">
                        <td className="px-4 py-2.5 chiffre text-[13px] text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-4 py-2.5">
                          <Link
                            to="/model/$id"
                            params={{ id: m.id }}
                            className="font-medium hover:text-accent"
                          >
                            {m.nom}
                          </Link>
                          <span className="ml-2 text-[12px] text-muted-foreground">{m.profil}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right chiffre">{nb(fm.global)}</td>
                        <td className="px-4 py-2.5 text-right chiffre text-muted-foreground">
                          {nb(fm.dimensions.legal_accuracy)}
                        </td>
                        <td className="px-4 py-2.5 text-right chiffre text-muted-foreground">
                          {nb(fm.dimensions.citation_integrity)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 font-mono text-[11px] tabulaire text-muted-foreground">
              Measured run · {dateFr(data.date_execution, "en")} · judge {data.juge ?? "—"} ·{" "}
              {data.nb_runs} run per question · domains{" "}
              {data.domaines.map((d) => L.domainesCourts[d] ?? d).join(", ")}
            </p>
          </section>
        )}

        {/* ── CERTIFICATION ──────────────────────────────────────────────── */}
        <section className="mt-20 grid gap-10 border border-border bg-surface-sunken p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-center">
          <div>
            <p className="etiquette">FinReg Verified</p>
            <h2 className="mt-3 text-[1.7rem] leading-[1.15]">
              An independent reliability assessment for regulatory AI systems
            </h2>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
              Designed to become an independent reliability standard. An assessment rests on a
              defined benchmark, a reproducible methodology, source verification, hallucination
              testing and calibration testing — nothing else.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <BoutonLien to="/audit">Request an audit →</BoutonLien>
              <BoutonLien to="/methodology" variante="secondaire">
                Read the methodology
              </BoutonLien>
            </div>
          </div>
          <div className="border border-ink bg-ink p-6 text-background">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
              FinReg Verified
            </p>
            <p className="mt-3 text-[15px] font-medium">Regulatory AI Reliability</p>
            <p className="mt-6 chiffre text-4xl">
              91<span className="text-base opacity-60"> /100</span>
            </p>
            <p className="mt-2 font-mono text-[11px] tracking-[0.1em] uppercase opacity-70">
              Assessment: 2026
            </p>
            <p className="mt-5 border-t border-background/20 pt-3 font-mono text-[10px] tracking-[0.12em] uppercase text-chart-4">
              Badge concept · illustrative score
            </p>
          </div>
        </section>

        {/* ── CONVERSION ─────────────────────────────────────────────────── */}
        <section className="mt-20 border-t border-foreground/70 pt-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h2 className="text-[1.9rem] leading-[1.12]">
                Find out how your AI performs on regulation.
              </h2>
              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
                Start with a free AI check on a sample of your system's answers. Move to a private
                benchmark on your own corpus when you need production evidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <BoutonLien to="/test">Test your AI →</BoutonLien>
              <BoutonLien to="/private-benchmark" variante="secondaire">
                Request a private benchmark →
              </BoutonLien>
            </div>
          </div>
        </section>
      </Page>
    </div>
  );
}
