# Paladins Voice Lines

This project contains voice line data for champions in the game Paladins.

The `champions.json` file in the `games/paladinsJokes/` directory contains voice line data organized by champion and skin. Each champion has a key in the JSON file, with nested objects for the default skin and any other skins.

The voice lines are stored as an array of objects with two keys:

- `voiceLine` - The text of the voice line
- `fileName` - The file name of the voice line audio clip

This allows easy lookup of voice line text and audio pairs by champion and skin.


More funny voice lines can be added by following the same structure.