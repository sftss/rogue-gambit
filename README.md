# Rogue Gambit

Rogue Gambit is a browser game that mixes chess tactics with roguelike progression:
- draft new pieces between rounds
- fight tactical battles on a chess board
- buy upgrades in the shop and collect relics

## Codex (Glossary)

The in-game Codex is the glossary for every chess piece in Rogue Gambit.

It includes:
- piece name and class (pawn, rook, bishop, knight, queen, king)
- clear gameplay ability text for each piece
- lore text, flavor quote, and gameplay tags
- white/black piece previews and an "in your army" indicator
- category filters to quickly browse by piece family

Unlock behavior:
- standard pieces are always visible
- special pieces unlock as you encounter them during runs
- an "Unlock All" button is available for full browsing

The Codex can be opened from the title screen, draft screen, and battle screen.

## Play Online

Open `https://sftss.github.io/rogue-gambit/`

## Run Locally

Use any static server. Example:

```bash
npx http-server . -p 8080 -c-1
```

Then open `http://localhost:8080`.