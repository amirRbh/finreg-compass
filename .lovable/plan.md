# FinReg — benchmark public de fiabilité des LLM sur la réglementation financière

Site statique en français, sans backend : toutes les données proviennent de deux fichiers JSON servis depuis `/public/data/`.

## Direction visuelle

Instrument de mesure, pas produit marketing : fond clair quasi-blanc, texte gris très foncé, **une seule couleur d'accent** (bleu ardoise sobre) réservée aux liens, en-têtes de tri actifs et barres de graphique. Chiffres en monospace, tableaux denses avec filets fins de 1px, titres en sans-serif compact. Aucun dégradé, ombre, illustration, emoji, icône décorative, hero marketing ni témoignage. Densité type rapport de régulateur. Responsive : tableaux en défilement horizontal contrôlé sur mobile, pas de transformation en cartes.

## Données factices

- `public/data/results.json` — 6 modèles (éditeurs plausibles : OpenAI, Anthropic, Google, Mistral, Meta, Alibaba), avec `date_execution`, `nb_questions: 150`, `nb_runs: 3`, et pour chaque modèle score global, taux d'hallucination de source, taux d'abstention correcte, écart-type, `scores_domaines` (SFDR, MIFID, AMF, DORA, LCBFT) et `scores_axes` (exactitude, sourcing, calibration, exploitabilité).
- `public/data/questions.json` — ~24 items répartis sur les 5 domaines, plusieurs types (qualification, calcul, procédure, périmètre, datation), difficultés 1–3, avec réponse de référence, source (texte, article, URL réelle vers Legifrance/EUR-Lex/AMF) et `reponses_modeles` pour les 6 modèles, incluant des scores variés et des flags dont `hallucination_source`.

Formes strictement conformes à celles fournies dans la demande.

## Pages

1. **Accueil `/`** — en tête, une seule statistique en très grand monospace : taux d'hallucination de source du modèle **médian**, avec une ligne d'explication. Puis le tableau de classement (rang, modèle, éditeur, score global, taux d'hallucination, écart-type), colonnes triables par clic sur l'en-tête, une ligne par modèle, nom cliquable vers la fiche. Sous le tableau, un graphique en barres groupées des scores par domaine (SVG maison, sans librairie de charts, monochrome à intensités variables + légende textuelle).
2. **Méthodologie `/methodologie`** — texte long structuré : objet du benchmark, construction du corpus, barème des 4 axes en tableau (0–2 par axe, critères explicités), protocole d'exécution (3 runs, température, agrégation, calcul des taux), limites, et le prompt système publié dans un bloc `<pre>` monospace avec bouton « Copier » (Clipboard API, aucun stockage).
3. **Questions `/questions`** — explorateur du corpus : filtres domaine / type / difficulté (état React en mémoire, aucun localStorage), compteur de résultats, une ligne par item dépliable qui révèle réponse de référence, source cliquable (article + URL) et le tableau des réponses des modèles avec score et flags. Les items portant `hallucination_source` reçoivent un marqueur sobre : filet gauche en accent + mention textuelle.
4. **Fiche modèle `/modele/$id`** — identité, métriques globales, scores par domaine et par axe en tableaux, puis les 5 échecs les plus significatifs (scores les plus bas / flags) cités in extenso avec la réponse de référence en regard. 404 propre si l'id est inconnu.
5. **Corpus privé `/corpus-prive`** — page courte : existence d'un jeu de questions non publié utilisé pour évaluer des systèmes en production, ce qui le distingue du corpus public, aucun tarif. Formulaire nom / société / email / message appelant une fonction placeholder (`envoyerDemandeCorpusPrive`) documentée comme à brancher plus tard, avec état d'envoi et message de confirmation.

Navigation textuelle sobre en en-tête sur toutes les pages. Pied de page : bandeau discret « Dernière exécution : 15/09/2026 — 150 questions — 3 runs », alimenté par `results.json`.

## Détails techniques

- Routes TanStack Router : `index.tsx`, `methodologie.tsx`, `questions.tsx`, `modele.$id.tsx`, `corpus-prive.tsx`, chacune avec son propre `head()` (titre et description spécifiques, og/twitter).
- Chargement des JSON via TanStack Query (`fetch('/data/…')`), typé, partagé par un module `src/lib/finreg.ts` (types, chargement, tri, médiane, sélection des échecs).
- Formatage centralisé : `Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })` pour tous les nombres, dates au format `JJ/MM/AAAA`.
- Tokens de couleur et typographie ajoutés dans `src/styles.css` (`@theme inline`) ; polices chargées par `<link>` dans `__root.tsx` (sans-serif compact + monospace). Aucune couleur codée en dur dans les composants.
- Aucun `localStorage` / `sessionStorage`, aucun backend, aucune librairie de graphiques.
