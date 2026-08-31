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
import { DIMENSIONS, dimensionsLib, type Dimension } from "@/lib/finreg";
import { useLangue } from "@/lib/langue";

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

const DOMAINES_EN = ["SFDR", "MiFID II", "DORA", "AML / CFT", "AMF doctrine", "Other"];
const DOMAINES_FR = ["SFDR", "MiFID II", "DORA", "LCB-FT", "Doctrine AMF", "Autre"];
const USAGES_EN = [
  "Internal compliance assistant",
  "Client-facing advisory",
  "Regulatory monitoring",
  "Document review",
  "Reporting automation",
];
const USAGES_FR = [
  "Assistant conformité interne",
  "Conseil au client",
  "Veille réglementaire",
  "Revue documentaire",
  "Automatisation du reporting",
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

const CONSTATS: { ok: boolean; en: string; fr: string }[] = [
  {
    ok: true,
    en: "Applicable act correctly identified on 9 of 10 sample answers",
    fr: "Texte applicable correctement identifié sur 9 réponses sur 10",
  },
  {
    ok: false,
    en: "2 answers cite an article that does not support the stated conclusion",
    fr: "2 réponses citent un article qui ne soutient pas la conclusion énoncée",
  },
  {
    ok: false,
    en: "No answer abstains, including where the text leaves the point open",
    fr: "Aucune réponse ne s'abstient, y compris là où le texte laisse la question ouverte",
  },
  {
    ok: true,
    en: "Answers include actionable steps and scope in 8 of 10 cases",
    fr: "Les réponses donnent des étapes et un périmètre exploitables dans 8 cas sur 10",
  },
];

function TesterVotreIA() {
  const { langue, t } = useLangue();
  const D = dimensionsLib(langue);
  const DOMAINES = langue === "fr" ? DOMAINES_FR : DOMAINES_EN;
  const USAGES = langue === "fr" ? USAGES_FR : USAGES_EN;
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
        etiquette={t("Free AI check", "Contrôle IA gratuit")}
        titre={t(
          "Find out how your AI performs on regulation.",
          "Découvrez comment votre IA se comporte sur la réglementation.",
        )}
        chapeau={t(
          "Four steps. You describe your system, paste a sample of its regulatory answers, and we return an independent reliability check scored on the same five dimensions as the public benchmark.",
          "Quatre étapes. Vous décrivez votre système, collez un échantillon de ses réponses réglementaires, et nous renvoyons un contrôle de fiabilité indépendant noté sur les cinq mêmes dimensions que le benchmark public.",
        )}
      />

      <div className="mt-8 flex flex-wrap gap-px border border-border bg-border">
        {(langue === "fr"
          ? ["Périmètre réglementaire", "Votre système", "Contact", "Rapport"]
          : ["Regulatory scope", "Your system", "Contact", "Report"]
        ).map((l, i) => {
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
                {t("Step", "Étape")} {n} {fait && "✓"}
              </p>
              <p className="mt-1 text-[13px] font-medium">{l}</p>
            </div>
          );
        })}
      </div>

      {etape === 1 && (
        <Section
          numero="01"
          titre={t(
            "Which regulations does your AI answer on?",
            "Sur quelles réglementations votre IA répond-elle ?",
          )}
        >
          <div className="mt-5 space-y-6 border border-border bg-surface p-6">
            <fieldset>
              <legend className="etiquette">
                {t(
                  "Regulatory scope — select all that apply",
                  "Périmètre réglementaire — plusieurs choix possibles",
                )}
              </legend>
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
              <legend className="etiquette">{t("Primary use case", "Usage principal")}</legend>
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
                {t("Continue →", "Continuer →")}
              </Bouton>
            </div>
          </div>
        </Section>
      )}

      {etape === 2 && (
        <Section
          numero="02"
          titre={t(
            "Your system and a sample of its answers",
            "Votre système et un échantillon de ses réponses",
          )}
          chapeau={t(
            "Paste answers your system produced on regulatory questions. Remove anything confidential — the check only needs the reasoning and the citations.",
            "Collez des réponses produites par votre système sur des questions réglementaires. Retirez tout élément confidentiel — le contrôle n'a besoin que du raisonnement et des citations.",
          )}
        >
          <div className="mt-5 space-y-5 border border-border bg-surface p-6">
            <Champ
              label={t("System description", "Description du système")}
              obligatoire
              aide={t(
                "Model, retrieval setup, prompt scope.",
                "Modèle, dispositif de recherche, périmètre du prompt.",
              )}
            >
              <input
                value={systeme}
                onChange={(e) => setSysteme(e.target.value)}
                className={CLASSE_INPUT}
                placeholder={t(
                  "e.g. GPT-based assistant with RAG over EUR-Lex and internal policies",
                  "ex. assistant GPT avec RAG sur EUR-Lex et les procédures internes",
                )}
              />
            </Champ>
            <Champ
              label={t("Sample answers", "Réponses de l'échantillon")}
              obligatoire
              aide={t(
                "Two to ten answers, with the question above each one.",
                "De deux à dix réponses, avec la question au-dessus de chacune.",
              )}
            >
              <textarea
                value={echantillon}
                onChange={(e) => setEchantillon(e.target.value)}
                rows={9}
                className={CLASSE_INPUT}
                placeholder={t(
                  "Q: Does SFDR Article 8 require a sustainability indicator set?\nA: …",
                  "Q : L'article 8 SFDR impose-t-il un jeu d'indicateurs de durabilité ?\nR : …",
                )}
              />
            </Champ>
            <div className="flex flex-wrap gap-3 border-t border-rule pt-4">
              <Bouton variante="secondaire" onClick={() => setEtape(1)}>
                {t("← Back", "← Retour")}
              </Bouton>
              <Bouton disabled={!valide2} onClick={() => setEtape(3)}>
                {t("Continue →", "Continuer →")}
              </Bouton>
            </div>
          </div>
        </Section>
      )}

      {etape === 3 && (
        <Section numero="03" titre={t("Where should the report go?", "Où envoyer le rapport ?")}>
          <div className="mt-5 space-y-5 border border-border bg-surface p-6">
            <Champ label={t("Company", "Société")} obligatoire>
              <input
                value={societe}
                onChange={(e) => setSociete(e.target.value)}
                className={CLASSE_INPUT}
              />
            </Champ>
            <Champ label={t("Work email", "E-mail professionnel")} obligatoire>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={CLASSE_INPUT}
              />
            </Champ>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {t(
                "Your sample is used to produce your report only. FinReg does not publish a named system's score without written agreement.",
                "Votre échantillon ne sert qu'à produire votre rapport. FinReg ne publie pas le score d'un système nommé sans accord écrit.",
              )}
            </p>
            <div className="flex flex-wrap gap-3 border-t border-rule pt-4">
              <Bouton variante="secondaire" onClick={() => setEtape(2)}>
                {t("← Back", "← Retour")}
              </Bouton>
              <Bouton
                disabled={!valide3}
                onClick={() => {
                  setEnvoye(true);
                  setEtape(4);
                }}
              >
                {t("See a sample report →", "Voir un exemple de rapport →")}
              </Bouton>
            </div>
          </div>
        </Section>
      )}

      {etape === 4 && (
        <Section
          numero="04"
          titre={t("What your report looks like", "À quoi ressemble votre rapport")}
          chapeau={t(
            "Below is the structure of a FinReg AI check. The figures shown are an illustration, not a measurement of your system.",
            "Voici la structure d'un contrôle FinReg. Les chiffres affichés sont illustratifs : ce n'est pas une mesure de votre système.",
          )}
        >
          {envoye && (
            <p className="mt-5 border-l-2 border-success pl-3 text-[13px] leading-relaxed">
              {t(
                `Request registered for ${societe}. A scored report on your sample is prepared manually and sent to ${email}.`,
                `Demande enregistrée pour ${societe}. Un rapport noté sur votre échantillon est préparé manuellement et envoyé à ${email}.`,
              )}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <PastilleDemo>
              {t("Illustrative report — not your score", "Rapport illustratif — pas votre score")}
            </PastilleDemo>
            <Pastille>
              {t("Scope", "Périmètre")}: {domaines.join(", ") || "—"}
            </Pastille>
          </div>
          <div className="mt-4">
            <CarteFiabilite
              score={DEMO_GLOBAL}
              dimensions={DEMO}
              libellesDimensions={D.libelles}
              sousTitre={t(
                "Structure of the deliverable: one score per dimension, plus the failing answers quoted in full with the primary text they contradict.",
                "Structure du livrable : un score par dimension, et les réponses en échec citées intégralement avec le texte officiel qu'elles contredisent.",
              )}
            />
          </div>
          <div className="mt-6 grid gap-px border border-border bg-border md:grid-cols-2">
            <div className="bg-surface p-6">
              <p className="etiquette">{t("Findings section", "Section constats")}</p>
              <ul className="mt-3 space-y-2">
                {CONSTATS.map((c) => (
                  <LigneVerification key={c.en} ok={c.ok}>
                    {langue === "fr" ? c.fr : c.en}
                  </LigneVerification>
                ))}
              </ul>
            </div>
            <div className="bg-surface p-6">
              <p className="etiquette">{t("Dimensions scored", "Dimensions notées")}</p>
              <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
                {DIMENSIONS.map((d) => (
                  <li key={d} className="border-b border-rule pb-2 last:border-b-0">
                    {D.libelles[d]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <BoutonLien to="/audit">{t("Request a full audit →", "Demander un audit complet →")}</BoutonLien>
            <BoutonLien to="/benchmark" variante="secondaire">
              {t("Compare against public systems", "Comparer aux systèmes publics")}
            </BoutonLien>
          </div>
        </Section>
      )}
    </Page>
  );
}
