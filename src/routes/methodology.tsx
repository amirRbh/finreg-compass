import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, Panneau, Section, Titre } from "@/components/finreg/Chrome";
import { dateFr, libelles, useQuestions, useResultats } from "@/lib/finreg";
import { useLangue } from "@/lib/langue";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — FinReg" },
      {
        name: "description",
        content:
          "What FinReg tests, what counts as a correct answer, how answers are scored, how legal sources are verified, and what has actually been measured so far.",
      },
      { property: "og:title", content: "Methodology — FinReg" },
      {
        property: "og:description",
        content:
          "Scoring rubric, verification statuses, run protocol, published system prompt, and the current limitations stated plainly.",
      },
    ],
  }),
  component: Methodologie,
});

/**
 * Le prompt système est publié tel qu'il est envoyé aux modèles : il n'est pas
 * traduit, sinon la page ne décrirait plus l'exécution réelle.
 */
const PROMPT = `You are answering questions on French and European Union
financial regulation.

Rules:
1. Answer only on the basis of texts applicable at the stated date.
   Do not rely on any repealed text.
2. Always cite the source: title of the act, article number, and where
   relevant the delegated act or the position of the supervisory authority.
3. Never cite a reference you are not certain exists. Where you are unsure
   of a reference, say so explicitly: "reference not verifiable".
4. Where the question cannot be settled without a further element of fact,
   state the applicable rule and then the missing condition.
5. If you do not know, answer "I cannot answer this reliably" without
   presenting a hypothesis as law.
6. Expected format: three parts — Qualification, Legal basis, Caveats.
   No more than 250 words.`;

const BAREME: { axe: string; critere: string; critereFr: string }[] = [
  {
    axe: "exactitude",
    critere:
      "2 — the rule stated is the one the applicable text lays down, completely. 1 — right in principle, incomplete or imprecise. 0 — wrong, or based on a text that does not apply.",
    critereFr:
      "2 — la règle énoncée est bien celle que pose le texte applicable, complètement. 1 — juste dans le principe, incomplète ou imprécise. 0 — fausse, ou fondée sur un texte qui ne s'applique pas.",
  },
  {
    axe: "sourcing",
    critere:
      "2 — act and article exact, level 1 and level 2 distinguished. 1 — real reference but imprecise or partial. 0 — reference non-existent, repealed, or off point.",
    critereFr:
      "2 — texte et article exacts, niveau 1 et niveau 2 distingués. 1 — référence réelle mais imprécise ou partielle. 0 — référence inexistante, abrogée ou hors sujet.",
  },
  {
    axe: "calibration",
    critere:
      "2 — caveats explicit and warranted, declines to answer where that is the right call. 1 — overconfident but no factual error. 0 — categorical and wrong.",
    critereFr:
      "2 — réserves explicites et justifiées, s'abstient quand c'est la bonne réponse. 1 — trop assuré, mais sans erreur factuelle. 0 — catégorique et faux.",
  },
  {
    axe: "exploitabilite",
    critere:
      "2 — structure respected, conditions and deadlines explicit. 1 — usable after rework. 0 — unusable or off format.",
    critereFr:
      "2 — structure respectée, conditions et délais explicites. 1 — exploitable après reprise. 0 — inexploitable ou hors format.",
  },
];

const SOMMAIRE = [
  { id: "tests", numero: "01", titre: "What FinReg tests", titreFr: "Ce que FinReg mesure" },
  {
    id: "correct",
    numero: "02",
    titre: "What counts as correct",
    titreFr: "Ce qui compte comme juste",
  },
  { id: "scoring", numero: "03", titre: "How answers are scored", titreFr: "Comment on note" },
  {
    id: "sources",
    numero: "04",
    titre: "How sources are verified",
    titreFr: "Vérification des sources",
  },
  { id: "protocol", numero: "05", titre: "Run protocol", titreFr: "Protocole d'exécution" },
  { id: "dataset", numero: "06", titre: "What has been measured", titreFr: "Ce qui a été mesuré" },
  { id: "limits", numero: "07", titre: "Current limitations", titreFr: "Limites actuelles" },
  { id: "prompt", numero: "08", titre: "System prompt", titreFr: "Prompt système" },
];

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 max-w-[38rem] space-y-3 text-[15px] leading-relaxed">{children}</div>;
}

