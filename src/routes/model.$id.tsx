import { createFileRoute, Link } from "@tanstack/react-router";
import { Chargement, Erreur, Page, Section, Titre } from "@/components/finreg/Chrome";
import { PastilleVerification } from "@/components/finreg/Statuts";
import {
  AXES,
  LIBELLES_AXES,
  LIBELLES_FLAGS,
  LIBELLES_TYPES,
  NOMS_COURTS_DOMAINES,
  echecsSignificatifs,
  nb,
  rangDe,
  useQuestions,
  useResultats,
  texteAffiche,
} from "@/lib/finreg";

export const Route = createFileRoute("/model/$id")({
  head: () => ({
    meta: [
      { title: "System profile — FinReg" },
      {
        name: "description",
        content:
          "Scores for one system by regulation and by scoring axis, with its most significant failures quoted in full.",
      },
      { property: "og:title", content: "System profile — FinReg" },
      {
        property: "og:description",
        content:
          "Scores by regulation, by scoring axis, and the system's most significant failures.",
      },
    ],
  }),
  component: FicheModele,
});

function FicheModele() {
  const { id } = Route.useParams();
  const { data: resultats, isPending, isError } = useResultats();
  const { data: questions } = useQuestions();

  if (isPending) {
    return (
      <Page>
        <Chargement />
      </Page>
    );
  }
  if (isError || !resultats) {
    return (
      <Page>
        <Erreur />
      </Page>
    );
  }

  const modele = resultats.modeles.find((m) => m.id === id);
  if (!modele) {
    return (
      <Page>
        <h1 className="text-3xl leading-tight sm:text-4xl">Unknown system</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No evaluated system carries the identifier <span className="font-mono">{id}</span>.
        </p>
        <Link to="/" className="mt-4 inline-block text-sm text-accent underline underline-offset-4">
          Back to the benchmark
        </Link>
      </Page>
    );
  }

  const echecs = questions ? echecsSignificatifs(questions, modele.id, 5) : [];

  return (
    <Page>
      <Titre
        etiquette={modele.id}
        titre={modele.nom}
        chapeau={
          <>
            {modele.profil} · ranked{" "}
            <span className="font-mono tabulaire">{rangDe(resultats.modeles, modele.id)}</span> of{" "}
            <span className="font-mono tabulaire">{resultats.modeles.length}</span> systems evaluated
          </>
        }
      />

      <section className="mt-10 grid grid-cols-2 gap-px bg-rule sm:grid-cols-4">
        <Metrique libelle="Regulatory accuracy" valeur={nb(modele.score_global)} unite="/100" />
        <Metrique
          libelle="Invented source"
          valeur={nb(modele.taux_hallucination_source)}
          unite="%"
        />
        <Metrique
          libelle="Disqualifying error"
          valeur={nb(modele.taux_erreur_disqualifiante)}
          unite="%"
        />
        <Metrique libelle="Declined to answer" valeur={nb(modele.taux_abstention)} unite="%" />
      </section>

      <div className="grid gap-x-12 md:grid-cols-2">
        <Section numero="01" titre="By regulation">
          <table className="mt-4 w-full border-collapse text-sm">
            <tbody>
              {resultats.domaines.map((d) => (
                <tr key={d} className="border-b border-border">
                  <td className="py-2.5 pr-4 font-mono text-[11px] tracking-[0.04em]">{d}</td>
                  <td className="py-2.5 pr-4">
                    <div className="h-[3px] w-full bg-surface-sunken">
                      <div
                        className="h-[3px] bg-accent"
                        style={{ width: `${modele.scores_domaines[d] ?? 0}%` }}
                      />
                    </div>
                  </td>
                  <td className="w-14 py-2.5 text-right font-mono tabulaire">
                    {nb(modele.scores_domaines[d])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2.5 font-mono text-[11px] text-muted-foreground">
            Average item score per regulation, out of 100.
          </p>
        </Section>

        <Section numero="02" titre="By scoring axis">
          <table className="mt-4 w-full border-collapse text-sm">
            <tbody>
              {AXES.map((a) => (
                <tr key={a} className="border-b border-border">
                  <td className="py-2.5 pr-4">{LIBELLES_AXES[a]}</td>
                  <td className="py-2.5 pr-4">
                    <div className="h-[3px] w-full bg-surface-sunken">
                      <div
                        className="h-[3px] bg-accent"
                        style={{ width: `${((modele.scores_axes[a] ?? 0) / 2) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="w-16 py-2.5 text-right font-mono tabulaire">
                    {nb(modele.scores_axes[a])} / 2
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2.5 font-mono text-[11px] text-muted-foreground">
            Average per axis across the whole corpus, on a 0 to 2 scale.
          </p>
        </Section>
      </div>

      <Section
        numero="03"
        titre="Most significant failures"
        chapeau="Items quoted in full, selected on the combination of lowest score and the presence of an invented source."
      >
        {!questions && (
          <div className="mt-4">
            <Chargement libelle="Loading the corpus…" />
          </div>
        )}
        {questions && echecs.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            No characterised failure on the published items.
          </p>
        )}
        <ol className="mt-6 space-y-8">
          {echecs.map(({ question, reponse }) => (
            <li key={question.id} className="filet-accent">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
                <Link
                  to="/question/$id"
                  params={{ id: question.id }}
                  className="text-accent underline underline-offset-4"
                >
                  {question.id}
                </Link>
                <span className="tabulaire">
                  · {NOMS_COURTS_DOMAINES[question.domaine] ?? question.domaine} ·{" "}
                  {LIBELLES_TYPES[question.type] ?? question.type} · level {question.difficulte} ·
                  score {nb(reponse.score)}
                </span>
                <PastilleVerification statut={question.verification.statut} taille="petite" />
              </p>
              <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed">{question.question}</p>
              <dl className="mt-4 max-w-2xl space-y-3 text-sm">
                <div>
                  <dt className="etiquette">What it answered</dt>
                  <dd className="mt-1.5 leading-relaxed">{texteAffiche(reponse.texte)}</dd>
                </div>
                <div>
                  <dt className="etiquette">What the law says</dt>
                  <dd className="mt-1.5 leading-relaxed text-muted-foreground">
                    {question.reponse_reference}
                  </dd>
                </div>
                <div>
                  <dt className="etiquette">Legal basis</dt>
                  <dd className="mt-1.5">
                    {question.source.texte} — {question.source.article}{" "}
                    <a
                      href={question.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-accent underline underline-offset-4"
                    >
                      open ↗
                    </a>
                  </dd>
                </div>
              </dl>
              {reponse.flags.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {reponse.flags.map((f) => (
                    <li
                      key={f}
                      className="border border-accent/40 bg-accent-soft px-2 py-0.5 font-mono text-[10px] tracking-[0.06em] text-accent uppercase"
                    >
                      {LIBELLES_FLAGS[f] ?? f}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Link
        to="/"
        className="mt-14 inline-block font-mono text-[11px] tracking-[0.08em] text-accent uppercase underline underline-offset-4"
      >
        ← Back to the benchmark
      </Link>
    </Page>
  );
}

function Metrique({ libelle, valeur, unite }: { libelle: string; valeur: string; unite: string }) {
  return (
    <div className="bg-surface p-5">
      <p className="etiquette">{libelle}</p>
      <p className="mt-3 font-mono text-[1.6rem] leading-none tracking-tight tabulaire">
        {valeur}
        <span className="ml-1 text-xs text-muted-foreground">{unite}</span>
      </p>
    </div>
  );
}
