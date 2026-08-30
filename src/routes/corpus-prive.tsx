import { createFileRoute } from "@tanstack/react-router";
import { Page, Panneau } from "@/components/finreg/Chrome";

/**
 * Adresse de contact publiée sur le site.
 *
 * À REMPLACER par l'adresse réelle avant la mise en ligne : tant que cette
 * valeur n'est pas celle d'une boîte relevée, la page le dit explicitement
 * plutôt que d'afficher un lien qui ne mène nulle part.
 */
const ADRESSE_CONTACT = "";

export const Route = createFileRoute("/corpus-prive")({
  head: () => ({
    meta: [
      { title: "Corpus privé — FinReg" },
      {
        name: "description",
        content:
          "Un jeu de questions non publié sert à évaluer des systèmes réglementaires en production, hors contamination du corpus public.",
      },
      { property: "og:title", content: "Corpus privé — FinReg" },
      {
        property: "og:description",
        content: "Évaluation de systèmes en production sur un corpus non publié. Prise de contact.",
      },
    ],
  }),
  component: CorpusPrive,
});

function CorpusPrive() {
  return (
    <Page>
      <p className="etiquette">Évaluation sur corpus non publié</p>
      <h1 className="text-3xl leading-tight sm:text-4xl">Corpus privé</h1>

      <section className="mt-6 max-w-2xl space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          Le corpus public a un défaut inhérent à sa publication : un modèle entraîné ou ajusté sur
          les pages de ce site peut les avoir vues, et une bonne note n'y prouve alors plus
          grand-chose. La réponse est un second jeu de questions, de même construction et de même
          barème, qui n'est diffusé sous aucune forme.
        </p>
        <p>
          Il est destiné à évaluer des systèmes en production — assistants de conformité, moteurs de
          recherche documentaire augmentés, chaînes de qualification automatisée — dans leur
          configuration réelle, avec leur base documentaire et leurs garde-fous. L'évaluation porte
          sur les mêmes quatre axes que le classement public et restitue, en plus des scores, la
          liste intégrale des échecs avec leur source attendue.
        </p>
        <p>
          Les résultats appartiendraient au demandeur et ne seraient pas publiés ; aucun élément du
          corpus privé n'est communiqué, avant ou après l'exécution. Cette offre est en cours de
          constitution : elle est décrite ici telle qu'elle sera rendue, non comme un service déjà
          rodé.
        </p>
      </section>

      <section className="mt-12 max-w-xl">
        <Panneau className="p-6">
          <h2 className="border-b border-rule pb-2 text-lg">Prise de contact</h2>
          {ADRESSE_CONTACT ? (
            <>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Décrivez le système à évaluer, son périmètre réglementaire et le calendrier
                envisagé. Les échanges se font par courriel : le site ne collecte ni ne conserve
                aucune donnée.
              </p>
              <a
                href={`mailto:${ADRESSE_CONTACT}?subject=${encodeURIComponent("FinReg — évaluation sur corpus privé")}`}
                className="mt-5 inline-block border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
              >
                Écrire à {ADRESSE_CONTACT}
              </a>
            </>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              L'adresse de contact n'est pas encore publiée. Elle le sera avec la première exécution
              mesurée. Aucun formulaire n'est proposé ici : mieux vaut pas de canal du tout qu'un
              formulaire qui accuse réception sans transmettre la demande.
            </p>
          )}
        </Panneau>
      </section>
    </Page>
  );
}
