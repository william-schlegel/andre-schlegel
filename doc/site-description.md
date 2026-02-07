# André Schlegel

Ce site internet retrace l'histoire d'André Schlegel, commandant de bord et résistant pendant la 2de guerre mondiale.

Ce site est complètement statique et utilisera le framework Astro JS pour le build. Le projet existe déjà dans ce dossier en mode minimal. Beaucoup d'animations sont prévues dans ce site, on utilisera framer motion pour les gérer. On utiliser Tailwind css v4 pour le style.

La quasi totalité du site se trouve sur une page unique dont les sections seront détaillées ci après.

Le site doit être adapté à une navigation mobile en mode vertical ou sur desktop

La page se décompose comme ceci :

- Section de présentation
- présentation animée des contenus
- Récapitulatif des contenus par année
- footer

## section de présentation

Cette section est composée d'une photo du commandant ndré Schlegel et d'un texte de présentation. Elle prend toute la hauteur du viewport. La photo est affichée avec une petite animation ainsi que le texte.

En scrollant vers le bas, on arrive dans la seconde section

## Présentation des contenus

Cette section est également présentée sur la hauteur du viewport et elle présente les contenus séquentiellement en utilisant le scrolling comme trigger.

La section comprend une barre de progression, sur la gauche en mode desktop et en bas en mode mobile. Lorsque la section est afffichée sur le viewport, le scrolling va faire défiler la barre de progression qui animera le contenu article par article.

Les articles sont tirés d'une collection Astro comprenant des fichiers md avec frontmatter.

Chaque article comprend les insormations suivantes :

- Date du contenu format yyyy-MM-dd
- Titre du contenu
- description courte du contenu
- une liste d'images
- une liste de vidéos (optionnel)
- image du carnet de bord (optionnel)
- Texte accompagnant le carnet de bord (optionnel)
- Des informations de lieux (coordonnées GPS) (optionnel)
- Des informations de trajets (couples de coordonnées GPS départ/arrivée et image à faire voyager entre les 2 points sur la carte) (optionnel)
- grade (optionel) correspondant à une image également
- fichier audio du narateur

Le contenu du md est la transcription du fichier audio.

Le fonctionnement des animations sur cette secrtion est détaillé plus loin.

## récapitulatif des contenus

Lorsque la progression est arrivée au dernier contenu dans la section précédente, le scrolling reprend normalement et présente une liste des différents contenus triée par dates et regorupés par année puis par contenus de l'année sous forme de cartes. En cliquant sur une carte, on aura accès à une page dédiée avec l'ensemble des informations du contenu (route /contenu/:slug)

Cette page dédiée affichera des thumnails des images qui s'afficheront en grand en cliquant dessus, la carte avec les trajets dessinés dessus, la possibilité de relire le contenu audio et la transcription de ce contenu.

La présentation de la liste sera la suivante :

---

Année : 1939

---

| 6 avril ......| | 12 mai .............|
| Base de Tours | | Mission observation |

---

Année: 1940

---

| 6 avril ......| | 12 mai .............|
| Base de Tours | | Mission observation |

---

## Footer

Affichage de quelques informations de base (année, site créé par William Schlegel) et lien vers 2 pages : mentions et contact

## animations de la présentation des contenus

C'est la section la plus complex à développer. Elle présente une barre de progression dans l'ensemble des contenus de la collection. Le scroll dans la section fait avancer la barre de progession de présentation de contenu en présentation de contenu tant qu'elle n'est pas arrivée à la fin du dernier. On peut aussi faire avancer cette barre à la souris ou au doigt en mode mobile ou encore avec les flèches droite et gauche.

L'affichage d la date et du titre du contenu en cours est affiché au dessus de la barre de progression, si l'utilisateur la fait avancer à la souris, cet affichage se met à jour pour qu'il sache où il en est. Lorsqu'il relache la souris, le contenu sélectionné démarre.

A chaque incrément (scroll) la présentation des contenus avance d'une étape.

Il peut y avoir plusieurs étapes en fonction de ce qui est présent dans le contenu. Demanière la plus complète, on va avoir les étapes suivantes :

- Affichage de la date, du titre et de la description
- Affichage de la carte
- Affichage du ou des trajets s'ils existent
- Affichage des thumbnails des images (cliquables, dans ce cas ils s'affichent dans une popin)
- Affichage des thumbnails des vidéos (cliquables, dans ce cas ils s'affichent dans une popin)
- Affichage du carnet de bord et de son texte accompagnateur
- Affichage du grade s'il a changé

Chacun de ces affichages a une animation propre. Si l'utilisateur scrolle en même temps que l'animation, celle-ci s'accélère. La fin d'une animation entraine le démarrage automatique de la suivante.

Lorsque la dernière animation d'un contenu est jouée, l'application attend une action de l'utilisateur pour passer au contenu suivant et démarrer la série d'animations correspondantes.

Lorsque le dernier contenu est terminé, le scroll fait avancer la page jusqu'à la section suivante.
