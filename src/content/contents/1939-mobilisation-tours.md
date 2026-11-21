---
date: 1939-09-03
title: Mobilisation a Tours
description: "Preparation des equipages et premiers ordres de deploiement sur l'axe Atlantique."
images:
  - https://picsum.photos/760/460?grayscale&random=311
  - https://picsum.photos/760/460?grayscale&random=312
  - https://picsum.photos/760/460?grayscale&random=313
  - https://picsum.photos/760/460?grayscale&random=314
routes:
  - from:
      name: Tours
      lng: 0.6848
      lat: 47.3941
    to:
      name: Londres
      lng: -0.1276
      lat: 51.5072
  - from:
      name: Londres
      lng: -0.1276
      lat: 51.5072
    to:
      name: Berlin
      lng: 13.405
      lat: 52.52
timeline:
  - cue: date
    delayMs: 0
  - cue: title
    delayMs: 100
  - cue: description
    delayMs: 200
  - cue: map
    delayMs: 200
  - cue: route
    delayMs: 300
    routeIndex: 0
  - cue: image
    delayMs: 200
    imageIndex: 0
    side: left
    holdMs: 1800
  - cue: image
    delayMs: 250
    imageIndex: 1
    side: right
    holdMs: 1400
  - cue: route
    delayMs: 1050
    routeIndex: 1
  - cue: image
    delayMs: 2700
    imageIndex: 2
    side: left
    holdMs: 2200
---
Le carnet mentionne la mise en alerte rapide de la base et la preparation des equipages.
Les premiers vols de liaison visent a coordonner les mouvements entre Tours et Londres.
