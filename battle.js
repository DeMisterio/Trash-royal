const builtInCharacters = [
  { id: 'knight', name: 'Knight', type: 'troop', rarity: 'common', elixir: 3, description: 'A dependable melee fighter with solid health.', emoji: '🛡️'},
  { id: 'archers', name: 'Archers', type: 'troop', rarity: 'common', elixir: 3, description: 'Twin archers with reliable ranged DPS.', emoji: '🏹', sprite: 'Characters/archers.png'},
  { id: 'baby-dragon', name: 'Baby Dragon', type: 'troop', rarity: 'epic', elixir: 4, description: 'Flying splash attacker, hard to take down.', emoji: '🐲', sprite: 'Characters/baby-dragon.png'},
  { id: 'fireball', name: 'Fireball', type: 'spell', rarity: 'rare', elixir: 4, description: 'Medium area damage spell.', emoji: '🔥', sprite: 'Characters/fireball.png',},
  { id: 'giant', name: 'Giant', type: 'troop', rarity: 'rare', elixir: 5, description: 'Slow but mighty siege unit that targets buildings.', emoji: '🗿', sprite: 'Characters/giant.png'},
  { id: 'minions', name: 'Minions', type: 'troop', rarity: 'common', elixir: 2, description: 'Fast flying melee attackers.', emoji: '🦅', sprite: 'Characters/minions.png'},
  { id: 'hog-rider', name: 'Hog Rider', type: 'troop', rarity: 'rare', elixir: 4, description: 'Jumps river and rushes for towers.', emoji: '🐗', sprite: 'Characters/hog-rider.png'},
  { id: 'musketeer', name: 'Musketeer', type: 'troop', rarity: 'rare', elixir: 4, description: 'Single target sharpshooter.', emoji: '🎯', sprite: 'Characters/musketeer.png'},
  { id: 'Speed', name: 'Speed', type: 'troop', rarity: 'common', elixir: 4, description: 'Community-made sprinter that hits like a truck.', emoji: '⚡', sprite: 'Characters/Speed.jpg'},
  { id: 'Epstein', name: 'Epstein', type: 'troop', rarity: 'rare', elixir: 4, description: 'Auto-generated stats for Epstein. Adjust to balance.', emoji: '🎩', sprite: 'Characters/Epstein.png'},
  { id: 'Sins', name: 'Sins', type: 'troop', rarity: 'legendary', elixir: 4, description: 'Auto-generated stats for Sins. Adjust to balance.', emoji: '😈', sprite: 'Characters/Sins.jpeg'},
  { id: '67', name: '67', type: 'troop', rarity: 'legendary', elixir: 3, description: 'Auto-generated stats for 67. Adjust to balance.', emoji: '🎲', sprite: 'Characters/67.png'},
  { id: 'diddy', name: 'Diddy', type: 'troop', rarity: 'common', elixir: 3, description: 'Creator cameo with surprisingly beefy stats.', emoji: '🕶️', sprite: 'Characters/diddy.avif'}
];

async function loadCharacterStats(character) {
    const path = `Characters/${character.id}.json`;

    try {
        const response = await fetch(path);
        if (!response.ok) {
            console.warn(`Stats JSON not found for ${character.id}`);
            return null; // JSON нет — оставляем дефолты
        }

        const json = await response.json();
        return json.stats || null;

    } catch (err) {
        console.error("Error loading stats for", character.id, err);
        return null;
    }
}

const DECK_STORAGE_KEY = 'clashRoyaleDeck';
const fallbackEmoji = builtInCharacters.reduce((acc, card) => {
  acc[card.id] = card.emoji;
  return acc;
}, {});
const NPC_NAMES = [
  'ShadowSlayer', 'ArcticWolf', 'CrimsonNova', 'NightHarbor', 'LavaKnight', 'FrostByte', 'StormCaller', 'IronHawk',
  'LoneRider', 'SilentNova', 'ToxicVortex', 'GoldenArrow', 'NebulaNine', 'MysticFlame', 'EmeraldGiant', 'VoidStriker',
  'CrimsonRider', 'SolarWarden', 'ArcaneBolt', 'ThunderBloom', 'ObsidianRogue', 'SilverMyst', 'PhotonDrake', 'TidalShock',
  'CrystalForge', 'BlazeFalcon', 'RuneKeeper', 'PixelSamurai', 'FrostTusk', 'VoltViking', 'NovaGhost', 'AtlasPrime',
  'VoidKnight', 'HexHunter', 'ZenithFox', 'PyroShade', 'EchoStorm', 'StealthMantis', 'ChaosMonk', 'DuneViper'
];

const rarityPillMap = { common: 'green', rare: 'gold', epic: 'purple', legendary: 'purple' };
const towerDefaults = { princess: 2534, king: 4200 };
const towerConfig = { princess: { range: 6.5, damage: 110, speed: 1.0 }, king: { range: 7, damage: 240, speed: 1.2 } };
const battlePhases = [
  { name: 'normal', duration: 120, regen: 2.8, icon: 'x1', message: 'Battle start!' },
  { name: 'double', duration: 60, regen: 1.4, icon: 'x2', message: 'Double Elixir!' },
  { name: 'overtime', duration: 60, regen: 0.9, icon: 'OT', message: 'Overtime!' }
];
const CARD_COOLDOWN = 4;
const SOUND_FILES = { menu: 'Sounds/menu.mp3', battle: 'Sounds/battle.mp3' };
const UNIT_SIZE = 64;
const UNIT_RADIUS = UNIT_SIZE / 2;
const regulationDuration = battlePhases.filter((p) => p.name !== 'overtime').reduce((sum, phase) => sum + phase.duration, 0);

const BUILT_IN_NORMALIZED = builtInCharacters.map((card) => normalizeCharacter(card));
const storedDeck = (() => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DECK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (err) {
    console.warn('Battle client: failed to load stored deck', err.message);
    return null;
  }
})();

const state = {
  characters: createCharacterMap(BUILT_IN_NORMALIZED),
  deck: storedDeck && storedDeck.length ? storedDeck : ensureDeck(BUILT_IN_NORMALIZED, []),
  collection: seedCollection(BUILT_IN_NORMALIZED),
  battle: null,
  dataLoaded: false,
  muted: false,
  sounds: { menu: null, battle: null }
};

const elements = {};

function normalizeCharacter(card) {
  const stats = card.stats || {
    health: card.health ?? 0,
    damage: card.attackPower ?? 0,
    attackSpeed: card.attackSpeed ?? 1,
    range: card.attackRange ?? 1,
    speed: card.speed ?? 60,
    targeting: (card.targeting || 'ground').toLowerCase(),
    spawnCount: card.spawnCount ?? 1,
    splashRadius: card.splashRadius ?? 0
  };
  return {
    ...card,
    type: card.type || (stats.radius || card.description?.toLowerCase().includes('spell') ? 'spell' : 'troop'),
    sprite: card.sprite || `Characters/${card.id}.png`,
    emoji: card.emoji || fallbackEmoji[card.id] || '🛡️',
    stats,
    health: stats.health ?? 0,
    attackPower: stats.damage ?? 0,
    attackSpeed: stats.attackSpeed ?? 1,
    attackRange: stats.range ?? 1,
    speed: stats.speed ?? 60,
    targeting: stats.targeting || 'ground',
    spawnCount: stats.spawnCount ?? 1,
    splashRadius: stats.splashRadius ?? stats.radius ?? 0
  };
}

function classifyRole(card) {
    if (card.type === "spell") return "spell";
    if (card.stats.health >= 2000) return "tank";
    if (card.stats.range >= 4) return "ranged";
    if (card.stats.speed >= 80) return "fast";
    if (card.stats.splashRadius > 0) return "aoe";
    return "melee";
}

const ROLE_SYNERGY = {
    tank:     ["ranged", "aoe", "fast"],
    melee:    ["ranged", "spell"],
    fast:     ["aoe", "ranged", "spell"],
    aoe:      ["tank", "fast"],
    ranged:   ["tank", "melee"],
    spell:    ["tank", "fast"]
};

