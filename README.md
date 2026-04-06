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
