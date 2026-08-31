import { Link } from "@tanstack/react-router";
import { libelles, texteAffiche, type Defaillance } from "@/lib/finreg";
import { LigneVerification, Pastille, Squelette } from "@/components/finreg/Ui";

/**
 * Console d'évaluation réglementaire.
 *
 * Elle ne met en scène rien : la question, la réponse, la source et le verdict
 * viennent d'un item réel du corpus et d'une réponse réellement mesurée.
 */
export function ConsoleEvaluation({ cas }: { cas?: Defaillance }) {
  const L = libelles("en");

  if (!cas) {
    return (
      <div className="border border-border bg-surface p-5 shadow-releve">
        <p className="etiquette">Regulatory AI evaluation console</p>
        <div className="mt-4">
          <Squelette lignes={6} />
        </div>
      </div>
    );
  }

  const q = cas.question;
  const inventee = cas.reponse.flags.includes("hallucination_source");
  const reponse = texteAffiche(cas.reponse.texte).split("\n").filter(Boolean).slice(0, 3).join(" ");

  return (
    <div className="border border-border bg-surface shadow-releve">
      {/* Barre d'instrument */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-ink px-4 py-2.5">
        <p className="font-mono text-[10px] tracking-[0.14em] text-background/80 uppercase">
          Regulatory AI evaluation console
        </p>
        <p className="font-mono text-[10px] tracking-[0.1em] text-background/60 tabulaire">
          item {q.id} · {L.domainesCourts[q.domaine] ?? q.domaine} · scored answer
        </p>
      </div>

      <div className="divide-y divide-rule">
        <div className="px-5 py-4">
          <p className="etiquette">Question</p>
          <p className="mt-2 text-[14px] leading-relaxed text-foreground">{q.question}</p>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="etiquette">AI answer</p>
            <Pastille>{cas.nomModele}</Pastille>
          </div>
          <p className="mt-2 line-clamp-6 text-[13px] leading-relaxed text-muted-foreground">
            {reponse}
          </p>
        </div>

        <div className="px-5 py-4">
          <p className="etiquette">Source verification</p>
          <ul className="mt-2.5 space-y-1.5">
            <LigneVerification ok>
              Regulation identified — {q.source.texte}
            </LigneVerification>
            <LigneVerification ok={!inventee}>
              {inventee
                ? `Article cited by the model could not be located in the act`
                : `Article exists — ${q.source.article}`}
            </LigneVerification>
            <LigneVerification ok={false}>Citation does not support the conclusion</LigneVerification>
          </ul>
        </div>

        <div className="bg-danger-soft px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Pastille ton="danger">
              {cas.severite === "critical" ? "Critical failure" : "Regulatory failure"}
            </Pastille>
            <span className="font-mono text-[10px] tracking-[0.12em] text-danger uppercase">
              {cas.categorie}
            </span>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed font-medium text-foreground">
            Unsupported legal conclusion
          </p>
          {cas.reponse.analyse && (
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {cas.reponse.analyse.incorrect}
            </p>
          )}
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-danger/20 pt-3 font-mono text-[10px] tracking-[0.1em] uppercase">
            <Link to="/question/$id" params={{ id: q.id }} className="text-accent hover:underline">
              Open the full case →
            </Link>
            <a
              href={q.source.url}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              Primary source ↗
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
