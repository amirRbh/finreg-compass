import { createFileRoute, Link } from "@tanstack/react-router";
import { Chargement, Erreur, Page, Section, Titre } from "@/components/finreg/Chrome";
import { PastilleVerification } from "@/components/finreg/Statuts";
import {
  AXES,
  libelles,
  echecsSignificatifs,
  nb,
  rangDe,
  useQuestions,
  useResultats,
  texteAffiche,
} from "@/lib/finreg";
import { useLangue } from "@/lib/langue";

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
  const { langue, t } = useLangue();
  const L = libelles(langue);

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
        <h1 className="text-3xl leading-tight sm:text-4xl">
          {t("Unknown system", "Système inconnu")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("No evaluated system carries the identifier ", "Aucun système évalué ne porte l'identifiant ")}
          <span className="font-mono">{id}</span>.
        </p>
        <Link to="/" className="mt-4 inline-block text-sm text-accent underline underline-offset-4">
          {t("Back to the benchmark", "Retour au classement")}
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
            {modele.profil} · {t("ranked", "classé")}{" "}
            <span className="font-mono tabulaire">{rangDe(resultats.modeles, modele.id)}</span>{" "}
            {t("of", "sur")}{" "}
            <span className="font-mono tabulaire">{resultats.modeles.length}</span>{" "}
            {t("systems evaluated", "systèmes évalués")}
          </>
        }
      />

      <section className="mt-10 grid grid-cols-2 gap-px bg-rule sm:grid-cols-4">
        <Metrique
          libelle={t("Regulatory accuracy", "Exactitude réglementaire")}
          valeur={nb(modele.score_global)}
          unite="/100"
        />
        <Metrique
          libelle={t("Invented source", "Source inventée")}
          valeur={nb(modele.taux_hallucination_source)}
          unite="%"
        />
        <Metrique
          libelle={t("Disqualifying error", "Erreur disqualifiante")}
          valeur={nb(modele.taux_erreur_disqualifiante)}
          unite="%"
        />
        <Metrique
          libelle={t("Declined to answer", "Abstention")}
          valeur={nb(modele.taux_abstention)}
          unite="%"
        />
      </section>

      <div className="grid gap-x-12 md:grid-cols-2">
        <Section numero="01" titre={t("By regulation", "Par réglementation")}>
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
            {t(
              "Average item score per regulation, out of 100.",
              "Note moyenne par réglementation, sur 100.",
            )}
          </p>
        </Section>

        <Section numero="02" titre={t("By scoring axis", "Par axe de notation")}>
          <table className="mt-4 w-full border-collapse text-sm">
            <tbody>
              {AXES.map((a) => (
                <tr key={a} className="border-b border-border">
                  <td className="py-2.5 pr-4">{L.axes[a]}</td>
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
            {t(
              "Average per axis across the whole corpus, on a 0 to 2 scale.",
              "Moyenne par axe sur tout le corpus, sur une échelle de 0 à 2.",
            )}
          </p>
        </Section>
      </div>

      <Section
        numero="03"
        titre={t("Most significant failures", "Échecs les plus significatifs")}
        chapeau={t(
          "Items quoted in full, selected on the combination of lowest score and the presence of an invented source.",
          "Items cités in extenso, retenus sur la combinaison de la note la plus basse et de la présence d'une source inventée.",
        )}
      >
        {!questions && (
          <div className="mt-4">
            <Chargement libelle={t("Loading the corpus…", "Chargement du corpus…")} />
          </div>
        )}
        {questions && echecs.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t(
              "No characterised failure on the published items.",
              "Aucun échec caractérisé sur les items publiés.",
            )}
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
                  · {L.domainesCourts[question.domaine] ?? question.domaine} ·{" "}
                  {L.types[question.type] ?? question.type} · {t("level", "niveau")}{" "}
                  {question.difficulte} · {t("score", "note")} {nb(reponse.score)}
                </span>
                <PastilleVerification statut={question.verification.statut} taille="petite" />
              </p>
              <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed">{question.question}</p>
              <dl className="mt-4 max-w-2xl space-y-3 text-sm">
                <div>
                  <dt className="etiquette">{t("What it answered", "Ce qu'il a répondu")}</dt>
                  <dd className="mt-1.5 leading-relaxed">{texteAffiche(reponse.texte)}</dd>
                </div>
                <div>
                  <dt className="etiquette">{t("What the law says", "Ce que dit le texte")}</dt>
                  <dd className="mt-1.5 leading-relaxed text-muted-foreground">
                    {question.reponse_reference}
                  </dd>
                </div>
                <div>
                  <dt className="etiquette">{t("Legal basis", "Fondement juridique")}</dt>
                  <dd className="mt-1.5">
                    {question.source.texte} — {question.source.article}{" "}
                    <a
                      href={question.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-accent underline underline-offset-4"
                    >
                      {t("open ↗", "ouvrir ↗")}
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
                      {L.flags[f] ?? f}
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
        ← {t("Back to the benchmark", "Retour au classement")}
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
