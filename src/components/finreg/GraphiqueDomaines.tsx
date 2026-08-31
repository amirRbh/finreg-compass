import { NOMS_COURTS_DOMAINES, nb, type Modele } from "@/lib/finreg";

const LARGEUR = 900;
const HAUTEUR = 300;
const MARGE = { haut: 12, bas: 34, gauche: 34, droite: 8 };

export function GraphiqueDomaines({
  modeles,
  domaines,
}: {
  modeles: Modele[];
  domaines: string[];
}) {
  const zoneL = LARGEUR - MARGE.gauche - MARGE.droite;
  const zoneH = HAUTEUR - MARGE.haut - MARGE.bas;
  const largeurGroupe = zoneL / domaines.length;
  const largeurBarre = (largeurGroupe * 0.78) / modeles.length;

  return (
    <div className="mt-4 border border-border bg-surface p-4 shadow-panneau sm:p-6">
      <div className="-mx-4 overflow-x-auto px-4">
        <svg
          viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
          className="h-72 w-full min-w-[36rem]"
          role="img"
          aria-label="Regulatory accuracy by domain and by system"
        >
          {[0, 25, 50, 75, 100].map((t) => {
            const y = MARGE.haut + zoneH - (t / 100) * zoneH;
            return (
              <g key={t}>
                <line
                  x1={MARGE.gauche}
                  x2={LARGEUR - MARGE.droite}
                  y1={y}
                  y2={y}
                  stroke="var(--color-border)"
                  strokeWidth={1}
                />
                <text
                  x={MARGE.gauche - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[var(--color-muted-foreground)] font-mono"
                  fontSize={9}
                >
                  {t}
                </text>
              </g>
            );
          })}
          {domaines.map((domaine, i) => {
            const x0 = MARGE.gauche + i * largeurGroupe + largeurGroupe * 0.11;
            return (
              <g key={domaine}>
                {modeles.map((m, j) => {
                  const valeur = m.scores_domaines[domaine] ?? 0;
                  const h = (valeur / 100) * zoneH;
                  const opacite = 1 - (j / Math.max(1, modeles.length)) * 0.66;
                  return (
                    <rect
                      key={m.id}
                      x={x0 + j * largeurBarre}
                      y={MARGE.haut + zoneH - h}
                      width={Math.max(2, largeurBarre - 1.5)}
                      height={h}
                      fill="var(--color-accent)"
                      opacity={opacite}
                      rx={0.5}
                    >
                      <title>{`${m.nom} — ${NOMS_COURTS_DOMAINES[domaine] ?? domaine}: ${nb(valeur)}`}</title>
                    </rect>
                  );
                })}
                <text
                  x={MARGE.gauche + i * largeurGroupe + largeurGroupe / 2}
                  y={HAUTEUR - MARGE.bas + 16}
                  textAnchor="middle"
                  className="fill-[var(--color-foreground)] font-mono"
                  fontSize={10}
                >
                  {NOMS_COURTS_DOMAINES[domaine] ?? domaine}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-muted-foreground">
        {modeles.map((m, j) => (
          <li key={m.id} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-4 bg-accent"
              style={{ opacity: 1 - (j / Math.max(1, modeles.length)) * 0.66 }}
              aria-hidden="true"
            />
            {m.nom}
          </li>
        ))}
      </ul>

      <div className="mt-8 -mx-4 overflow-x-auto px-4">
        <table className="zebre w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-foreground/60 bg-surface-sunken">
              <th scope="col" className="entete-col py-2 pr-4 text-left">
                System
              </th>
              {domaines.map((d) => (
                <th key={d} scope="col" className="entete-col py-2 pr-4 text-right">
                  {NOMS_COURTS_DOMAINES[d] ?? d}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {modeles.map((m) => (
              <tr key={m.id} className="border-b border-border">
                <td className="py-2 pr-4">{m.nom}</td>
                {domaines.map((d) => (
                  <td key={d} className="py-2 pr-4 text-right font-mono tabulaire">
                    {nb(m.scores_domaines[d])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
