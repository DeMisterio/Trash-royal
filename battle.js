const builtInCharacters = [

  { id: 'knight', name: 'Knight', type: 'troop', rarity: 'common', elixir: 3, description: 'A dependable melee fighter with solid health.', emoji: '🛡️', sprite: 'Characters/knight.png', stats: { health: 1600, damage: 150, attackSpeed: 1.1, range: 0.8, speed: 52, targeting: 'ground', spawnCount: 1, splashRadius: 0 } },
  { id: 'archers', name: 'Archers', type: 'troop', rarity: 'common', elixir: 3, description: 'Twin archers with reliable ranged DPS.', emoji: '🏹', sprite: 'Characters/archers.png', stats: { health: 304, damage: 107, attackSpeed: 1.2, range: 5, speed: 60, targeting: 'air-ground', spawnCount: 2, splashRadius: 0 } },
  { id: 'baby-dragon', name: 'Baby Dragon', type: 'troop', rarity: 'epic', elixir: 4, description: 'Flying splash attacker, hard to take down.', emoji: '🐲', sprite: 'Characters/baby-dragon.png', stats: { health: 1200, damage: 150, attackSpeed: 1.6, range: 3.5, speed: 62, targeting: 'air-ground', spawnCount: 1, splashRadius: 2 } },
  { id: 'giant', name: 'Giant', type: 'troop', rarity: 'rare', elixir: 5, description: 'Slow but mighty siege unit that targets buildings.', emoji: '🗿', sprite: 'Characters/giant.png', stats: { health: 3344, damage: 211, attackSpeed: 1.5, range: 0.8, speed: 40, targeting: 'buildings', spawnCount: 1, splashRadius: 0 } },
  { id: 'musketeer', name: 'Musketeer', type: 'troop', rarity: 'rare', elixir: 4, description: 'Single target sharpshooter.', emoji: '🎯', sprite: 'Characters/musketeer.png', stats: { health: 598, damage: 160, attackSpeed: 1.1, range: 6, speed: 65, targeting: 'air-ground', spawnCount: 1, splashRadius: 0 } },
  { id: 'fireball', name: 'Fireball', type: 'spell', rarity: 'rare', elixir: 4, description: 'Medium area damage spell.', emoji: '🔥', sprite: 'Characters/fireball.png', stats: { damage: 572, radius: 2.5, towerDamageModifier: 0.35 } },
  { id: 'minions', name: 'Minions', type: 'troop', rarity: 'common', elixir: 3, description: 'Fast flying melee attackers.', emoji: '🦅', sprite: 'Characters/minions.png', stats: { health: 190, damage: 90, attackSpeed: 1, range: 1, speed: 90, targeting: 'air-ground', spawnCount: 3, splashRadius: 0 } },
  { id: 'hog-rider', name: 'Hog Rider', type: 'troop', rarity: 'rare', elixir: 4, description: 'Jumps river and rushes for towers.', emoji: '🐗', sprite: 'Characters/hog-rider.png', stats: { health: 1696, damage: 264, attackSpeed: 1.5, range: 0.8, speed: 96, targeting: 'buildings', spawnCount: 1, splashRadius: 0 } }
];
function smoothStep(from, to, factor) {
    if (isNaN(from)) return to; // аварийный фикс
    return from + (to - from) * factor;
}

const synergy = {
    tank:        { ranged:3, splash:3, swarm:2, bruiser:1 },
    juggernaut:  { ranged:3, swarm:3, splash:2 },
    bruiser:     { ranged:2, swarm:3, splash:1 },
    siege:       { ranged:3, swarm:2 },
    splash:      { swarm:3, tank:2, juggernaut:2 },
    swarm:       { tank:2, juggernaut:3, splash:2 },
    ranged:      { tank:3, juggernaut:3, siege:3 }
};

