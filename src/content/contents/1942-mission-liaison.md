---
date: 1942-11-08
title: Mission de liaison
description: Transmission de messages strategiques entre les bases allies et les points de ravitaillement.
images:
  - https://picsum.photos/760/460?grayscale&random=321
  - https://picsum.photos/760/460?grayscale&random=322
  - https://picsum.photos/760/460?grayscale&random=323
  - https://picsum.photos/760/460?grayscale&random=324
routes:
  - from:
      name: Berlin
      lng: 13.405
      lat: 52.52
    to:
      name: Prague
      lng: 14.4378
      lat: 50.0755
  - from:
      name: Prague
      lng: 14.4378
      lat: 50.0755
    to:
      name: Bruxelles
      lng: 4.3517
      lat: 50.8503
timeline:
  - cue: date
    delayMs: 0
  - cue: title
    delayMs: 120
  - cue: description
    delayMs: 220
  - cue: map
    delayMs: 240
  - cue: route
    delayMs: 320
    routeIndex: 0
  - cue: image
    delayMs: 300
    imageIndex: 0
    side: right
  - cue: image
    delayMs: 400
    imageIndex: 1
    side: left
  - cue: route
    delayMs: 900
    routeIndex: 1
  - cue: image
    delayMs: 700
    imageIndex: 2
    side: right
---
Les liaisons radio et physiques sont multipliees pour assurer la circulation des informations.
Le journal de mission decrit une chaine continue entre les equipes europeennes.
