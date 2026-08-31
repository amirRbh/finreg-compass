# Refonte visuelle FinReg — passe « rapport de régulateur » soignée

Objectif : garder l'identité instrument de mesure (dense, austère, données au centre) mais élever la qualité typographique, le rythme vertical et la lisibilité des chiffres. Aucun changement de données, de calculs ni de routes.

## Direction retenue

- **Palette** : papier chaud (fond ivoire), encre chaude quasi-noire, une seule couleur d'accent brique désaturée. Aucun dégradé, aucune ombre marquée, aucune icône décorative.
- **Typographie** : titres en serif de rapport (Source Serif 4), texte courant en IBM Plex Sans, tous les chiffres en IBM Plex Mono avec chiffres tabulaires. Échelle typographique resserrée et cohérente entre les pages.
- **Grille** : colonne de contenu unique max-w-5xl, filets fins comme seul séparateur, numérotation de sections (01, 02, 03) en monospace.

## Modifications par page

**Global (`src/styles.css`, `Chrome.tsx`)**
- Tokens affinés : `--surface`, `--surface-sunken`, `--rule`, `--accent-soft`, ombre de panneau quasi nulle.
- En-tête : filet inférieur net, navigation en onglets carrés à contraste inversé sur l'élément actif.
- Pied de page : bandeau discret date d'exécution + nombre de questions, en monospace.
- Composants partagés : `Titre`, `Section`, `Panneau`, `Chargement`, `Erreur` harmonisés.

**Accueil (`index.tsx`)**
- Statistique unique en très grand caractère, alignée sur la grille, avec sous-titre d'une ligne et rappel de la méthode de calcul.
- Tableau de classement : en-têtes triables plus lisibles, lignes zébrées légères, colonne de rang en monospace, mise en avant sobre du modèle médian.
- Graphique en barres groupées : espacement des groupes revu, libellés de domaine plus lisibles, légende compacte, tableau numérique associé.

**Méthodologie (`methodology.tsx`)**
- Rythme de lecture : mesure de ligne limitée, barème des 4 axes en tableau serré, bloc de prompt système en monospace avec bouton de copie discret.

**Questions (`questions.tsx`)**
- Barre de filtres compacte (domaine, type, difficulté) en puces carrées.
- Lignes dépliables : hiérarchie claire question / réponse de référence / source / réponses des modèles ; flag `hallucination_source` signalé par un filet accent et une étiquette monospace, sans couleur criarde.

**Fiche modèle (`model.$id.tsx`)**
- Bandeau de métriques en grille, tableaux domaines/axes alignés, barres de score minimalistes, 5 échecs cités en blocs à filet accent.

**Corpus privé (`private-benchmark.tsx`)**
- Texte court sur une colonne étroite, formulaire aux champs carrés sans ombre, états succès/erreur sobres.

## Notes techniques

- Uniquement du frontend : classes Tailwind et tokens dans `src/styles.css`. Aucune valeur de couleur codée en dur dans les composants.
- Pas de `localStorage`/`sessionStorage`, dates au format français, chiffres à une décimale avec séparateur français : inchangé.
- Vérification finale : typecheck + capture Playwright des 5 routes.
