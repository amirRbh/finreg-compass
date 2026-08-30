import { createFileRoute, Link } from "@tanstack/react-router";
import { Chargement, Erreur, Page, Panneau } from "@/components/finreg/Chrome";
import { ExplicationVerification } from "@/components/finreg/Statuts";
import {
  AXES,
  LIBELLES_AXES,
  LIBELLES_DOMAINES,
  LIBELLES_FLAGS,
  LIBELLES_TYPES,
  estGrave,
  nb,
  useQuestions,
  useResultats,
} from "@/lib/finreg";

export const Route = createFileRoute("/question/$id")({
  head: () => ({
    meta: [
      { title: "Item du corpus — FinReg" },
      {
        name: "description",
        content:
          "Un item du corpus FinReg : la question, la réponse de référence, l'article dont elle est tirée, le statut de vérification de cette citation et la réponse notée de chaque système.",
      },
      { property: "og:title", content: "Item du corpus — FinReg" },
      {
        property: "og:description",
        content:
          "Question, réponse de référence, fondement juridique, vérification de la citation et notes détaillées par axe.",
      },
    ],
  }),
  component: FicheQuestion,
});

const LIBELLES_DIFFICULTE: Record<number, string> = {
  1: "1 — application directe",
  2: "2 — combinaison de deux dispositions",
  3: "3 — périmètre ou datation",
};

function FicheQuestion() {
  const { id } = Route.useParams();
  const { data: questions, isPending, isError } = useQuestions();
  const { data: resultats } = useResultats();

  if (isPending) {
    return (
      <Page>
        <Chargement libelle="Chargement du corpus…" />
      </Page>
    );
  }
  if (isError || !questions) {
    return (
      <Page>
        <Erreur libelle="Corpus indisponible." />
      </Page>
    );
  }

  const question = questions.find((q) => q.id === id);
  if (!question) {
    return (
      <Page>
        <h1 className="text-3xl leading-tight sm:text-4xl">Item inconnu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aucun item du corpus ne porte l'identifiant <span className="font-mono">{id}</span>.
        </p>
        <Link
          to="/questions"
          className="mt-4 inline-block text-sm text-accent underline underline-offset-4"
        >
          Retour au corpus
        </Link>
      </Page>
    );
  }

  const index = questions.findIndex((q) => q.id === question.id);
  const precedent = questions[index - 1];
  const suivant = questions[index + 1];
  const nomModele = (idModele: string) =>
    resultats?.modeles.find((m) => m.id === idModele)?.nom ?? idModele;

  // Classement des réponses de la meilleure à la moins bonne : la comparaison
  // est le sujet de la page, elle ne doit pas dépendre de l'ordre du fichier.
  const reponses = Object.entries(question.reponses_modeles).sort(
    (a, b) => b[1].score - a[1].score,
  );

  return (
    <Page>
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/questions" className="underline underline-offset-4 hover:text-foreground">
          Corpus
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-mono">{question.id}</span>
      </nav>

      <p className="etiquette mt-4">{LIBELLES_DOMAINES[question.domaine] ?? question.domaine}</p>
      <h1 className="mt-2 max-w-3xl text-2xl leading-snug sm:text-3xl">{question.question}</h1>
      <p className="mt-3 font-mono text-[11px] text-muted-foreground">
        {LIBELLES_TYPES[question.type] ?? question.type} ·{" "}
        {LIBELLES_DIFFICULTE[question.difficulte] ?? `difficulté ${question.difficulte}`}
      </p>

      {/* 1. La réponse attendue */}
      <section className="mt-10">
        <h2 className="border-b border-rule pb-2 text-lg">Réponse de référence</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">{question.reponse_reference}</p>
      </section>

      {/* 2. D'où elle sort */}
      <section className="mt-10">
        <h2 className="border-b border-rule pb-2 text-lg">Fondement juridique</h2>
        <Panneau className="mt-3 max-w-2xl p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="etiquette">Texte</dt>
              <dd className="mt-1.5 text-sm">{question.source.texte}</dd>
            </div>
            <div>
              <dt className="etiquette">Disposition</dt>
              <dd className="mt-1.5 text-sm">{question.source.article}</dd>
            </div>
          </dl>
          <div className="mt-4 border-t border-rule pt-4">
            <a
              href={question.source.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-accent underline underline-offset-4"
            >
              Consulter la source officielle ↗
            </a>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {question.source.precision === "article"
                ? "Le lien ouvre l'article cité."
                : "Le lien ouvre le texte consolidé, et non l'article cité directement : la disposition est à retrouver dans le sommaire."}
            </p>
          </div>
        </Panneau>
      </section>

      {/* 3. Ce que vaut cette citation */}
      <section className="mt-10">
        <h2 className="border-b border-rule pb-2 text-lg">Vérification de la source</h2>
        <div className="mt-3 max-w-2xl">
          <ExplicationVerification verification={question.verification} />
        </div>
      </section>

      {/* 4. Ce que les modèles en ont fait */}
      <section className="mt-12">
        <h2 className="border-b border-rule pb-2 text-lg">Réponses évaluées</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Chaque réponse est notée de 0 à 2 sur quatre axes — exactitude, sourcing, calibration,
          exploitabilité — dont la somme donne la note sur 10.{" "}
          <Link to="/methodologie" className="text-accent underline underline-offset-4">
            Voir le barème
          </Link>
          .
        </p>

        <ol className="mt-5 space-y-4">
          {reponses.map(([idModele, reponse]) => {
            const grave = reponse.flags.some(estGrave);
            return (
              <li
                key={idModele}
                className={`border bg-surface p-5 shadow-panneau ${
                  grave ? "border-accent/50" : "border-border"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <Link
                    to="/modele/$id"
                    params={{ id: idModele }}
                    className="font-medium underline decoration-border decoration-1 underline-offset-4 hover:text-accent hover:decoration-accent"
                  >
                    {nomModele(idModele)}
                  </Link>
                  <p className="font-mono text-lg tabulaire">
                    {nb(reponse.score)}
                    <span className="text-xs text-muted-foreground"> /10</span>
                  </p>
                </div>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {reponse.texte}
                </p>

                <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3 border-t border-rule pt-3">
                  {AXES.map((axe) => (
                    <div key={axe}>
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
