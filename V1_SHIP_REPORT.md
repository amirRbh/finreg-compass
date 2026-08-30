# FINREG V1 — SHIP REPORT

## 1. What FinReg does

FinReg mesure ce qu'un modèle de langage sait réellement de la réglementation
financière française et européenne, et publie chaque note avec l'item qui l'a
produite.

Le pari du produit tient en une phrase : **un assistant qui cite un article
inexistant est inutilisable en conformité**, parce que sa réponse ne peut être
ni vérifiée, ni opposée, ni archivée. FinReg traite donc l'invention de source
comme un échec distinct de l'erreur de fond, et la mesure séparément.

Chaque item du corpus tient les cinq maillons de la chaîne :

```
Texte réglementaire  →  Question  →  Réponse de référence  →  Vérification  →  Note
   (acte, article)      (fermée)      (rédigée du texte)     (de la citation)  (4 axes)
```

## 2. Target user

Responsable conformité, RCCI, risk officer ou direction juridique en banque,
société de gestion, assurance ou fintech, confronté à la question « peut-on
laisser un assistant IA répondre à des questions réglementaires ? ».

Cible secondaire : éditeurs de solutions RegTech cherchant une mesure
indépendante, et investisseurs évaluant la fiabilité annoncée d'un produit.

## 3. Core user journey

```
Accueil                    le problème, la chaîne, un item en entier
  ↓
Corpus (/questions)        24 items filtrables, chacun avec son statut
  ↓
Item (/question/$id)       question → réponse attendue → article → vérification
  ↓                        → réponse de chaque système, notée sur 4 axes
Fiche système (/modele/$id) scores par domaine et par axe, échecs cités in extenso
  ↓
Méthodologie               barème, statuts, protocole, prompt système publié
```

Parcours vérifié de bout en bout au navigateur, en 3 minutes, sans impasse.

## 4. Features shipped

- **Page item (`/question/$id`)** — nouvelle, et centrale. C'est la page qui
  démontre le produit : la question, la réponse de référence, le texte et
  l'article dont elle sort avec lien vers la source officielle, le résultat du
  contrôle de cette citation, puis la réponse de chaque système avec ses quatre
  notes d'axe et ses drapeaux. Permalien, navigation item précédent / suivant.
- **Accueil reconstruit** — énonce le problème et la chaîne mesurée avant tout
  chiffre, montre un item en entier, puis les agrégats et le classement.
- **Statut de vérification par item** — « source vérifiée » / « en cours de
  vérification », avec la raison exacte du blocage, visible partout où l'item
  apparaît, et filtrable dans le corpus.
- **Bandeau de statut du jeu de données** — permanent, sur toutes les pages,
  découlant d'un champ des données et non d'un texte en dur.
- **Données recalculées** — plus aucun agrégat n'est saisi à la main.
- **Corpus explorable** — filtres domaine / type / difficulté / vérification,
  items cliquables portant leur source.
- **35 tests**, scripts `typecheck` / `lint` / `test` / `donnees` / `verifier`.
- **Aperçu de partage** (Open Graph) et métadonnées par page.

## 5. Features deliberately postponed

| Reporté | Raison |
| --- | --- |
| Exécution réelle des modèles | Demande des clés API, un budget et un protocole d'exécution — c'est la V1.1, pas la V1 |
| Élargissement du corpus au-delà de 24 items | 24 items bien sourcés démontrent l'instrument ; 500 médiocres le décrédibiliseraient |
| Corpus privé opérationnel | Décrit comme offre, pas encore constitué |
| Formulaire de contact | Retiré plutôt que laissé factice (voir §13) |
| Recherche plein texte, comparateur de systèmes, export | Confort, pas compréhension |
| Historique des exécutions, suivi dans le temps | Suppose plusieurs exécutions réelles |
| Analytics, i18n, API publique, authentification | Hors V1 |

## 6. Regulatory coverage

Cinq domaines, 24 items, 10 textes distincts :

| Domaine | Items | Textes principaux |
| --- | --- | --- |
| SFDR | 5 | Règlement (UE) 2019/2088, règlement délégué (UE) 2022/1288 |
| MIF 2 | 5 | Directive 2014/65/UE, règlement délégué (UE) 2017/565 |
| AMF | 4 | Règlement (UE) 596/2014 (MAR), (UE) 2017/1129, directive 2011/61/UE, code de commerce |
| DORA | 5 | Règlement (UE) 2022/2554 |
| LCB-FT | 5 | Code monétaire et financier |

