import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Chargement, Erreur, Page, Panneau, Section, Titre } from "@/components/finreg/Chrome";
import { GraphiqueDomaines } from "@/components/finreg/GraphiqueDomaines";
import { PastilleVerification } from "@/components/finreg/Statuts";
import {
  LIBELLES_DOMAINES,
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
      { title: "FinReg — mesurer ce que les modèles de langage savent de la réglementation" },
      {
        name: "description",
        content:
          "FinReg confronte les modèles de langage à des questions de réglementation financière dont la réponse et la source sont établies, et publie chaque note avec l'item qui la produit.",
      },
      {
        property: "og:title",
        content: "FinReg — mesurer ce que les modèles de langage savent de la réglementation",
      },
      {
        property: "og:description",
        content:
          "Un banc de mesure sur SFDR, MIF 2, AMF, DORA et LCB-FT : chaque note est rattachée à une question, une réponse de référence et un article.",
      },
    ],
  }),
  component: Accueil,
});

const COLONNES: { cle: CleTri; libelle: string; num: boolean }[] = [
  { cle: "rang", libelle: "Rang", num: true },
  { cle: "nom", libelle: "Système", num: false },
  { cle: "profil", libelle: "Profil", num: false },
  { cle: "score_global", libelle: "Score global", num: true },
  { cle: "taux_hallucination_source", libelle: "Source inventée (%)", num: true },
  { cle: "taux_abstention", libelle: "Abstention (%)", num: true },
];

/** Item mis en avant sur l'accueil : il montre la chaîne complète en un écran. */
const ITEM_VITRINE = "AMF-0010";

