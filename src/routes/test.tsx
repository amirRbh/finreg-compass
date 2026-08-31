import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, Section, Titre } from "@/components/finreg/Chrome";
import {
  BoutonLien,
  Bouton,
  CarteFiabilite,
  Champ,
  CLASSE_INPUT,
  LigneVerification,
  Pastille,
  PastilleDemo,
} from "@/components/finreg/Ui";
import { DIMENSIONS, LIBELLES_DIMENSIONS, type Dimension } from "@/lib/finreg";

const TITRE = "Test your AI on financial regulation — free FinReg AI check";
const DESCRIPTION =
  "Submit a sample of your AI's regulatory answers and receive an independent reliability check on legal accuracy, citation integrity, hallucinations and calibration.";

export const Route = createFileRoute("/test")({
  head: () => ({
    meta: [
      { title: TITRE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Test your AI on financial regulation" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: TesterVotreIA,
});

const DOMAINES = ["SFDR", "MiFID II", "DORA", "AML / CFT", "AMF doctrine", "Other"];
const USAGES = [
  "Internal compliance assistant",
  "Client-facing advisory",
  "Regulatory monitoring",
  "Document review",
  "Reporting automation",
];

/** Rapport de démonstration : aucune mesure, et le dit sur chaque écran. */
const DEMO: Record<Dimension, number> = {
  legal_accuracy: 78,
  citation_integrity: 61,
  hallucination_resistance: 72,
  calibration: 44,
  operational_usability: 83,
};
const DEMO_GLOBAL = 67.6;

const CONSTATS: { ok: boolean; texte: string }[] = [
  { ok: true, texte: "Applicable act correctly identified on 9 of 10 sample answers" },
  { ok: false, texte: "2 answers cite an article that does not support the stated conclusion" },
  { ok: false, texte: "No answer abstains, including where the text leaves the point open" },
  { ok: true, texte: "Answers include actionable steps and scope in 8 of 10 cases" },
];

function TesterVotreIA() {
  const [etape, setEtape] = useState(1);
  const [envoye, setEnvoye] = useState(false);
  const [domaines, setDomaines] = useState<string[]>([]);
  const [usage, setUsage] = useState("");
  const [societe, setSociete] = useState("");
  const [email, setEmail] = useState("");
  const [systeme, setSysteme] = useState("");
  const [echantillon, setEchantillon] = useState("");

  const basculerDomaine = (d: string) =>
    setDomaines((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const valide1 = domaines.length > 0 && usage !== "";
  const valide2 = systeme.trim() !== "" && echantillon.trim().length > 40;
  const valide3 = societe.trim() !== "" && /.+@.+\..+/.test(email);

  return (
    <Page>
      <Titre
        etiquette="Free AI check"
        titre="Find out how your AI performs on regulation."
        chapeau="Four steps. You describe your system, paste a sample of its regulatory answers, and we return an independent reliability check scored on the same five dimensions as the public benchmark."
      />

      <div className="mt-8 flex flex-wrap gap-px border border-border bg-border">
        {["Regulatory scope", "Your system", "Contact", "Report"].map((l, i) => {
          const n = i + 1;
          const actif = etape === n;
          const fait = etape > n;
          return (
            <div
              key={l}
              className={`flex-1 basis-40 px-4 py-3 ${actif ? "bg-ink text-background" : "bg-surface"}`}
            >
              <p
                className={`font-mono text-[10px] tracking-[0.14em] uppercase ${
                  actif ? "text-background/70" : "text-muted-foreground"
                }`}
              >
                Step {n} {fait && "✓"}
              </p>
              <p className="mt-1 text-[13px] font-medium">{l}</p>
            </div>
          );
        })}
      </div>

      {etape === 1 && (
        <Section numero="01" titre="Which regulations does your AI answer on?">
          <div className="mt-5 space-y-6 border border-border bg-surface p-6">
            <fieldset>
              <legend className="etiquette">Regulatory scope — select all that apply</legend>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {DOMAINES.map((d) => {
                  const actif = domaines.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={actif}
                      onClick={() => basculerDomaine(d)}
                      className={`border px-3 py-2 font-mono text-[11px] tracking-[0.08em] transition-colors ${
                        actif
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-surface text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <fieldset>
              <legend className="etiquette">Primary use case</legend>
              <div className="mt-3 space-y-2">
                {USAGES.map((u) => (
                  <label key={u} className="flex items-center gap-3 text-[14px]">
                    <input
                      type="radio"
                      name="usage"
                      value={u}
                      checked={usage === u}
                      onChange={() => setUsage(u)}
                      className="accent-accent"
                    />
                    {u}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="border-t border-rule pt-4">
              <Bouton disabled={!valide1} onClick={() => setEtape(2)}>
                Continue →
              </Bouton>
            </div>
          </div>
        </Section>
      )}

      {etape === 2 && (
        <Section
          numero="02"
          titre="Your system and a sample of its answers"
          chapeau="Paste answers your system produced on regulatory questions. Remove anything confidential — the check only needs the reasoning and the citations."
        >
          <div className="mt-5 space-y-5 border border-border bg-surface p-6">
            <Champ label="System description" obligatoire aide="Model, retrieval setup, prompt scope.">
              <input
                value={systeme}
                onChange={(e) => setSysteme(e.target.value)}
                className={CLASSE_INPUT}
                placeholder="e.g. GPT-based assistant with RAG over EUR-Lex and internal policies"
              />
            </Champ>
            <Champ
              label="Sample answers"
              obligatoire
              aide="Two to ten answers, with the question above each one."
            >
              <textarea
                value={echantillon}
                onChange={(e) => setEchantillon(e.target.value)}
                rows={9}
                className={CLASSE_INPUT}
                placeholder={"Q: Does SFDR Article 8 require a sustainability indicator set?\nA: …"}
              />
            </Champ>
            <div className="flex flex-wrap gap-3 border-t border-rule pt-4">
              <Bouton variante="secondaire" onClick={() => setEtape(1)}>
                ← Back
              </Bouton>
              <Bouton disabled={!valide2} onClick={() => setEtape(3)}>
                Continue →
              </Bouton>
            </div>
          </div>
        </Section>
      )}

      {etape === 3 && (
        <Section numero="03" titre="Where should the report go?">
          <div className="mt-5 space-y-5 border border-border bg-surface p-6">
            <Champ label="Company" obligatoire>
              <input
                value={societe}
                onChange={(e) => setSociete(e.target.value)}
                className={CLASSE_INPUT}
              />
            </Champ>
            <Champ label="Work email" obligatoire>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={CLASSE_INPUT}
              />
            </Champ>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Your sample is used to produce your report only. FinReg does not publish a named
              system's score without written agreement.
            </p>
            <div className="flex flex-wrap gap-3 border-t border-rule pt-4">
              <Bouton variante="secondaire" onClick={() => setEtape(2)}>
                ← Back
              </Bouton>
              <Bouton
                disabled={!valide3}
                onClick={() => {
                  setEnvoye(true);
                  setEtape(4);
                }}
              >
                See a sample report →
              </Bouton>
            </div>
          </div>
        </Section>
      )}

      {etape === 4 && (
        <Section
          numero="04"
          titre="What your report looks like"
          chapeau="Below is the structure of a FinReg AI check. The figures shown are an illustration, not a measurement of your system."
        >
          {envoye && (
            <p className="mt-5 border-l-2 border-success pl-3 text-[13px] leading-relaxed">
              Request registered for {societe}. A scored report on your sample is prepared manually
              and sent to {email}.
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <PastilleDemo>Illustrative report — not your score</PastilleDemo>
            <Pastille>Scope: {domaines.join(", ") || "—"}</Pastille>
          </div>
          <div className="mt-4">
            <CarteFiabilite
              score={DEMO_GLOBAL}
              dimensions={DEMO}
              libellesDimensions={LIBELLES_DIMENSIONS}
              sousTitre="Structure of the deliverable: one score per dimension, plus the failing answers quoted in full with the primary text they contradict."
            />
          </div>
          <div className="mt-6 grid gap-px border border-border bg-border md:grid-cols-2">
            <div className="bg-surface p-6">
              <p className="etiquette">Findings section</p>
              <ul className="mt-3 space-y-2">
                {CONSTATS.map((c) => (
                  <LigneVerification key={c.texte} ok={c.ok}>
                    {c.texte}
                  </LigneVerification>
                ))}
              </ul>
            </div>
            <div className="bg-surface p-6">
              <p className="etiquette">Dimensions scored</p>
              <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
                {DIMENSIONS.map((d) => (
                  <li key={d} className="border-b border-rule pb-2 last:border-b-0">
                    {LIBELLES_DIMENSIONS[d]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <BoutonLien to="/audit">Request a full audit →</BoutonLien>
            <BoutonLien to="/benchmark" variante="secondaire">
              Compare against public systems
            </BoutonLien>
          </div>
        </Section>
      )}
    </Page>
  );
}
