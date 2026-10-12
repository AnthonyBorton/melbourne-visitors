# One Fine Day — Melbourne

A visually rich, interactive single-day planner for friends visiting Melbourne. Visitors can choose
from local coffee shops, landmarks, cultural stops and food favourites, then see a timed itinerary
and route on a stylised city map. The header theme control switches between light and dark modes,
remembering the visitor's choice in their browser while otherwise following their system preference.

## Run locally

The site has no build step. Serve the folder with any static web server:

```powershell
npx serve .
```

## Deployment

Every push to `main` deploys the site to GitHub Pages using
`.github/workflows/deploy-pages.yml`.
