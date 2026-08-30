import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Chargement, Erreur, Page } from "@/components/finreg/Chrome";
import { PastilleVerification } from "@/components/finreg/Statuts";
import {
  LIBELLES_TYPES,
  LIBELLES_VERIFICATION,
  ORDRE_DOMAINES,
  ORDRE_TYPES,
  useQuestions,
  valeursPresentes,
  type Question,
} from "@/lib/finreg";

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [
      { title: "Corpus public — FinReg" },
      {
        name: "description",
        content:
          "Le corpus public FinReg : chaque question réglementaire avec sa réponse de référence, l'article dont elle est tirée et le statut de vérification de cette citation.",
      },
      { property: "og:title", content: "Corpus public — FinReg" },
      {
        property: "og:description",
        content:
          "Filtrez par domaine, type, difficulté et statut de vérification, puis ouvrez un item pour suivre la chaîne complète.",
      },
    ],
  }),
  component: Questions,
});

const LIBELLES_DIFFICULTE: Record<string, string> = {
  "1": "1 — application directe",
  "2": "2 — combinaison",
  "3": "3 — périmètre / datation",
};

function Questions() {
  const { data: questions, isPending, isError } = useQuestions();
  const [domaine, setDomaine] = useState("tous");
  const [type, setType] = useState("tous");
  const [difficulte, setDifficulte] = useState("toutes");
  const [verification, setVerification] = useState("toutes");

  // Les options de filtre viennent du corpus publié, pas d'une liste figée ici :
  // le vocabulaire des données fait foi, et aucun item ne doit rester introuvable.
  const domainesPresents = useMemo(
    () =>
      valeursPresentes(
        (questions ?? []).map((q) => q.domaine),
        ORDRE_DOMAINES,
      ),
    [questions],
  );
  const typesPresents = useMemo(
    () =>
      valeursPresentes(
        (questions ?? []).map((q) => q.type),
        ORDRE_TYPES,
      ),
    [questions],
  );
  const difficultesPresentes = useMemo(
    () =>
      [...new Set((questions ?? []).map((q) => q.difficulte))].sort((a, b) => a - b).map(String),
    [questions],
  );

  const filtrees = useMemo(() => {
    if (!questions) return [];
    return questions.filter(
      (q) =>
        (domaine === "tous" || q.domaine === domaine) &&
        (type === "tous" || q.type === type) &&
        (difficulte === "toutes" || String(q.difficulte) === difficulte) &&
        (verification === "toutes" || q.verification.statut === verification),
    );
  }, [questions, domaine, type, difficulte, verification]);

  const verifiees =
    questions?.filter((q) => q.verification.statut === "source_verifiee").length ?? 0;

  return (
    <Page>
      <p className="etiquette">Corpus public</p>
      <h1 className="text-3xl leading-tight sm:text-4xl">Les questions, en clair</h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
        Le corpus est publié intégralement : c'est ce qui rend le barème vérifiable. Chaque item
        porte sa réponse de référence, l'article dont elle est tirée et le résultat du contrôle de
        cette citation. Ouvrez un item pour voir ce que chaque système a répondu.
      </p>

      {questions && (
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          {questions.length} items publiés — {verifiees} à source vérifiée,{" "}
          {questions.length - verifiees} en cours de vérification.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-5 border border-border bg-surface px-4 py-3 shadow-panneau">
        <Filtre
          libelle="Domaine"
          valeur={domaine}
          onChange={setDomaine}
          options={[{ v: "tous", l: "Tous" }, ...domainesPresents.map((d) => ({ v: d, l: d }))]}
        />
        <Filtre
          libelle="Type"
          valeur={type}
          onChange={setType}
          options={[
            { v: "tous", l: "Tous" },
            ...typesPresents.map((t) => ({ v: t, l: LIBELLES_TYPES[t] ?? t })),
          ]}
        />
        <Filtre
          libelle="Difficulté"
          valeur={difficulte}
          onChange={setDifficulte}
          options={[
            { v: "toutes", l: "Toutes" },
            ...difficultesPresentes.map((d) => ({ v: d, l: LIBELLES_DIFFICULTE[d] ?? d })),
          ]}
        />
        <Filtre
          libelle="Vérification"
          valeur={verification}
          onChange={setVerification}
          options={[
            { v: "toutes", l: "Toutes" },
            ...Object.entries(LIBELLES_VERIFICATION).map(([v, l]) => ({ v, l })),
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
          <p className="mt-6 font-mono text-[11px] text-muted-foreground">
            {filtrees.length} item(s) affiché(s)
          </p>
          <ul className="mt-2 border-t border-rule">
            {filtrees.map((q) => (
              <Item key={q.id} question={q} />
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

function Item({ question }: { question: Question }) {
  return (
    <li className="border-b border-border">
      <Link
        to="/question/$id"
        params={{ id: question.id }}
        className="block px-3 py-4 transition-colors hover:bg-surface-sunken"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-[11px] text-muted-foreground">{question.id}</span>
          <PastilleVerification statut={question.verification.statut} taille="petite" />
          <span className="font-mono text-[11px] text-muted-foreground">
            {LIBELLES_TYPES[question.type] ?? question.type} · diff. {question.difficulte}
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed">{question.question}</p>
        <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
          {question.source.texte} — {question.source.article}
        </p>
      </Link>
    </li>
  );
}