function generateSmartCombos(cards) {
    const combos = [];

    for (let i = 0; i < cards.length; i++) {
        const a = cards[i];
        const roleA = classifyRole(a);

        for (let j = 0; j < cards.length; j++) {
            if (i === j) continue;
            const b = cards[j];
            const roleB = classifyRole(b);

            if (!ROLE_SYNERGY[roleA]) continue;
            if (!ROLE_SYNERGY[roleA].includes(roleB)) continue;

            combos.push([a.id, b.id]);

            for (let k = 0; k < cards.length; k++) {
                if (k === i || k === j) continue;
                const c = cards[k];
                const roleC = classifyRole(c);

                if (
                    ROLE_SYNERGY[roleA].includes(roleC) &&
                    ROLE_SYNERGY[roleB].includes(roleC)
                ) {
                    combos.push([a.id, b.id, c.id]);
                }
            }
        }
    }

    return combos;
}

function createCharacterMap(cards) {
  return cards.reduce((acc, card) => {
    acc[card.id] = card;
    return acc;
  }, {});
}

function seedCollection(cards) {
  // Try loading collection from storage
  try {
    const saved = localStorage.getItem("userCollection");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch (err) {
    console.warn("Failed to read stored user collection:", err.message);
  }
  const collection = {};
  cards.forEach((card) => {
    collection[card.id] = {
      level: Math.floor(Math.random() * 3) + 8,
      unlocked: true,
      copies: Math.floor(Math.random() * 200) + 20
    };
  });
  return collection;
}

function ensureDeck(cards, existingDeck = []) {
  const available = cards.map((card) => card.id);
  if (!available.length) return [];
  let deck = existingDeck.filter((id) => available.includes(id));
  if (deck.length < 4) {
    deck = available.slice(0, Math.min(8, available.length));
  }
  return deck.slice(0, Math.min(8, available.length));
}

const randomBetween = (min, max) => Math.random() * (max - min) + min;
const shuffleArray = (arr) => arr
  .map((value) => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value);
const getCardArtMarkup = (card) => (card.sprite ? `<img src="${card.sprite}" alt="${card.name} card art">` : `<span class="emoji-art">${card.emoji}</span>`);
const getUnitMarkup = (card) => (card.sprite ? `<img src="${card.sprite}" alt="${card.name} unit">` : card.emoji);
const getAvailableCardIds = () => {
  const ids = Object.keys(state.characters || {});
  if (ids.length) return ids;
  return BUILT_IN_NORMALIZED.map((card) => card.id);
};
const pickOpponentProfile = () => {
  const namesPool = NPC_NAMES.length ? NPC_NAMES : ['Arena NPC'];
  const name = namesPool[Math.floor(Math.random() * namesPool.length)];
  const available = getAvailableCardIds();
  const playerDeck = state.deck || [];
  const filtered = available.filter((id) => !playerDeck.includes(id));
  const pool = filtered.length >= 8 ? filtered : [...filtered, ...playerDeck];
  const deckIds = shuffleArray([...new Set(pool)]).slice(0, Math.min(8, pool.length));
  return { name, deckIds };
};
const formatTime = (seconds) => {
  const m = Math.floor(Math.max(seconds, 0) / 60).toString().padStart(1, '0');
  const s = Math.floor(Math.max(seconds, 0) % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function getArenaDimensions() {
  if (!elements.arenaField) return { width: 0, height: 0, riverY: 0 };
  const width = elements.arenaField.clientWidth;
  const height = elements.arenaField.clientHeight;
  return { width, height, riverY: height / 2 };
}

function clampPointToArena(x, y) {
  const { width, height } = getArenaDimensions();
  return {
    x: clamp(x, 0, Math.max(0, width - UNIT_SIZE)),
    y: clamp(y, 0, Math.max(0, height - UNIT_SIZE))
  };
}

function centerToPoint(cx, cy) {
  return clampPointToArena(cx - UNIT_RADIUS, cy - UNIT_RADIUS);
}

function getLaneAnchorX(lane = 'middle') {
  const { width } = getArenaDimensions();
  if (!width) return UNIT_RADIUS;
  const ratios = { left: 0.22, right: 0.78, middle: 0.5 };
  return width * (ratios[lane] ?? 0.5);
}

function selectBridgeForLane(laneX) {
  const bridges = getBridgePositions();
  if (!bridges) return null;
  const entries = Object.values(bridges);
  if (!entries.length) return null;
  return entries.reduce((best, bridge) => {
    if (!best) return bridge;
    const delta = Math.abs(laneX - bridge.x);
    const bestDelta = Math.abs(laneX - best.x);
    return delta < bestDelta ? bridge : best;
  }, null);
}

function getUnitCenter(unit) {
  return { x: unit.x + UNIT_RADIUS, y: unit.y + UNIT_RADIUS };
}

function cacheElements() {
  elements.battleModal = document.getElementById('battleModal');
  elements.battleTimer = document.getElementById('battleTimer');
  elements.timerValue = document.getElementById('timerValue');
  elements.timerPhaseIcon = document.getElementById('timerPhaseIcon');
  elements.phaseBanner = document.getElementById('phaseBanner');
  elements.battleStatus = document.getElementById('battleStatus');
  elements.playerCrowns = document.getElementById('playerCrowns');
  elements.enemyCrowns = document.getElementById('enemyCrowns');
  elements.arenaField = document.getElementById('arenaField');
  elements.pocketLeft = document.getElementById('pocketLeft');
  elements.pocketRight = document.getElementById('pocketRight');
  elements.spellRadius = document.getElementById('spellRadius');
  elements.projectileLayer = document.getElementById('projectileLayer');
  elements.battleHand = document.getElementById('battleHand');
  elements.nextCard = document.getElementById('nextCard');
  elements.cardDragGhost = document.getElementById('cardDragGhost');
  elements.elixirBar = document.getElementById('elixirBar');
  elements.elixirFill = document.getElementById('elixirFill');
  elements.elixirCount = document.getElementById('elixirCount');
  elements.battleResult = document.getElementById('battleResult');
  elements.emotePanel = document.getElementById('emotePanel');
  elements.battleButton = document.getElementById('battleButton');
  elements.leaveBattle = document.getElementById('leaveBattle');
  elements.muteToggle = document.getElementById('muteToggle');
  elements.emoteToggle = document.getElementById('emoteToggle');
  elements.enemyName = document.getElementById('enemyName');
}

function setBattleButtonState(isLoading) {
  if (!elements.battleButton) return;
  elements.battleButton.disabled = isLoading;
  elements.battleButton.textContent = isLoading ? 'Loading Cards…' : 'Battle!';
}

function setupSounds() {
  Object.entries(SOUND_FILES).forEach(([key, path]) => {
    const audio = new Audio(path);
    audio.loop = true;
    audio.volume = key === 'battle' ? 0.4 : 0.25;
    audio.addEventListener('error', () => console.warn(`Sound ${path} missing.`));
    state.sounds[key] = audio;
  });
}

function playSoundtrack(name) {
  if (state.muted) return;
  const audio = state.sounds[name];
  if (!audio) return;
  Object.entries(state.sounds).forEach(([key, track]) => {
    if (track && key !== name) track.pause();
  });
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function stopAllSound() {
  Object.values(state.sounds).forEach((track) => track && track.pause());
}

async function bootstrapCharacters() {
  const assignFromList = (cards) => {
    state.characters = createCharacterMap(cards);
    state.collection = seedCollection(cards);
    state.deck = storedDeck && storedDeck.length ? storedDeck : ensureDeck(cards, []);
  };

  try {
    const manifestResp = await fetch('Characters/characters-manifest.json');
    if (!manifestResp.ok) throw new Error('Manifest missing');
    const manifest = await manifestResp.json();
    const loaded = [];
    for (const id of manifest.characters || []) {
      try {
        const resp = await fetch(`Characters/${id}.json`);
        if (!resp.ok) throw new Error(`Missing JSON for ${id}`);
        const data = await resp.json();
        loaded.push(normalizeCharacter({ ...data, id }));
      } catch (err) {
        console.warn('Failed to load character', id, err.message);
      }
    }
    if (!loaded.length) throw new Error('No character data files readable');
    assignFromList(loaded);
  } catch (err) {
    console.warn('Falling back to built-in characters:', err.message);
    assignFromList(BUILT_IN_NORMALIZED);
  }
}

function measureArenaGeometry() {
  if (!elements.arenaField) return { towers: {}, bridges: {} };
  const field = elements.arenaField.getBoundingClientRect();
  const towers = {};
  document.querySelectorAll('.tower').forEach((node) => {
    const rect = node.getBoundingClientRect();
    towers[`${node.dataset.side}-${node.dataset.slot}`] = {
      x: rect.left - field.left + rect.width / 2,
      y: rect.top - field.top + rect.height / 2
    };
  });
  const bridgePositions = {};
  document.querySelectorAll('.bridge').forEach((node) => {
    const rect = node.getBoundingClientRect();
    const key = node.classList.contains('left') ? 'left' : 'right';
    bridgePositions[key] = {
      x: rect.left - field.left + rect.width / 2,
      y: rect.top - field.top + rect.height / 2,
      width: rect.width,
      height: rect.height
    };
  });
  return { towers, bridgePositions };
}

function refreshBattleGeometry() {
  if (!state.battle) return;
  const geometry = measureArenaGeometry();
  state.battle.towerPositions = geometry.towers;
  state.battle.bridgePositions = geometry.bridgePositions;
}

function createBattleState(opponentProfile, deckCards = state.deck.filter((id) => state.characters[id])) {
  const { towers: towerPositions, bridgePositions } = measureArenaGeometry();
  const towers = {
    'friendly-left': { side: 'friendly', lane: 'left', type: 'princess', hp: towerDefaults.princess, max: towerDefaults.princess },
    'friendly-right': { side: 'friendly', lane: 'right', type: 'princess', hp: towerDefaults.princess, max: towerDefaults.princess },
    'friendly-king': { side: 'friendly', lane: 'middle', type: 'king', hp: towerDefaults.king, max: towerDefaults.king, active: true },
    'enemy-left': { side: 'enemy', lane: 'left', type: 'princess', hp: towerDefaults.princess, max: towerDefaults.princess },
    'enemy-right': { side: 'enemy', lane: 'right', type: 'princess', hp: towerDefaults.princess, max: towerDefaults.princess },
    'enemy-king': { side: 'enemy', lane: 'middle', type: 'king', hp: towerDefaults.king, max: towerDefaults.king, active: false }
  };
  return {
    globalTime: regulationDuration,
    phaseIndex: 0,
    phaseTimeLeft: battlePhases[0].duration,
    player: { elixir: 5, regenTimer: 0, cooldowns: {} },
    enemy: { elixir: 5, regenTimer: 0, nextPlay: 3, emoteTimer: 5 },
    crowns: { player: 0, enemy: 0 },
    towers,
    towerPositions,
    bridgePositions,
    deployUnlocked: { left: false, right: false },
    queue: [...deckCards],
    hand: deckCards.slice(0, 4),
    nextIndex: 4,
    selection: null,
    units: [],
    projectiles: [],
    animationFrame: null,
    lastTick: performance.now(),
    phase: battlePhases[0].name,
    opponent: opponentProfile
  };
}

function startBattle() {
  if (state.battle) return;
  if (!state.dataLoaded) {
    elements.battleStatus.textContent = 'Cards are still loading. Please wait…';
    return;
  }
  const playableDeck = state.deck.filter((id) => state.characters[id]);
  if (playableDeck.length < 4) {
    elements.battleStatus.textContent = 'Select at least 4 cards in your deck before battling.';
    return;
  }
  const opponent = pickOpponentProfile();
  state.battle = createBattleState(opponent, playableDeck);
  refreshBattleGeometry();
  if (elements.enemyName) elements.enemyName.textContent = opponent?.name || 'Opponent';
  elements.battleResult.textContent = '';
  elements.battleResult.classList.remove('show');
  elements.arenaField.classList.remove('card-ready', 'spell-ready');
  elements.projectileLayer.innerHTML = '';
  updatePocketIndicators();
  updateTowerUI();
  renderBattleHUD();
  playSoundtrack('battle');
  state.battle.animationFrame = requestAnimationFrame(battleLoop);
}

function battleLoop(timestamp) {
  if (!state.battle) return;
  const delta = (timestamp - state.battle.lastTick) / 1000;
  state.battle.lastTick = timestamp;
  updateBattle(delta);
  state.battle.animationFrame = requestAnimationFrame(battleLoop);
}

function updateBattle(delta) {
  updateBattleTimer(delta);
  updateElixir(delta);
  updateEnemyAI(delta);
  updateUnits(delta);
  updateProjectiles(delta);
  updateTowers(delta);
  renderBattleHUD();
}

function updateBattleTimer(delta) {
  if (!state.battle) return;
  if (state.battle.phase !== 'overtime') {
    state.battle.globalTime -= delta;
  }
  state.battle.phaseTimeLeft -= delta;
  if (state.battle.phaseTimeLeft <= 0) {
    if (state.battle.phaseIndex < battlePhases.length - 1) {
      goToNextPhase();
    } else {
      concludeBattle();
    }
  }
}

function goToNextPhase() {
  if (!state.battle) return;
  const nextIndex = Math.min(state.battle.phaseIndex + 1, battlePhases.length - 1);
  state.battle.phaseIndex = nextIndex;
  state.battle.phase = battlePhases[nextIndex].name;
  state.battle.phaseTimeLeft = battlePhases[nextIndex].duration;
  triggerPhaseBanner(battlePhases[nextIndex].message);
}

function triggerPhaseBanner(message) {
  if (!elements.phaseBanner) return;
  elements.phaseBanner.textContent = message;
  elements.phaseBanner.classList.add('show');
  setTimeout(() => elements.phaseBanner.classList.remove('show'), 1500);
}

function updateElixir(delta) {
  if (!state.battle) return;
  const currentPhase = battlePhases[state.battle.phaseIndex];
  const regenRate = currentPhase.regen;
  ['player', 'enemy'].forEach((side) => {
    const bar = state.battle[side];
    bar.regenTimer = (bar.regenTimer || 0) + delta;
    while (bar.regenTimer >= regenRate) {
      bar.regenTimer -= regenRate;
      bar.elixir = Math.min(10, (bar.elixir || 0) + 1);
    }
  });
}

function showEmote(emote, side) {
  if (!state.battle) return;
  refreshBattleGeometry();
  const kingTowerKey = side === 'friendly' ? 'friendly-king' : 'enemy-king';
  const towerPos = state.battle.towerPositions[kingTowerKey];
  
  if (!towerPos) return;
  
  const emoteElement = document.createElement('div');
  emoteElement.className = 'emote-display';
  emoteElement.textContent = emote;
  emoteElement.style.left = `${towerPos.x - 30}px`;
  emoteElement.style.top = `${towerPos.y - 60}px`;
  elements.arenaField.appendChild(emoteElement);
  
  setTimeout(() => {
    if (emoteElement.parentNode) {
      emoteElement.remove();
    }
  }, 2000);
}

function updateEnemyAI(delta) {
  if (!state.battle) return;

  // Emotes keep working normally
  state.battle.enemy.emoteTimer = (state.battle.enemy.emoteTimer || 0) - delta;
  if (state.battle.enemy.emoteTimer <= 0) {
    const friendlyAlive = ['friendly-left','friendly-right','friendly-king'].filter(k=>isTowerAlive(k)).length;
    const enemyAlive = ['enemy-left','enemy-right','enemy-king'].filter(k=>isTowerAlive(k)).length;
    let em = null;
    if (enemyAlive > friendlyAlive) em = ['😎','👏'][Math.floor(Math.random()*2)];
    if (enemyAlive < friendlyAlive) em = ['😡','😢'][Math.floor(Math.random()*2)];
    if (!em && Math.random() < 0.1) em = ['😀','😎','😡','👏','😢','👎'][Math.floor(Math.random()*6)];
    if (em) showEmote(em,'enemy');
    state.battle.enemy.emoteTimer = randomBetween(2,5);
  }

  // COMBO INTELLIGENCE
  state.battle.enemy.nextPlay -= delta;
  if (state.battle.enemy.nextPlay > 0) return;

  const elixir = state.battle.enemy.elixir;
  const deckIds = state.battle.opponent?.deckIds || getAvailableCardIds();
  const cards = deckIds.map(id=>state.characters[id]).filter(c=>c);

  // --- SMART COMBO AI ---
  const smartCombos = generateSmartCombos(cards)
    .filter(combo => {
        const total = combo.reduce((sum,id)=>sum + (state.characters[id]?.elixir || 0), 0);
        return total <= elixir;
    });

  let selectedCombo = null;
  if (smartCombos.length && Math.random() < 0.55) {
      selectedCombo = smartCombos[Math.floor(Math.random() * smartCombos.length)];
  }

  if (selectedCombo) {
      for (const id of selectedCombo) {
          const unitCard = state.characters[id];
          if (!unitCard) continue;
          state.battle.enemy.elixir -= unitCard.elixir;
          spawnEnemyUnit(unitCard);
      }
      state.battle.enemy.nextPlay = randomBetween(3, 7);
      return;
  }
  // --- END SMART COMBO AI ---

  // Legacy fallback AI:
  function classify(c) {
    if (c.type === 'spell') return 'spell';
    if (c.stats.health >= 1500) return 'tank';
    if (c.stats.range >= 4) return 'ranged';
    return 'melee';
  }

  function pickTank(pool) {
    return pool.find(c=>classify(c)==='tank' && c.elixir<=elixir);
  }
  function pickSupport(pool){
    return pool.find(c=>classify(c)==='ranged' && c.elixir<=elixir);
  }
  function cheapSpell(pool){
    return pool.find(c=>c.type==='spell' && c.elixir<=elixir);
  }

  const tankPool = cards.filter(c=>classify(c)==='tank');
  const rangedPool = cards.filter(c=>classify(c)==='ranged');
  const spellPool = cards.filter(c=>c.type==='spell');

  const isWinning = state.battle.crowns.enemy > state.battle.crowns.player;
  const playerLow = ['friendly-left','friendly-right','friendly-king'].some(k=>{
    const t = state.battle.towers[k];
    return t && t.hp < t.max*0.25;
  });

  // COMBO RULES:

  // 1. SPELL punish if player is low HP tower
  if (playerLow) {
    const finisher = cheapSpell(spellPool);
    if (finisher) {
      state.battle.enemy.elixir -= finisher.elixir;
      spawnEnemyUnit(finisher);
      state.battle.enemy.nextPlay = randomBetween(2,4);
      return;
    }
  }

  // 2. TANK + support push
  let tank = pickTank(tankPool);
  let support = pickSupport(rangedPool);

  if (tank && support && tank.elixir + support.elixir <= elixir) {
    state.battle.enemy.elixir -= tank.elixir;
    spawnEnemyUnit(tank);
    state.battle.enemy.elixir -= support.elixir;
    spawnEnemyUnit(support);
    state.battle.enemy.nextPlay = randomBetween(4,7);
    return;
  }

  // 3. If losing - spam cheapest troops
  if (!isWinning) {
    const cheap = cards.filter(c=>c.elixir<=elixir).sort((a,b)=>a.elixir-b.elixir)[0];
    if (cheap) {
      state.battle.enemy.elixir -= cheap.elixir;
      spawnEnemyUnit(cheap);
      state.battle.enemy.nextPlay = randomBetween(2,4);
      return;
    }
  }

  // 4. Default random valid troop
  const troopPool = cards.filter(c=>c.elixir<=elixir);
  if (troopPool.length) {
    const pick = troopPool[Math.floor(Math.random()*troopPool.length)];
    state.battle.enemy.elixir -= pick.elixir;
    spawnEnemyUnit(pick);
  }

  state.battle.enemy.nextPlay = randomBetween(3,6);
}

function renderBattleHUD() {
  if (!state.battle) return;
  const phase = battlePhases[state.battle.phaseIndex];
  const displayTime = phase.name === 'overtime' ? state.battle.phaseTimeLeft : state.battle.globalTime;
  elements.timerValue.textContent = formatTime(displayTime);
  elements.timerPhaseIcon.textContent = phase.icon;
  elements.battleTimer.classList.toggle('double', phase.name === 'double');
  elements.battleTimer.classList.toggle('overtime', phase.name === 'overtime');
  
  // Overtime effects (red and shaking when < 30s)
  const isOvertime = displayTime <= 30;
  elements.battleTimer.classList.toggle('overtime-warning', isOvertime);
  
  elements.playerCrowns.textContent = state.battle.crowns.player;
  elements.enemyCrowns.textContent = state.battle.crowns.enemy;
  renderElixir();
  renderBattleHand();
}

function renderElixir() {
  if (!state.battle) return;
  const elixir = Math.min(10, state.battle.player.elixir);
  elements.elixirFill.style.width = `${(elixir / 10) * 100}%`;
  elements.elixirCount.textContent = elixir.toFixed(1);
}

function renderBattleHand() {
  elements.battleHand.innerHTML = '';
  state.battle.hand.forEach((cardId) => {
    const card = state.characters[cardId];
    if (!card) return;
    const div = document.createElement('div');
    div.className = 'battle-card';
    div.dataset.card = cardId;
    div.draggable = true;
    const disabled = state.battle.player.elixir < card.elixir;
    if (disabled) div.classList.add('disabled');
    if (state.battle.selection === cardId) div.classList.add('selected');
    div.innerHTML = `
      <div class="card-art small">${getCardArtMarkup(card)}</div>
      <strong>${card.name}</strong>
      <span>${card.elixir}⚡</span>
    `;
    const cooldown = state.battle.player.cooldowns[cardId];
    if (cooldown > 0) {
      const overlay = document.createElement('div');
      overlay.className = 'card-cooldown';
      overlay.textContent = cooldown.toFixed(1);
      div.appendChild(overlay);
      div.classList.add('disabled');
      div.draggable = false;
    }
    elements.battleHand.appendChild(div);
  });
  const nextCardId = state.battle.queue[state.battle.nextIndex % state.battle.queue.length];
  elements.nextCard.textContent = nextCardId ? state.characters[nextCardId].name : '--';
}

function selectBattleCard(cardId) {
  if (!state.battle) return;
  const card = state.characters[cardId];
  if (!card) return;
  if (state.battle.player.elixir < card.elixir) {
    elements.battleStatus.textContent = 'Not enough elixir!';
    return;
  }
  state.battle.selection = cardId;
  const isSpell = card.type === 'spell';
  elements.arenaField.classList.toggle('spell-ready', isSpell);
  elements.arenaField.classList.add('card-ready');
  renderBattleHand();
}

function getDeployPermission(card, x, y, rect) {
  if (!card) return { allowed: false, lane: 'middle' };
  const lane = x < rect.width / 3 ? 'left' : x > (2 * rect.width) / 3 ? 'right' : 'middle';
  if (card.type === 'spell') {
    return { allowed: true, lane };
  }
  const friendly = y >= rect.height / 2;
  
  // Check if enemy base is destroyed - allow deployment further on enemy side
  const enemyLeftDestroyed = !isTowerAlive('enemy-left');
  const enemyRightDestroyed = !isTowerAlive('enemy-right');
  const enemyKingDestroyed = !isTowerAlive('enemy-king');
  
  if (friendly) {
    return { allowed: true, lane };
  }
  
  // Can deploy on enemy side if their base in that lane is destroyed
  if (lane === 'left' && enemyLeftDestroyed) {
    return { allowed: true, lane };
  }
  if (lane === 'right' && enemyRightDestroyed) {
    return { allowed: true, lane };
  }
  if (lane === 'middle' && enemyKingDestroyed) {
    return { allowed: true, lane };
  }
  
  if (lane === 'middle') return { allowed: false, lane };
  const unlocked = state.battle.deployUnlocked[lane];
  return { allowed: !!unlocked, lane, pocket: !unlocked };
}

function handleArenaClick(event) {
  if (!state.battle || !state.battle.selection) return;
  const rect = elements.arenaField.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const card = state.characters[state.battle.selection];
  const permission = getDeployPermission(card, x, y, rect);
  if (!permission.allowed) {
    elements.battleStatus.textContent = permission.pocket ? 'Destroy that tower to unlock the pocket!' : 'Deploy on your side!';
    return;
  }
  deployCard(state.battle.selection, { x, y, lane: permission.lane });
}

function deployCard(cardId, position) {
  const card = state.characters[cardId];
  if (!card || !state.battle) return;
  state.battle.player.elixir = Math.max(0, state.battle.player.elixir - card.elixir);
  if (card.type === 'spell') {
    castSpell(card, position);
  } else {
    spawnFriendlyUnit(card, position);
    elements.battleStatus.textContent = `${card.name} deployed!`;
  }
  state.battle.player.cooldowns[cardId] = CARD_COOLDOWN;
  cycleCard(cardId);
  state.battle.selection = null;
  elements.arenaField.classList.remove('card-ready', 'spell-ready');
  renderBattleHand();
  renderElixir();
}

function cycleCard(cardId) {
  const index = state.battle.hand.indexOf(cardId);
  if (index > -1) {
    const nextCard = state.battle.queue[state.battle.nextIndex % state.battle.queue.length];
    state.battle.hand[index] = nextCard;
    state.battle.nextIndex += 1;
  }
}

function spawnFriendlyUnit(card, position) {
  spawnUnit(card, 'friendly', position);
}

function spawnEnemyUnit(card) {
  const lane = ['left', 'middle', 'right'][Math.floor(Math.random() * 3)];
  const x = getLaneAnchorX(lane);
  const y = UNIT_RADIUS + 10;
  spawnUnit(card, 'enemy', { x, y, lane });
}

function spawnUnit(card, side, position) {
  const count = card.spawnCount || 1;
  for (let i = 0; i < count; i += 1) {
    const offsetIndex = i - (count - 1) / 2;
    const spreadX = offsetIndex * (UNIT_RADIUS * 0.9);
    const spreadY = Math.abs(offsetIndex) * 6;
    const unit = createUnit(card, side, position.lane, position.x + spreadX, position.y + spreadY);
    state.battle.units.push(unit);
    elements.arenaField.appendChild(unit.element);
  }
}

function createUnit(card, side, lane, x, y) {
  const { x: adjustedX, y: adjustedY } = clampPointToArena(x - UNIT_RADIUS, y - UNIT_RADIUS);
  const targetKey = resolveTargetTower(side, lane);
  const targetPos = getTargetPosition(side, targetKey);
  const element = document.createElement('div');
  element.className = `unit ${side}`;
  element.innerHTML = getUnitMarkup(card);
  element.style.left = `${adjustedX}px`;
  element.style.top = `${adjustedY}px`;
  const isRanged = (card.attackRange || 1) > 2;
  return {
    card,
    side,
    lane,
    element,
    x: adjustedX,
    y: adjustedY,
    speed: card.speed || 50,
    attackRange: (card.attackRange || 1) * 35,
    attackPower: card.attackPower || 0,
    attackSpeed: card.attackSpeed || 1,
    attackCooldown: 0,
    hp: card.health || 0,
    maxHp: card.health || 0,
    targetKey,
    targetX: targetPos.x,
    targetY: targetPos.y,
    targetUnit: null,
    mode: 'move',
    done: false,
    isRanged,
    path: null,
    currentPathIndex: 0
  };
}

function resolveTargetTower(side, lane) {
  const prefix = side === 'friendly' ? 'enemy' : 'friendly';
  const ordered = lane === 'middle' ? [`${prefix}-king`, `${prefix}-left`, `${prefix}-right`] : [`${prefix}-${lane}`, `${prefix}-king`];
  return ordered.find((key) => state.battle.towers[key].hp > 0) || `${prefix}-king`;
}

function getTargetPosition(side, targetKey) {
  const fieldWidth = elements.arenaField.clientWidth;
  const fieldHeight = elements.arenaField.clientHeight;
  const towerPos = state.battle.towerPositions[targetKey];
  if (towerPos) {
    return { x: towerPos.x, y: towerPos.y };
  }
  // Fallback
  const margin = targetKey.includes('king') ? 60 : 90;
  const x = targetKey.includes('left') ? fieldWidth * 0.2 : targetKey.includes('right') ? fieldWidth * 0.8 : fieldWidth * 0.5;
  const y = side === 'friendly' ? margin : fieldHeight - margin;
  return { x, y };
}

function getBridgePositions() {
  if (state.battle?.bridgePositions) return state.battle.bridgePositions;
  const { width, riverY } = getArenaDimensions();
  if (!width) return null;
  return {
    left: { x: width * 0.25, y: riverY, width: 130, height: 60 },
    right: { x: width * 0.75, y: riverY, width: 130, height: 60 }
  };
}

function isInRiver(x, y) {
  const { height } = getArenaDimensions();
  if (!height) return false;
  const centerY = y + UNIT_RADIUS;
  const riverTop = height / 2 - 30;
  const riverBottom = height / 2 + 30;
  return centerY >= riverTop && centerY <= riverBottom;
}

function isOnBridge(x, y) {
  const bridges = getBridgePositions();
  if (!bridges) return false;
  const centerX = x + UNIT_RADIUS;
  const centerY = y + UNIT_RADIUS;
  const tolerance = 4;
  return Object.values(bridges).some((bridge) => {
    const halfW = bridge.width / 2 + tolerance;
    const halfH = bridge.height / 2 + tolerance;
    return (
      centerX >= bridge.x - halfW &&
      centerX <= bridge.x + halfW &&
      centerY >= bridge.y - halfH &&
      centerY <= bridge.y + halfH
    );
  });
}

function findPathToTarget(unit) {
  const { width, height, riverY } = getArenaDimensions();
  if (!width || !height) return [centerToPoint(unit.targetX, unit.targetY)];
  const path = [];
  const unitCenter = getUnitCenter(unit);
  // Prevent backwards paths
  const { riverY: _riverY } = getArenaDimensions();
  if (unit.side === 'friendly' && unit.targetY < _riverY - 40) {
    unit.targetY = _riverY - 40;
  }
  if (unit.side === 'enemy' && unit.targetY > _riverY + 40) {
    unit.targetY = _riverY + 40;
  }
  const laneX = getLaneAnchorX(unit.lane);
  const tolerance = 4;
  const needsToCross =
    (unit.side === 'friendly' && unit.targetY < riverY - 20) ||
    (unit.side === 'enemy' && unit.targetY > riverY + 20);
  const lastPoint = () => path[path.length - 1] || unitCenter;

  if (Math.abs(unitCenter.x - laneX) > tolerance) {
    path.push({ x: laneX, y: unitCenter.y });
  }

  if (needsToCross) {
    const bridge = selectBridgeForLane(laneX);
    if (bridge) {
      const entryY = unit.side === 'friendly' ? riverY + 50 : riverY - 50;
      const exitY = unit.side === 'friendly' ? riverY - 60 : riverY + 60;
      if (Math.abs(lastPoint().x - bridge.x) > tolerance) {
        path.push({ x: bridge.x, y: lastPoint().y });
      }
      path.push({ x: bridge.x, y: entryY });
      path.push({ x: bridge.x, y: bridge.y });
      path.push({ x: bridge.x, y: exitY });
    }
  }

  path.push({ x: unit.targetX, y: unit.targetY });

  return path
    .map((center) => centerToPoint(center.x, center.y))
    .filter((point, index, arr) => {
      if (index === 0) return true;
      const prev = arr[index - 1];
      return Math.hypot(prev.x - point.x, prev.y - point.y) > tolerance;
    });
}

function findNearestEnemy(unit, range) {
  const { height } = getArenaDimensions();
  if (!height) return null;
  const myCenter = getUnitCenter(unit);
  return (
    state.battle.units
      .filter((u) => u.side !== unit.side && !u.done && u.hp > 0)
      .map((u) => {
        const enemyCenter = getUnitCenter(u);
        const dist = Math.hypot(myCenter.x - enemyCenter.x, myCenter.y - enemyCenter.y);
        const enemyInMyTerritory = unit.side === 'friendly' ? enemyCenter.y > height / 2 : enemyCenter.y < height / 2;
        const priority = enemyInMyTerritory ? 0 : 1;
        return { unit: u, dist, priority };
      })
      .filter((entry) => entry.dist <= range)
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.dist - b.dist;
      })[0]?.unit || null
  );
}

function updateUnits(delta) {
  // Apply overtime speed boost
  const isOvertime = state.battle && state.battle.globalTime <= 30;
  const speedMultiplier = isOvertime ? 1.2 : 1.0;
  
  state.battle.units = state.battle.units.filter((unit) => {
    if (unit.done || unit.hp <= 0) {
      unit.element.remove();
      return false;
    }
    
    if (unit.attackCooldown > 0) unit.attackCooldown -= delta;
    
    // Apply speed multiplier
    const currentSpeed = unit.speed * speedMultiplier;
    
    // Check for nearby enemies first - prioritize enemies in our territory
    const nearbyEnemy = findNearestEnemy(unit, unit.attackRange * 1.5); // Slightly larger detection range
    
    if (nearbyEnemy && (unit.mode !== 'combat' || unit.targetUnit !== nearbyEnemy)) {
      unit.mode = 'combat';
      unit.targetUnit = nearbyEnemy;
    }
    
    if (unit.mode === 'combat') {
      // Check if enemy is still in range
      if (!unit.targetUnit || unit.targetUnit.done || unit.targetUnit.hp <= 0) {
        unit.targetUnit = findNearestEnemy(unit, unit.attackRange);
        if (!unit.targetUnit) {
          const safeTarget = resolveTargetTower(unit.side, unit.lane);
          const { riverY } = getArenaDimensions();
          const targetPos = getTargetPosition(unit.side, safeTarget);

          if (unit.side === 'friendly' && targetPos.y < riverY) {
            targetPos.y = riverY - 40;
          }
          if (unit.side === 'enemy' && targetPos.y > riverY) {
            targetPos.y = riverY + 40;
          }

          unit.targetKey = safeTarget;
          unit.targetX = targetPos.x;
          unit.targetY = targetPos.y;

          unit.mode = 'move';
          unit.path = findPathToTarget(unit);
          unit.currentPathIndex = 0;
          return true;
        }
      }
      
      const myCenter = getUnitCenter(unit);
      const enemyCenter = getUnitCenter(unit.targetUnit);
      const enemyDist = Math.hypot(myCenter.x - enemyCenter.x, myCenter.y - enemyCenter.y);
      
      if (enemyDist > unit.attackRange) {
        const dx = enemyCenter.x - myCenter.x;
        const dy = enemyCenter.y - myCenter.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
          const nextX = unit.x + (dx / dist) * currentSpeed * delta;
          const nextY = unit.y + (dy / dist) * currentSpeed * delta;
          const clamped = clampPointToArena(nextX, nextY);
          unit.x = clamped.x;
          unit.y = clamped.y;
        }
      } else {
        // Attack enemy
        if (unit.attackCooldown <= 0) {
          if (unit.isRanged) {
            const start = getUnitCenter(unit);
            const end = getUnitCenter(unit.targetUnit);
            spawnProjectile(start, end, () => {
              if (unit.targetUnit && !unit.targetUnit.done) {
                unit.targetUnit.hp -= unit.attackPower;
                if (unit.targetUnit.hp <= 0) {
                  unit.targetUnit.done = true;
                }
              }
            });
            unit.element.classList.add('attacking');
            setTimeout(() => unit.element.classList.remove('attacking'), 200);
          } else {
            // Melee attack
            unit.targetUnit.hp -= unit.attackPower;
            unit.element.classList.add('attacking');
            setTimeout(() => unit.element.classList.remove('attacking'), 200);
            if (unit.targetUnit.hp <= 0) {
              unit.targetUnit.done = true;
            }
          }
          unit.attackCooldown = unit.attackSpeed;
        }
      }
    } else if (unit.mode === 'move') {
      // Initialize path if needed
      if (!unit.path) {
        unit.path = findPathToTarget(unit);
        unit.currentPathIndex = 0;
      }
      
      if (unit.path.length === 0) {
        unit.mode = 'attack';
        return true;
      }
      
      const currentTarget = unit.path[unit.currentPathIndex];
      const dx = currentTarget.x - unit.x;
      const dy = currentTarget.y - unit.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < 5) {
        // Reached waypoint
        unit.currentPathIndex++;
        if (unit.currentPathIndex >= unit.path.length) {
          unit.mode = 'attack';
          return true;
        }
      } else {
        const moveX = (dx / dist) * currentSpeed * delta;
        const moveY = (dy / dist) * currentSpeed * delta;
        const newX = unit.x + moveX;
        const newY = unit.y + moveY;

        // CR rule: units must not walk backwards, but allow small Y wiggle (±4px)
        const tol = 4;
        const goingBackwards =
          (unit.side === 'friendly' && newY > unit.y + tol) ||
          (unit.side === 'enemy' && newY < unit.y - tol);

        if (goingBackwards) {
          unit.path = findPathToTarget(unit);
          unit.currentPathIndex = 0;
          return true;
        }

        const willBeInRiver = isInRiver(newX, newY);
        const willBeOnBridge = isOnBridge(newX, newY);
        const currentlyOnBridge = isOnBridge(unit.x, unit.y);
        
        if (willBeInRiver && !(willBeOnBridge || currentlyOnBridge)) {
          unit.path = findPathToTarget(unit);
          unit.currentPathIndex = 0;
          return true;
        }
        
        const clamped = clampPointToArena(newX, newY);
        unit.x = clamped.x;
        unit.y = clamped.y;
      }
    } else if (unit.mode === 'attack') {
      // Attack tower
      if (!isTowerAlive(unit.targetKey)) {
        const newTarget = resolveTargetTower(unit.side, unit.lane);
        if (!isTowerAlive(newTarget)) {
          unit.done = true;
          unit.element.remove();
          return false;
        }
        unit.targetKey = newTarget;
        const newPos = getTargetPosition(unit.side, unit.targetKey);
        unit.targetX = newPos.x;
        unit.targetY = newPos.y;
        unit.path = findPathToTarget(unit);
        unit.currentPathIndex = 0;
        unit.mode = 'move';
        return true;
      }
      
      const towerPos = state.battle.towerPositions[unit.targetKey];
      if (!towerPos) {
        unit.mode = 'move';
        return true;
      }
      
      const unitCenter = getUnitCenter(unit);
      const dist = Math.hypot(unitCenter.x - towerPos.x, unitCenter.y - towerPos.y);
      
      if (dist > unit.attackRange) {
        const dx = towerPos.x - unitCenter.x;
        const dy = towerPos.y - unitCenter.y;
        const moveDist = Math.hypot(dx, dy);
        if (moveDist > 0) {
          const nextX = unit.x + (dx / moveDist) * currentSpeed * delta;
          const nextY = unit.y + (dy / moveDist) * currentSpeed * delta;
          const clamped = clampPointToArena(nextX, nextY);
          unit.x = clamped.x;
          unit.y = clamped.y;
        }
      } else {
        // Attack tower
        if (unit.attackCooldown <= 0) {
          if (unit.isRanged) {
            spawnProjectile(
              unitCenter,
              { x: towerPos.x, y: towerPos.y },
              () => damageTower(unit.targetKey, unit.attackPower, unit.side)
            );
            unit.element.classList.add('attacking');
            setTimeout(() => unit.element.classList.remove('attacking'), 200);
          } else {
            damageTower(unit.targetKey, unit.attackPower, unit.side);
            unit.element.classList.add('attacking');
            setTimeout(() => unit.element.classList.remove('attacking'), 200);
          }
          unit.attackCooldown = unit.attackSpeed;
        }
      }
    }
    
    // Update visual position
    unit.element.style.left = `${unit.x}px`;
    unit.element.style.top = `${unit.y}px`;
    
    return true;
  });
}

