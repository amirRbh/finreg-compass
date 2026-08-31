import { createFileRoute } from "@tanstack/react-router";
import { Page, Section, Titre } from "@/components/finreg/Chrome";
import { BoutonLien, LigneVerification } from "@/components/finreg/Ui";

const TITRE = "About FinReg — independent regulatory AI evaluation";
const DESCRIPTION =
  "FinReg is an independent evaluator of AI systems on financial regulation. It publishes its methodology, verifies every source and takes no fee from the systems it ranks publicly.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITRE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "About FinReg" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: APropos,
});

function APropos() {
  return (
    <Page>
      <Titre
        etiquette="About"
        titre="Independent, because the measurement is worthless otherwise."
        chapeau="FinReg evaluates how AI systems handle EU and French financial regulation. It exists because “the model sounds confident” is not evidence, and because a compliance function cannot audit what nobody measures."
      />

      <Section numero="01" titre="Independence rules we hold ourselves to">
        <ul className="mt-5 space-y-3 border border-border bg-surface p-6">
          <LigneVerification ok>
            No vendor pays to appear in, or to be removed from, the public index.
          </LigneVerification>
          <LigneVerification ok>
            The public corpus, its sources and the scoring rubric are published.
          </LigneVerification>
          <LigneVerification ok>
            Every cited act and article in the corpus is checked against the primary text.
          </LigneVerification>
          <LigneVerification ok>
            Private engagement results are never published without written agreement.
          </LigneVerification>
          <LigneVerification ok={false}>
            FinReg does not provide legal advice, and no score is a legal opinion.
          </LigneVerification>
        </ul>
      </Section>

      <Section
        numero="02"
        titre="What FinReg is not"
        chapeau="Clarity here protects the value of the measurement."
      >
        <div className="mt-5 grid gap-px border border-border bg-border md:grid-cols-3">
          {[
            ["Not a law firm", "No interpretation is sold as advice. Scores measure answers against published text."],
            ["Not a model vendor", "FinReg builds no regulatory assistant and resells none."],
            ["Not a certification body", "FinReg Verified is a reliability assessment, not a regulatory approval."],
          ].map(([t, d]) => (
            <div key={t} className="bg-surface p-6">
              <p className="text-[15px] font-medium">{t}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section numero="03" titre="Work with us">
        <div className="mt-5 flex flex-wrap gap-3">
          <BoutonLien to="/audit">Request an audit →</BoutonLien>
          <BoutonLien to="/methodology" variante="secondaire">
            Read the methodology
          </BoutonLien>
        </div>
      </Section>
    </Page>
  );
}
