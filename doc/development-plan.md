# Plan de développement - Site André Schlegel

## 1. Objectif produit
Construire un site statique Astro retraçant des faits historiques de la Seconde Guerre mondiale autour d'André Schlegel, avec une narration immersive centrée sur une page principale, enrichie par des pages de détail de contenu.

## 2. Architecture fonctionnelle
- Page principale (scroll narratif):
  - Hero de présentation (portrait + contexte historique)
  - Section de progression animée des contenus
  - Récapitulatif par année (cartes cliquables)
  - Footer (mentions/contact)
- Page détail par contenu (`/contenu/:slug`):
  - Galerie médias (images/vidéos)
  - Carte MapLibre (points + trajets)
  - Audio + transcription
  - Informations de grade/carnet si présentes

## 3. Modèle de données (collection Astro)
Créer une collection `content` avec frontmatter:
- `date` (yyyy-MM-dd)
- `title`
- `summary`
- `images[]`
- `videos[]` (optionnel)
- `logbookImage` (optionnel)
- `logbookText` (optionnel)
- `locations[]` (optionnel)
- `routes[]` (optionnel)
- `rankImage` (optionnel)
- `audio`
Le corps Markdown contient la transcription.

## 4. Plan de réalisation par phases
1. Fondation technique
- Structurer layouts Astro (`MainLayout`, `Section`, `TimelineCard`).
- Définir tokens design (couleurs, typo, espacements, z-index).
- Installer et intégrer Framer Motion côté composants interactifs.

2. Section Hero
- Construire une section pleine hauteur responsive.
- Ajouter animation d'entrée image + texte (fade/translate + léger parallax).

3. Moteur de progression narrative
- Créer un état de progression (index contenu + index étape).
- Mapper les étapes dynamiques selon contenu disponible.
- Gérer interactions:
  - scroll (avance/recul)
  - drag/touch sur barre de progression
  - clavier (flèches gauche/droite)
- Synchroniser UI: date/titre au-dessus de la barre + contenu actif.

4. Rendu des étapes médias
- Étapes: intro, carte, trajets, images, vidéos, carnet, grade.
- Créer animations dédiées par type de bloc.
- Autoriser accélération d'animation en cas de scroll utilisateur.

5. Carte et géographie
- Intégrer MapLibre GL.
- Afficher points, lignes de trajets et animation visuelle de route.
- Prévoir fallback visuel si géodonnées absentes.

6. Section récapitulative
- Grouper les contenus par année.
- Afficher cartes compactes et lien vers page détail.
- Garantir lisibilité mobile/desktop.

7. Page détail contenu
- Galerie cliquable (lightbox).
- Carte route complète.
- Lecteur audio + transcription.

8. Accessibilité, performance, SEO
- Contraste, focus states, navigation clavier.
- Optimiser images (tailles, lazy loading).
- Métadonnées SEO + OpenGraph.

9. QA et livraison
- Tests manuels mobile/desktop.
- Vérification des interactions de scroll et des cas sans médias optionnels.
- Build statique final et revue contenu historique.

## 5. Propositions design (3 pistes)
### Design A - "Archives cinématographiques"
- Palette: charbon, olive usé, ivoire.
- Typo: serif éditoriale + sans condensée.
- Ambiance: sombre, dramatique, grain léger.
- Animation: reveals progressifs, parallax doux, barre de progression lumineuse verticale.

### Design B - "Dossier militaire annoté"
- Palette: papier vieilli, encre noire, rouge cachet.
- Typo: style machine à écrire + serif documentaire.
- Ambiance: carnet/rapport classifié, blocs encadrés, tampons visuels.
- Animation: slides séquentiels, effet "tampon" à l'apparition, soulignement de dates.

### Design C - "Mémorial cartographique moderne"
- Palette: bleu acier, sable pâle, accents cuivre.
- Typo: display historique + lecture contemporaine.
- Ambiance: musée interactif, lignes cartographiques et modules superposés.
- Animation: transitions en panneaux, timeline horizontale animée, focus progressif sur la carte.

## 6. Décision recommandée
Commencer par Design A pour la première implémentation produit:
- meilleure cohérence avec une narration immersive longue.
- forte lisibilité sur mobile.
- animation plus facile à décliner ensuite sur les pages de détail.
