import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/finreg/Chrome";
import { envoyerDemandeCorpusPrive } from "@/lib/corpus-prive";

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
        content:
          "Évaluation de systèmes en production sur un corpus non publié. Prise de contact.",
      },
    ],
  }),
  component: CorpusPrive,
});

type Etat = "saisie" | "envoi" | "envoye" | "erreur";

function CorpusPrive() {
  const [nom, setNom] = useState("");
  const [societe, setSociete] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [etat, setEtat] = useState<Etat>("saisie");

  const soumettre = async (evenement: React.FormEvent) => {
    evenement.preventDefault();
    setEtat("envoi");
    try {
      await envoyerDemandeCorpusPrive({ nom, societe, email, message });
      setEtat("envoye");
    } catch {
      setEtat("erreur");
    }
  };

  return (
    <Page>
      <h1 className="text-lg font-semibold tracking-tight">Corpus privé</h1>

      <section className="mt-4 max-w-2xl space-y-3 text-sm leading-relaxed">
        <p>
          À côté du corpus public, FinReg maintient un jeu de questions non publié, de même
          construction et de même barème. Il n'est diffusé sous aucune forme, ce qui le préserve de
          la contamination : un modèle entraîné ou ajusté sur les pages de ce site ne peut pas
          l'avoir vu.
        </p>
        <p>
          Ce corpus sert à évaluer des systèmes en production — assistants de conformité,
          moteurs de recherche documentaire augmentés, chaînes de qualification automatisée — dans
          leur configuration réelle, avec leur base documentaire et leurs garde-fous. L'évaluation
          porte sur les mêmes quatre axes que le classement public et restitue, en plus des scores,
          la liste intégrale des échecs avec leur source attendue.
        </p>
        <p>
          Les résultats appartiennent au demandeur et ne sont pas publiés. Aucun élément du corpus
          privé n'est communiqué, avant ou après l'exécution.
        </p>
      </section>

      <section className="mt-10 max-w-xl border-t border-border pt-6">
        <h2 className="text-sm font-semibold tracking-tight">Prise de contact</h2>
        {etat === "envoye" ? (
          <p className="mt-3 text-sm">
            Demande enregistrée. Une réponse est adressée à l'adresse indiquée sous cinq jours
            ouvrés.
          </p>
        ) : (
          <form onSubmit={soumettre} className="mt-4 space-y-4">
            <Champ libelle="Nom" valeur={nom} onChange={setNom} requis />
            <Champ libelle="Société" valeur={societe} onChange={setSociete} requis />
            <Champ
              libelle="Email professionnel"
              valeur={email}
              onChange={setEmail}
              type="email"
              requis
            />
            <label className="block">
              <span className="text-xs text-muted-foreground">Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
                className="mt-1 w-full border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={etat === "envoi"}
              className="border border-accent px-3 py-1.5 text-sm text-accent disabled:opacity-50"
            >
              {etat === "envoi" ? "Envoi…" : "Envoyer la demande"}
            </button>
            {etat === "erreur" && (
              <p className="font-mono text-[11px] text-destructive">
                L'envoi a échoué. Réessayez ultérieurement.
              </p>
            )}
            <p className="font-mono text-[11px] text-muted-foreground">
              Le formulaire appelle une fonction d'envoi encore à brancher : aucune donnée n'est
              transmise ni conservée à ce stade.
            </p>
          </form>
        )}
      </section>
    </Page>
  );
}

function Champ({
  libelle,
  valeur,
  onChange,
  type = "text",
  requis = false,
}: {
  libelle: string;
  valeur: string;
  onChange: (v: string) => void;
  type?: string;
  requis?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{libelle}</span>
      <input
        type={type}
        value={valeur}
        required={requis}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
      />
    </label>
  );
}
