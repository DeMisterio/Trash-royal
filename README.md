# Trash Royal – Web Prototype 🗑️👑
*A chaotic browser-based parody of Clash Royale built with nothing but HTML, CSS, and JavaScript.*

Trash Royal recreates the core CR experience, then mutates it into something faster, funnier, and completely open for modification. Every card, every sound, every stat is fully data-driven, so the game grows as fast as you can drop new PNGs into a folder.

## 🚀 Features at a Glance
- Full browser battle arena  
- Deck builder with persistent saves  
- NPC AI with emotes and random decks  
- Drag-and-drop card system  
- Auto-generated custom characters  
- Custom sound support  
- 100% Vanilla JS (no frameworks)

## 📱 UI & Menu Flow

### 🏠 Home / Battle
A simplified CR-style home screen with trophy road, chest slots, and the iconic “Battle” button.  
Hit it → you're instantly dropped into the arena with no loading screens, no transitions, just instant chaos.

### 🃏 Cards Tab
Your 8-card battle deck + full collection grid.  
Drag, inspect, upgrade, reshuffle — all changes save via `localStorage` and instantly affect battles.

### 🛒 Shop / 🎪 Events / 👥 Clans
Lightweight versions of the original tabs:
- simple clan chat  
- rotating mock events  
- placeholder shop offers  

The layout mirrors CR’s thumb-friendly UI and bright gradients.

## ⚔️ Battle System

Trash Royal keeps the pacing familiar but uses its own clean, DOM-based battle logic:

- Real elixir timings (2.8s → 1.4s → 0.9s) ⚡  
- Lane pathfinding toward bridges ↗️↘️  
- Towers auto-fire with HP bars 🏰  
- Projectile + melee combat 🔥  
- Overtime + victory overlays ⏱️👑  

Everything is rendered with **CSS transforms and DOM nodes** instead of Canvas/WebGL for maximum transparency.

## 🤖 NPC AI

Opponents behave like chaotic CR players:

- Generates its own deck from all cards you *didn’t* choose  
- Tracks elixir and deploys legal cards  
- Uses contextual emotes (toxic when winning, depressed when losing)  
- Random names + unpredictable behavior  

It’s dumb, hilarious, and surprisingly fun to fight.

## 🧪 Custom Characters (Drop-In System)

You can add new characters without touching a single line of code.

### 1️⃣ Temporary Auto-Generated Characters
Just drop a PNG/JPG into:

```
Trash-Royal/Characters/
```

When you reload the game:
- the generator creates **temporary stats on the fly**  
- the card appears in your collection automatically  
- stats reset every time you restart (no JSON = no persistence)

Perfect for memes, jokes, and quick prototypes.  
Add yourself. Add your friend. Add a random PNG cat. The game accepts everything.

## 2️⃣ Permanent Characters (JSON Stats) 📝

If you want your character to have **saved, persistent properties**, you must run the Node generator:

**Steps:**
```bash
cd tools
node generateCharacters.js
```

The script will:  
- scan `/Characters/`  
- detect all images without JSON  
- generate complete stat files  
- register the card permanently

You can manually edit any character inside:

```
Trash-Royal/Characters/*.json
```

Modify health, damage, speed, rarity, elixir — whatever you want.

## 🔊 Custom Sound Support (Battle & Menu)

Drop your own `.mp3` files into:

```
Trash-Royal/Sounds/
```

Use these exact filenames for automatic loading:

- `battle.mp3` — plays during fights ⚔️  
- `menu.mp3` — plays in the main menu 🎵  

Instant soundtrack replacement. No coding needed.

## 🛠️ Tech Highlights

- Fully data-driven card system  
- Vanilla JS only  
- LocalStorage deck persistence  
- Works in any modern browser  
- Zero build steps — just open `index.html`  

## ▶️ Getting Started

1. Download the project  
2. Open `index.html` in your browser  
3. Build a deck  
4. Hit Battle  
5. Try not to laugh when NPCs start spamming emotes 😭🔥

## ✨ Trash Royal Philosophy
Not a clone.  
Not a competitor.  
Just a glorious HTML/CSS/JS sandbox where **parody meets chaos**.
