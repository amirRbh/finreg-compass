import { createFileRoute, Link } from "@tanstack/react-router";
import { Chargement, Erreur, Page, Panneau } from "@/components/finreg/Chrome";
import { ExplicationVerification } from "@/components/finreg/Statuts";
import {
  AXES,
  libelles,
  estGrave,
  nb,
  useQuestions,
  useResultats,
  texteAffiche,
} from "@/lib/finreg";
import { useLangue } from "@/lib/langue";

export const Route = createFileRoute("/question/$id")({
  head: () => ({
    meta: [
      { title: "Benchmark item — FinReg" },
      {
        name: "description",
        content:
          "One item from the FinReg corpus: the question, what the law says, the article it comes from, the verification of that citation, and what each AI system answered.",
      },
      { property: "og:title", content: "Benchmark item — FinReg" },
      {
        property: "og:description",
        content:
          "Question, expected answer, legal basis, citation verification, and scored model answers.",
      },
    ],
  }),
  component: FicheQuestion,
});

function TitreSection({ numero, children }: { numero: string; children: React.ReactNode }) {
  return (
    <h2 className="flex items-baseline gap-4 border-b border-foreground/70 pb-2.5 text-[1.2rem]">
      <span className="font-mono text-[11px] tracking-[0.08em] text-accent">{numero}</span>
      <span>{children}</span>
    </h2>
  );
}

