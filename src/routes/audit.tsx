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
import { useLangue } from "@/lib/langue";

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

type Offre = { nom: string; pour: string; contenu: string[] };

const OFFRES_EN: Offre[] = [
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

const OFFRES_FR: Offre[] = [
  {
    nom: "Évaluation pilote",
    pour: "Vous voulez des preuves avant d'engager un système.",
    contenu: [
      "50 questions sur votre périmètre réglementaire",
      "Notation sur les cinq dimensions FinReg",
      "Réponses en échec citées avec le texte contredit",
      "Un rapport écrit, un point de restitution",
    ],
  },
  {
    nom: "Audit complet",
    pour: "Vous déployez une IA réglementaire et devez pouvoir la documenter.",
    contenu: [
      "Corpus privé bâti pour vos obligations",
      "Plusieurs passages par question, variance rapportée",
      "Vérification des sources face aux textes officiels",
      "Constats reliés à votre dispositif de contrôle",
    ],
  },
  {
    nom: "Surveillance continue",
    pour: "Votre système, son modèle ou sa recherche évoluent dans le temps.",
    contenu: [
      "Ré-évaluation à cadence fixe",
      "Alertes de régression sur l'intégrité des citations",
      "Suivi de tendance pour les comités des risques",
      "Réactualisation du score de fiabilité",
    ],
  },
];

const PROCESSUS_EN = [
  ["01", "Scoping", "We agree the regulatory perimeter, the use cases and what a failure means for you."],
  ["02", "Corpus", "Questions are drafted from primary texts and supervisory doctrine, with verified sources."],
  ["03", "Execution", "Your system answers under controlled conditions; runs are logged and reproducible."],
  ["04", "Scoring", "Answers are judged against the primary text on five dimensions, answer by answer."],
  ["05", "Report", "Scores, failing answers in full, and the risk they create in operational terms."],
] as const;

const PROCESSUS_FR = [
  ["01", "Cadrage", "Nous fixons le périmètre réglementaire, les cas d'usage et ce qu'est un échec pour vous."],
  ["02", "Corpus", "Les questions sont rédigées depuis les textes officiels et la doctrine, sources vérifiées."],
  ["03", "Exécution", "Votre système répond en conditions contrôlées ; les passages sont journalisés et reproductibles."],
  ["04", "Notation", "Les réponses sont jugées face au texte officiel sur cinq dimensions, une par une."],
  ["05", "Rapport", "Scores, réponses en échec in extenso, et le risque qu'elles créent en termes opérationnels."],
] as const;

function Audit() {
  const { langue, t } = useLangue();
  const OFFRES = langue === "fr" ? OFFRES_FR : OFFRES_EN;
  const PROCESSUS = langue === "fr" ? PROCESSUS_FR : PROCESSUS_EN;
  const [envoye, setEnvoye] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    societe: "",
    email: "",
    offre: "",
    message: "",
  });
  const offreChoisie = form.offre || OFFRES[0]!.nom;
  const valide =
    form.nom.trim() !== "" && form.societe.trim() !== "" && /.+@.+\..+/.test(form.email);

  return (
    <Page>
      <Titre
        etiquette={t("Audit & assessment", "Audit & évaluation")}
        titre={t(
          "An independent audit of your regulatory AI.",
          "Un audit indépendant de votre IA réglementaire.",
        )}
        chapeau={t(
          "FinReg evaluates AI systems the way a supervisor would read them: against the primary text, citation by citation, with every failure documented. Engagements are scoped, priced and reported in writing.",
          "FinReg évalue les systèmes d'IA comme un superviseur les lirait : face au texte officiel, citation par citation, chaque défaillance documentée. Les missions sont cadrées, chiffrées et restituées par écrit.",
        )}
      />

      <Section numero="01" titre={t("Engagements", "Missions")}>
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
                {t("Scoped on request", "Cadrage sur demande")}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section numero="02" titre={t("How an engagement runs", "Déroulé d'une mission")}>
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
        titre={t("Request an audit", "Demander un audit")}
        chapeau={t(
          "Tell us what your system does and which regulations it touches. We reply with a scoping note.",
          "Dites-nous ce que fait votre système et quelles réglementations il touche. Nous répondons par une note de cadrage.",
        )}
      >
        {envoye ? (
          <div className="mt-5 border border-success/40 bg-success-soft p-6">
            <Pastille ton="succes">{t("Request registered", "Demande enregistrée")}</Pastille>
            <p className="mt-3 text-[15px] leading-relaxed">
              {t(
                `Thank you, ${form.nom}. Your request for a ${offreChoisie.toLowerCase()} has been recorded. A scoping note is prepared manually and sent to ${form.email}.`,
                `Merci, ${form.nom}. Votre demande d'${offreChoisie.toLowerCase()} a été enregistrée. Une note de cadrage est préparée manuellement et envoyée à ${form.email}.`,
              )}
            </p>
            <div className="mt-5">
              <BoutonLien to="/benchmark" variante="secondaire">
                {t("Explore the public benchmark", "Explorer le benchmark public")}
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
              <Champ label={t("Name", "Nom")} obligatoire>
                <input
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className={CLASSE_INPUT}
                />
              </Champ>
              <Champ label={t("Company", "Société")} obligatoire>
                <input
                  value={form.societe}
                  onChange={(e) => setForm({ ...form, societe: e.target.value })}
                  className={CLASSE_INPUT}
                />
              </Champ>
            </div>
            <Champ label={t("Work email", "E-mail professionnel")} obligatoire>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={CLASSE_INPUT}
              />
            </Champ>
            <Champ label={t("Engagement", "Mission")}>
              <select
                value={offreChoisie}
                onChange={(e) => setForm({ ...form, offre: e.target.value })}
                className={CLASSE_INPUT}
              >
                {OFFRES.map((o) => (
                  <option key={o.nom}>{o.nom}</option>
                ))}
              </select>
            </Champ>
            <Champ
              label={t("What should we evaluate?", "Que devons-nous évaluer ?")}
              aide={t(
                "System, use cases, regulatory perimeter.",
                "Système, cas d'usage, périmètre réglementaire.",
              )}
            >
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={CLASSE_INPUT}
              />
            </Champ>
            <div className="border-t border-rule pt-4">
              <Bouton type="submit" disabled={!valide}>
                {t("Send request →", "Envoyer la demande →")}
              </Bouton>
              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                {t(
                  "FinReg provides AI evaluation and benchmarking services. It does not provide legal advice, and audit results are not legal opinions.",
                  "FinReg fournit des services d'évaluation et de benchmark d'IA. Elle ne délivre pas de conseil juridique, et ses résultats d'audit ne sont pas des opinions juridiques.",
                )}
              </p>
            </div>
          </form>
        )}
      </Section>
    </Page>
  );
}
