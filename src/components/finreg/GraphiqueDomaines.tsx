import { DOMAINES, nb, type Modele } from "@/lib/finreg";

const LARGEUR = 900;
const HAUTEUR = 300;
const MARGE = { haut: 12, bas: 34, gauche: 34, droite: 8 };

export function GraphiqueDomaines({ modeles }: { modeles: Modele[] }) {
  const zoneL = LARGEUR - MARGE.gauche - MARGE.droite;
  const zoneH = HAUTEUR - MARGE.haut - MARGE.bas;
  const largeurGroupe = zoneL / DOMAINES.length;
  const largeurBarre = (largeurGroupe * 0.78) / modeles.length;

  return (
    <div className="mt-4">
      <div className="-mx-4 overflow-x-auto px-4">
        <svg
          viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
          className="h-64 w-full min-w-[36rem]"
          role="img"
          aria-label="Scores par domaine réglementaire et par modèle"
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
          {DOMAINES.map((domaine, i) => {
            const x0 = MARGE.gauche + i * largeurGroupe + largeurGroupe * 0.11;
            return (
              <g key={domaine}>
                {modeles.map((m, j) => {
                  const valeur = m.scores_domaines[domaine] ?? 0;
                  const h = (valeur / 100) * zoneH;
                  const opacite = 1 - (j / Math.max(1, modeles.length)) * 0.72;
                  return (
                    <rect
                      key={m.id}
                      x={x0 + j * largeurBarre}
                      y={MARGE.haut + zoneH - h}
                      width={Math.max(2, largeurBarre - 1.5)}
                      height={h}
                      fill="var(--color-accent)"
                      opacity={opacite}
                    >
                      <title>{`${m.nom} — ${domaine} : ${nb(valeur)}`}</title>
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
                  {domaine}
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
              style={{ opacity: 1 - (j / Math.max(1, modeles.length)) * 0.72 }}
              aria-hidden="true"
            />
            {m.nom}
          </li>
        ))}
      </ul>

      <div className="mt-6 -mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr className="border-y border-border">
              <th scope="col" className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground">
                Modèle
              </th>
              {DOMAINES.map((d) => (
                <th
                  key={d}
                  scope="col"
                  className="py-2 pr-4 text-right text-xs font-medium text-muted-foreground"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modeles.map((m) => (
              <tr key={m.id} className="border-b border-border">
                <td className="py-2 pr-4">{m.nom}</td>
                {DOMAINES.map((d) => (
                  <td key={d} className="py-2 pr-4 text-right font-mono">
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
