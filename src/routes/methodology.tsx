import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, Panneau, Section, Titre } from "@/components/finreg/Chrome";
import { dateFr, EXPLICATIONS_AXES, LIBELLES_AXES, useQuestions, useResultats } from "@/lib/finreg";

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

const BAREME = [
  {
    axe: "exactitude",
    critere:
      "2 — the rule stated is the one the applicable text lays down, completely. 1 — right in principle, incomplete or imprecise. 0 — wrong, or based on a text that does not apply.",
  },
  {
    axe: "sourcing",
    critere:
      "2 — act and article exact, level 1 and level 2 distinguished. 1 — real reference but imprecise or partial. 0 — reference non-existent, repealed, or off point.",
  },
  {
    axe: "calibration",
    critere:
      "2 — caveats explicit and warranted, declines to answer where that is the right call. 1 — overconfident but no factual error. 0 — categorical and wrong.",
  },
  {
    axe: "exploitabilite",
    critere:
      "2 — structure respected, conditions and deadlines explicit. 1 — usable after rework. 0 — unusable or off format.",
  },
];

const SOMMAIRE = [
  { id: "tests", numero: "01", titre: "What FinReg tests" },
  { id: "correct", numero: "02", titre: "What counts as correct" },
  { id: "scoring", numero: "03", titre: "How answers are scored" },
  { id: "sources", numero: "04", titre: "How sources are verified" },
  { id: "protocol", numero: "05", titre: "Run protocol" },
  { id: "dataset", numero: "06", titre: "What has been measured" },
  { id: "limits", numero: "07", titre: "Current limitations" },
  { id: "prompt", numero: "08", titre: "System prompt" },
];

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 max-w-[38rem] space-y-3 text-[15px] leading-relaxed">{children}</div>;
}

