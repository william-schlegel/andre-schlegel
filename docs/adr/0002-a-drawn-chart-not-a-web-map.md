# A drawn Chart, not a web map

The Chart is drawn by the site itself from open coastline and border outlines, in the manner of a period aeronautical chart, instead of being a restyled modern web map. MapLibre was already installed in the repo and has been removed on purpose. A web map shows today's borders and place names where the story needs those of 1936–1947 ("Afrique française du Nord", wartime Germany), it depends on an outside tile service for a site that should keep working as plain static files, and its look cannot be brought fully into the "Dossier sous la lampe" identity.

## Considered options

- **A modern interactive web map with an aged look** — rejected for the reasons above, at the cost of losing free zoom down to the individual airfields.
- **A separate map per Scene** — rejected because the Route must read as one continuous line across the whole Journey.
