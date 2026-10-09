# One Fine Day — Melbourne

A visually rich, interactive single-day planner for friends visiting Melbourne. Visitors can choose
from local coffee shops, landmarks, cultural stops and food favourites, then see a timed itinerary
and route on a stylised city map.

## Themes

The site follows your system color scheme by default. Use the sun/moon control in the header to
choose light or dark mode; your choice is saved in this browser. To preview a theme without changing
your saved choice, add `?scoutTheme=light` or `?scoutTheme=dark` to the page URL.

## Run locally

The site has no build step. Serve the folder with any static web server:

```powershell
npx serve .
```

## Deployment

Every push to `main` deploys the site to GitHub Pages using
`.github/workflows/deploy-pages.yml`.
