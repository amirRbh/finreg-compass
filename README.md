# FinReg Compass

Construis un site public de benchmark : "FinReg ", un classement 

de fiabilité des modèles de langage sur la réglementation financière 

française et européenne. Le site est en français.

POSITIONNEMENT VISUEL

C'est un instrument de mesure, pas une startup. L'esthétique de 

référence est celle d'un rapport de régulateur ou d'un papier de 

recherche : dense, austère, la donnée occupe la place. Fond clair, 

une seule couleur d'accent, chiffres en police monospace, tableaux 

serrés. Interdits : dégradés, ombres portées, illustrations, 

emoji, icônes décoratives, hero marketing, témoignages, badges 

"as seen on".

DONNÉES

Aucun backend. Tout est lu depuis deux fichiers statiques dans 

/public/data/. Crée-les avec des données factices respectant 

exactement ces formes :

results.json :

{ "date_execution": "2026-09-15", "nb_questions": 150, "nb_runs": 3,

  "modeles": [ { "id": "modele-a", "nom": "Modèle A", "editeur": "…",

    "score_global": 72.4, "taux_hallucination_source": 11.2,

    "taux_abstention_correcte": 34.0, "ecart_type": 2.1,

    "scores_domaines": { "SFDR": 78.0, "MIFID": 69.5, "AMF": 55.2,

      "DORA": 81.0, "LCBFT": 74.3 },

    "scores_axes": { "exactitude": 1.6, "sourcing": 1.2,

      "calibration": 1.1, "exploitabilite": 1.7 } } ] }

questions.json : liste d'items

{ "id": "SFDR-0001", "domaine": "SFDR", "type": "qualification",

  "difficulte": 2, "question": "…", "reponse_reference": "…",

  "source": { "texte": "…", "article": "…", "url": "…" },

  "reponses_modeles": { "modele-a": { "texte": "…", "score": 6,

    "flags": ["hallucination_source"] } } }

PAGES

1. Accueil — en haut, une seule statistique en très grand caractère : 

le taux d'hallucination de source du modèle médian, avec sous-titre 

explicatif d'une ligne. Puis le tableau de classement : rang, modèle, 

éditeur, score global, taux d'hallucination, écart-type. Colonnes 

triables. Une ligne par modèle, pas de cartes. Sous le tableau, un 

graphique en barres groupées des scores par domaine.

2. Méthodologie — texte long, structuré, avec le barème des 4 axes 

en tableau, le protocole d'exécution et le prompt système publié 

dans un bloc de code copiable.

3. Questions — explorateur du corpus public. Filtres par domaine, 

type et difficulté. Chaque item est une ligne dépliable qui révèle 

la réponse de référence, la source cliquable, et les réponses des 

modèles avec leur score et leurs flags. Les items flaggés 

"hallucination_source" sont signalés visuellement de manière sobre.

4. Modèle/:id — fiche détaillée d'un modèle : scores par domaine, 

par axe, et les 5 échecs les plus significatifs cités in extenso.

5. Corpus privé — page courte expliquant qu'un jeu de questions 

non publié existe et sert à évaluer des systèmes en production. 

Un formulaire simple (nom, société, email, message) qui appelle 

une fonction placeholder à brancher plus tard. Pas de tarif affiché.

CONTRAINTES TECHNIQUES

React + Tailwind, responsive mobile. Pas de localStorage ni de 

sessionStorage. Dates au format français. Tous les chiffres avec 

une décimale et le séparateur français. Un bandeau discret en pied 

de page indiquant la date de la dernière exécution et le nombre 

de questions.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c47fae80-3159-4847-9ba3-d8c5dda9c555).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