Types représentés : qualification, procédure, périmètre, datation, calcul.
Trois niveaux de difficulté. Toutes les sources pointent vers EUR-Lex ou
Légifrance — un test le vérifie.

Ce n'est **pas** une couverture de la réglementation financière : c'est un
échantillon suffisant pour démontrer l'instrument.

## 7. Verified rules

**18 items sur 24** portent le statut « source vérifiée » : le texte et
l'article cités ont été contrôlés, ils existent et portent la règle énoncée par
la réponse de référence.

Ce contrôle porte sur la citation. Il ne vaut pas avis juridique et ne préjuge
pas de l'application de la règle à un cas d'espèce — la page méthodologie le
dit explicitement, et l'interface le répète sur chaque item.

## 8. Pending rules

**6 items** restent publiés en « cours de vérification », avec la raison du
blocage affichée :

| Item | Ce qui bloque |
| --- | --- |
| `SFDR-0003` | L'option de l'article 17 est ouverte aux États membres ; le choix français n'a pas été confirmé sur source officielle |
| `DORA-0014` | Les délais de 4 h / 24 h relèvent des normes techniques, pas de l'article 19 |
| `DORA-0018` | Les seuils de matérialité relèvent du règlement délégué de classification |
| `LCBFT-0020` | Numérotation de l'article de la partie réglementaire non confirmée |
| `LCBFT-0021` | Le seuil de loyer n'est rattaché à aucun article précis |
| `LCBFT-0022` | Le lien publié pointe vers la section du code, pas vers l'article |

Aucun n'a été promu, retiré ni masqué. C'est le comportement voulu : la
distinction entre vérifié et non vérifié est le produit.

## 9. Demo dataset

Le classement est un **échantillon de démonstration**, marqué comme tel :

- 5 systèmes « Modèle A » à « Modèle E », décrits par un archétype
  (« généraliste, très grande taille », « ouvert, poids publiés »). **Aucun
  éditeur réel n'est nommé, aucun produit commercialisé n'est noté.**
- 120 évaluations écrites une par une, chacune rattachée à la règle, au seuil ou
  à la date de son item.
- Chaque réponse notée de 0 à 2 sur les quatre axes ; la note sur 10 et tous les
  agrégats en sont déduits.

Résultats de l'échantillon : 84,5 / 72,0 / 55,0 / 24,2 / 23,7 sur 100.
Sur les 120 réponses, **10,8 % citent une source inexistante, abrogée ou hors
sujet**, et 60,8 points séparent le meilleur du moins bon système.

Deux mécanismes tiennent la distinction :

1. `results.json` porte un champ `statut`. Tant qu'il vaut
   `echantillon_demonstration`, le bandeau s'affiche sur toutes les pages. Le
   bandeau et les chiffres découlent de la **même requête de données** et sont
   conditionnés au même objet : aucun chiffre ne peut donc s'afficher sans la
   mention qui le qualifie. Le jour où une exécution mesurée remplacera
   l'échantillon, la mention disparaîtra d'elle-même — et pas avant.
2. Aucun agrégat n'est saisi à la main, et un test refuse tout chiffre publié
   qui ne se recalcule pas depuis le corpus.

## 10. Technical architecture

TanStack Start (React 19, Vite 8, Tailwind v4), **sans backend**. Les pages
lisent deux fichiers statiques servis depuis `public/data/`.

```
scripts/corpus-source.json         ← source d'autorité : questions, sources, vérification
scripts/reponses-echantillon.json  ← source d'autorité : réponses de l'échantillon
        │
        └── scripts/construire-donnees.mjs      (bun run donnees)
                    ├── public/data/questions.json
                    └── public/data/results.json   (agrégats recalculés)
```

Un seul circuit : les fichiers de `scripts/` s'éditent, ceux de `public/data/`
se génèrent. Aucun chemin parallèle n'a été créé.