function castSpell(card, position) {
  const key = resolveTargetTower('friendly', position.lane);
  const tower = state.battle.towers[key];
  if (!tower) return;
  const damage = Math.round(card.stats.damage * (card.stats.towerDamageModifier || 1));
  createSpellIndicator(position.x, position.y, card.stats.radius || 30);
  damageTower(key, damage, 'friendly');
  elements.battleStatus.textContent = `${card.name} hits ${key.replace('-', ' ')}!`;
}

function createSpellIndicator(x, y, radius) {
  elements.spellRadius.style.width = `${radius * 2}px`;
  elements.spellRadius.style.height = `${radius * 2}px`;
  elements.spellRadius.style.left = `${x - radius}px`;
  elements.spellRadius.style.top = `${y - radius}px`;
  elements.spellRadius.classList.add('show');
  setTimeout(() => elements.spellRadius.classList.remove('show'), 400);
}

function updateProjectiles(delta) {
  if (!state.battle.projectiles.length) return;
  state.battle.projectiles = state.battle.projectiles.filter((proj) => {
    proj.elapsed += delta;
    const progress = Math.min(1, proj.elapsed / proj.duration);
    if (progress >= 1) {
      proj.element.remove();
      if (proj.onImpact) proj.onImpact();
      return false;
    }
    const x = proj.start.x + (proj.end.x - proj.start.x) * progress;
    const y = proj.start.y + (proj.end.y - proj.start.y) * progress;
    proj.element.style.left = `${x}px`;
    proj.element.style.top = `${y}px`;
    return true;
  });
}

