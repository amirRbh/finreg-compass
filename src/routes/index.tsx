import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Chargement, Erreur, Page, Panneau, Section } from "@/components/finreg/Chrome";
import { GraphiqueDomaines } from "@/components/finreg/GraphiqueDomaines";
import { PastilleVerification } from "@/components/finreg/Statuts";
import {
  libelles,
  nb,
  rangDe,
  trier,
  useQuestions,
  useResultats,
  type CleTri,
  texteAffiche,
} from "@/lib/finreg";
import { useLangue } from "@/lib/langue";

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

/** Item mis en avant : il porte l'erreur la plus lisible du corpus. */
const ITEM_VITRINE = "AMF-0010";
const MODELE_VITRINE = "modele-d";

function Accueil() {
  const { data, isPending, isError } = useResultats();
  const { data: questions } = useQuestions();
  const { langue, t } = useLangue();
  const L = libelles(langue);
  const [cle, setCle] = useState<CleTri>("rang");
  const [ascendant, setAscendant] = useState(true);

  const COLONNES: { cle: CleTri; libelle: string; num: boolean }[] = [
    { cle: "rang", libelle: "#", num: true },
    { cle: "nom", libelle: t("System", "Système"), num: false },
    { cle: "profil", libelle: t("Profile", "Profil"), num: false },
    { cle: "score_global", libelle: t("Regulatory accuracy", "Exactitude réglementaire"), num: true },
    { cle: "taux_hallucination_source", libelle: t("Invented source", "Source inventée"), num: true },
    { cle: "taux_abstention", libelle: t("Declined", "Abstention"), num: true },
  ];

  const CHAINE = [
    {
      etape: t("Question", "Question"),
      detail: t(
        "A closed regulatory question with a determinate answer.",
        "Une question réglementaire fermée, à réponse déterminée.",
      ),
    },
    {
      etape: t("What the law says", "Ce que dit le texte"),
      detail: t(
        "The expected answer, drafted from the text itself.",
        "La réponse attendue, rédigée à partir du texte lui-même.",
      ),
    },
    {
      etape: t("Source", "Source"),
      detail: t(
        "The act, the article, the date, the official link.",
        "Le texte, l'article, la date, le lien officiel.",
      ),
    },
    {
      etape: t("Verification", "Vérification"),
      detail: t(
        "The citation is checked — or flagged as not yet established.",
        "La citation est contrôlée — ou signalée comme non encore établie.",
      ),
    },
    {
      etape: t("Model answer", "Réponse du modèle"),
      detail: t(
        "What the system replied, scored on four axes.",
        "Ce que le système a répondu, noté sur quatre axes.",
      ),
    },
  ];

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
  const nomVitrine =
    data?.modeles.find((m) => m.id === reponseVitrine?.id)?.nom ?? t("The model", "Le modèle");
  const verifiees =
    questions?.filter((q) => q.verification.statut === "source_verifiee").length ?? 0;

  return (
    <Page>
      {/* ── Écran 1 : cinq secondes pour comprendre ───────────────────────── */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-14">
        <div className="max-w-3xl">
          <p className="etiquette">
            {t(
              "Public benchmark · EU & French financial regulation",
              "Benchmark public · réglementation financière française et européenne",
            )}
          </p>
          <h1 className="mt-4 text-4xl leading-[1.06] tracking-tight text-balance sm:text-[3.25rem]">
            {t("AI can write regulation.", "L'IA sait écrire sur la réglementation.")}
            <br />
            <span className="text-accent">
              {t("Can it get regulation right?", "Sait-elle l'appliquer juste ?")}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed">
            {t(
              "FinReg tests AI systems on real regulatory questions and checks every answer against the primary legal text.",
              "FinReg soumet des systèmes d'IA à de vraies questions réglementaires et contrôle chaque réponse contre le texte de loi.",
            )}
          </p>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {t(
              "An assistant that cites an article which does not exist is unusable in compliance: its answer cannot be checked, relied on, or filed.",
              "Un assistant qui cite un article inexistant est inexploitable en conformité : sa réponse ne peut être vérifiée, ni opposée, ni versée à un dossier.",
            )}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
            <Link
              to="/questions"
              className="border border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              {t("Explore the benchmark", "Explorer le benchmark")}
            </Link>
            {vitrine && (
              <Link
                to="/question/$id"
                params={{ id: vitrine.id }}
                className="border border-border px-5 py-2.5 text-sm transition-colors hover:bg-surface-sunken"
              >
                {t("See a question", "Voir une question")}
              </Link>
            )}
          </div>
        </div>

        {data && (
          <aside className="border-t border-foreground pt-4 lg:mt-2 lg:border-t-2">
            <p className="etiquette">{t("This run", "Cette exécution")}</p>
            <dl className="mt-3 divide-y divide-rule/60 text-[13px]">
              {[
                [t("Items", "Items"), String(data.nb_questions)],
                [t("Systems", "Systèmes"), String(data.modeles.length)],
                [t("Answers", "Réponses"), String(data.synthese.nb_reponses)],
                [t("Runs / item", "Passages / item"), String(data.nb_runs)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3 py-1.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-mono tabulaire">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>

      {/* ── Le chiffre qui pose le problème ───────────────────────────────── */}
      {data && (
        <Panneau className="mt-16 grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex min-h-[14rem] flex-col bg-surface-sunken/60 p-6">
            <p className="etiquette">
              {t("Answers not safe to rely on", "Réponses non fiables")}
            </p>
            <p className="mt-6 font-mono text-[4.75rem] leading-none tracking-tighter tabulaire text-accent">
              {nb(data.synthese.taux_reponse_non_fiable)}
              <span className="align-top text-xl"> %</span>
            </p>
            <p className="mt-auto border-t border-rule pt-3 text-[13px] leading-relaxed text-muted-foreground">
              {t(
                `of the ${data.synthese.nb_reponses} evaluated answers invent a source or state a rule the text does not contain.`,
                `des ${data.synthese.nb_reponses} réponses évaluées inventent une source ou énoncent une règle que le texte ne contient pas.`,
              )}
            </p>
          </div>
          <div className="flex min-h-[14rem] flex-col p-6">
            <p className="etiquette">
              {t("Average regulatory accuracy", "Exactitude réglementaire moyenne")}
            </p>
            <p className="mt-6 font-mono text-4xl leading-none tracking-tight tabulaire">
              {nb(data.synthese.exactitude_reglementaire)}
              <span className="text-base text-muted-foreground"> /100</span>
            </p>
            <p className="mt-auto border-t border-rule pt-3 text-[13px] leading-relaxed text-muted-foreground">
              {t(
                `across all systems and all items. Best ${nb(meilleur?.score_global)}, worst ${nb(pire?.score_global)} — the system you pick matters more than the prompt.`,
                `tous systèmes et tous items confondus. Meilleur ${nb(meilleur?.score_global)}, moins bon ${nb(pire?.score_global)} — le choix du système compte plus que la formulation du prompt.`,
              )}
            </p>
          </div>
          <div className="flex min-h-[14rem] flex-col p-6">
            <p className="etiquette">{t("Benchmark corpus", "Corpus du benchmark")}</p>
            <p className="mt-6 font-mono text-4xl leading-none tracking-tight tabulaire">
              {verifiees}
              <span className="text-base text-muted-foreground"> / {data.nb_questions}</span>
            </p>
            <p className="mt-auto border-t border-rule pt-3 text-[13px] leading-relaxed text-muted-foreground">
              {t(
                "items whose citation has been checked. The rest are published as under review, never as verified.",
                "items dont la citation a été contrôlée. Les autres sont publiés en revue, jamais comme vérifiés.",
              )}
            </p>
          </div>
        </Panneau>
      )}

      {/* ── Comment lire le site, en clair ────────────────────────────────── */}
      {data && (
        <Panneau className="mt-4 bg-accent-soft/40 p-5 sm:p-6">
          <p className="etiquette">{t("How to read this page", "Comment lire cette page")}</p>
          <dl className="mt-4 grid gap-5 sm:grid-cols-3">
            {[
              [
                t("Regulatory accuracy /100", "Exactitude réglementaire /100"),
                t(
                  "How often a system gets the rule right. 100 means every answer matched the legal text.",
                  "À quelle fréquence un système énonce la bonne règle. 100 signifie que chaque réponse correspondait au texte.",
                ),
              ],
              [
                t("Invented source %", "Source inventée %"),
                t(
                  "How often it cited an article that does not exist, or one that says something else.",
                  "À quelle fréquence il a cité un article inexistant, ou un article qui dit autre chose.",
                ),
              ],
              [
                t("Declined %", "Abstention %"),
                t(
                  "How often it said it did not know. Saying nothing is safer than inventing an article.",
                  "À quelle fréquence il a dit ne pas savoir. Ne rien dire vaut mieux qu'inventer un article.",
                ),
              ],
            ].map(([terme, sens]) => (
              <div key={terme}>
                <dt className="text-sm font-medium">{terme}</dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{sens}</dd>
              </div>
            ))}
          </dl>
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
          titre={t(
            "The model sounds confident. The law says otherwise.",
            "Le modèle a l'air sûr de lui. Le texte dit l'inverse.",
          )}
          chapeau={t(
            "One item from the corpus, in full. This is what the benchmark catches.",
            "Un item du corpus, en entier. Voilà ce que le benchmark attrape.",
          )}
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
                <p className="etiquette">{t("What the law says", "Ce que dit le texte")}</p>
                <p className="mt-3 text-sm leading-relaxed">{vitrine.reponse_reference}</p>
                <p className="mt-4 border-t border-rule pt-3 text-[13px] leading-relaxed text-muted-foreground">
                  {vitrine.source.texte}
                  <br />
                  {vitrine.source.article} · {vitrine.source.adopte}
                </p>
              </div>
              <div className="bg-surface-sunken/50 p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="etiquette">
                    {t(`${nomVitrine} answered`, `Réponse de ${nomVitrine}`)}
                  </p>
                  <p className="font-mono text-lg tabulaire text-accent">
                    {nb(reponseVitrine.r.score)}
                    <span className="text-xs text-muted-foreground"> /10</span>
                  </p>
                </div>
                <p className="mt-3 line-clamp-[11] text-sm leading-relaxed">
                  {texteAffiche(reponseVitrine.r.texte)}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {reponseVitrine.r.flags.map((f) => (
                    <li
                      key={f}
                      className="border border-accent/40 bg-accent-soft px-2 py-0.5 font-mono text-[10px] tracking-[0.06em] text-accent uppercase"
                    >
                      {L.flags[f] ?? f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-rule p-5 sm:p-6">
              <p className="etiquette">{t("Why it fails", "Pourquoi c'est faux")}</p>
              <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    {t("Got right", "Ce qui est juste")}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed">
                    {reponseVitrine.r.analyse.correct}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-accent">
                    {t("Got wrong", "Ce qui est faux")}
                  </dt>
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
                {t(
                  "See all five systems on this question →",
                  "Voir tous les systèmes sur cette question →",
                )}
              </Link>
            </div>
          </Panneau>
        </Section>
      )}

      {/* ── La chaîne ─────────────────────────────────────────────────────── */}
      <Section
        numero="02"
        titre={t("Every score traces back to an article", "Chaque note remonte à un article")}
        chapeau={t(
          "A score is worth nothing if you cannot get back to what produced it. Each item in the corpus carries the whole chain.",
          "Une note ne vaut rien si l'on ne peut pas remonter à ce qui l'a produite. Chaque item du corpus porte toute la chaîne.",
        )}
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
            titre={t("Results", "Classement")}
            chapeau={t(
              "Regulatory accuracy out of 100 — the average score across every item in the corpus. Click a header to sort.",
              "Exactitude réglementaire sur 100 — la note moyenne sur l'ensemble des items du corpus. Cliquez un en-tête pour trier.",
            )}
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
              {t(
                "A high decline rate is not a flaw in itself: a system that refuses to answer rather than inventing an article is still usable. The last two columns are read together.",
                "Un fort taux d'abstention n'est pas un défaut en soi : un système qui refuse de répondre plutôt que d'inventer un article reste utilisable. Les deux dernières colonnes se lisent ensemble.",
              )}
            </p>
          </Section>

          <Section
            numero="04"
            titre={t("What the score is made of", "De quoi la note est faite")}
            chapeau={t(
              "Each answer is scored 0 to 2 on four axes. Shown here as an average out of 100.",
              "Chaque réponse est notée de 0 à 2 sur quatre axes. Affichés ici en moyenne sur 100.",
            )}
          >
            <Panneau className="mt-4 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="zebre w-full min-w-[40rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-foreground/60 bg-surface-sunken">
                      <th scope="col" className="entete-col px-4 py-2.5 text-left">
                        {t("System", "Système")}
                      </th>
                      {Object.keys(L.axes).map((a) => (
                        <th key={a} scope="col" className="entete-col px-4 py-2.5 text-right">
                          {L.axes[a]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trier(data.modeles, "score_global", false).map((m) => (
                      <tr key={m.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">{m.nom}</td>
                        {Object.keys(L.axes).map((a) => (
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
            titre={t("By regulation", "Par réglementation")}
            chapeau={`${t(
              "Regulatory accuracy out of 100, per domain.",
              "Exactitude réglementaire sur 100, par domaine.",
            )} ${data.domaines.map((d) => L.domainesCourts[d] ?? d).join(" · ")}.`}
          >
            <GraphiqueDomaines modeles={data.modeles} domaines={data.domaines} />
          </Section>
        </>
      )}
    </Page>
  );
}