Supprimé : `src/lib/corpus-prive.ts` (placeholder d'envoi qui jetait la saisie),
`mediane` et `modeleMedian` (devenues inutilisées).

## 11. Tests

```
bun run verifier   →  typecheck + lint + test + build
```

| Étape | Résultat |
| --- | --- |
| `typecheck` (tsc --noEmit) | PASS |
| `lint` (eslint + prettier) | PASS — 0 erreur, 6 avertissements préexistants sur les composants shadcn/ui |
| `test` (vitest) | PASS — 35 tests, 2 fichiers |
| `build` (vite + nitro) | PASS |

Les tests protègent les propriétés dont dépend la crédibilité, pas
l'apparence. Ils refusent : une source hors EUR-Lex / Légifrance, une
appréciation recopiée d'un item à l'autre, un agrégat qui ne se recalcule pas,
une date d'exécution dans le futur, un nombre de questions annoncé supérieur au
nombre publié, un item marqué vérifié dont le lien ne pointe pas vers l'article
cité, et un échantillon de démonstration qui nommerait un éditeur réel.

Trois d'entre eux ont trouvé de vrais défauts en étant écrits (quatre
appréciations dupliquées, une trop laconique pour être une évaluation).

## 12. Deployment

Le build produit une application Nitro ciblant Cloudflare Workers (`.output/`,
`wrangler.json` généré, 676 Ko d'assets publics). Le projet est connecté à
Lovable : les commits poussés sur la branche connectée y sont synchronisés.

Aucun secret, aucune clé API, aucune variable d'environnement, aucun endpoint :
le site est intégralement statique. Rien à configurer pour déployer.

**Aucune URL de démo n'a été publiée depuis cette session** : le déploiement
passe par le compte Lovable / Cloudflare du fondateur, auquel je n'ai pas accès.

## 13. Known limitations

1. **Le classement ne mesure rien.** C'est un échantillon écrit à la main. Il
   démontre l'instrument, il ne dit rien sur aucun modèle réel. C'est la
   limitation majeure, et elle est affichée en permanence.
2. **24 items ne couvrent pas la réglementation.** Un écart de quelques points
   n'y serait pas significatif ; seuls les écarts de nature se lisent.
3. **Pas de canal de contact.** Le formulaire promettait une réponse sous cinq
   jours ouvrés alors que rien n'était transmis. Il est retiré ; la constante
   `ADRESSE_CONTACT` dans `src/routes/corpus-prive.tsx` n'attend qu'une adresse
   pour réactiver un lien `mailto`. **À faire avant tout pitch.**
4. **Corpus public donc contaminable** — assumé et expliqué ; c'est la raison
   d'être du corpus privé.
5. **Vérification = contrôle de citation**, pas revue juridique. Aucun juriste
   n'a validé les réponses de référence, et le site ne le prétend nulle part.
6. `vite preview` échoue (il cherche `dist/server/server.js` là où nitro écrit
   `.output/`). Sans effet sur `dev` ni sur le déploiement.

## 14. Recommended next 5 actions

1. **Renseigner `ADRESSE_CONTACT`** et redéployer. Un pitch sans moyen de
   recontact perd le lead. 5 minutes.
2. **Déployer et faire circuler l'URL** auprès de 5 responsables conformité.
   L'objectif est une réaction, pas une vente.
3. **Exécuter une vraie mesure sur 2 ou 3 modèles**, sur ces 24 items. Le
   pipeline est prêt : remplacer `reponses-echantillon.json`, passer `statut` à
   `execution_mesuree`, relancer `bun run donnees`. Le bandeau tombe de
   lui-même. C'est ce qui transforme la démo en produit.
4. **Lever les 6 items en revue** en retrouvant les références manquantes.
   18/24 → 24/24 renforce l'argument central.
5. **Écouter avant d'élargir.** Ne pas ajouter de domaine ni de question tant
   que 5 professionnels n'ont pas dit ce qui leur manque.

## 15. V2 ideas

- Exécutions datées et suivi de l'évolution des modèles dans le temps.
- Évaluation de systèmes augmentés (RAG) et non plus de modèles nus — c'est ce
  que déploient réellement les équipes conformité.
- Corpus privé opérationnel, avec rapport d'échecs livré au demandeur.
- Attestation d'évaluation exploitable en comité des risques.
- Ouverture du corpus à contribution de praticiens, avec circuit de validation.
- Extension à d'autres juridictions (Luxembourg, Belgique, Suisse) ou domaines
  (MiCA, CSRD, Bâle).
- API de scoring pour intégration continue chez un éditeur.