function spawnProjectile(start, end, onImpact, type = 'default') {
  const element = document.createElement('div');
  element.className = `projectile ${type}`;
  element.style.left = `${start.x}px`;
  element.style.top = `${start.y}px`;
  elements.projectileLayer.appendChild(element);
  const dist = Math.hypot(end.x - start.x, end.y - start.y);
  const duration = Math.min(1.5, Math.max(0.3, dist / 300));
  state.battle.projectiles.push({ element, start, end, duration, elapsed: 0, onImpact });
}

function updateTowers(delta) {
  Object.entries(state.battle.towers).forEach(([key, tower]) => {
    if (tower.hp <= 0) return;
    const config = towerConfig[tower.type];
    const towerPos = state.battle.towerPositions[key];
    if (!towerPos) return;
    
    // Check for nearby enemy units (3cm = ~90px radius)
    const nearbyEnemies = state.battle.units.filter(unit => {
      if (unit.side === tower.side || unit.done || unit.hp <= 0) return false;
      const dist = Math.hypot(unit.x - towerPos.x, unit.y - towerPos.y);
      return dist <= 90; // 3cm radius
    });
    
    // If enemies are very close, defend aggressively
    if (nearbyEnemies.length > 0) {
      tower.defenseCooldown = (tower.defenseCooldown || 0) - delta;
      if (tower.defenseCooldown <= 0) {
        const closest = nearbyEnemies.sort((a, b) => {
          const distA = Math.hypot(a.x - towerPos.x, a.y - towerPos.y);
          const distB = Math.hypot(b.x - towerPos.x, b.y - towerPos.y);
          return distA - distB;
        })[0];
        tower.defenseCooldown = 1.2; // Shoot every 1.2 seconds
        const enemyCenter = getUnitCenter(closest);
        spawnProjectile(
          towerPos,
          enemyCenter,
          () => damageUnit(closest, config.damage),
          'arrow'
        );
      }
    }
    
    // Normal tower targeting
    tower.cooldown = (tower.cooldown || 0) - delta;
    if (tower.cooldown > 0) return;
    const target = findUnitTarget(tower.side === 'friendly' ? 'enemy' : 'friendly', config.range, key);
    if (target) {
      tower.cooldown = config.speed;
      const targetCenter = getUnitCenter(target);
      spawnProjectile(towerPos, targetCenter, () => damageUnit(target, config.damage), 'arrow');
    }
  });
}

