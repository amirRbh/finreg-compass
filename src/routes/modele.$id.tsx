import { createFileRoute, Link } from "@tanstack/react-router";
import { Chargement, Erreur, Page } from "@/components/finreg/Chrome";
import {
  AXES,
  DOMAINES,
  LIBELLES_AXES,
  LIBELLES_FLAGS,
  LIBELLES_TYPES,
  echecsSignificatifs,
  nb,
  rangDe,
  useQuestions,
  useResultats,
} from "@/lib/finreg";

export const Route = createFileRoute("/modele/$id")({
  head: () => ({
    meta: [
      { title: "Fiche modèle — FinReg" },
      {
        name: "description",
        content:
          "Détail des scores d'un modèle par domaine réglementaire et par axe de notation, avec les échecs les plus significatifs cités in extenso.",
      },
      { property: "og:title", content: "Fiche modèle — FinReg" },
      {
        property: "og:description",
        content:
          "Scores par domaine, scores par axe et échecs les plus significatifs du modèle évalué.",
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
        <h1 className="text-3xl leading-tight sm:text-4xl">Modèle inconnu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aucun modèle ne correspond à l'identifiant <span className="font-mono">{id}</span>.
        </p>
        <Link to="/" className="mt-4 inline-block text-sm text-accent underline underline-offset-4">
          Retour au classement
        </Link>
      </Page>
    );
  }

  const echecs = questions ? echecsSignificatifs(questions, modele.id, 5) : [];

  return (
    <Page>
      <p className="font-mono text-[11px] text-muted-foreground">{modele.id}</p>
      <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">{modele.nom}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {modele.editeur} — rang {rangDe(resultats.modeles, modele.id)} sur{" "}
        {resultats.modeles.length}
      </p>

      <section className="mt-8 grid grid-cols-2 divide-border border border-border bg-surface shadow-panneau sm:grid-cols-4 sm:divide-x">
        <Metrique libelle="Score global" valeur={nb(modele.score_global)} unite="/100" />
        <Metrique
          libelle="Hallucination de source"
          valeur={nb(modele.taux_hallucination_source)}
          unite="%"
        />
        <Metrique
          libelle="Abstention correcte"
          valeur={nb(modele.taux_abstention_correcte)}
          unite="%"
        />
        <Metrique libelle="Écart-type inter-runs" valeur={nb(modele.ecart_type)} unite="pts" />
      </section>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="border-b border-rule pb-2 text-lg">Scores par domaine</h2>
          <table className="mt-3 w-full border-collapse text-sm">
            <tbody>
              {DOMAINES.map((d) => (
                <tr key={d} className="border-b border-border">
                  <td className="py-2 pr-4 font-mono text-xs">{d}</td>
                  <td className="py-2 pr-4">
                    <div className="h-1.5 w-full bg-muted">
                      <div
                        className="h-1.5 bg-accent"
                        style={{ width: `${modele.scores_domaines[d] ?? 0}%` }}
                      />
                    </div>
                  </td>
                  <td className="w-14 py-2 text-right font-mono">
                    {nb(modele.scores_domaines[d])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="border-b border-rule pb-2 text-lg">Scores par axe</h2>
          <table className="mt-3 w-full border-collapse text-sm">
            <tbody>
              {AXES.map((a) => (
                <tr key={a} className="border-b border-border">
                  <td className="py-2 pr-4">{LIBELLES_AXES[a]}</td>
                  <td className="py-2 pr-4">
                    <div className="h-1.5 w-full bg-muted">
                      <div
                        className="h-1.5 bg-accent"
                        style={{ width: `${((modele.scores_axes[a] ?? 0) / 2) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="w-16 py-2 text-right font-mono">
                    {nb(modele.scores_axes[a])} / 2
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            Moyenne par axe sur l'ensemble du corpus, échelle 0 à 2.
          </p>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="border-b border-rule pb-2 text-lg">Échecs les plus significatifs</h2>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Items cités in extenso, retenus sur la combinaison du score le plus faible et de la
          présence d'une hallucination de source.
        </p>
        {!questions && (
          <div className="mt-4">
            <Chargement libelle="Chargement du corpus…" />
          </div>
        )}
        {questions && echecs.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Aucun échec caractérisé sur les items publiés.
          </p>
        )}
        <ol className="mt-4 space-y-6">
          {echecs.map(({ question, reponse }) => (
            <li key={question.id} className="border-l-2 border-l-accent pl-4">
              <p className="font-mono text-[11px] text-muted-foreground">
                {question.id} · {question.domaine} ·{" "}
                {LIBELLES_TYPES[question.type] ?? question.type} · difficulté{" "}
                {question.difficulte} · score {nb(reponse.score)}
              </p>
              <p className="mt-2 max-w-2xl text-sm">{question.question}</p>
              <dl className="mt-3 max-w-2xl space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Réponse du modèle</dt>
                  <dd className="mt-1 leading-relaxed">{reponse.texte}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Réponse de référence</dt>
                  <dd className="mt-1 leading-relaxed text-muted-foreground">
                    {question.reponse_reference}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Source attendue</dt>
                  <dd className="mt-1">
                    {question.source.texte} — {question.source.article}{" "}
                    <a
                      href={question.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-accent underline underline-offset-4"
                    >
                      consulter
                    </a>
                  </dd>
                </div>
              </dl>
              {reponse.flags.length > 0 && (
                <p className="mt-2 font-mono text-[11px] text-accent">
                  {reponse.flags.map((f) => LIBELLES_FLAGS[f] ?? f).join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <Link to="/" className="mt-10 inline-block text-sm text-accent underline underline-offset-4">
        Retour au classement
      </Link>
    </Page>
  );
}

function Metrique({
  libelle,
  valeur,
  unite,
}: {
  libelle: string;
  valeur: string;
  unite: string;
}) {
  return (
    <div className="border-b border-border p-5 last:border-b-0 sm:border-b-0">
      <p className="etiquette">{libelle}</p>
      <p className="mt-3 font-mono text-2xl tracking-tight tabulaire">
        {valeur}
        <span className="ml-1 text-xs text-muted-foreground">{unite}</span>
      </p>
    </div>
  );
}
