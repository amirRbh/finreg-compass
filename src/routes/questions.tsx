import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Chargement, Erreur, Page } from "@/components/finreg/Chrome";
import {
  DOMAINES,
  LIBELLES_FLAGS,
  LIBELLES_TYPES,
  nb,
  useQuestions,
  useResultats,
  type Question,
} from "@/lib/finreg";

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [
      { title: "Corpus public de questions — FinReg" },
      {
        name: "description",
        content:
          "Explorateur du corpus public FinReg : questions réglementaires, réponses de référence sourcées et réponses notées de chaque modèle.",
      },
      { property: "og:title", content: "Corpus public de questions — FinReg" },
      {
        property: "og:description",
        content:
          "Filtrez par domaine, type et difficulté, et comparez les réponses des modèles à la réponse de référence.",
      },
    ],
  }),
  component: Questions,
});

const TYPES = ["qualification", "procedure", "perimetre", "datation", "calcul"] as const;

function Questions() {
  const { data: questions, isPending, isError } = useQuestions();
  const { data: resultats } = useResultats();
  const [domaine, setDomaine] = useState("tous");
  const [type, setType] = useState("tous");
  const [difficulte, setDifficulte] = useState("toutes");
  const [ouvert, setOuvert] = useState<string | null>(null);

  const filtrees = useMemo(() => {
    if (!questions) return [];
    return questions.filter(
      (q) =>
        (domaine === "tous" || q.domaine === domaine) &&
        (type === "tous" || q.type === type) &&
        (difficulte === "toutes" || String(q.difficulte) === difficulte),
    );
  }, [questions, domaine, type, difficulte]);

  const nomModele = (id: string) => resultats?.modeles.find((m) => m.id === id)?.nom ?? id;

  return (
    <Page>
      <p className="etiquette">Corpus · 24 items publiés</p>
      <h1 className="text-3xl leading-tight sm:text-4xl">Corpus public</h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
        Chaque item indique la réponse de référence, sa source et les réponses notées de chaque
        modèle. Les réponses citant une source inexistante, abrogée ou inapplicable sont signalées.
      </p>

      <div className="mt-8 flex flex-wrap gap-5 border border-border bg-surface px-4 py-3 shadow-panneau">
        <Filtre
          libelle="Domaine"
          valeur={domaine}
          onChange={setDomaine}
          options={[
            { v: "tous", l: "Tous" },
            ...DOMAINES.map((d) => ({ v: d, l: d })),
          ]}
        />
        <Filtre
          libelle="Type"
          valeur={type}
          onChange={setType}
          options={[
            { v: "tous", l: "Tous" },
            ...TYPES.map((t) => ({ v: t, l: LIBELLES_TYPES[t] ?? t })),
          ]}
        />
        <Filtre
          libelle="Difficulté"
          valeur={difficulte}
          onChange={setDifficulte}
          options={[
            { v: "toutes", l: "Toutes" },
            { v: "1", l: "1 — directe" },
            { v: "2", l: "2 — combinée" },
            { v: "3", l: "3 — périmètre" },
          ]}
        />
      </div>

      {isPending && (
        <div className="mt-6">
          <Chargement />
        </div>
      )}
      {isError && (
        <div className="mt-6">
          <Erreur libelle="Corpus indisponible." />
        </div>
      )}

      {questions && (
        <>
          <p className="mt-4 font-mono text-[11px] text-muted-foreground">
            {filtrees.length} item(s) sur {questions.length} publiés
          </p>
          <ul className="mt-2 border-t border-rule">
            {filtrees.map((q) => (
              <Item
                key={q.id}
                question={q}
                ouvert={ouvert === q.id}
                onToggle={() => setOuvert(ouvert === q.id ? null : q.id)}
                nomModele={nomModele}
              />
            ))}
          </ul>
          {filtrees.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Aucun item ne correspond à ces filtres.
            </p>
          )}
        </>
      )}
    </Page>
  );
}

function Filtre({
  libelle,
  valeur,
  onChange,
  options,
}: {
  libelle: string;
  valeur: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <label className="flex items-baseline gap-2 text-xs">
      <span className="text-muted-foreground">{libelle}</span>
      <select
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border bg-background px-2 py-1 font-mono text-xs text-foreground focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}

function Item({
  question,
  ouvert,
  onToggle,
  nomModele,
}: {
  question: Question;
  ouvert: boolean;
  onToggle: () => void;
  nomModele: (id: string) => string;
}) {
  const halluciné = Object.values(question.reponses_modeles).some((r) =>
    r.flags.includes("hallucination_source"),
  );

  return (
    <li className={`border-b border-border ${halluciné ? "border-l-2 border-l-accent" : ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-baseline gap-3 px-3 py-3.5 text-left transition-colors hover:bg-surface-sunken"
        aria-expanded={ouvert}
      >
        <span className="w-24 shrink-0 font-mono text-[11px] text-muted-foreground">
          {question.id}
        </span>
        <span className="flex-1 text-sm">{question.question}</span>
        <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:inline">
          {LIBELLES_TYPES[question.type] ?? question.type} · diff. {question.difficulte}
        </span>
        <span className="shrink-0 font-mono text-xs text-accent">{ouvert ? "−" : "+"}</span>
      </button>

      {halluciné && !ouvert && (
        <p className="px-3 pb-3 font-mono text-[11px] text-accent">
          Au moins une réponse cite une source non vérifiable.
        </p>
      )}

      {ouvert && (
        <div className="bg-surface-sunken/60 px-3 pt-1 pb-5">
          <dl className="max-w-2xl text-sm">
            <dt className="text-xs font-medium text-muted-foreground">Réponse de référence</dt>
            <dd className="mt-1 leading-relaxed">{question.reponse_reference}</dd>
            <dt className="mt-3 text-xs font-medium text-muted-foreground">Source</dt>
            <dd className="mt-1">
              {question.source.texte} — {question.source.article}{" "}
              <a
                href={question.source.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-accent underline underline-offset-4"
              >
                consulter
              </a>
            </dd>
          </dl>

          <div className="mt-4 -mx-4 overflow-x-auto px-4">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-rule bg-surface-sunken">
                  <th scope="col" className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground">
                    Modèle
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right text-xs font-medium text-muted-foreground">
                    Score
                  </th>
                  <th scope="col" className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground">
                    Évaluation
                  </th>
                  <th scope="col" className="py-2 text-left text-xs font-medium text-muted-foreground">
                    Drapeaux
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(question.reponses_modeles).map(([id, r]) => (
                  <tr key={id} className="border-b border-border align-top">
                    <td className="py-2 pr-4 whitespace-nowrap">{nomModele(id)}</td>
                    <td className="py-2 pr-4 text-right font-mono tabulaire">{nb(r.score)}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{r.texte}</td>
                    <td className="py-2 font-mono text-[11px]">
                      {r.flags.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        r.flags.map((f) => (
                          <span
                            key={f}
                            className={`block ${
                              f === "hallucination_source" ? "text-accent" : "text-muted-foreground"
                            }`}
                          >
                            {LIBELLES_FLAGS[f] ?? f}
                          </span>
                        ))
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </li>
  );
}