function generateSmartCombos(deck) {
    // распределяем карты по ролям
    const byRole = {};
    deck.forEach(card => {
        const r = card.role;
        if (!byRole[r]) byRole[r] = [];
        byRole[r].push(card);
    });

    const combos = [];

    function addCombo(cards) {
        combos.push(cards.map(c => c.id));
    }

    // === 1) ДВУХКАРТОЧНЫЕ КОМБО ПО СИНЕРГИИ
    for (const r1 in byRole) {
        for (const r2 in byRole) {
            if (synergy[r1] && synergy[r1][r2] >= 2) {
                for (const c1 of byRole[r1]) {
                    for (const c2 of byRole[r2]) {
                        if (c1.id !== c2.id) {
                            addCombo([c1, c2]);
                        }
                    }
                }
            }
        }
    }

    // === 2) "Большие пуши": tank + splash + ranged
    if (byRole.tank && byRole.splash && byRole.ranged) {
        for (const t of byRole.tank)
            for (const s of byRole.splash)
                for (const r of byRole.ranged)
                    addCombo([t, s, r]);
    }

    // === 3) Juggernaut push: juggernaut + ranged + swarm
    if (byRole.juggernaut && byRole.ranged && byRole.swarm) {
        for (const j of byRole.juggernaut)
            for (const r of byRole.ranged)
                for (const w of byRole.swarm)
                    addCombo([j, r, w]);
    }

    return combos;
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


function detectRole(card) {
    const hp = card.stats.health;
    const dmg = card.stats.damage;
    const range = card.stats.range;
    const count = card.stats.spawnCount;
    const targeting = card.stats.targeting;

    // атакует здания → осадный
    if (targeting === "buildings") return "siege";

    // рой
    if (count >= 3 && hp < 600) return "swarm";

    // дальний бой
    if (range >= 3.5) return "ranged";

    // танк
    if (hp >= 2500 && dmg < 250) return "tank";

    // джаггернаут (много HP, много урона)
    if (hp >= 3500 && dmg >= 300) return "juggernaut";

    // брузер
    if (hp >= 900 && dmg >= 200 && range <= 2) return "bruiser";

    // fallback
    return "melee";
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

function classifyUnit(card) {
    if (card.type === "spell") return "spell";
    if (card.stats.health >= 1500) return "tank";
    if (card.stats.range >= 4) return "ranged";
    return "melee";
}

function isUnderAttack() {
    return state.battle.units.some(u =>
        u.side === "friendly" &&
        u.y > state.battle.arenaHeight * 0.58
    );
}

function playerIsLosing() {
  const b = state.battle;
  if (!b) return false;

  const t = b.towers || {};
  const playerCrowns = (b.crowns && b.crowns.player) || 0;
  const enemyCrowns = (b.crowns && b.crowns.enemy) || 0;

  const playerTowerHp =
    (t["friendly-left"]?.hp || 0) +
    (t["friendly-right"]?.hp || 0) +
    (t["friendly-king"]?.hp || 0);

  const enemyTowerHp =
    (t["enemy-left"]?.hp || 0) +
    (t["enemy-right"]?.hp || 0) +
    (t["enemy-king"]?.hp || 0);

  const playerScore = playerCrowns * 10000 + playerTowerHp;
  const enemyScore = enemyCrowns * 10000 + enemyTowerHp;

  return playerScore < enemyScore;
}

function enemyInCriticalDanger() {
  const b = state.battle;
  if (!b || !b.towers) return false;

  // Use the global towerDefaults (declared as `const towerDefaults = ...`)
  const td = typeof towerDefaults !== 'undefined' ? towerDefaults : { princess: 0, king: 0 };

  const enemyLeftHp = b.towers["enemy-left"]?.hp || 0;
  const enemyRightHp = b.towers["enemy-right"]?.hp || 0;
  const enemyKingHp = b.towers["enemy-king"]?.hp || 0;

  return (
    (td.princess > 0 && enemyLeftHp < td.princess * 0.2) ||
    (td.princess > 0 && enemyRightHp < td.princess * 0.2) ||
    (td.king > 0 && enemyKingHp < td.king * 0.25)
  );
}


function processEnemyEmotions(enemy) {
  if (!state.battle || !enemy) return;
  if ((enemy.emoteTimer || 0) > 0) return;

  // 1. You're losing -> enemy trolls
  if (playerIsLosing()) {
    const toxic = ["👎", "😂", "😎", "👏"];
    showEmote(toxic[Math.floor(Math.random() * toxic.length)], "enemy");
    enemy.emoteTimer = randomBetween(3, 6);
    return;
  }

  // 2. Enemy in critical danger
  if (enemyInCriticalDanger()) {
    const panic = ["😡", "😢", "😨", "💀"];
    showEmote(panic[Math.floor(Math.random() * panic.length)], "enemy");
    enemy.emoteTimer = randomBetween(2, 4);
    return;
  }

  // 3. Neutral behaviour (rare)
  if (Math.random() < 0.12) {
    const casual = ["😀", "😏", "🤨"];
    showEmote(casual[Math.floor(Math.random() * casual.length)], "enemy");
  }

  enemy.emoteTimer = randomBetween(4, 7);
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
  try {
    const delta = (timestamp - state.battle.lastTick) / 1000;
    state.battle.lastTick = timestamp;
    updateBattle(delta);
  } catch (err) {
    console.error("Error in battleLoop:", err);
  }
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
    // Получаем реальные объекты карт из колоды оппонента
    const deckCards = state.battle.opponent.deckIds.map(id => state.characters[id]);
    const smartCombos = generateSmartCombos(deckCards);
    // Сортируем комбинации от простой (2 карты) к большой (3 карты)
    const sortedCombos = smartCombos.sort((a, b) => a.length - b.length);
    
    // Ищем комбо, которое бот может себе позволить (по эликсиру)
    function findUsableCombo() {
        for (const combo of sortedCombos) {
            let totalCost = 0;
    
            for (const id of combo) {
                const card = state.characters[id];
                totalCost += card.elixir;
            }
    
            // если хватает эликсира – берём
            if (state.battle.opponent.elixir >= totalCost) {
                return combo;
            }
        }
        return null;
    }
    
    const enemy = state.battle.enemy;
    if (!enemy) return;
    
    function underThreat() {
    return state.battle.units.some(u =>
        u.side === "player" &&
        u.x > 150 && u.x < 350  // зона возле его башни, при необходимости увеличи
    );
    }
    let chosenCombo = null;

    if (!underThreat()) {
        chosenCombo = findUsableCombo();
    }
    if (chosenCombo) {
    for (let i = 0; i < chosenCombo.length; i++) {
        const id = chosenCombo[i];
        spawnOpponentUnit(id, "center"); // или lane
    }

    // Потратить эликсир
    let cost = chosenCombo.reduce((sum, id) => sum + state.characters[id].elixir, 0);
    state.battle.opponent.elixir -= cost;

    return; // важно! Чтобы бот не делал обычную логику в этот тик
    }

    // Таймеры
    enemy.nextPlay -= delta;
    enemy.emoteTimer = (enemy.emoteTimer || 0) - delta;

    const deckIds = state.battle.opponent?.deckIds || getAvailableCardIds();
    let troops = deckIds
        .map(id => state.characters[id])
        .filter(c => c && c.type !== "spell");

    if (troops.length === 0) return;

    // ==== Классификация юнитов ====
    const tanks = troops.filter(c => classifyUnit(c) === "tank")
        .sort((a, b) => b.stats.health - a.stats.health);

    const ranged = troops.filter(c => classifyUnit(c) === "ranged")
        .sort((a, b) => b.stats.damage - a.stats.damage);

    const cheap = troops.filter(c => c.elixir <= 3)
        .sort((a, b) => a.elixir - b.elixir);

    // ==== Комбо-фаза (вторая часть пушки) ====
    if (enemy.comboQueue) {
        enemy.comboQueue.delay -= delta;
        if (enemy.comboQueue.delay <= 0) {
            spawnEnemyUnit(enemy.comboQueue.card);
            enemy.elixir -= enemy.comboQueue.card.elixir;
            enemy.comboQueue = null;
        }

        // эмоции в комбо-режиме тоже проверяются
        processEnemyEmotions(enemy);
        return;
    }

    // ==== Минимальная карта ====
    const cheapest = cheap.length ? cheap[0].elixir : 99;
    if (enemy.elixir < cheapest) {
        processEnemyEmotions(enemy);
        return;
    }

    // ==== 1. Экстренная оборона ====
    if (isUnderAttack()) {
        if (enemy.nextPlay <= 0 && cheap.length > 0) {
            const card = cheap[0];
            if (enemy.elixir >= card.elixir) {
                spawnEnemyUnit(card);
                enemy.elixir -= card.elixir;
                enemy.nextPlay = randomBetween(0.6, 1.3);
            }
        }
        processEnemyEmotions(enemy);
        return;
    }

    // ==== 2. Комбо-атака (танк + DPS) ====
    if (tanks.length > 0 && ranged.length > 0) {
        const tank = tanks[0];
        const dps = ranged[0];
        const comboCost = tank.elixir + dps.elixir;

        if (enemy.elixir >= comboCost && enemy.nextPlay <= 0) {

            // Выставляем танка
            spawnEnemyUnit(tank);
            enemy.elixir -= tank.elixir;

            // Планируем DPS чуть позже
            enemy.comboQueue = {
                card: dps,
                delay: randomBetween(0.8, 1.2)
            };

            enemy.nextPlay = randomBetween(3.5, 5);

            processEnemyEmotions(enemy);
            return;
        }
    }

    // ==== 3. Обычный игровой режим ====
    if (enemy.nextPlay <= 0) {
        const playable = troops.filter(c => enemy.elixir >= c.elixir);
        if (playable.length > 0) {
            const card = playable[Math.floor(Math.random() * playable.length)];
            spawnEnemyUnit(card);
            enemy.elixir -= card.elixir;

            enemy.nextPlay = randomBetween(2, 4);
        }
    }

    // ==== эмоции ====
    processEnemyEmotions(enemy);
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
function evaluateLanes() {
  const lanes = {
    left:   { friendlyStrength: 0, enemyStrength: 0 },
    middle: { friendlyStrength: 0, enemyStrength: 0 },
    right:  { friendlyStrength: 0, enemyStrength: 0 }
  };

  const { width } = getArenaDimensions();

  const laneFromUnit = (unit) => {
    if (unit.lane === 'left' || unit.lane === 'middle' || unit.lane === 'right') {
      return unit.lane;
    }
    const center = getUnitCenter(unit);
    if (!width) return 'middle';
    if (center.x < width / 3) return 'left';
    if (center.x > (2 * width) / 3) return 'right';
    return 'middle';
  };

  state.battle.units.forEach((u) => {
    if (u.done || u.hp <= 0) return;
    const lane = laneFromUnit(u);
    const value = (u.attackPower || 0) + (u.hp || 0) * 0.15;
    if (u.side === 'friendly') {
      lanes[lane].friendlyStrength += value;
    } else if (u.side === 'enemy') {
      lanes[lane].enemyStrength += value;
    }
  });

  return lanes;
}

// Выбор линии: либо дефаемся, либо пушим
function pickLane(lanes) {
  let bestDefLane = 'middle';
  let bestDefScore = 0;

  Object.keys(lanes).forEach((lane) => {
    const stats = lanes[lane];
    const threat = stats.friendlyStrength - stats.enemyStrength;
    if (threat > bestDefScore) {
      bestDefScore = threat;
      bestDefLane = lane;
    }
  });

  // Если нас реально давят где-то, дефаем там
  if (bestDefScore > 0) {
    return { lane: bestDefLane, mode: 'def' };
  }

  // Иначе выбираем линию, где у enemy преимущество → пуш
  let bestPushLane = 'middle';
  let bestPushScore = -Infinity;

  Object.keys(lanes).forEach((lane) => {
    const stats = lanes[lane];
    const advantage = stats.enemyStrength - stats.friendlyStrength;
    if (advantage > bestPushScore) {
      bestPushScore = advantage;
      bestPushLane = lane;
    }
  });

  return { lane: bestPushLane, mode: 'push' };
}

// Роли карт для выбора (очень грубо, но лучше рандома)
const ENEMY_ROLE_MAP = {
  'giant': 'tank',
  'knight': 'tank',
  'hog-rider': 'tank',
  'baby-dragon': 'aoe',
  'archers': 'dps',
  'minions': 'dps',
  'musketeer': 'dps'
};

// Выбор лучшей карты для def или push
function pickEnemyCard(mode) {
  const enemy = state.battle.enemy;
  const deckIds = (state.battle.opponent?.deckIds || getAvailableCardIds());
  let pool = deckIds
    .map((id) => state.characters[id])
    .filter((card) => card && card.type !== 'spell'); // враг пока играет только юнитами

  if (!pool.length) pool = getTroopCards();

  // Элексир ограничение
  pool = pool.filter((card) => card.elixir <= enemy.elixir);

  // Кулдауны врага
  enemy.cooldowns = enemy.cooldowns || {};
  pool = pool.filter((card) => (enemy.cooldowns[card.id] || 0) <= 0);

  if (!pool.length) return null;

  const scoreCard = (card) => {
    const role = ENEMY_ROLE_MAP[card.id] || 'dps';
    const hp   = card.health || card.stats?.health || 0;
    const dmg  = card.attackPower || card.stats?.damage || 0;
    const rng  = card.attackRange || card.stats?.range || 1;

    if (mode === 'def') {
      let s = dmg * 1.2 + rng * 8;
      if (role === 'aoe') s += 40;
      if (role === 'dps') s += 20;
      if (role === 'tank') s += 5;
      return s;
    } else {
      // push
      let s = hp * 0.25 + dmg;
      if (role === 'tank') s += 40;
      if (role === 'dps') s += 10;
      return s;
    }
  };

  return pool.reduce((best, card) => {
    if (!best) return card;
    return scoreCard(card) > scoreCard(best) ? card : best;
  }, null);
}

// Спавн юнита врага в конкретной линии
function spawnEnemyUnitAtLane(card, lane) {
  const safeLane = lane || ['left', 'middle', 'right'][Math.floor(Math.random() * 3)];
  const x = getLaneAnchorX(safeLane);
  const y = UNIT_RADIUS + 10;
  spawnUnit(card, 'enemy', { x, y, lane: safeLane });
}

function enemyBehindClose(unit, enemy) {
  if (!enemy) return false;

  const my = getUnitCenter(unit);
  const en = getUnitCenter(enemy);

  const dx = Math.abs(en.x - my.x);
  const dy = en.y - my.y;
  const dist = Math.hypot(dx, dy);

  // Friendly marches UP → enemy behind if dy > 0
  if (unit.side === "friendly" && dy > 0 && dist < 40) return true;

  // Enemy marches DOWN → enemy behind if dy < 0
  if (unit.side === "enemy" && dy < 0 && dist < 40) return true;

  return false;
}
function isGoingBackwards(unit, nx, ny) {
    const dy = ny - unit.y;

    // если горизонтальный шаг больше вертикального, это диагональ — НЕ назад
    const horizontal = Math.abs(nx - unit.x);
    const vertical = Math.abs(dy);
    if (horizontal > vertical) return false;

    if (unit.side === "friendly") return dy > 4;
    if (unit.side === "enemy") return dy < -4;

    return false;
}


function updateUnits(delta) {
    const isOvertime = state.battle && state.battle.globalTime <= 30;
    const speedMultiplier = isOvertime ? 1.2 : 1.0;

    state.battle.units = state.battle.units.filter((unit) => {
        if (unit.done || unit.hp <= 0) {
            unit.element.remove();
            return false;
        }

        if (unit.attackCooldown > 0) unit.attackCooldown -= delta;
        const currentSpeed = unit.speed * speedMultiplier;
        let moved = false;

        // 1) Ищем ближайшего врага
        const nearbyEnemy = findNearestEnemy(unit, unit.attackRange * 1.5);
        if (nearbyEnemy && (unit.mode !== "combat" || unit.targetUnit !== nearbyEnemy)) {
            unit.mode = "combat";
            unit.targetUnit = nearbyEnemy;
        }

        // =====================================================
        //                     COMBAT MODE
        // =====================================================
        if (unit.mode === "combat") {

            // Противник умер → идём к башне
            if (!unit.targetUnit || unit.targetUnit.done || unit.targetUnit.hp <= 0) {
                const safeTarget = resolveTargetTower(unit.side, unit.lane);
                const pos = getTargetPosition(unit.side, safeTarget);

                unit.targetKey = safeTarget;
                unit.targetX = pos.x;
                unit.targetY = pos.y;

                unit.mode = "move";
                unit.path = findPathToTarget(unit);
                unit.currentPathIndex = 0;

            } else {
                const myC = getUnitCenter(unit);
                const enemyC = getUnitCenter(unit.targetUnit);
                const dx = enemyC.x - myC.x;
                const dy = enemyC.y - myC.y;
                const dist = Math.hypot(dx, dy);

                // шаг назад ТОЛЬКО если враг сзади
                if (enemyBehindClose(unit)) {
                    const back = currentSpeed * 0.5;
                    const nx = unit.x - (dx / dist) * back * delta;
                    const ny = unit.y - (dy / dist) * back * delta;
                    const cl = clampPointToArena(nx, ny);

                    if (!isGoingBackwards(unit, cl.x, cl.y)) {
                        unit.x = smoothStep(unit.x, cl.x, 0.7);
                        unit.y = smoothStep(unit.y, cl.y, 0.7);
                    }
                    moved = true;
                }

                // движение вперёд (диагональ)
                else if (dist > unit.attackRange) {
                    const nx = unit.x + (dx / dist) * currentSpeed * delta;
                    const ny = unit.y + (dy / dist) * currentSpeed * delta;
                    const cl = clampPointToArena(nx, ny);

                    if (!isGoingBackwards(unit, cl.x, cl.y)) {
                        unit.x = smoothStep(unit.x, cl.x, 0.7);
                        unit.y = smoothStep(unit.y, cl.y, 0.7);
                    }
                    moved = true;
                }

                // атака
                else {
                    if (unit.attackCooldown <= 0) {
                        if (unit.isRanged) {
                            spawnProjectile(myC, enemyC, () => {
                                if (unit.targetUnit && !unit.targetUnit.done) {
                                    unit.targetUnit.hp -= unit.attackPower;
                                    if (unit.targetUnit.hp <= 0) unit.targetUnit.done = true;
                                }
                            });
                        } else {
                            unit.targetUnit.hp -= unit.attackPower;
                            if (unit.targetUnit.hp <= 0) unit.targetUnit.done = true;
                        }
                        unit.attackCooldown = unit.attackSpeed;
                    }
                }
            }
        }

        // =====================================================
        //                     MOVE MODE
        // =====================================================
        if (unit.mode === "move") {

            if (!unit.path) {
                unit.path = findPathToTarget(unit);
                unit.currentPathIndex = 0;
            }

            if (unit.path.length > 0) {
                const target = unit.path[unit.currentPathIndex];
                const dx = target.x - unit.x;
                const dy = target.y - unit.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 5) {
                    unit.currentPathIndex++;
                    if (unit.currentPathIndex >= unit.path.length) {
                        unit.mode = "attack";
                    }
                } else {
                    const nx = unit.x + (dx / dist) * currentSpeed * delta;
                    const ny = unit.y + (dy / dist) * currentSpeed * delta;
                    const cl = clampPointToArena(nx, ny);

                    if (!isGoingBackwards(unit, cl.x, cl.y)) {
                        unit.x = smoothStep(unit.x, cl.x, 0.7);
                        unit.y = smoothStep(unit.y, cl.y, 0.7);
                    }
                    moved = true;
                }
            } else {
                unit.mode = "attack";
            }
        }

        // =====================================================
        //                   ATTACK TOWER
        // =====================================================
        if (unit.mode === "attack") {

            if (!isTowerAlive(unit.targetKey)) {
                const nxt = resolveTargetTower(unit.side, unit.lane);
                if (!isTowerAlive(nxt)) {
                    unit.done = true;
                    unit.element.remove();
                    return false;
                }

                const pos = getTargetPosition(unit.side, nxt);
                unit.targetKey = nxt;
                unit.targetX = pos.x;
                unit.targetY = pos.y;

                unit.mode = "move";
                unit.path = findPathToTarget(unit);
                unit.currentPathIndex = 0;

            } else {
                const towerPos = state.battle.towerPositions[unit.targetKey];
                const myC = getUnitCenter(unit);

                const dx = towerPos.x - myC.x;
                const dy = towerPos.y - myC.y;
                const dist = Math.hypot(dx, dy);

                if (dist > unit.attackRange) {
                    const nx = unit.x + (dx / dist) * currentSpeed * delta;
                    const ny = unit.y + (dy / dist) * currentSpeed * delta;
                    const cl = clampPointToArena(nx, ny);

                    if (!isGoingBackwards(unit, cl.x, cl.y)) {
                        unit.x = smoothStep(unit.x, cl.x, 0.7);
                        unit.y = smoothStep(unit.y, cl.y, 0.7);
                    }
                    moved = true;

                } else {
                    if (unit.attackCooldown <= 0) {
                        damageTower(unit.targetKey, unit.attackPower, unit.side);
                        unit.attackCooldown = unit.attackSpeed;
                    }
                }
            }
        }

        // =====================================================
        //               ОБНОВЛЕНИЕ ВИЗУАЛА ЮНИТА
        // =====================================================
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

  // Player cooldowns
  Object.keys(state.battle.player.cooldowns).forEach((cardId) => {
    state.battle.player.cooldowns[cardId] = Math.max(0, state.battle.player.cooldowns[cardId] - 1);
  });

  // Enemy cooldowns
  if (!state.battle.enemy.cooldowns) {
    state.battle.enemy.cooldowns = {};
  } else {
    Object.keys(state.battle.enemy.cooldowns).forEach((cardId) => {
      state.battle.enemy.cooldowns[cardId] = Math.max(0, state.battle.enemy.cooldowns[cardId] - 1);
    });
  }
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
