import { createFileRoute } from "@tanstack/react-router";
import { Page, Panneau, Titre } from "@/components/finreg/Chrome";
import { useLangue } from "@/lib/langue";

/**
 * Adresse de contact publiée sur le site.
 *
 * À REMPLACER par l'adresse réelle avant la mise en ligne : tant que cette
 * valeur n'est pas celle d'une boîte relevée, la page le dit explicitement
 * plutôt que d'afficher un lien qui ne mène nulle part.
 */
const ADRESSE_CONTACT = "";

export const Route = createFileRoute("/private-benchmark")({
  head: () => ({
    meta: [
      { title: "Private benchmark — FinReg" },
      {
        name: "description",
        content:
          "Test your own regulatory corpus. A private question set, never published, to evaluate production systems without contamination.",
      },
      { property: "og:title", content: "Private benchmark — FinReg" },
      {
        property: "og:description",
        content: "Evaluate a production system on questions no model has seen. In preparation.",
      },
    ],
  }),
  component: CorpusPrive,
});

function CorpusPrive() {
  const { t } = useLangue();

  return (
    <Page>
      <Titre
        etiquette={t("Coming next", "Prochainement")}
        titre={t("Test your own regulatory corpus", "Testez votre propre corpus réglementaire")}
        chapeau={
          <span className="text-foreground">
            {t("See where AI gets ", "Voyez où l'IA se trompe sur ")}
            <em>{t("your", "votre")}</em>
            {t(
              " regulation wrong — on questions no model has been trained on.",
              " réglementation — sur des questions qu'aucun modèle n'a vues à l'entraînement.",
            )}
          </span>
        }
      />

      <section className="mt-8 max-w-2xl space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          {t(
            "The public corpus has a flaw inherent to being public: a system trained or tuned on these pages may have seen them, and a good score then proves less than it appears. The answer is a second question set, built the same way and scored the same way, that is never published.",
            "Le corpus public a un défaut inhérent à sa publicité : un système entraîné ou ajusté sur ces pages a pu les voir, et une bonne note prouve alors moins qu'il n'y paraît. La réponse est un second jeu de questions, construit et noté de la même manière, mais jamais publié.",
          )}
        </p>
        <p>
          {t(
            "It is meant for evaluating systems in production — compliance assistants, retrieval-augmented search, automated qualification pipelines — in their real configuration, with their own document base and their own guardrails. Evaluation runs on the same four axes as the public benchmark and returns, alongside the scores, the full list of failures with the source each answer should have cited.",
            "Il est destiné à l'évaluation de systèmes en production — assistants conformité, recherche augmentée, chaînes de qualification automatisées — dans leur configuration réelle, avec leur base documentaire et leurs garde-fous. L'évaluation porte sur les mêmes quatre axes que le benchmark public et restitue, à côté des notes, la liste complète des échecs avec la source que chaque réponse aurait dû citer.",
          )}
        </p>
        <p>
          {t(
            "Results would belong to the requester and would not be published; no element of the private corpus is disclosed, before or after a run.",
            "Les résultats appartiendraient au demandeur et ne seraient pas publiés ; aucun élément du corpus privé n'est divulgué, ni avant ni après une exécution.",
          )}
        </p>
      </section>

      <section className="mt-10 max-w-2xl">
        <Panneau className="p-6">
          <p className="font-mono text-[11px] tracking-[0.08em] text-accent uppercase">
            {t("Not yet operational", "Pas encore opérationnel")}
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            {t(
              "There is no upload, no submission form and no account. This page describes what the private benchmark will be, not a service that runs today. It is stated plainly here rather than behind a form that would accept a corpus and do nothing with it.",
              "Il n'y a ni dépôt de fichier, ni formulaire d'envoi, ni compte. Cette page décrit ce que sera le benchmark privé, pas un service qui tourne aujourd'hui. C'est dit franchement, plutôt que caché derrière un formulaire qui accepterait un corpus sans rien en faire.",
            )}
          </p>
          {ADRESSE_CONTACT ? (
            <a
              href={`mailto:${ADRESSE_CONTACT}?subject=${encodeURIComponent("FinReg — private benchmark")}`}
              className="mt-5 inline-block border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              {t("Get in touch", "Nous écrire")} — {ADRESSE_CONTACT}
            </a>
          ) : (
            <p className="mt-4 border-t border-rule pt-4 text-sm leading-relaxed text-muted-foreground">
              {t(
                "A contact address will be published with the first measured run.",
                "Une adresse de contact sera publiée avec la première exécution mesurée.",
              )}
            </p>
          )}
        </Panneau>
      </section>
    </Page>
  );
}
