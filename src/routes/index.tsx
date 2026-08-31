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
  NUMEROS_DIMENSIONS,
  casVitrine,
  dateFr,
  dimensionsLib,
  fiabilite,
  libelles,
  nb,
  trier,
  useQuestions,
  useResultats,
} from "@/lib/finreg";
import { useLangue } from "@/lib/langue";

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
    titre: ["Fabricated source", "Source inventée"],
    resume: [
      "The AI cites an article that does not exist.",
      "L'IA cite un article qui n'existe pas.",
    ],
    detail: [
      "“Article 14(3) of Regulation (EU) 2019/2088 requires…” — SFDR has no Article 14(3). The obligation is invented, and so is the number that supports it.",
      "« L'article 14(3) du règlement (UE) 2019/2088 impose… » — SFDR n'a pas d'article 14(3). L'obligation est inventée, et le numéro qui la soutient aussi.",
    ],
  },
  {
    titre: ["Wrong citation", "Citation erronée"],
    resume: [
      "The cited article exists — but does not support the answer.",
      "L'article cité existe — mais ne soutient pas la réponse.",
    ],
    detail: [
      "An answer on suitability assessments cites a MiFID II article that governs best execution. The reference is checkable, and it checks out false.",
      "Une réponse sur l'évaluation d'adéquation cite un article MiFID II qui régit la meilleure exécution. La référence est vérifiable, et elle est fausse.",
    ],
  },
  {
    titre: ["Overconfident answer", "Réponse surconfiante"],
    resume: [
      "The AI should have abstained but provides a definitive legal conclusion.",
      "L'IA aurait dû s'abstenir : elle tranche définitivement.",
    ],
    detail: [
      "Where the text leaves scope or timing open, the system answers “yes, the firm may rely on it” with no condition, no exception and no caveat.",
      "Là où le texte laisse le périmètre ou la datation ouverts, le système répond « oui, l'entreprise peut s'en prévaloir », sans condition ni exception.",
    ],
  },
];

