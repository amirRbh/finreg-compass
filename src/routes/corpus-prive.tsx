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
  component: CorpusPrive;
});

function CorpusPrive() {
  return null;
}
