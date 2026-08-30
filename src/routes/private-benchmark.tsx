import { createFileRoute } from "@tanstack/react-router";
import { Page, Panneau } from "@/components/finreg/Chrome";

/**
 * Adresse de contact publiée sur le site.
 *
 * À REMPLACER par l'adresse réelle avant la mise en ligne : tant que cette
 * valeur n'est pas celle d'une boîte relevée, la page le dit explicitement
 * plutôt que d'afficher un lien qui ne mène nulle part.
 */
const ADRESSE_CONTACT = "";

export const Route = createFileRoute("/private-benchmark")({
  head: () => ({
    meta: [
      { title: "Private benchmark — FinReg" },
      {
        name: "description",
        content:
          "Test your own regulatory corpus. A private question set, never published, to evaluate production systems without contamination.",
      },
      { property: "og:title", content: "Private benchmark — FinReg" },
      {
        property: "og:description",
        content: "Evaluate a production system on questions no model has seen. In preparation.",
      },
    ],
  }),
  component: CorpusPrive,
});

function CorpusPrive() {
  return (
    <Page>
      <p className="etiquette">Coming next</p>
      <h1 className="text-3xl leading-tight sm:text-4xl">Test your own regulatory corpus</h1>
      <p className="mt-5 max-w-2xl text-[17px] leading-relaxed">
        See where AI gets <em>your</em> regulation wrong — on questions no model has been trained
        on.
      </p>

      <section className="mt-8 max-w-2xl space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          The public corpus has a flaw inherent to being public: a system trained or tuned on these
          pages may have seen them, and a good score then proves less than it appears. The answer is
          a second question set, built the same way and scored the same way, that is never
          published.
        </p>
        <p>
          It is meant for evaluating systems in production — compliance assistants,
          retrieval-augmented search, automated qualification pipelines — in their real
          configuration, with their own document base and their own guardrails. Evaluation runs on
          the same four axes as the public benchmark and returns, alongside the scores, the full
          list of failures with the source each answer should have cited.
        </p>
        <p>
          Results would belong to the requester and would not be published; no element of the
          private corpus is disclosed, before or after a run.
        </p>
      </section>

      <section className="mt-10 max-w-2xl">
        <Panneau className="p-6">
          <p className="font-mono text-[11px] tracking-[0.08em] text-accent uppercase">
            Not yet operational
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            There is no upload, no submission form and no account. This page describes what the
            private benchmark will be, not a service that runs today. It is stated plainly here
            rather than behind a form that would accept a corpus and do nothing with it.
          </p>
          {ADRESSE_CONTACT ? (
            <a
              href={`mailto:${ADRESSE_CONTACT}?subject=${encodeURIComponent("FinReg — private benchmark")}`}
              className="mt-5 inline-block border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              Get in touch — {ADRESSE_CONTACT}
            </a>
          ) : (
            <p className="mt-4 border-t border-rule pt-4 text-sm leading-relaxed text-muted-foreground">
              A contact address will be published with the first measured run.
            </p>
          )}
        </Panneau>
      </section>
    </Page>
  );
}