const CHAINE = [
  { etape: "Texte", detail: "Un règlement ou un code, à un article identifié." },
  { etape: "Question", detail: "Une question fermée dont la réponse est déterminée." },
  { etape: "Référence", detail: "La réponse attendue, rédigée à partir du texte." },
  { etape: "Vérification", detail: "La citation est contrôlée, ou signalée comme non établie." },
  { etape: "Note", detail: "Ce que le modèle a répondu, noté sur quatre axes." },
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
  const vitrine = questions?.find((q) => q.id === ITEM_VITRINE) ?? questions?.[0];
  const verifiees =
    questions?.filter((q) => q.verification.statut === "source_verifiee").length ?? 0;

  return (
    <Page>
      <Titre
        etiquette="Banc de mesure · France & Union européenne"
        titre="Ce qu'un modèle de langage sait vraiment de la réglementation financière"
        chapeau={
          <>
            Un assistant qui cite un article inexistant est inutilisable en conformité : sa réponse
            ne peut être ni vérifiée, ni opposée, ni archivée. FinReg confronte les modèles à des
            questions dont la réponse <em>et</em> la source sont établies, puis publie chaque note
            avec l'item qui l'a produite.
          </>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link
          to="/questions"
          className="border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          Ouvrir le corpus
        </Link>
        {vitrine && (
          <Link
            to="/question/$id"
            params={{ id: vitrine.id }}
            className="text-sm text-accent underline underline-offset-4"
          >
            Suivre un exemple de bout en bout
          </Link>
        )}
      </div>

      {/* --- Ce que le produit fait, avant tout chiffre --- */}
      <Section
        numero="01"
        titre="La chaîne mesurée"
        chapeau="Une note n'a de valeur que si l'on peut remonter à ce qui l'a produite. Chaque item du corpus tient les cinq maillons."
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

      {/* --- L'item vitrine : la chaîne sur un cas réel --- */}
      {vitrine && (
        <Section
          numero="02"
          titre="Un item, en entier"
          chapeau="Le corpus est public. Rien n'est résumé : la question, la réponse attendue, l'article dont elle sort et le contrôle de cette citation sont lisibles item par item."
        >
          <Panneau className="mt-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[11px] text-muted-foreground">{vitrine.id}</span>
              <PastilleVerification statut={vitrine.verification.statut} taille="petite" />
            </div>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed font-medium">
              {vitrine.question}
            </p>
            <dl className="mt-5 grid gap-5 border-t border-rule pt-5 sm:grid-cols-2">
              <div>
                <dt className="etiquette">Réponse de référence</dt>
                <dd className="mt-2 text-sm leading-relaxed">{vitrine.reponse_reference}</dd>
              </div>
              <div>
                <dt className="etiquette">Fondement</dt>
                <dd className="mt-2 text-sm leading-relaxed">
                  {vitrine.source.texte}
                  <br />
                  <span className="text-muted-foreground">{vitrine.source.article}</span>
                  <br />
                  <a
                    href={vitrine.source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-accent underline underline-offset-4"
                  >
                    consulter le texte
                  </a>
                </dd>
              </div>
            </dl>
            <Link
              to="/question/$id"
              params={{ id: vitrine.id }}
              className="mt-5 inline-block border border-border px-3 py-1.5 text-sm transition-colors hover:bg-surface-sunken"
            >
              Voir ce que chaque modèle a répondu →
            </Link>
          </Panneau>
        </Section>
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

      {data && meilleur && (
        <>
          <Section
            numero="03"
            titre="Ce que mesure l'échantillon"
            chapeau="Tous les chiffres de cette page sont recalculés à partir des items du corpus. Aucun n'est saisi à la main."
          >
            <Panneau className="mt-4 grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="p-6">
                <p className="etiquette">Réponses citant une source inventée</p>
                <p className="mt-4 font-mono text-6xl leading-none tracking-tighter tabulaire text-accent">
                  {nb(data.synthese.taux_hallucination_source)}
                  <span className="align-top text-xl"> %</span>
                </p>
                <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                  sur les {data.synthese.nb_reponses} réponses évaluées, l'article cité est
                  inexistant, abrogé ou étranger à la question.
                </p>
              </div>
              <div className="p-6">
                <p className="etiquette">Écart du meilleur au moins bon</p>
                <p className="mt-4 font-mono text-4xl leading-none tracking-tight tabulaire">
                  {nb(data.synthese.ecart_meilleur_moins_bon)}
                  <span className="text-base text-muted-foreground"> pts</span>
                </p>
                <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                  De {nb(meilleur.score_global)} à{" "}
                  {nb(trier(data.modeles, "score_global", true)[0]!.score_global)} sur 100 : le
                  choix du système pèse plus que celui du prompt.
                </p>
              </div>
              <div className="p-6">
                <p className="etiquette">Corpus publié</p>
                <p className="mt-4 font-mono text-4xl leading-none tracking-tight tabulaire">
                  {verifiees}
                  <span className="text-base text-muted-foreground"> / {data.nb_questions}</span>
                </p>
                <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                  items dont la citation a été contrôlée. Les autres sont publiés comme étant en
                  cours de vérification.
                </p>
              </div>
            </Panneau>
          </Section>

          <Section
            numero="04"
            titre="Classement"
            chapeau="Score global sur 100, moyenne des notes obtenues sur les items du corpus. Cliquez sur un en-tête pour trier."
          >
            <Panneau className="mt-4 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[48rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-rule bg-surface-sunken">
                      {COLONNES.map((c) => (
                        <th
                          key={c.cle}
                          scope="col"
                          className={`px-4 py-2.5 text-xs font-medium ${c.num ? "text-right" : "text-left"}`}
                          aria-sort={
                            cle === c.cle ? (ascendant ? "ascending" : "descending") : "none"
                          }
                        >
                          <button
                            type="button"
                            onClick={() => basculer(c.cle)}
                            className={`transition-colors hover:text-foreground ${
                              cle === c.cle ? "text-accent" : "text-muted-foreground"
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
                              to="/modele/$id"
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
              Un taux d'abstention élevé n'est pas un défaut en soi : un modèle qui refuse de
              répondre plutôt que d'inventer un article reste utilisable. Les deux dernières
              colonnes se lisent ensemble.
            </p>
          </Section>

          <Section
            numero="05"
            titre="Par domaine"
            chapeau={`Score sur 100 par domaine réglementaire. ${data.domaines
              .map((d) => LIBELLES_DOMAINES[d] ?? d)
              .join(" · ")}.`}
          >
            <GraphiqueDomaines modeles={data.modeles} domaines={data.domaines} />
          </Section>
        </>
      )}
    </Page>
  );
}