function Methodologie() {
  const [copie, setCopie] = useState(false);
  const { data: questions } = useQuestions();
  const { data: resultats } = useResultats();
  const { langue, t } = useLangue();
  const L = libelles(langue);
  const fr = langue === "fr";

  // Les effectifs cités dans le texte sont lus dans les données publiées : une
  // méthodologie qui annoncerait un corpus plus large que celui qu'elle publie
  // se réfuterait elle-même.
  const nbQuestions = questions?.length ?? resultats?.nb_questions ?? 0;
  const nbEnRevue = questions?.filter((q) => q.verification.statut === "en_revue").length ?? 0;
  const nbSystemes = resultats?.modeles.length ?? 0;

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT);
      setCopie(true);
      window.setTimeout(() => setCopie(false), 2000);
    } catch {
      setCopie(false);
    }
  };

  const limites = [
    {
      t: t("Size", "Taille"),
      d: t(
        `${nbQuestions} items do not cover French and European financial regulation. A gap of a few points between two systems would not be significant at this scale. What does read at this scale are differences in kind — a system that invents articles against one that declines to answer.`,
        `${nbQuestions} items ne couvrent pas la réglementation financière française et européenne. Un écart de quelques points entre deux systèmes ne serait pas significatif à cette échelle. Ce qui se lit à cette échelle, ce sont les différences de nature — un système qui invente des articles face à un système qui s'abstient.`,
      ),
    },
    {
      t: t("Scope", "Périmètre"),
      d: t(
        "Results describe systems answering from internal knowledge. They do not transfer to a retrieval-augmented system, where the quality of the indexed corpus dominates.",
        "Les résultats décrivent des systèmes qui répondent sur leur connaissance interne. Ils ne se transposent pas à un système à recherche augmentée, où la qualité du corpus indexé domine.",
      ),
    },
    {
      t: t("Contamination", "Contamination"),
      d: t(
        "The corpus is public, so a system trained on these pages may have seen them. That is the reason for the private benchmark.",
        "Le corpus est public : un système entraîné sur ces pages a pu les voir. C'est la raison d'être du benchmark privé.",
      ),
    },
    {
      t: t("Scoring", "Notation"),
      d: t(
        "Scores are assigned by a judge model against the expected answer and its verified source, not by a lawyer reviewing each answer. Every answer is published in full so that any score can be contested on the item page.",
        "Les notes sont attribuées par un modèle juge, au regard de la réponse de référence et de sa source vérifiée, et non par un juriste relisant chaque réponse. Chaque réponse est publiée intégralement afin que toute note puisse être contestée sur la page de l'item.",
      ),
    },
    {
      t: t("Single run", "Une seule exécution"),
      d: t(
        "Each item was put once to each system, so the figures include the variance of a single sample rather than averaging it out.",
        "Chaque item a été posé une fois à chaque système : les chiffres incluent donc la variance d'un tirage unique au lieu de la moyenner.",
      ),
    },
    {
      t: t("Standing", "Portée"),
      d: t(
        "Scores are not a guarantee of compliance, and neither the benchmark nor the expected answers replace legal validation.",
        "Les notes ne garantissent aucune conformité, et ni le benchmark ni les réponses de référence ne remplacent une validation juridique.",
      ),
    },
  ];

  return (
    <Page>
      <Titre
        etiquette={t("Protocol · public version", "Protocole · version publique")}
        titre={t("Methodology", "Méthodologie")}
        chapeau={t(
          "Everything the figures on this site rest on: what is asked, what counts as a right answer, how it is scored, and what the measurement does not establish.",
          "Tout ce sur quoi reposent les chiffres de ce site : ce qui est demandé, ce qui compte comme bonne réponse, comment c'est noté, et ce que la mesure n'établit pas.",
        )}
      />

      <nav
        aria-label={t("Sections", "Sommaire")}
        className="mt-10 border-y border-rule bg-surface-sunken"
      >
        <ol className="grid grid-cols-1 divide-y divide-rule sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
          {SOMMAIRE.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="flex items-baseline gap-2.5 px-4 py-2.5 transition-colors hover:bg-surface"
              >
                <span className="font-mono text-[11px] tracking-[0.08em] text-accent">
                  {s.numero}
                </span>
                <span className="text-[13px] leading-snug">{fr ? s.titreFr : s.titre}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div id="tests" className="scroll-mt-24">
        <Section numero="01" titre={t("What FinReg tests", "Ce que FinReg mesure")}>
          <Prose>
            <p>
              {t(
                "Whether an AI system, asked a regulatory question, states the rule the applicable text actually lays down — and whether the source it cites for that rule exists and says so.",
                "Si un système d'IA, interrogé sur une question réglementaire, énonce bien la règle que pose le texte applicable — et si la source qu'il cite pour cette règle existe et dit bien cela.",
              )}
            </p>
            <p>
              {t(
                "FinReg treats a citation to a non-existent or inapplicable source as a failure distinct from an error of substance. A correct answer resting on an imaginary article is unusable in compliance: it cannot be checked, relied on, or filed. Fluency, tone and summarising ability are not measured.",
                "FinReg traite la citation d'une source inexistante ou inapplicable comme un échec distinct de l'erreur de fond. Une réponse juste appuyée sur un article imaginaire est inexploitable en conformité : elle ne peut être vérifiée, invoquée ni archivée. La fluidité, le ton et la capacité de synthèse ne sont pas mesurés.",
              )}
            </p>
          </Prose>
        </Section>
      </div>

      <div id="correct" className="scroll-mt-24">
        <Section
          numero="02"
          titre={t("What counts as a correct answer", "Ce qui compte comme bonne réponse")}
        >
          <Prose>
            <p>
              {t(
                "Every question is closed and has a determinate answer under the text in force. The expected answer is drafted from the text itself and published alongside the question, so that a reader can disagree with it against the source rather than on trust.",
                "Chaque question est fermée et admet une réponse déterminée au regard du texte en vigueur. La réponse de référence est rédigée depuis le texte lui-même et publiée à côté de la question, afin qu'un lecteur puisse la contester face à la source plutôt que sur parole.",
              )}
            </p>
            <p>
              {t(
                "The corpus covers five domains — SFDR, MiFID II, market abuse and issuer obligations, DORA and AML/CFT — at three levels of difficulty: direct application of an explicit rule, two provisions combined, and questions of scope or timing that turn on an exception.",
                "Le corpus couvre cinq domaines — SFDR, MiFID II, abus de marché et obligations des émetteurs, DORA et LCB-FT — à trois niveaux de difficulté : application directe d'une règle explicite, combinaison de deux dispositions, et questions de périmètre ou de calendrier qui basculent sur une exception.",
              )}
            </p>
          </Prose>
        </Section>
      </div>

      <div id="scoring" className="scroll-mt-24">
        <Section numero="03" titre={t("How answers are scored", "Comment les réponses sont notées")}>
          <Prose>
            <p>
              {t(
                "Four axes, each scored 0 to 2. Their sum, out of 8, is rebased to a score out of 10. A system’s regulatory accuracy is the average of its item scores, out of 100.",
                "Quatre axes, chacun noté de 0 à 2. Leur somme, sur 8, est ramenée à une note sur 10. L'exactitude réglementaire d'un système est la moyenne de ses notes d'items, sur 100.",
              )}
            </p>
          </Prose>

          <div className="-mx-5 mt-6 overflow-x-auto px-5">
            <table className="zebre w-full min-w-[40rem] border-collapse text-sm">
              <thead>
                <tr className="border-y border-foreground/60 bg-surface-sunken">
                  <th scope="col" className="entete-col px-3 py-2.5 text-left">
                    {t("Axis", "Axe")}
                  </th>
                  <th scope="col" className="entete-col px-3 py-2.5 text-left">
                    {t("Question it answers", "Question posée")}
                  </th>
                  <th scope="col" className="entete-col px-3 py-2.5 text-left">
                    {t("Scale", "Barème")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {BAREME.map((l) => (
                  <tr key={l.axe} className="border-b border-border align-top">
                    <td className="px-3 py-3 whitespace-nowrap">{L.axes[l.axe]}</td>
                    <td className="px-3 py-3 text-muted-foreground">{L.explicationsAxes[l.axe]}</td>
                    <td className="px-3 py-3 text-[13px] leading-relaxed text-muted-foreground">
                      {fr ? l.critereFr : l.critere}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Prose>
            <p>
              {t("Two rates are reported alongside the score.", "Deux taux accompagnent la note.")}{" "}
              <span className="font-medium">{t("Invented source", "Source inventée")}</span>{" "}
              {t(
                "is the share of answers citing a reference that is non-existent, repealed or foreign to the question.",
                "désigne la part des réponses citant une référence inexistante, abrogée ou étrangère à la question.",
              )}{" "}
              <span className="font-medium">{t("Declined", "Abstention")}</span>{" "}
              {t(
                "is the share of answers where the system refuses to answer rather than advancing a rule — not a defect in itself, and the counterpart of the first.",
                "désigne la part des réponses où le système refuse de répondre plutôt que d'avancer une règle — ce n'est pas un défaut en soi, et c'est la contrepartie du premier taux.",
              )}
            </p>
          </Prose>
        </Section>
      </div>

      <div id="sources" className="scroll-mt-24">
        <Section
          numero="04"
          titre={t("How legal sources are verified", "Comment les sources sont vérifiées")}
          chapeau={t(
            "Each item carries a status describing the state of the check on its citation, and nothing else.",
            "Chaque item porte un statut qui décrit l'état du contrôle de sa citation, et rien d'autre.",
          )}
        >
          <Prose>
            <p>
              <span className="font-medium">{t("Verified", "Source vérifiée")}</span>{" "}
              {t(
                "— the cited act and article were checked: they exist and carry the rule stated in the expected answer. The check covers the citation. It is not legal advice and says nothing about how the rule applies to a particular set of facts.",
                "— le texte et l'article cités ont été contrôlés : ils existent et portent bien la règle énoncée dans la réponse de référence. Le contrôle porte sur la citation. Ce n'est pas un conseil juridique et cela ne dit rien de l'application de la règle à une situation de fait.",
              )}
            </p>
            <p>
              <span className="font-medium">{t("Under review", "En revue")}</span>{" "}
              {t(
                `— the rule has been identified and the expected answer is published, but it is not yet tied to a specific article: the provision sits in a delegated act not yet identified, in a regulatory part whose numbering remains to be confirmed, or in a national transposition still to be checked. Of the ${nbQuestions} items published, ${nbEnRevue} are in this position. They stay visible, with the exact reason stated, rather than being withdrawn or promoted to verified.`,
                `— la règle est identifiée et la réponse de référence est publiée, mais elle n'est pas encore rattachée à un article précis : la disposition se trouve dans un acte délégué non encore identifié, dans une partie réglementaire dont la numérotation reste à confirmer, ou dans une transposition nationale encore à contrôler. Sur les ${nbQuestions} items publiés, ${nbEnRevue} sont dans ce cas. Ils restent visibles, avec le motif exact indiqué, plutôt que retirés ou promus au rang de vérifiés.`,
              )}
            </p>
            <p>
              {t(
                "No item reaches the first category without the check having been done. A corpus that presented unchecked citations as verified would be measuring hallucination with an instrument that hallucinates.",
                "Aucun item n'atteint la première catégorie sans que le contrôle ait été fait. Un corpus qui présenterait des citations non contrôlées comme vérifiées mesurerait l'hallucination avec un instrument qui hallucine.",
              )}
            </p>
          </Prose>
        </Section>
      </div>

      <div id="protocol" className="scroll-mt-24">
        <Section numero="05" titre={t("Run protocol", "Protocole d'exécution")}>
          <Prose>
            <p>
              {t(
                "Each question is put to the system in an independent session, with no history, no search tool and no document access. Sampling is left at temperature 0.2 where the model accepts it, and at the provider default where it does not. Answers are capped at 250 words. No example is supplied in the prompt: the measurement is of the system’s internal knowledge, not of its retrieval ability.",
                "Chaque question est posée au système dans une session indépendante, sans historique, sans outil de recherche et sans accès documentaire. L'échantillonnage est fixé à une température de 0,2 quand le modèle l'accepte, et laissé au réglage par défaut du fournisseur sinon. Les réponses sont plafonnées à 250 mots. Aucun exemple n'est fourni dans le prompt : c'est la connaissance interne du système qui est mesurée, pas sa capacité de recherche.",
              )}
            </p>
            <p>
              {t(
                "Every answer is then scored by an independent judge model",
                "Chaque réponse est ensuite notée par un modèle juge indépendant",
              )}
              {resultats?.juge ? <span className="font-mono"> ({resultats.juge})</span> : null}
              {t(
                ", which receives the question, the expected answer and the verified source, and returns the four axis scores, the flags and a written appreciation. The judge never sees the other systems’ answers, nor which system produced the one it is scoring.",
                ", qui reçoit la question, la réponse de référence et la source vérifiée, et restitue les quatre notes d'axe, les drapeaux et une appréciation rédigée. Le juge ne voit jamais les réponses des autres systèmes, ni quel système a produit celle qu'il note.",
              )}
            </p>
          </Prose>
        </Section>
      </div>

      <div id="dataset" className="scroll-mt-24">
        <Section
          numero="06"
          titre={t("What has actually been measured", "Ce qui a réellement été mesuré")}
        >
          <Prose>
            <p>
              {t(
                `${nbSystemes} named systems were put to the ${nbQuestions} published items on `,
                `${nbSystemes} systèmes nommés ont été confrontés aux ${nbQuestions} items publiés le `,
              )}
              {resultats ? dateFr(resultats.date_execution, langue) : t("the run date", "jour du run")}
              {t(", for ", ", soit ")}
              {resultats?.synthese.nb_reponses ?? nbSystemes * nbQuestions}
              {t(
                " scored answers. Answers are published in full on each item page: the text shown next to a score is the text the model actually returned, not a summary of it.",
                " réponses notées. Les réponses sont publiées intégralement sur la page de chaque item : le texte affiché à côté d'une note est celui que le modèle a réellement renvoyé, pas un résumé.",
              )}
            </p>
            <p>
              {t(
                "Every figure on the site — regulatory accuracy, invented-source rate, declined rate, scores by regulation and by axis — is recomputed from those item-level answers: no aggregate is typed by hand, and any figure shown can be reconstructed from the corpus pages. The harness, the system prompt and the judge prompt are published with the corpus, so the run can be replicated.",
                "Tous les chiffres du site — exactitude réglementaire, taux de source inventée, taux d'abstention, notes par réglementation et par axe — sont recalculés depuis ces réponses item par item : aucun agrégat n'est saisi à la main, et tout chiffre affiché peut être reconstitué depuis les pages du corpus. Le harnais, le prompt système et le prompt du juge sont publiés avec le corpus, afin que l'exécution puisse être répliquée.",
              )}
            </p>
          </Prose>
        </Section>
      </div>

      <div id="limits" className="scroll-mt-24">
        <Section
          numero="07"
          titre={t("Current limitations", "Limites actuelles")}
          chapeau={t(
            "Stated here rather than left for a reader to discover against the data.",
            "Énoncées ici plutôt que laissées à la découverte du lecteur face aux données.",
          )}
        >
          <div className="mt-6 grid gap-px bg-rule sm:grid-cols-2">
            {limites.map((l) => (
              <div key={l.t} className="bg-surface p-5">
                <p className="etiquette">{l.t}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{l.d}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div id="prompt" className="scroll-mt-24">
        <Section
          numero="08"
          titre={t("System prompt", "Prompt système")}
          chapeau={t(
            "Identical for every system and every run, and published in full so that a run can be replicated.",
            "Identique pour tous les systèmes et toutes les exécutions, publié intégralement afin qu'un run puisse être répliqué. Il est envoyé en anglais : il est reproduit ici tel quel.",
          )}
        >
          <Panneau className="mt-6">
            <div className="flex items-center justify-between border-b border-rule bg-surface-sunken px-4 py-2">
              <span className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                system_prompt.txt
              </span>
              <button
                type="button"
                onClick={copier}
                className="border border-border px-2 py-0.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
              >
                {copie ? t("Copied", "Copié") : t("Copy", "Copier")}
              </button>
            </div>
            <pre className="overflow-x-auto px-4 py-4 font-mono text-xs leading-relaxed whitespace-pre">
              {PROMPT}
            </pre>
          </Panneau>
        </Section>
      </div>
    </Page>
  );
}