function FicheQuestion() {
  const { id } = Route.useParams();
  const { data: questions, isPending, isError } = useQuestions();
  const { data: resultats } = useResultats();
  const { langue, t } = useLangue();
  const L = libelles(langue);

  if (isPending) {
    return (
      <Page>
        <Chargement libelle={t("Loading the corpus…", "Chargement du corpus…")} />
      </Page>
    );
  }
  if (isError || !questions) {
    return (
      <Page>
        <Erreur libelle={t("Corpus unavailable.", "Corpus indisponible.")} />
      </Page>
    );
  }

  const question = questions.find((q) => q.id === id);
  if (!question) {
    return (
      <Page>
        <h1 className="text-3xl leading-tight sm:text-4xl">{t("Unknown item", "Item inconnu")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(
            "No item in the corpus carries the identifier ",
            "Aucun item du corpus ne porte l'identifiant ",
          )}
          <span className="font-mono">{id}</span>.
        </p>
        <Link
          to="/questions"
          className="mt-4 inline-block text-sm text-accent underline underline-offset-4"
        >
          {t("Back to the corpus", "Retour au corpus")}
        </Link>
      </Page>
    );
  }

  const index = questions.findIndex((q) => q.id === question.id);
  const precedent = questions[index - 1];
  const suivant = questions[index + 1];
  const nomModele = (idModele: string) =>
    resultats?.modeles.find((m) => m.id === idModele)?.nom ?? idModele;

  // De la meilleure réponse à la moins bonne : la comparaison est le sujet de
  // la page, elle ne doit pas dépendre de l'ordre du fichier.
  const reponses = Object.entries(question.reponses_modeles).sort(
    (a, b) => b[1].score - a[1].score,
  );

  return (
    <Page>
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/questions" className="underline underline-offset-4 hover:text-foreground">
          Questions
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-mono">{question.id}</span>
      </nav>

      <p className="etiquette mt-4">{L.domaines[question.domaine] ?? question.domaine}</p>
      <h1 className="mt-2 max-w-3xl text-2xl leading-snug sm:text-3xl">{question.question}</h1>
      <p className="mt-3 font-mono text-[11px] text-muted-foreground">
        {L.types[question.type] ?? question.type} ·{" "}
        {L.difficulte[question.difficulte] ??
          `${t("difficulty", "difficulté")} ${question.difficulte}`}
      </p>

      {/* 1 — Ce que dit réellement le texte */}
      <section className="mt-10">
        <TitreSection numero="01">{t("What the law says", "Ce que dit le texte")}</TitreSection>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">{question.reponse_reference}</p>
      </section>

      {/* 2 — D'où cela sort */}
      <section className="mt-10">
        <TitreSection numero="02">{t("Legal basis", "Fondement juridique")}</TitreSection>
        <Panneau className="mt-3 max-w-2xl p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="etiquette">{t("Act", "Texte")}</dt>
              <dd className="mt-1.5 text-sm">{question.source.texte}</dd>
            </div>
            <div>
              <dt className="etiquette">{t("Provision", "Article")}</dt>
              <dd className="mt-1.5 text-sm">{question.source.article}</dd>
            </div>
            <div>
              <dt className="etiquette">{t("Version", "Version")}</dt>
              <dd className="mt-1.5 text-sm">{question.source.adopte}</dd>
            </div>
            <div>
              <dt className="etiquette">{t("Jurisdiction", "Juridiction")}</dt>
              <dd className="mt-1.5 text-sm">
                {question.source.juridiction === "EU"
                  ? t("European Union", "Union européenne")
                  : t("France", "France")}
              </dd>
            </div>
          </dl>
          <div className="mt-4 border-t border-rule pt-4">
            <a
              href={question.source.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-accent underline underline-offset-4"
            >
              {t("Open the official source ↗", "Ouvrir la source officielle ↗")}
            </a>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {question.source.precision === "article"
                ? t(
                    "The link opens the cited article.",
                    "Le lien ouvre l'article cité.",
                  )
                : t(
                    "The link opens the consolidated text rather than the cited article: the provision has to be found from the table of contents.",
                    "Le lien ouvre le texte consolidé plutôt que l'article cité : la disposition doit être retrouvée depuis le sommaire.",
                  )}
              {question.source.langue_source === "fr" &&
                t(
                  " Légifrance publishes in French only.",
                  " Légifrance ne publie qu'en français.",
                )}
            </p>
          </div>
        </Panneau>
      </section>

      {/* 3 — Ce que vaut cette citation */}
      <section className="mt-10">
        <TitreSection numero="03">{t("Verification", "Vérification")}</TitreSection>
        <div className="mt-3 max-w-2xl">
          <ExplicationVerification verification={question.verification} />
        </div>
      </section>

      {/* 4 — Ce que les systèmes en ont fait */}
      <section className="mt-12">
        <TitreSection numero="04">
          {t("What the systems answered", "Ce que les systèmes ont répondu")}
        </TitreSection>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {t(
            "Each answer is scored 0 to 2 on four axes — legal accuracy, citation accuracy, calibration, usability — whose sum gives the score out of 10.",
            "Chaque réponse est notée de 0 à 2 sur quatre axes — exactitude juridique, exactitude de la citation, calibration, exploitabilité — dont la somme donne la note sur 10.",
          )}{" "}
          <Link to="/methodology" className="text-accent underline underline-offset-4">
            {t("See the rubric", "Voir le barème")}
          </Link>
          .
        </p>

        <ol className="mt-5 space-y-4">
          {reponses.map(([idModele, reponse]) => {
            const grave = reponse.flags.some(estGrave);
            return (
              <li
                key={idModele}
                className={`border bg-surface shadow-panneau ${
                  grave ? "border-accent/50" : "border-border"
                }`}
              >
                <div className="p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <Link
                      to="/model/$id"
                      params={{ id: idModele }}
                      className="font-medium underline decoration-border decoration-1 underline-offset-4 hover:text-accent hover:decoration-accent"
                    >
                      {nomModele(idModele)}
                    </Link>
                    <p className={`font-mono text-lg tabulaire ${grave ? "text-accent" : ""}`}>
                      {nb(reponse.score)}
                      <span className="text-xs text-muted-foreground"> /10</span>
                    </p>
                  </div>

                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {texteAffiche(reponse.texte)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3 border-t border-rule pt-3">
                    {AXES.map((axe) => (
                      <div key={axe} title={L.explicationsAxes[axe]}>
                        <p className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
                          {L.axes[axe]}
                        </p>
                        <p className="mt-1 font-mono text-sm tabulaire">
                          {reponse.axes[axe] ?? "—"}
                          <span className="text-[10px] text-muted-foreground"> /2</span>
                        </p>
                      </div>
                    ))}
                    {reponse.flags.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {reponse.flags.map((f) => (
                          <li
                            key={f}
                            className={`border px-2 py-0.5 font-mono text-[10px] tracking-[0.06em] uppercase ${
                              estGrave(f)
                                ? "border-accent/40 bg-accent-soft text-accent"
                                : "border-border text-muted-foreground"
                            }`}
                          >
                            {L.flags[f] ?? f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Le « pourquoi » : ce que le système a vu juste, et où il bascule. */}
                {reponse.analyse && (
                  <div className="border-t border-accent/30 bg-accent-soft/40 p-5">
                    <p className="etiquette text-accent">{t("Why it fails", "Pourquoi c'est faux")}</p>
                    <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          {t("Got right", "Ce qui est juste")}
                        </dt>
                        <dd className="mt-1 text-sm leading-relaxed">{reponse.analyse.correct}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-accent">
                          {t("Got wrong", "Ce qui est faux")}
                        </dt>
                        <dd className="mt-1 text-sm leading-relaxed">
                          {reponse.analyse.incorrect}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <nav className="mt-12 flex items-center justify-between gap-4 border-t border-rule pt-5 text-sm">
        {precedent ? (
          <Link
            to="/question/$id"
            params={{ id: precedent.id }}
            className="text-accent underline underline-offset-4"
          >
            ← {precedent.id}
          </Link>
        ) : (
          <span />
        )}
        {suivant ? (
          <Link
            to="/question/$id"
            params={{ id: suivant.id }}
            className="text-accent underline underline-offset-4"
          >
            {suivant.id} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </Page>
  );
}