function findUnitTarget(side, range, towerKey) {
  const origin = state.battle.towerPositions[towerKey];
  if (!origin) return null;
  const units = state.battle.units
    .filter((unit) => unit.side === side && !unit.done)
    .map((unit) => {
      const center = getUnitCenter(unit);
      return { unit, dist: Math.hypot(center.x - origin.x, center.y - origin.y) };
    })
    .filter((entry) => entry.dist <= range * 35)
    .sort((a, b) => a.dist - b.dist);
  return units.length ? units[0].unit : null;
}

function damageUnit(unit, damage) {
  if (!unit || unit.done) return;
  unit.hp = (unit.hp || unit.card.health || 0) - damage;
  if (unit.hp <= 0) {
    unit.done = true;
    unit.element.remove();
  }
}

function isTowerAlive(key) {
  const tower = state.battle.towers[key];
  return tower && tower.hp > 0;
}

function damageTower(key, amount, attackerSide) {
  const tower = state.battle.towers[key];
  if (!tower || tower.hp <= 0) return;
  tower.hp = Math.max(0, tower.hp - amount);
  updateTowerUI();
  if (tower.hp === 0) {
    handleTowerDestroyed(key, attackerSide);
  }
}

function updateTowerUI() {
  Object.entries(state.battle.towers).forEach(([key, tower]) => {
    const bar = document.querySelector(`[data-tower="${key}"]`);
    if (bar) bar.style.width = `${(tower.hp / tower.max) * 100}%`;
    const [side, slot] = key.split('-');
    const towerNode = document.querySelector(`.tower[data-side="${side}"][data-slot="${slot}"]`);
    if (towerNode) towerNode.classList.toggle('destroyed', tower.hp <= 0);
  });
}

