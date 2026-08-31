import { createFileRoute, Link } from "@tanstack/react-router";
import { Chargement, Erreur, Page, Panneau } from "@/components/finreg/Chrome";
import { ExplicationVerification } from "@/components/finreg/Statuts";
import {
  AXES,
  EXPLICATIONS_AXES,
  LIBELLES_AXES,
  LIBELLES_DIFFICULTE,
  LIBELLES_DOMAINES,
  LIBELLES_FLAGS,
  LIBELLES_TYPES,
  estGrave,
  nb,
  useQuestions,
  useResultats,
  texteAffiche,
} from "@/lib/finreg";

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

function FicheQuestion() {
  const { id } = Route.useParams();
  const { data: questions, isPending, isError } = useQuestions();
  const { data: resultats } = useResultats();

  if (isPending) {
    return (
      <Page>
        <Chargement libelle="Loading the corpus…" />
      </Page>
    );
  }
  if (isError || !questions) {
    return (
      <Page>
        <Erreur libelle="Corpus unavailable." />
      </Page>
    );
  }

  const question = questions.find((q) => q.id === id);
  if (!question) {
    return (
      <Page>
        <h1 className="text-3xl leading-tight sm:text-4xl">Unknown item</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No item in the corpus carries the identifier <span className="font-mono">{id}</span>.
        </p>
        <Link
          to="/questions"
          className="mt-4 inline-block text-sm text-accent underline underline-offset-4"
        >
          Back to the corpus
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

      <p className="etiquette mt-4">{LIBELLES_DOMAINES[question.domaine] ?? question.domaine}</p>
      <h1 className="mt-2 max-w-3xl text-2xl leading-snug sm:text-3xl">{question.question}</h1>
      <p className="mt-3 font-mono text-[11px] text-muted-foreground">
        {LIBELLES_TYPES[question.type] ?? question.type} ·{" "}
        {LIBELLES_DIFFICULTE[question.difficulte] ?? `difficulty ${question.difficulte}`}
      </p>

      {/* 1 — Ce que dit réellement le texte */}
      <section className="mt-10">
        <h2 className="flex items-baseline gap-4 border-b border-foreground/70 pb-2.5 text-[1.2rem]"><span className="font-mono text-[11px] tracking-[0.08em] text-accent">01</span><span>What the law says</span></h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">{question.reponse_reference}</p>
      </section>

      {/* 2 — D'où cela sort */}
      <section className="mt-10">
        <h2 className="flex items-baseline gap-4 border-b border-foreground/70 pb-2.5 text-[1.2rem]"><span className="font-mono text-[11px] tracking-[0.08em] text-accent">02</span><span>Legal basis</span></h2>
        <Panneau className="mt-3 max-w-2xl p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="etiquette">Act</dt>
              <dd className="mt-1.5 text-sm">{question.source.texte}</dd>
            </div>
            <div>
              <dt className="etiquette">Provision</dt>
              <dd className="mt-1.5 text-sm">{question.source.article}</dd>
            </div>
            <div>
              <dt className="etiquette">Version</dt>
              <dd className="mt-1.5 text-sm">{question.source.adopte}</dd>
            </div>
            <div>
              <dt className="etiquette">Jurisdiction</dt>
              <dd className="mt-1.5 text-sm">
                {question.source.juridiction === "EU" ? "European Union" : "France"}
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
              Open the official source ↗
            </a>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {question.source.precision === "article"
                ? "The link opens the cited article."
                : "The link opens the consolidated text rather than the cited article: the provision has to be found from the table of contents."}
              {question.source.langue_source === "fr" && " Légifrance publishes in French only."}
            </p>
          </div>
        </Panneau>
      </section>

      {/* 3 — Ce que vaut cette citation */}
      <section className="mt-10">
        <h2 className="flex items-baseline gap-4 border-b border-foreground/70 pb-2.5 text-[1.2rem]"><span className="font-mono text-[11px] tracking-[0.08em] text-accent">03</span><span>Verification</span></h2>
        <div className="mt-3 max-w-2xl">
          <ExplicationVerification verification={question.verification} />
        </div>
      </section>

      {/* 4 — Ce que les systèmes en ont fait */}
      <section className="mt-12">
        <h2 className="flex items-baseline gap-4 border-b border-foreground/70 pb-2.5 text-[1.2rem]"><span className="font-mono text-[11px] tracking-[0.08em] text-accent">04</span><span>What the systems answered</span></h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Each answer is scored 0 to 2 on four axes — legal accuracy, citation accuracy,
          calibration, usability — whose sum gives the score out of 10.{" "}
          <Link to="/methodology" className="text-accent underline underline-offset-4">
            See the rubric
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
                      <div key={axe} title={EXPLICATIONS_AXES[axe]}>
                        <p className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
                          {LIBELLES_AXES[axe]}
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
                            {LIBELLES_FLAGS[f] ?? f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Le « pourquoi » : ce que le système a vu juste, et où il bascule. */}
                {reponse.analyse && (
                  <div className="border-t border-accent/30 bg-accent-soft/40 p-5">
                    <p className="etiquette text-accent">Why it fails</p>
                    <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Got right</dt>
                        <dd className="mt-1 text-sm leading-relaxed">{reponse.analyse.correct}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-accent">Got wrong</dt>
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
