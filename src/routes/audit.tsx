import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, Section, Titre } from "@/components/finreg/Chrome";
import {
  Bouton,
  BoutonLien,
  Champ,
  CLASSE_INPUT,
  LigneVerification,
  Pastille,
} from "@/components/finreg/Ui";

const TITRE = "Request a regulatory AI audit — FinReg";
const DESCRIPTION =
  "Independent audits of regulatory AI systems: pilot evaluation, full audit against your own corpus, and continuous monitoring of legal accuracy, citations, hallucinations and calibration.";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: TITRE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Request a regulatory AI audit" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Audit,
});

const OFFRES = [
  {
    nom: "Pilot evaluation",
    pour: "You want evidence before committing to a system.",
    contenu: [
      "50 questions on your regulatory perimeter",
      "Scored on the five FinReg dimensions",
      "Failing answers quoted with the contradicting text",
      "One written report, one review call",
    ],
  },
  {
    nom: "Full audit",
    pour: "You are deploying regulatory AI and need defensible documentation.",
    contenu: [
      "Private corpus built for your obligations",
      "Multiple runs per question, variance reported",
      "Source verification against primary texts",
      "Findings mapped to your control framework",
    ],
  },
  {
    nom: "Continuous monitoring",
    pour: "Your system, its model or its retrieval changes over time.",
    contenu: [
      "Re-evaluation on a fixed cadence",
      "Regression alerts on citation integrity",
      "Trend reporting for risk committees",
      "Re-assessment of the reliability score",
    ],
  },
];

const PROCESSUS = [
  ["01", "Scoping", "We agree the regulatory perimeter, the use cases and what a failure means for you."],
  ["02", "Corpus", "Questions are drafted from primary texts and supervisory doctrine, with verified sources."],
  ["03", "Execution", "Your system answers under controlled conditions; runs are logged and reproducible."],
  ["04", "Scoring", "Answers are judged against the primary text on five dimensions, answer by answer."],
  ["05", "Report", "Scores, failing answers in full, and the risk they create in operational terms."],
] as const;

function Audit() {
  const [envoye, setEnvoye] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    societe: "",
    email: "",
    offre: "Pilot evaluation",
    message: "",
  });
  const valide =
    form.nom.trim() !== "" && form.societe.trim() !== "" && /.+@.+\..+/.test(form.email);

  return (
    <Page>
      <Titre
        etiquette="Audit & assessment"
        titre="An independent audit of your regulatory AI."
        chapeau="FinReg evaluates AI systems the way a supervisor would read them: against the primary text, citation by citation, with every failure documented. Engagements are scoped, priced and reported in writing."
      />

      <Section numero="01" titre="Engagements">
        <div className="mt-5 grid gap-px border border-border bg-border lg:grid-cols-3">
          {OFFRES.map((o) => (
            <article key={o.nom} className="flex flex-col bg-surface p-6">
              <p className="text-[17px] leading-snug font-semibold">{o.nom}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{o.pour}</p>
              <ul className="mt-5 space-y-2 border-t border-rule pt-4">
                {o.contenu.map((c) => (
                  <LigneVerification key={c} ok>
                    {c}
                  </LigneVerification>
                ))}
              </ul>
              <p className="mt-6 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                Scoped on request
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section numero="02" titre="How an engagement runs">
        <ol className="mt-5 border border-border bg-surface">
          {PROCESSUS.map(([n, titre, detail]) => (
            <li
              key={n}
              className="grid gap-2 border-b border-rule px-6 py-5 last:border-b-0 sm:grid-cols-[3rem_minmax(0,12rem)_minmax(0,1fr)] sm:items-baseline"
            >
              <span className="font-mono text-[11px] tracking-[0.12em] text-accent">{n}</span>
              <span className="text-[15px] font-medium">{titre}</span>
              <span className="text-[13px] leading-relaxed text-muted-foreground">{detail}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        numero="03"
        titre="Request an audit"
        chapeau="Tell us what your system does and which regulations it touches. We reply with a scoping note."
      >
        {envoye ? (
          <div className="mt-5 border border-success/40 bg-success-soft p-6">
            <Pastille ton="succes">Request registered</Pastille>
            <p className="mt-3 text-[15px] leading-relaxed">
              Thank you, {form.nom}. Your request for a {form.offre.toLowerCase()} has been recorded.
              A scoping note is prepared manually and sent to {form.email}.
            </p>
            <div className="mt-5">
              <BoutonLien to="/benchmark" variante="secondaire">
                Explore the public benchmark
              </BoutonLien>
            </div>
          </div>
        ) : (
          <form
            className="mt-5 space-y-5 border border-border bg-surface p-6"
            onSubmit={(e) => {
              e.preventDefault();
              setEnvoye(true);
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Champ label="Name" obligatoire>
                <input
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className={CLASSE_INPUT}
                />
              </Champ>
              <Champ label="Company" obligatoire>
                <input
                  value={form.societe}
                  onChange={(e) => setForm({ ...form, societe: e.target.value })}
                  className={CLASSE_INPUT}
                />
              </Champ>
            </div>
            <Champ label="Work email" obligatoire>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={CLASSE_INPUT}
              />
            </Champ>
            <Champ label="Engagement">
              <select
                value={form.offre}
                onChange={(e) => setForm({ ...form, offre: e.target.value })}
                className={CLASSE_INPUT}
              >
                {OFFRES.map((o) => (
                  <option key={o.nom}>{o.nom}</option>
                ))}
              </select>
            </Champ>
            <Champ label="What should we evaluate?" aide="System, use cases, regulatory perimeter.">
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={CLASSE_INPUT}
              />
            </Champ>
            <div className="border-t border-rule pt-4">
              <Bouton type="submit" disabled={!valide}>
                Send request →
              </Bouton>
              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                FinReg provides AI evaluation and benchmarking services. It does not provide legal
                advice, and audit results are not legal opinions.
              </p>
            </div>
          </form>
        )}
      </Section>
    </Page>
  );
}