function Accueil() {
  const { data, isPending, isError } = useResultats();
  const { data: questions } = useQuestions();
  const { langue, t } = useLangue();
  const i = langue === "fr" ? 1 : 0;

  const L = libelles(langue);
  const D = dimensionsLib(langue);
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
                {t(
                  "Independent evaluation • Financial regulation • Reproducible methodology",
                  "Évaluation indépendante • Réglementation financière • Méthodologie reproductible",
                )}
              </p>
              <h1 className="mt-5 text-[2.5rem] leading-[1.05] text-balance sm:text-[3.4rem]">
                {t(
                  "Can your AI be trusted with regulation?",
                  "Peut-on confier la réglementation à votre IA ?",
                )}
              </h1>
              <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-muted-foreground">
                {t(
                  "FinReg independently tests regulatory AI for legal accuracy, citation integrity, hallucinations and calibration.",
                  "FinReg teste de façon indépendante les IA réglementaires : exactitude juridique, intégrité des citations, hallucinations et calibration.",
                )}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <BoutonLien to="/test">{t("Test your AI →", "Tester votre IA →")}</BoutonLien>
                <BoutonLien to="/benchmark" variante="secondaire">
                  {t("Explore the benchmark", "Explorer le benchmark")}
                </BoutonLien>
              </div>
              {data && (
                <BandeauProvenance
                  className="mt-10 max-w-xl"
                  entrees={[
                    ["Benchmark", "v1.0"],
                    ["Questions", String(data.nb_questions)],
                    [t("Domains", "Domaines"), String(data.domaines.length)],
                    [t("Evaluated", "Évalué le"), dateFr(data.date_execution, langue)],
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
              <h2 className="text-[1.3rem]">
                {t(
                  "What we measured on the public benchmark",
                  "Ce que nous avons mesuré sur le benchmark public",
                )}
              </h2>
              <Pastille ton="succes">
                {t("Measured run · not demo data", "Exécution mesurée · pas de données factices")}
              </Pastille>
            </div>
            <Panneau className="mt-4 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              <Tuile
                etiquette={t("Answers not safe to rely on", "Réponses non fiables")}
                valeur={nb(data.synthese.taux_reponse_non_fiable)}
                unite="%"
                ton="danger"
                note={t(
                  `of the ${data.synthese.nb_reponses} scored answers invent a source or state a rule the text does not contain.`,
                  `des ${data.synthese.nb_reponses} réponses notées inventent une source ou énoncent une règle absente du texte.`,
                )}
              />
              <Tuile
                etiquette={t(
                  "Fabricated or unsupported citation",
                  "Citation inventée ou non étayée",
                )}
                valeur={nb(data.synthese.taux_hallucination_source)}
                unite="%"
                note={t(
                  "of answers cite an article that does not exist, or one that says something else.",
                  "des réponses citent un article inexistant, ou qui dit autre chose.",
                )}
              />
              <Tuile
                etiquette={t("Declined to answer", "Abstentions")}
                valeur={nb(data.synthese.taux_abstention)}
                unite="%"
                note={t(
                  "systems almost never abstain — even where the applicable text leaves the point open.",
                  "les systèmes ne s'abstiennent presque jamais — même quand le texte laisse la question ouverte.",
                )}
              />
              <Tuile
                etiquette={t("Verified sources in corpus", "Sources vérifiées du corpus")}
                valeur={`${verifiees ?? "—"}`}
                unite={`/ ${data.nb_questions}`}
                note={t(
                  "items whose cited act and article were checked against the primary text.",
                  "items dont le texte et l'article cités ont été vérifiés à la source.",
                )}
              />
            </Panneau>
          </section>
        )}

        {/* ── LE PROBLÈME ────────────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="max-w-3xl">
            <p className="etiquette">{t("The problem", "Le problème")}</p>
            <h2 className="mt-3 text-[2rem] leading-[1.12] sm:text-[2.4rem]">
              {t(
                "AI can sound right and still be wrong.",
                "Une IA peut sonner juste et se tromper.",
              )}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              {t(
                "A regulatory hallucination isn't just a bad answer. It can mean a fabricated citation, an incorrect legal interpretation or a false statement about an obligation — delivered in the register of a compliance memo, which is exactly what makes it dangerous.",
                "Une hallucination réglementaire n'est pas qu'une mauvaise réponse : c'est une citation inventée, une interprétation juridique fausse ou une obligation imaginaire — énoncée dans le registre d'une note de conformité, et c'est exactement ce qui la rend dangereuse.",
              )}
            </p>
          </div>
          <div className="mt-8 grid gap-px border border-border bg-border md:grid-cols-3">
            {PROBLEMES.map((p, n) => (
              <article key={p.titre[0]} className="flex flex-col bg-surface p-6">
                <p className="font-mono text-[10px] tracking-[0.14em] text-danger uppercase">
                  {String(n + 1).padStart(2, "0")} — {p.titre[i]}
                </p>
                <p className="mt-4 text-[15px] leading-snug font-medium">{p.resume[i]}</p>
                <p className="mt-3 border-t border-rule pt-3 text-[13px] leading-relaxed text-muted-foreground">
                  {p.detail[i]}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-[12px] text-muted-foreground">
            {t("Illustrative failure patterns. Every real case in the", "Motifs d'échec illustratifs. Chaque cas réel de la")}{" "}
            <Link to="/failures" className="text-accent underline underline-offset-2">
              {t("failure database", "base des défaillances")}
            </Link>{" "}
            {t(
              "is tied to a measured answer and a primary source.",
              "renvoie à une réponse mesurée et à une source officielle.",
            )}
          </p>
        </section>

        {/* ── CE QUE FINREG MESURE ───────────────────────────────────────── */}
        <section className="mt-20">
          <div className="max-w-3xl">
            <p className="etiquette">{t("What FinReg measures", "Ce que FinReg mesure")}</p>
            <h2 className="mt-3 text-[1.9rem] leading-[1.15]">
              {t(
                "Five dimensions, scored per answer",
                "Cinq dimensions, notées réponse par réponse",
              )}
            </h2>
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
                    <p className="text-[15px] font-medium">{D.libelles[d]}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                      {D.questions[d]}
                    </p>
                  </div>
                  <p className="border-l-2 border-danger/40 pl-3 text-[12.5px] leading-relaxed text-muted-foreground">
                    <span className="font-mono text-[10px] tracking-[0.12em] text-danger uppercase">
                      {t("Example failure", "Exemple d'échec")}
                    </span>
                    <br />
                    {D.echecs[d]}
                  </p>
                  <div className="lg:text-right">
                    <p className="chiffre text-2xl text-ink">
                      {valeur !== undefined ? nb(valeur) : "—"}
                    </p>
                    <p className="mt-1 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
                      {t("best system", "meilleur système")}
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
                {t(
                  "One number a risk committee can read",
                  "Un chiffre lisible par un comité des risques",
                )}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                {t(
                  "Derived from the five measured dimensions, on a 0–100 scale. It is a reliability indicator for an AI system, not a compliance certificate and not a legal opinion.",
                  "Dérivé des cinq dimensions mesurées, sur une échelle de 0 à 100. C'est un indicateur de fiabilité d'un système d'IA, pas un certificat de conformité ni une opinion juridique.",
                )}
              </p>
            </div>
            {tete && (
              <p className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                {t(`shown for ${tete.nom} · leading system`, `affiché pour ${tete.nom} · système de tête`)}
              </p>
            )}
          </div>
          <div className="mt-6">
            {f && tete ? (
              <CarteFiabilite
                score={f.global}
                dimensions={f.dimensions}
                libellesDimensions={D.libelles}
                sousTitre={t(
                  `${tete.nom} · ${data?.nb_questions} questions · ${data?.domaines.length} regulatory domains · judged answer by answer against the primary text.`,
                  `${tete.nom} · ${data?.nb_questions} questions · ${data?.domaines.length} domaines réglementaires · noté réponse par réponse face au texte officiel.`,
                )}
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
                {t("Full leaderboard →", "Classement complet →")}
              </Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="zebre w-full min-w-[36rem] border border-border bg-surface text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="entete-col px-4 py-2.5 text-left">#</th>
                    <th className="entete-col px-4 py-2.5 text-left">
                      {t("System", "Système")}
                    </th>
                    <th className="entete-col px-4 py-2.5 text-right">
                      {t("Reliability", "Fiabilité")}
                    </th>
                    <th className="entete-col px-4 py-2.5 text-right">
                      {t("Legal accuracy", "Exactitude juridique")}
                    </th>
                    <th className="entete-col px-4 py-2.5 text-right">
                      {t("Citation integrity", "Intégrité des citations")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classement.slice(0, 4).map((m, n) => {
                    const fm = fiabilite(m);
                    return (
                      <tr key={m.id} className="border-b border-rule last:border-b-0">
                        <td className="px-4 py-2.5 chiffre text-[13px] text-muted-foreground">
                          {n + 1}
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
              {t("Measured run", "Exécution mesurée")} · {dateFr(data.date_execution, langue)} ·{" "}
              {t("judge", "juge")} {data.juge ?? "—"} · {data.nb_runs}{" "}
              {t("run per question", "passage par question")} · {t("domains", "domaines")}{" "}
              {data.domaines.map((d) => L.domainesCourts[d] ?? d).join(", ")}
            </p>
          </section>
        )}

        {/* ── CERTIFICATION ──────────────────────────────────────────────── */}
        <section className="mt-20 grid gap-10 border border-border bg-surface-sunken p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-center">
          <div>
            <p className="etiquette">FinReg Verified</p>
            <h2 className="mt-3 text-[1.7rem] leading-[1.15]">
              {t(
                "An independent reliability assessment for regulatory AI systems",
                "Une évaluation indépendante de fiabilité pour les IA réglementaires",
              )}
            </h2>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
              {t(
                "Designed to become an independent reliability standard. An assessment rests on a defined benchmark, a reproducible methodology, source verification, hallucination testing and calibration testing — nothing else.",
                "Conçue pour devenir un standard indépendant de fiabilité. Une évaluation repose sur un benchmark défini, une méthodologie reproductible, la vérification des sources, le test des hallucinations et celui de la calibration — rien d'autre.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <BoutonLien to="/audit">{t("Request an audit →", "Demander un audit →")}</BoutonLien>
              <BoutonLien to="/methodology" variante="secondaire">
                {t("Read the methodology", "Lire la méthodologie")}
              </BoutonLien>
            </div>
          </div>
          <div className="border border-ink bg-ink p-6 text-background">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
              FinReg Verified
            </p>
            <p className="mt-3 text-[15px] font-medium">
              {t("Regulatory AI Reliability", "Fiabilité d'IA réglementaire")}
            </p>
            <p className="mt-6 chiffre text-4xl">
              91<span className="text-base opacity-60"> /100</span>
            </p>
            <p className="mt-2 font-mono text-[11px] tracking-[0.1em] uppercase opacity-70">
              {t("Assessment: 2026", "Évaluation : 2026")}
            </p>
            <p className="mt-5 border-t border-background/20 pt-3 font-mono text-[10px] tracking-[0.12em] uppercase text-chart-4">
              {t("Badge concept · illustrative score", "Concept de badge · score illustratif")}
            </p>
          </div>
        </section>

        {/* ── CONVERSION ─────────────────────────────────────────────────── */}
        <section className="mt-20 border-t border-foreground/70 pt-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h2 className="text-[1.9rem] leading-[1.12]">
                {t(
                  "Find out how your AI performs on regulation.",
                  "Découvrez comment votre IA se comporte sur la réglementation.",
                )}
              </h2>
              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
                {t(
                  "Start with a free AI check on a sample of your system's answers. Move to a private benchmark on your own corpus when you need production evidence.",
                  "Commencez par un contrôle gratuit sur un échantillon des réponses de votre système. Passez à un benchmark privé sur votre propre corpus quand il faut des preuves en production.",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <BoutonLien to="/test">{t("Test your AI →", "Tester votre IA →")}</BoutonLien>
              <BoutonLien to="/private-benchmark" variante="secondaire">
                {t("Request a private benchmark →", "Demander un benchmark privé →")}
              </BoutonLien>
            </div>
          </div>
        </section>
      </Page>
    </div>
  );
}