function handleTowerDestroyed(key, attackerSide) {
  const isEnemy = key.startsWith('enemy');
  if (isEnemy) {
    state.battle.crowns.player += key.includes('king') ? 3 : 1;
  } else {
    state.battle.crowns.enemy += key.includes('king') ? 3 : 1;
  }
  if (isEnemy && key.includes('left')) state.battle.deployUnlocked.left = true;
  if (isEnemy && key.includes('right')) state.battle.deployUnlocked.right = true;
  updatePocketIndicators();
  renderBattleHUD();
  
  // End game if king tower is destroyed
  if (key.includes('king')) {
    const playerTowersAlive = ['friendly-left', 'friendly-right', 'friendly-king']
      .filter(k => isTowerAlive(k)).length;
    const enemyTowersAlive = ['enemy-left', 'enemy-right', 'enemy-king']
      .filter(k => isTowerAlive(k)).length;
    const playerTowerHealth = ['friendly-left', 'friendly-right', 'friendly-king']
      .reduce((sum, k) => sum + (state.battle.towers[k]?.hp || 0), 0);
    const enemyTowerHealth = ['enemy-left', 'enemy-right', 'enemy-king']
      .reduce((sum, k) => sum + (state.battle.towers[k]?.hp || 0), 0);
    
    const result = attackerSide === 'friendly' ? 'Victory!' : 'Defeat';
    endBattle(result, {
      playerCrowns: state.battle.crowns.player,
      enemyCrowns: state.battle.crowns.enemy,
      playerTowersAlive,
      enemyTowersAlive,
      playerTowerHealth,
      enemyTowerHealth
    });
  }
}