function Methodologie() {
  const [copie, setCopie] = useState(false);
  const { data: questions } = useQuestions();
  const { data: resultats } = useResultats();

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

  return (
    <Page>
      <Titre
        etiquette="Protocol · public version"
        titre="Methodology"
        chapeau="Everything the figures on this site rest on: what is asked, what counts as a right answer, how it is scored, and what the measurement does not establish."
      />

      <nav aria-label="Sections" className="mt-10 border-y border-rule bg-surface-sunken">
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
                <span className="text-[13px] leading-snug">{s.titre}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div id="tests" className="scroll-mt-24">
        <Section numero="01" titre="What FinReg tests">
          <Prose>
            <p>
              Whether an AI system, asked a regulatory question, states the rule the applicable text
              actually lays down — and whether the source it cites for that rule exists and says so.
            </p>
            <p>
              FinReg treats a citation to a non-existent or inapplicable source as a failure distinct
              from an error of substance. A correct answer resting on an imaginary article is
              unusable in compliance: it cannot be checked, relied on, or filed. Fluency, tone and
              summarising ability are not measured.
            </p>
          </Prose>
        </Section>
      </div>

      <div id="correct" className="scroll-mt-24">
        <Section numero="02" titre="What counts as a correct answer">
          <Prose>
            <p>
              Every question is closed and has a determinate answer under the text in force. The
              expected answer is drafted from the text itself and published alongside the question,
              so that a reader can disagree with it against the source rather than on trust.
            </p>
            <p>
              The corpus covers five domains — SFDR, MiFID II, market abuse and issuer obligations,
              DORA and AML/CFT — at three levels of difficulty: direct application of an explicit
              rule, two provisions combined, and questions of scope or timing that turn on an
              exception.
            </p>
          </Prose>
        </Section>
      </div>

      <div id="scoring" className="scroll-mt-24">
        <Section numero="03" titre="How answers are scored">
          <Prose>
            <p>
              Four axes, each scored 0 to 2. Their sum, out of 8, is rebased to a score out of 10. A
              system&rsquo;s regulatory accuracy is the average of its item scores, out of 100.
            </p>
          </Prose>

          <div className="-mx-5 mt-6 overflow-x-auto px-5">
            <table className="zebre w-full min-w-[40rem] border-collapse text-sm">
              <thead>
                <tr className="border-y border-foreground/60 bg-surface-sunken">
                  <th scope="col" className="entete-col px-3 py-2.5 text-left">
                    Axis
                  </th>
                  <th scope="col" className="entete-col px-3 py-2.5 text-left">
                    Question it answers
                  </th>
                  <th scope="col" className="entete-col px-3 py-2.5 text-left">
                    Scale
                  </th>
                </tr>
              </thead>
              <tbody>
                {BAREME.map((l) => (
                  <tr key={l.axe} className="border-b border-border align-top">
                    <td className="px-3 py-3 whitespace-nowrap">{LIBELLES_AXES[l.axe]}</td>
                    <td className="px-3 py-3 text-muted-foreground">{EXPLICATIONS_AXES[l.axe]}</td>
                    <td className="px-3 py-3 text-[13px] leading-relaxed text-muted-foreground">
                      {l.critere}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Prose>
            <p>
              Two rates are reported alongside the score.{" "}
              <span className="font-medium">Invented source</span> is the share of answers citing a
              reference that is non-existent, repealed or foreign to the question.{" "}
              <span className="font-medium">Declined</span> is the share of answers where the system
              refuses to answer rather than advancing a rule — not a defect in itself, and the
              counterpart of the first.
            </p>
          </Prose>
        </Section>
      </div>

      <div id="sources" className="scroll-mt-24">
        <Section
          numero="04"
          titre="How legal sources are verified"
          chapeau="Each item carries a status describing the state of the check on its citation, and nothing else."
        >
          <Prose>
            <p>
              <span className="font-medium">Verified</span> — the cited act and article were checked:
              they exist and carry the rule stated in the expected answer. The check covers the
              citation. It is not legal advice and says nothing about how the rule applies to a
              particular set of facts.
            </p>
            <p>
              <span className="font-medium">Under review</span> — the rule has been identified and
              the expected answer is published, but it is not yet tied to a specific article: the
              provision sits in a delegated act not yet identified, in a regulatory part whose
              numbering remains to be confirmed, or in a national transposition still to be checked.
              Of the {nbQuestions} items published, {nbEnRevue} are in this position. They stay
              visible, with the exact reason stated, rather than being withdrawn or promoted to
              verified.
            </p>
            <p>
              No item reaches the first category without the check having been done. A corpus that
              presented unchecked citations as verified would be measuring hallucination with an
              instrument that hallucinates.
            </p>
          </Prose>
        </Section>
      </div>

      <div id="protocol" className="scroll-mt-24">
        <Section numero="05" titre="Run protocol">
          <Prose>
            <p>
              Each question is put to the system in an independent session, with no history, no
              search tool and no document access. Sampling is left at temperature 0.2 where the model
              accepts it, and at the provider default where it does not. Answers are capped at 250
              words. No example is supplied in the prompt: the measurement is of the
              system&rsquo;s internal knowledge, not of its retrieval ability.
            </p>
            <p>
              Every answer is then scored by an independent judge model
              {resultats?.juge ? <span className="font-mono"> ({resultats.juge})</span> : null},
              which receives the question, the expected answer and the verified source, and returns
              the four axis scores, the flags and a written appreciation. The judge never sees the
              other systems&rsquo; answers, nor which system produced the one it is scoring.
            </p>
          </Prose>
        </Section>
      </div>

      <div id="dataset" className="scroll-mt-24">
        <Section numero="06" titre="What has actually been measured">
          <Prose>
            <p>
              {nbSystemes} named systems were put to the {nbQuestions} published items on{" "}
              {resultats ? dateFr(resultats.date_execution) : "the run date"}, for{" "}
              {resultats?.synthese.nb_reponses ?? nbSystemes * nbQuestions} scored answers. Answers
              are published in full on each item page: the text shown next to a score is the text
              the model actually returned, not a summary of it.
            </p>
            <p>
              Every figure on the site — regulatory accuracy, invented-source rate, declined rate,
              scores by regulation and by axis — is recomputed from those item-level answers: no
              aggregate is typed by hand, and any figure shown can be reconstructed from the corpus
              pages. The harness, the system prompt and the judge prompt are published with the
              corpus, so the run can be replicated.
            </p>
          </Prose>
        </Section>
      </div>

      <div id="limits" className="scroll-mt-24">
        <Section
          numero="07"
          titre="Current limitations"
          chapeau="Stated here rather than left for a reader to discover against the data."
        >
          <div className="mt-6 grid gap-px bg-rule sm:grid-cols-2">
            {[
              {
                t: "Size",
                d: `${nbQuestions} items do not cover French and European financial regulation. A gap of a few points between two systems would not be significant at this scale. What does read at this scale are differences in kind — a system that invents articles against one that declines to answer.`,
              },
              {
                t: "Scope",
                d: "Results describe systems answering from internal knowledge. They do not transfer to a retrieval-augmented system, where the quality of the indexed corpus dominates.",
              },
              {
                t: "Contamination",
                d: "The corpus is public, so a system trained on these pages may have seen them. That is the reason for the private benchmark.",
              },
              {
                t: "Scoring",
                d: "Scores are assigned by a judge model against the expected answer and its verified source, not by a lawyer reviewing each answer. Every answer is published in full so that any score can be contested on the item page.",
              },
              {
                t: "Single run",
                d: "Each item was put once to each system, so the figures include the variance of a single sample rather than averaging it out.",
              },
              {
                t: "Standing",
                d: "Scores are not a guarantee of compliance, and neither the benchmark nor the expected answers replace legal validation.",
              },
            ].map((l) => (
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
          titre="System prompt"
          chapeau="Identical for every system and every run, and published in full so that a run can be replicated."
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
                {copie ? "Copied" : "Copy"}
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
