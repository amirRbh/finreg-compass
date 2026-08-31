import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/finreg/Chrome";
import {
  dateFr,
  EXPLICATIONS_AXES,
  LIBELLES_AXES,
  useQuestions,
  useResultats,
} from "@/lib/finreg";

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
      <p className="etiquette">Protocol · public version</p>
      <h1 className="text-3xl leading-tight sm:text-4xl">Methodology</h1>

      <section className="mt-6 max-w-2xl space-y-3 text-[15px] leading-relaxed">
        <h2 className="border-b border-rule pb-2 text-lg">What FinReg tests</h2>
        <p>
          Whether an AI system, asked a regulatory question, states the rule the applicable text
          actually lays down — and whether the source it cites for that rule exists and says so.
        </p>
        <p>
          FinReg treats a citation to a non-existent or inapplicable source as a failure distinct
          from an error of substance. A correct answer resting on an imaginary article is unusable
          in compliance: it cannot be checked, relied on, or filed. Fluency, tone and summarising
          ability are not measured.
        </p>

        <h2 className="mt-10 border-b border-rule pb-2 text-lg">What counts as a correct answer</h2>
        <p>
          Every question is closed and has a determinate answer under the text in force. The
          expected answer is drafted from the text itself and published alongside the question, so
          that a reader can disagree with it against the source rather than on trust.
        </p>
        <p>
          The corpus covers five domains — SFDR, MiFID II, market abuse and issuer obligations, DORA
          and AML/CFT — at three levels of difficulty: direct application of an explicit rule, two
          provisions combined, and questions of scope or timing that turn on an exception.
        </p>

        <h2 className="mt-10 border-b border-rule pb-2 text-lg">How answers are scored</h2>
        <p>
          Four axes, each scored 0 to 2. Their sum, out of 8, is rebased to a score out of 10. A
          system's regulatory accuracy is the average of its item scores, out of 100.
        </p>
      </section>

      <div className="mt-4 -mx-4 overflow-x-auto px-4">
        <table className="zebre w-full min-w-[38rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-foreground/60 bg-surface-sunken">
              <th scope="col" className="entete-col px-3 py-2 text-left">
                Axis
              </th>
              <th scope="col" className="entete-col px-3 py-2 text-left">
                Question it answers
              </th>
              <th scope="col" className="entete-col px-3 py-2 text-left">
                Scale
              </th>
            </tr>
          </thead>
          <tbody>
            {BAREME.map((l) => (
              <tr key={l.axe} className="border-b border-border align-top">
                <td className="px-3 py-2.5 whitespace-nowrap">{LIBELLES_AXES[l.axe]}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{EXPLICATIONS_AXES[l.axe]}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{l.critere}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <section className="mt-6 max-w-2xl space-y-3 text-[15px] leading-relaxed">
        <p>
          Two rates are reported alongside the score.{" "}
          <span className="font-medium">Invented source</span> is the share of answers citing a
          reference that is non-existent, repealed or foreign to the question.{" "}
          <span className="font-medium">Declined</span> is the share of answers where the system
          refuses to answer rather than advancing a rule — not a defect in itself, and the
          counterpart of the first.
        </p>

        <h2 className="mt-10 border-b border-rule pb-2 text-lg">How legal sources are verified</h2>
        <p>
          Each item carries a status describing the state of the check on its citation, and nothing
          else.
        </p>
        <p>
          <span className="font-medium">Verified</span> — the cited act and article were checked:
          they exist and carry the rule stated in the expected answer. The check covers the
          citation. It is not legal advice and says nothing about how the rule applies to a
          particular set of facts.
        </p>
        <p>
          <span className="font-medium">Under review</span> — the rule has been identified and the
          expected answer is published, but it is not yet tied to a specific article: the provision
          sits in a delegated act not yet identified, in a regulatory part whose numbering remains
          to be confirmed, or in a national transposition still to be checked. Of the {nbQuestions}{" "}
          items published, {nbEnRevue} are in this position. They stay visible, with the exact
          reason stated, rather than being withdrawn or promoted to verified.
        </p>
        <p>
          No item reaches the first category without the check having been done. A corpus that
          presented unchecked citations as verified would be measuring hallucination with an
          instrument that hallucinates.
        </p>

        <h2 className="mt-10 border-b border-rule pb-2 text-lg">Run protocol</h2>
        <p>
          Each question is put to the system in an independent session, with no history, no search
          tool and no document access. Sampling is left at temperature 0.2 where the model accepts
          it, and at the provider default where it does not. Answers are capped at 250 words. No
          example is supplied in the prompt: the measurement is of the system&rsquo;s internal
          knowledge, not of its retrieval ability.
        </p>
        <p>
          Every answer is then scored by an independent judge model
          {resultats?.juge ? <span className="font-mono"> ({resultats.juge})</span> : null}, which
          receives the question, the expected answer and the verified source, and returns the four
          axis scores, the flags and a written appreciation. The judge never sees the other
          systems&rsquo; answers, nor which system produced the one it is scoring.
        </p>

        <h2 id="dataset" className="mt-10 scroll-mt-24 border-b border-rule pb-2 text-lg">
          What has actually been measured
        </h2>
        <p>
          {nbSystemes} named systems were put to the {nbQuestions} published items on{" "}
          {resultats ? dateFr(resultats.date_execution) : "the run date"}, for{" "}
          {resultats?.synthese.nb_reponses ?? nbSystemes * nbQuestions} scored answers. Answers are
          published in full on each item page: the text shown next to a score is the text the model
          actually returned, not a summary of it.
        </p>
        <p>
          Every figure on the site — regulatory accuracy, invented-source rate, declined rate, scores
          by regulation and by axis — is recomputed from those item-level answers: no aggregate is
          typed by hand, and any figure shown can be reconstructed from the corpus pages. The
          harness, the system prompt and the judge prompt are published with the corpus, so the run
          can be replicated.
        </p>


        <h2 className="mt-10 border-b border-rule pb-2 text-lg">Current limitations</h2>
        <p>
          <span className="font-medium">Size.</span> {nbQuestions} items do not cover French and
          European financial regulation. A gap of a few points between two systems would not be
          significant at this scale. What does read at this scale are differences in kind — a system
          that invents articles against one that declines to answer.
        </p>
        <p>
          <span className="font-medium">Scope.</span> Results describe systems answering from
          internal knowledge. They do not transfer to a retrieval-augmented system, where the
          quality of the indexed corpus dominates.
        </p>
        <p>
          <span className="font-medium">Contamination.</span> The corpus is public, so a system
          trained on these pages may have seen them. That is the reason for the private benchmark.
        </p>
        <p>
          <span className="font-medium">Standing.</span> Scores are not a guarantee of compliance,
          and neither the benchmark nor the expected answers replace legal validation.
        </p>

        <h2 className="mt-10 border-b border-rule pb-2 text-lg">System prompt</h2>
        <p>
          Identical for every system and every run, and published in full so that a run can be
          replicated.
        </p>
      </section>

      <div className="mt-4 border border-border">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="font-mono text-[11px] text-muted-foreground">system_prompt.txt</span>
          <button
            type="button"
            onClick={copier}
            className="font-mono text-[11px] text-accent underline-offset-4 hover:underline"
          >
            {copie ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto px-3 py-3 font-mono text-xs leading-relaxed whitespace-pre">
          {PROMPT}
        </pre>
      </div>
    </Page>
  );
}