function updatePocketIndicators() {
  elements.pocketLeft.classList.toggle('active', !!state.battle?.deployUnlocked.left);
  elements.pocketRight.classList.toggle('active', !!state.battle?.deployUnlocked.right);
}

function endBattle(resultText, stats = {}) {
  if (!state.battle) return;
  cancelAnimationFrame(state.battle.animationFrame);
  state.battle.units.forEach((unit) => unit.element.remove());
  state.battle.projectiles.forEach((proj) => proj.element.remove());
  
  // Show win panel
  showWinPanel(resultText, stats);
  
  state.battle = null;
  playSoundtrack('menu');
}

function showWinPanel(resultText, stats) {
  const panel = document.createElement('div');
  panel.className = 'win-panel';
  panel.innerHTML = `
    <div class="win-panel-content">
      <h1 class="win-title">${resultText}</h1>
      <div class="win-crowns">
        <div class="crown-display">
          <span class="crown-icon">👑</span>
          <span class="crown-count">${stats.playerCrowns || 0}</span>
          <span class="crown-label">You</span>
        </div>
        <div class="crown-display">
          <span class="crown-icon">👑</span>
          <span class="crown-count">${stats.enemyCrowns || 0}</span>
          <span class="crown-label">Enemy</span>
        </div>
      </div>
      <div class="win-stats">
        <div class="stat-row">
          <span>Towers Destroyed:</span>
          <span>${3 - (stats.playerTowersAlive || 0)} vs ${3 - (stats.enemyTowersAlive || 0)}</span>
        </div>
        <div class="stat-row">
          <span>Towers Remaining:</span>
          <span>${stats.playerTowersAlive || 0} vs ${stats.enemyTowersAlive || 0}</span>
        </div>
        <div class="stat-row">
          <span>Total Tower Health:</span>
          <span>${Math.round(stats.playerTowerHealth || 0)} vs ${Math.round(stats.enemyTowerHealth || 0)}</span>
        </div>
      </div>
      <button class="button gold" id="homeButton">Home</button>
    </div>
  `;
  elements.arenaField.appendChild(panel);
  
  document.getElementById('homeButton').addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

function concludeBattle() {
  if (!state.battle) return;
  
  // Count alive towers
  const playerTowersAlive = ['friendly-left', 'friendly-right', 'friendly-king']
    .filter(key => isTowerAlive(key)).length;
  const enemyTowersAlive = ['enemy-left', 'enemy-right', 'enemy-king']
    .filter(key => isTowerAlive(key)).length;
  
  // Calculate total tower health
  const playerTowerHealth = ['friendly-left', 'friendly-right', 'friendly-king']
    .reduce((sum, key) => sum + (state.battle.towers[key]?.hp || 0), 0);
  const enemyTowerHealth = ['enemy-left', 'enemy-right', 'enemy-king']
    .reduce((sum, key) => sum + (state.battle.towers[key]?.hp || 0), 0);
  
  let result = 'Draw';
  if (playerTowersAlive !== enemyTowersAlive) {
    result = playerTowersAlive > enemyTowersAlive ? 'Victory!' : 'Defeat';
  } else if (playerTowerHealth !== enemyTowerHealth) {
    result = playerTowerHealth > enemyTowerHealth ? 'Victory!' : 'Defeat';
  }
  
  endBattle(result, {
    playerCrowns: state.battle.crowns.player,
    enemyCrowns: state.battle.crowns.enemy,
    playerTowersAlive,
    enemyTowersAlive,
    playerTowerHealth,
    enemyTowerHealth
  });
}

function getTroopCards() {
  return Object.values(state.characters).filter((card) => card.type !== 'spell');
}

function bindEvents() {
  elements.battleButton.addEventListener('click', startBattle);
  elements.leaveBattle.addEventListener('click', () => {
    stopAllSound();
    playSoundtrack('menu');
    if (state.battle) {
      cancelAnimationFrame(state.battle.animationFrame);
      state.battle.units.forEach((unit) => unit.element.remove());
      state.battle.projectiles.forEach((proj) => proj.element.remove());
      state.battle = null;
    }
  });
  // Drag and drop handlers
  let draggedCard = null;
  let isDragging = false;
  
  elements.battleHand.addEventListener('dragstart', (event) => {
    const card = event.target.closest('.battle-card');
    if (!card || card.classList.contains('disabled')) {
      event.preventDefault();
      return;
    }
    isDragging = true;
    draggedCard = card.dataset.card;
    event.dataTransfer.effectAllowed = 'move';
    card.style.opacity = '0.5';
  });
  
  elements.battleHand.addEventListener('dragend', (event) => {
    const card = event.target.closest('.battle-card');
    if (card) card.style.opacity = '1';
    isDragging = false;
    draggedCard = null;
  });
  
  // Prevent click when dragging
  elements.battleHand.addEventListener('click', (event) => {
    if (isDragging) {
      event.preventDefault();
      event.stopPropagation();
      isDragging = false;
      return;
    }
    const card = event.target.closest('.battle-card');
    if (!card || card.classList.contains('disabled')) return;
    selectBattleCard(card.dataset.card);
  });
  
  elements.arenaField.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    if (!draggedCard || !state.battle) return;
    const card = state.characters[draggedCard];
    if (!card) return;
    
    const rect = elements.arenaField.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const permission = getDeployPermission(card, x, y, rect);
    
    // Update deploy zone visual
    elements.arenaField.classList.toggle('valid-drop', permission.allowed);
    elements.arenaField.classList.toggle('invalid-drop', !permission.allowed);
  });
  
  elements.arenaField.addEventListener('dragleave', () => {
    elements.arenaField.classList.remove('valid-drop', 'invalid-drop');
  });
  
  elements.arenaField.addEventListener('drop', (event) => {
    event.preventDefault();
    elements.arenaField.classList.remove('valid-drop', 'invalid-drop');
    
    if (!draggedCard || !state.battle) return;
    const card = state.characters[draggedCard];
    if (!card) return;
    
    const rect = elements.arenaField.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const permission = getDeployPermission(card, x, y, rect);
    
    if (permission.allowed) {
      deployCard(draggedCard, { x, y, lane: permission.lane });
    } else {
      elements.battleStatus.textContent = permission.pocket ? 'Destroy that tower to unlock the pocket!' : 'Deploy on your side!';
    }
    
    draggedCard = null;
  });
  
  elements.arenaField.addEventListener('click', handleArenaClick);
  elements.emoteToggle.addEventListener('click', () => elements.emotePanel.classList.toggle('active'));
  elements.emotePanel.addEventListener('click', (event) => {
    if (event.target.dataset.emote) {
      const emote = event.target.dataset.emote;
      showEmote(emote, 'friendly');
      elements.emotePanel.classList.remove('active');
    }
  });
  elements.muteToggle.addEventListener('click', () => {
    state.muted = !state.muted;
    elements.muteToggle.textContent = state.muted ? '🔈 Unmute' : '🔇 Mute';
    if (state.muted) stopAllSound();
    else playSoundtrack(state.battle ? 'battle' : 'menu');
  });
  window.addEventListener('resize', () => {
    if (state.battle) refreshBattleGeometry();
  });
}

function tickOneSecond() {
  if (!state.battle) return;
  Object.keys(state.battle.player.cooldowns).forEach((cardId) => {
    state.battle.player.cooldowns[cardId] = Math.max(0, state.battle.player.cooldowns[cardId] - 1);
  });
  renderBattleHand();
}

async function init() {
  cacheElements();
  setupSounds();
  playSoundtrack('menu');
  setBattleButtonState(true);
  await bootstrapCharacters();
  state.dataLoaded = true;
  setBattleButtonState(false);
  bindEvents();
  renderBattleHUD();
  setInterval(tickOneSecond, 1000);
}

document.addEventListener('DOMContentLoaded', init);
