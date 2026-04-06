# Rogue Gambit

Rogue Gambit is a browser game that mixes chess tactics with roguelike progression:
- draft new pieces between rounds
- fight tactical battles on a chess board
- buy upgrades in the shop and collect relics

## Quick Analysis

Current strengths:
- clear screen/state flow (title, draft, shop, match, codex, options)
- modular JS split by domain (board, pieces, AI, draft, relics, saves, renderer)
- good replay loop (draft -> battle -> shop -> draft)

Top improvements to prioritize next:
- add a balance pass for strongest special pieces/relic combinations
- add lightweight automated smoke tests for critical flows (start run, save/load, end round)
- add an in-game tutorial overlay for first-time players

## Run Locally

Use any static server. Example:

```bash
npx http-server . -p 8080 -c-1
```

Then open `http://localhost:8080`.

## Publish On GitHub

If this folder is not yet a git repository:

```bash
git init
git add .
git commit -m "Initial release: Rogue Gambit"
```

Create an empty GitHub repository (example: `rogue-gambit`) and push:

```bash
git branch -M main
git remote add origin https://github.com/<your-user>/rogue-gambit.git
git push -u origin main
```

## Deploy With GitHub Pages

1. Open repository Settings -> Pages.
2. In Build and deployment, choose Deploy from a branch.
3. Select branch `main`, folder `/ (root)`.
4. Save and wait for deployment.

Your game will be available at:

`https://<your-user>.github.io/rogue-gambit/`

## Integrate Into A Website

Yes, this game can be integrated into a website.

Option A (recommended): host as a page of your site
- copy this project into a subfolder (example: `/games/rogue-gambit/`)
- keep `index.html`, `style.css`, and `js/` together
- link to `/games/rogue-gambit/`

Option B: embed via iframe

```html
<div style="position:relative;width:100%;max-width:1100px;aspect-ratio:16/10;">
  <iframe
    src="https://<your-user>.github.io/rogue-gambit/"
    title="Play Rogue Gambit"
    style="position:absolute;inset:0;width:100%;height:100%;border:0;"
    loading="lazy"
    allow="fullscreen"
  ></iframe>
</div>
```

Notes for integration:
- if embedded with iframe, audio may require first user interaction (browser policy)
- use HTTPS hosting for best compatibility
- test on mobile and desktop after integration
