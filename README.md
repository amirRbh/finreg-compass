# FinReg

Banc de mesure public de la fiabilité des modèles de langage sur la
réglementation financière française et européenne — SFDR, MIF 2, doctrine et
réglementation AMF, DORA, LCB-FT. Le site est en français.

## Ce que fait le produit

Un assistant qui cite un article inexistant est inutilisable en conformité : sa
réponse ne peut être ni vérifiée, ni opposée, ni archivée. FinReg confronte les
modèles à des questions dont la réponse *et* la source sont établies, puis
publie chaque note avec l'item qui l'a produite.

Chaque item du corpus tient les cinq maillons de la chaîne :

```
Texte réglementaire  →  Question  →  Réponse de référence  →  Vérification  →  Note
   (acte, article)      (fermée)      (rédigée du texte)      (de la citation)  (4 axes)
```

## Statut du jeu de données publié

Le corpus, les réponses de référence, les sources et leur statut de
vérification sont réels. **Le classement, lui, est un échantillon de
démonstration** : les cinq systèmes « Modèle A » à « Modèle E » sont des
archétypes, et leurs réponses ont été écrites à la main pour illustrer ce que
mesure chaque axe du barème. Aucun modèle commercialisé n'est nommé, noté ni
classé.

Deux mécanismes tiennent cette distinction, plutôt qu'une simple bonne
intention :

- `public/data/results.json` porte un champ `statut`. Tant qu'il vaut
  `echantillon_demonstration`, un bandeau apparaît en haut de **toutes** les
  pages. Il disparaîtra le jour où une exécution mesurée remplacera
  l'échantillon, et pas avant.
- Aucun agrégat n'est saisi à la main. Score global, taux de source inventée,
  taux d'abstention, scores par domaine et par axe sont tous recalculés depuis
  les réponses item par item, et un test le vérifie à chaque exécution.

De la même manière, un item dont la citation n'a pas pu être rattachée à un
article précis reste publié avec le statut « en cours de vérification » et la
raison exacte du blocage. Il n'est jamais promu au rang de vérifié.

## Architecture

Application [TanStack Start](https://tanstack.com/start) (React 19, Vite,
Tailwind v4), sans backend. Les pages lisent deux fichiers statiques servis
depuis `public/data/`.

```
scripts/corpus-source.json         questions, sources, statut de vérification
scripts/reponses-echantillon.json  réponses de l'échantillon de démonstration
        │
        └── scripts/construire-donnees.mjs   (bun run donnees)
                    │
                    ├── public/data/questions.json
                    └── public/data/results.json
```

Les deux fichiers de `scripts/` sont les sources d'autorité : c'est là qu'on
édite le corpus. Les fichiers de `public/data/` sont générés — les modifier à
la main serait sans effet à la prochaine génération, et casserait les tests
d'intégrité.

### Pages

| Route            | Rôle                                                             |
| ---------------- | ---------------------------------------------------------------- |
| `/`              | Ce que fait FinReg, la chaîne, un item en entier, le classement   |
| `/questions`     | Corpus public, filtrable par domaine, type, difficulté et statut  |
| `/question/$id`  | Un item de bout en bout : question → source → vérification → notes |
| `/modele/$id`    | Fiche d'un système : scores par domaine, par axe, échecs cités     |
| `/methodologie`  | Barème, statuts de vérification, protocole, prompt système publié  |
| `/corpus-prive`  | Évaluation sur corpus non publié                                   |

## Développement

```bash
bun install
bun run dev          # serveur de développement
bun run donnees      # régénère public/data depuis scripts/
bun run verifier     # typecheck + lint + tests + build
```

Commandes disponibles séparément : `typecheck`, `lint`, `test`, `test:watch`,
`build`, `format`.

### Modifier le corpus

1. Éditer `scripts/corpus-source.json` (question, source, statut de
   vérification) et `scripts/reponses-echantillon.json` (réponses évaluées,
   notées de 0 à 2 sur les quatre axes).
2. `bun run donnees`
3. `bun run test` — les contrôles d'intégrité refusent notamment une source non
   officielle, une appréciation recopiée d'un item à l'autre, un agrégat qui ne
   se recalcule pas, une date d'exécution dans le futur, ou un item marqué
   vérifié dont le lien ne pointe pas vers l'article cité.

## Déploiement

Le build produit une application Nitro ciblant Cloudflare Workers
(`.output/`, `wrangler.json` généré). Le projet est connecté à
[Lovable](https://lovable.dev) : les commits poussés sur la branche connectée
sont synchronisés vers l'éditeur.

## Avertissement

FinReg publie des mesures, pas des conseils. Ni le classement ni les réponses
de référence ne constituent un avis juridique. Le contrôle de vérification
porte sur l'existence et la pertinence de la citation, pas sur l'application de
la règle à un cas d'espèce.
