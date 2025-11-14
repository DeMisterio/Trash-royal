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

const fallbackEmoji = builtInCharacters.reduce((acc, card) => {
  acc[card.id] = card.emoji;
  return acc;
}, {}); 
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

const BUILT_IN_NORMALIZED = builtInCharacters.map((card) => normalizeCharacter(card));
const DECK_STORAGE_KEY = 'clashRoyaleDeck';
const NPC_NAMES = [
  'ShadowSlayer', 'ArcticWolf', 'CrimsonNova', 'NightHarbor', 'LavaKnight', 'FrostByte', 'StormCaller', 'IronHawk',
  'LoneRider', 'SilentNova', 'ToxicVortex', 'GoldenArrow', 'NebulaNine', 'MysticFlame', 'EmeraldGiant', 'VoidStriker',
  'CrimsonRider', 'SolarWarden', 'ArcaneBolt', 'ThunderBloom', 'ObsidianRogue', 'SilverMyst', 'PhotonDrake', 'TidalShock'
];
const shuffleArray = (arr) => arr
  .map((value) => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value);

function createCharacterMap(cards) {
  return cards.reduce((acc, card) => {
    acc[card.id] = card;
    return acc;
  }, {});
}
function loadCollectionFromStorage() {
  try {
    const raw = localStorage.getItem("userCollection");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (err) {
    console.warn("Failed to load stored user collection:", err.message);
    return null;
  }
}
function seedCollection(cards) {
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

function loadDeckFromStorage() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DECK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (err) {
    console.warn('Failed to load stored deck:', err.message);
    return null;
  }
}

function saveDeckToStorage(deck) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(deck));
  } catch (err) {
    console.warn('Failed to persist deck:', err.message);
  }
}
function ensureDeck(cards, preferred = []) {
  const available = cards.map((card) => card.id);
  if (!available.length) return [];
  const unique = [];
  const seen = new Set();

  preferred.forEach((id) => {
    if (available.includes(id) && !seen.has(id) && unique.length < Math.min(MAX_DECK_SIZE, available.length)) {
      unique.push(id);
      seen.add(id);
    }
  });

  for (const id of available) {
    if (unique.length >= Math.min(MAX_DECK_SIZE, available.length)) break;
    if (!seen.has(id)) {
      unique.push(id);
      seen.add(id);
    }
  }

  return unique;
}

const rarityPillMap = { common: 'green', rare: 'gold', epic: 'purple', legendary: 'purple' };
const towerDefaults = { princess: 2534, king: 4200 };
const towerConfig = { princess: { range: 6.5, damage: 110, speed: 1.0 }, king: { range: 7, damage: 240, speed: 1.2 } };
const battlePhases = [
  { name: 'normal', duration: 120, regen: 2.8, icon: 'x1', message: 'Battle start!' },
  { name: 'double', duration: 60, regen: 1.4, icon: 'x2', message: 'Double Elixir!' },
  { name: 'overtime', duration: 60, regen: 0.9, icon: 'OT', message: 'Overtime!' }
];
const MAX_DECK_SIZE = 8;
const CARD_COOLDOWN = 4;
const SOUND_FILES = { menu: 'Sounds/menu.mp3', battle: 'Sounds/battle.mp3' };

const storedDeck = loadDeckFromStorage();

const state = {
  profile: { name: 'Den Player', level: 12, trophies: 4280, nextArena: 'Arena 13' },
  currencies: { gold: 56200, gems: 615 },
  chestSlots: [
    { id: 'slot-1', type: 'Golden Chest', rarity: 'rare', duration: 14400, remaining: 14400, status: 'locked' },
    { id: 'slot-2', type: 'Silver Chest', rarity: 'common', duration: 7200, remaining: 0, status: 'ready' },
    { id: 'slot-3', type: 'Magical Chest', rarity: 'epic', duration: 28800, remaining: 28800, status: 'locked' },
    { id: 'slot-4', type: 'Legendary Chest', rarity: 'legendary', duration: 43200, remaining: 43200, status: 'locked' }
  ],
  deck: storedDeck && storedDeck.length ? storedDeck : ['knight', 'archers', 'baby-dragon', 'giant', 'musketeer', 'fireball', 'minions', 'hog-rider'],
  collection: loadCollectionFromStorage() || seedCollection(BUILT_IN_NORMALIZED),
  shopOffers: [
    { id: 'free-gift', name: 'Free Gift', description: 'Claim a small chest on us!', costType: 'free', claimed: false },
    { id: 'card-knight', name: '20x Knight', description: 'Bundle offer', costType: 'gold', cost: 400 },
    { id: 'card-archers', name: '40x Archers', description: 'Daily deal', costType: 'gold', cost: 800 },
    { id: 'pile-gems', name: 'Stack of Gems', description: '+250 gems', costType: 'gems', cost: 500 }
  ],
  clan: {
    name: 'Code Crushers',
    desc: 'Friendly clan focused on learning builds.',
    score: 24450,
    chat: [
      { author: 'Leader', text: 'Welcome to battle training!', type: 'message', timestamp: new Date() },
      { author: 'FrostByte', text: 'Need Hog donations please!', type: 'request', card: 'hog-rider', needed: 10, received: 2, timestamp: new Date(Date.now() - 1000 * 60 * 15) }
    ],
    requestCooldown: 0
  },
  events: [
    { id: 'triple', name: 'Triple Elixir Frenzy', desc: 'Fast cycle challenge with triple elixir.', timeLeft: 3600, reward: 'Exclusive banner' },
    { id: 'draft', name: 'Classic Draft', desc: 'Pick cards on the fly, adapt to surprises.', timeLeft: 7200, reward: '1000 Gold + Trade Token' }
  ],
  characters: createCharacterMap(BUILT_IN_NORMALIZED),
  battle: null,
  muted: false,
  sounds: { menu: null, battle: null },
  dataLoaded: false,
  manifestVersion: null,
  ui: { focusedCard: null }
};

let characterSyncPromise = null;

const elements = {
  playerName: document.getElementById('playerName'),
  playerLevel: document.getElementById('playerLevel'),
  trophyCount: document.getElementById('trophyCount'),
  trophyProgress: document.getElementById('trophyProgress'),
  nextArena: document.getElementById('nextArena'),
  goldCount: document.getElementById('goldCount'),
  gemCount: document.getElementById('gemCount'),
  chestGrid: document.getElementById('chestGrid'),
  deckList: document.getElementById('deckList'),
  collectionGrid: document.getElementById('collectionGrid'),
  avgElixir: document.getElementById('avgElixir'),
  shopOffers: document.getElementById('shopOffers'),
  clanName: document.getElementById('clanName'),
  clanDesc: document.getElementById('clanDesc'),
  clanScore: document.getElementById('clanScore'),
  clanChat: document.getElementById('clanChat'),
  requestCooldown: document.getElementById('requestCooldown'),
  eventsList: document.getElementById('eventsList'),
  characterData: document.getElementById('characterData'),
  updatePanel: document.getElementById('updatePanel'),
  updateTitle: document.getElementById('updateTitle'),
  updateDate: document.getElementById('updateDate'),
  updateSummary: document.getElementById('updateSummary'),
  updateHighlights: document.getElementById('updateHighlights'),
  battleModal: document.getElementById('battleModal'),
  battleTimer: document.getElementById('battleTimer'),
  timerValue: document.getElementById('timerValue'),
  timerPhaseIcon: document.getElementById('timerPhaseIcon'),
  phaseBanner: document.getElementById('phaseBanner'),
  battleStatus: document.getElementById('battleStatus'),
  battleHand: document.getElementById('battleHand'),
  nextCard: document.getElementById('nextCard'),
  elixirFill: document.getElementById('elixirFill'),
  elixirCount: document.getElementById('elixirCount'),
  elixirBar: document.getElementById('elixirBar'),
  playerCrowns: document.getElementById('playerCrowns'),
  enemyCrowns: document.getElementById('enemyCrowns'),
  arenaField: document.getElementById('arenaField'),
  battleResult: document.getElementById('battleResult'),
  emotePanel: document.getElementById('emotePanel'),
  requestCardsButton: document.getElementById('requestCardsButton'),
  pocketLeft: document.getElementById('pocketLeft'),
  pocketRight: document.getElementById('pocketRight'),
  projectileLayer: document.getElementById('projectileLayer'),
  spellRadius: document.getElementById('spellRadius'),
  cardDragGhost: document.getElementById('cardDragGhost'),
  cardModal: document.getElementById('cardModal'),
  cardModalTitle: document.getElementById('cardModalTitle'),
  cardModalArt: document.getElementById('cardModalArt'),
  cardModalRarity: document.getElementById('cardModalRarity'),
  cardModalDesc: document.getElementById('cardModalDesc'),
  cardModalStats: document.getElementById('cardModalStats'),
  cardUpgradeButton: document.getElementById('cardUpgradeButton'),
  cardUseButton: document.getElementById('cardUseButton'),
  cardUpgradeHint: document.getElementById('cardUpgradeHint'),
  closeCardModal: document.getElementById('closeCardModal'),
  leaveBattle: document.getElementById('leaveBattle'),
  muteToggle: document.getElementById('muteToggle'),
  battleTimerIcon: document.getElementById('timerPhaseIcon'),
  enemyName: document.getElementById('enemyName')
};

const towerElements = {};
const towerBars = {};
document.querySelectorAll('.tower').forEach((node) => {
  towerElements[`${node.dataset.side}-${node.dataset.slot}`] = node;
});
document.querySelectorAll('[data-tower]').forEach((node) => {
  towerBars[node.dataset.tower] = node;
});

const formatTime = (seconds) => {
  const m = Math.floor(Math.max(seconds, 0) / 60).toString().padStart(1, '0');
  const s = Math.floor(Math.max(seconds, 0) % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const randomBetween = (min, max) => Math.random() * (max - min) + min;
const getCardArtMarkup = (card) =>
  card.sprite ? `<img src="${card.sprite}" alt="${card.name} card art">` : `<span class="emoji-art">${card.emoji}</span>`;
const getUnitMarkup = (card) =>
  card.sprite ? `<img src="${card.sprite}" alt="${card.name} unit">` : card.emoji;
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

const LOCAL_CARD_PREFIX = 'generated-card-';

function ensureGeneratedCacheLoaded() {
  if (window.__generatedCardData || typeof localStorage === 'undefined') return;
  const cache = {};
  Object.keys(localStorage)
    .filter((key) => key.startsWith(LOCAL_CARD_PREFIX))
    .forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data?.id) cache[data.id] = data;
      } catch (err) {
        console.warn('Failed to restore cached card', key, err.message);
      }
    });
  window.__generatedCardData = cache;
}

function loadGeneratedCardFromStorage(id) {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${LOCAL_CARD_PREFIX}${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Failed to read cached card', id, err.message);
    return null;
  }
}

async function loadManifest() {
  if (window.__characterManifest) return window.__characterManifest;
  try {
    const resp = await fetch('Characters/characters-manifest.json', { cache: 'no-store' });
    if (resp.ok) {
      const manifest = await resp.json();
      if (Array.isArray(manifest.images)) {
        const imageIds = manifest.images
          .map((entry) => {
            if (typeof entry === 'string') return entry;
            return entry?.base || entry?.id || entry?.name;
          })
          .filter(Boolean);
        const combined = new Set([...(manifest.characters || []), ...imageIds]);
        manifest.characters = Array.from(combined);
      }
      window.__characterManifest = manifest;
      return manifest;
    }
  } catch (err) {
    console.warn('Unable to fetch character manifest.', err.message);
  }
  return { version: Date.now(), characters: [] };
}

async function fetchCharacterDefinition(id) {
  try {
    const resp = await fetch(`Characters/${id}.json?cacheBust=${Date.now()}`);
    if (!resp.ok) throw new Error(`Missing JSON for ${id}`);
    return await resp.json();
  } catch (err) {
    console.warn('Missing card file for', id, err.message);
    const generated = window.__generatedCardData?.[id] || loadGeneratedCardFromStorage(id);
    if (generated) return generated;
    return null;
  }
}

async function bootstrapCharacters() {
  ensureGeneratedCacheLoaded();
  const sanitizeId = (id) => (id || '').replace(/\\/g, '/').split('/').filter(Boolean).pop() || id;
  const assignFromList = (cards) => {
    state.characters = createCharacterMap(cards);
    state.collection = seedCollection(cards);
    const savedDeck = loadDeckFromStorage();
    const preferredDeck = savedDeck && savedDeck.length ? savedDeck : state.deck || [];
    state.deck = ensureDeck(cards, preferredDeck);
    saveDeckToStorage(state.deck);
  };

  try {
    const manifest = await loadManifest();
    const manifestVersion = manifest?.version || Date.now();
    const generatedIds = Object.keys(window.__generatedCardData || {});
    const manifestIds = Array.from(
      new Set([...(manifest.characters || []), ...generatedIds].map(sanitizeId))
    );
    const loaded = [];
    for (const rawId of manifestIds) {
      const id = sanitizeId(rawId);
      const data = await fetchCharacterDefinition(id);
      if (data) {
        loaded.push(normalizeCharacter({ ...data, id }));
      }
    }
    if (!loaded.length) throw new Error('No character data files readable');
    assignFromList(loaded);
    state.manifestVersion = manifestVersion;
  } catch (err) {
    console.warn('Falling back to built-in characters:', err.message);
    assignFromList(BUILT_IN_NORMALIZED);
    state.manifestVersion = state.manifestVersion || Date.now();
  }
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

function renderProfile() {
  elements.playerName.textContent = state.profile.name;
  elements.playerLevel.textContent = `Level ${state.profile.level}`;
  elements.trophyCount.textContent = state.profile.trophies.toLocaleString();
  elements.nextArena.textContent = state.profile.nextArena;
  const progress = Math.min((state.profile.trophies % 6000) / 60, 100);
  elements.trophyProgress.style.width = `${progress}%`;
  elements.goldCount.textContent = state.currencies.gold.toLocaleString();
  elements.gemCount.textContent = state.currencies.gems.toLocaleString();
}

function renderChests() {
  elements.chestGrid.innerHTML = '';
  state.chestSlots.forEach((slot) => {
    const card = document.createElement('div');
    card.className = `chest-card rarity-${slot.rarity}`;
    const timerText = slot.status === 'ready' ? 'Ready to open!' : formatTime(slot.remaining);
    card.innerHTML = `
      <div class="chest-type">${slot.type}</div>
      <div class="muted">${slot.rarity.toUpperCase()}</div>
      <div class="timer">${timerText}</div>
      <div class="chest-actions">
        ${slot.status === 'locked' ? `<button class="button green" data-chest="${slot.id}" data-action="unlock">Start</button>` : ''}
        ${slot.status === 'unlocking' ? '<button class="button ghost" disabled>Opening…</button>' : ''}
        ${slot.status === 'ready' ? `<button class="button gold" data-chest="${slot.id}" data-action="open">Open</button>` : ''}
        <button class="button ghost" data-chest="${slot.id}" data-action="speed">💎</button>
      </div>
    `;
    elements.chestGrid.appendChild(card);
  });
}

function handleChestAction(id, action) {
  const chest = state.chestSlots.find((c) => c.id === id);
  if (!chest) return;
  if (action === 'unlock' && chest.status === 'locked') {
    if (state.chestSlots.some((c) => c.status === 'unlocking')) {
      alert('Only one chest can unlock at a time.');
      return;
    }
    chest.status = 'unlocking';
    chest.remaining = chest.duration;
  } else if (action === 'speed' && chest.status !== 'ready') {
    const gemCost = Math.max(1, Math.round(chest.remaining / 600));
    if (state.currencies.gems >= gemCost) {
      state.currencies.gems -= gemCost;
      chest.remaining = 0;
      chest.status = 'ready';
    }
  } else if (action === 'open' && chest.status === 'ready') {
    chest.status = 'empty';
    chest.type = 'Empty Slot';
    state.currencies.gold += 500;
    alert('Chest opened! +500 gold');
  }
  renderProfile();
  renderChests();
}

function renderDeck() {
  elements.deckList.innerHTML = '';
  const slots = Array.from({ length: MAX_DECK_SIZE }, (_, slot) => state.deck[slot] ?? null);
  slots.forEach((cardId, slot) => {
    const card = state.characters[cardId];
    const tile = document.createElement('div');
    tile.dataset.slot = slot;
    if (!card) {
      tile.className = 'card-tile empty-slot';
      tile.innerHTML = `
        <div class="card-name">Empty Slot</div>
        <small class="muted">Select a card then tap here</small>
      `;
    } else {
      tile.className = `card-tile rarity-${card.rarity}`;
      tile.dataset.card = cardId;
      tile.innerHTML = `
        <button class="card-info-btn" data-card="${card.id}" aria-label="Inspect ${card.name}">ℹ️</button>
        <div class="card-cost">${card.elixir}</div>
        <div class="card-art">${getCardArtMarkup(card)}</div>
        <div class="card-name">${card.name}</div>
        <small class="muted">Lvl ${state.collection[card.id]?.level ?? 1}</small>
      `;
    }
    elements.deckList.appendChild(tile);
  });
  const activeCards = slots.filter((id) => state.characters[id]);
  const avg = activeCards.length
    ? activeCards.reduce((sum, id) => sum + (state.characters[id]?.elixir || 0), 0) / activeCards.length
    : 0;
  elements.avgElixir.textContent = activeCards.length ? avg.toFixed(1) : '--';
}

function renderCollection() {
  elements.collectionGrid.innerHTML = '';
  const cards = Object.values(state.characters).sort((a, b) => a.name.localeCompare(b.name));
  cards.forEach((card) => {
    const owned = state.collection[card.id]?.unlocked;
    const div = document.createElement('div');
    div.className = `card-tile rarity-${card.rarity} collection-card ${owned ? '' : 'locked'}`;
    div.dataset.card = card.id;
    div.innerHTML = `
      <button class="card-info-btn" data-card="${card.id}" aria-label="Inspect ${card.name}">ℹ️</button>
      <div class="card-cost">${card.elixir}</div>
      <div class="card-art">${getCardArtMarkup(card)}</div>
      <div class="card-name">${card.name}</div>
      <small class="muted">${owned ? `Lvl ${state.collection[card.id].level}` : 'Locked'}</small>
    `;
    elements.collectionGrid.appendChild(div);
  });
  try {
    localStorage.setItem("userCollection", JSON.stringify(state.collection));
  } catch (err) {
    console.warn("Failed to save user collection:", err.message);
  }
}

function renderShop() {
  elements.shopOffers.innerHTML = '';
  state.shopOffers.forEach((offer) => {
    const card = document.createElement('div');
    card.className = 'offer-card';
    const costLabel = offer.costType === 'free' ? 'Free' : `${offer.cost} ${offer.costType}`;
    card.innerHTML = `
      <div>
        <h3>${offer.name}</h3>
        <p>${offer.description}</p>
      </div>
      <button class="button ${offer.costType === 'free' ? 'green' : 'gold'}" data-offer="${offer.id}" ${offer.claimed ? 'disabled' : ''}>
        ${offer.claimed ? 'Claimed' : costLabel}
      </button>
    `;
    elements.shopOffers.appendChild(card);
  });
}

function renderClan() {
  elements.clanName.textContent = state.clan.name;
  elements.clanDesc.textContent = state.clan.desc;
  elements.clanScore.textContent = `${state.clan.score.toLocaleString()} pts`;
  elements.requestCooldown.textContent = state.clan.requestCooldown > 0 ? `Request again in ${formatTime(state.clan.requestCooldown)}` : '';
  elements.requestCardsButton.disabled = state.clan.requestCooldown > 0;
  elements.clanChat.innerHTML = '';
  state.clan.chat.forEach((entry) => {
    const tpl = document.getElementById('chatEntryTemplate').content.cloneNode(true);
    tpl.querySelector('.chat-meta').textContent = `${entry.author} • ${entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    tpl.querySelector('.chat-text').textContent = entry.text;
    const actions = tpl.querySelector('.chat-actions');
    if (entry.type === 'request') {
      actions.innerHTML = `
        <span class="muted">${entry.received}/${entry.needed} donated</span>
        <button class="button green" data-donate="${entry.card}">Donate</button>
      `;
    }
    elements.clanChat.appendChild(tpl);
  });
}

async function loadStatusPanel() {
  if (!elements.updatePanel) return;
  try {
    const resp = await fetch(`status.json?cacheBust=${Date.now()}`);
    if (!resp.ok) throw new Error('Missing status file');
    const data = await resp.json();
    elements.updateTitle.textContent = data.title || 'Latest Update';
    elements.updateDate.textContent = data.date ? new Date(data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    elements.updateSummary.textContent = data.summary || data.paragraph || 'Fresh changes just landed.';
    const list = Array.isArray(data.highlights) ? data.highlights : [];
    if (list.length) {
      elements.updateHighlights.innerHTML = list.map((item) => `<li>${item}</li>`).join('');
    } else {
      elements.updateHighlights.innerHTML = '';
    }
  } catch (err) {
    elements.updateTitle.textContent = 'Update Notes';
    elements.updateDate.textContent = '';
    elements.updateSummary.textContent = 'Unable to load update information right now.';
    if (elements.updateHighlights) elements.updateHighlights.innerHTML = '';
    console.warn('Status panel load failed:', err.message);
  }
}

function renderEvents() {
  elements.eventsList.innerHTML = '';
  state.events.forEach((event) => {
    const div = document.createElement('div');
    div.className = 'event-card';
    div.innerHTML = `
      <strong>${event.name}</strong>
      <p>${event.desc}</p>
      <div class="flex" style="justify-content: space-between;">
        <span class="muted">Ends in ${formatTime(event.timeLeft)}</span>
        <button class="button gold" data-event="${event.id}">Enter</button>
      </div>
      <small class="muted">Reward: ${event.reward}</small>
    `;
    elements.eventsList.appendChild(div);
  });
}

function renderCharacterData() {
  elements.characterData.innerHTML = '';
  Object.values(state.characters).forEach((card) => {
    const block = document.createElement('div');
    block.style.marginBottom = '0.65rem';
    block.innerHTML = `
      <strong>${card.name}</strong> <span class="pill ${rarityPillMap[card.rarity] || 'purple'}">${card.rarity}</span>
      <div class="muted">${card.description}</div>
      <small class="muted">Cost ${card.elixir} • Atk ${card.attackPower} • HP ${card.health} • Speed ${card.speed}</small>
    `;
    elements.characterData.appendChild(block);
  });
}

function getTroopCards() {
  return Object.values(state.characters).filter((card) => card.type !== 'spell');
}

function requestCards() {
  const unlocked = Object.keys(state.collection);
  if (!unlocked.length) return;
  const cardId = unlocked[Math.floor(Math.random() * unlocked.length)];
  state.clan.chat.unshift({
    author: state.profile.name,
    text: `Requesting ${state.characters[cardId].name}!`,
    type: 'request',
    card: cardId,
    needed: 20,
    received: 0,
    timestamp: new Date()
  });
  state.clan.requestCooldown = 30;
  renderClan();
}

function handleDonate(cardId) {
  const donationCost = 10;
  if ((state.collection[cardId]?.copies || 0) >= donationCost) {
    state.collection[cardId].copies -= donationCost;
    state.currencies.gold += 50;
    renderProfile();
  }
}

function handleShopPurchase(id) {
  const offer = state.shopOffers.find((o) => o.id === id);
  if (!offer || offer.claimed) return;
  if (offer.costType === 'free') {
    state.currencies.gold += 200;
  } else if (offer.costType === 'gold' && state.currencies.gold >= offer.cost) {
    state.currencies.gold -= offer.cost;
  } else if (offer.costType === 'gems' && state.currencies.gems >= offer.cost) {
    state.currencies.gems -= offer.cost;
  } else {
    alert('Not enough currency');
    return;
  }
  offer.claimed = true;
  renderProfile();
  renderShop();
}

function openCardModal(cardId) {
  const card = state.characters[cardId];
  if (!card) return;
  state.ui.focusedCard = cardId;
  elements.cardModalTitle.textContent = card.name;
  if (elements.cardModalArt) {
    elements.cardModalArt.innerHTML = getCardArtMarkup(card);
  }
  elements.cardModalRarity.textContent = card.rarity.toUpperCase();
  elements.cardModalRarity.className = `pill ${rarityPillMap[card.rarity] || 'purple'}`;
  elements.cardModalDesc.textContent = card.description;
  elements.cardModalStats.innerHTML = `
    <span>Elixir: ${card.elixir}</span>
    <span>Speed: ${card.speed}</span>
    <span>Attack: ${card.attackPower}</span>
    <span>Range: ${card.attackRange}</span>
  `;
  const upgradeCost = getUpgradeCost(cardId);
  const owned = state.collection[cardId];
  const canUpgrade = owned && state.currencies.gold >= upgradeCost.gold && owned.copies >= upgradeCost.cards;
  elements.cardUpgradeButton.disabled = !canUpgrade;
  elements.cardUpgradeButton.textContent = canUpgrade ? `Upgrade (${upgradeCost.gold}💰)` : 'Upgrade';
  const inDeck = state.deck.includes(cardId);
  elements.cardUseButton.textContent = inDeck ? 'Unuse' : 'Use';
  elements.cardUseButton.dataset.mode = inDeck ? 'unuse' : 'use';
  elements.cardUseButton.disabled = inDeck ? false : !owned?.unlocked;
  elements.cardUpgradeHint.textContent = owned ? `Level ${owned.level} • ${owned.copies} copies` : 'Unlock this card to upgrade.';
  elements.cardModal.classList.remove('hidden');
}

function closeCardModal() {
  elements.cardModal.classList.add('hidden');
  state.ui.focusedCard = null;
}

function getUpgradeCost(cardId) {
  const card = state.characters[cardId];
  const owned = state.collection[cardId];
  if (!card || !owned) return { gold: Infinity, cards: Infinity };
  const base = { common: 50, rare: 150, epic: 400, legendary: 800 }[card.rarity] || 200;
  const multiplier = owned.level;
  return {
    gold: base * multiplier,
    cards: Math.max(1, Math.ceil(multiplier / 1.5)) * (card.rarity === 'common' ? 2 : 1)
  };
}

function upgradeCard(cardId) {
  const card = state.characters[cardId];
  const owned = state.collection[cardId];
  if (!card || !owned) return;
  const cost = getUpgradeCost(cardId);
  if (state.currencies.gold < cost.gold || owned.copies < cost.cards) return;
  state.currencies.gold -= cost.gold;
  owned.copies -= cost.cards;
  owned.level += 1;
  renderProfile();
  renderDeck();
  renderCollection();
  openCardModal(cardId);
}

function useCardFromModal(cardId) {
  const deckIndex = state.deck.findIndex((id) => id === cardId);
  if (deckIndex > -1) {
    state.deck[deckIndex] = null;
    closeCardModal();
    renderDeck();
    saveDeckToStorage(state.deck);
    return;
  }
  closeCardModal();
  document.querySelectorAll('.collection-grid .card-tile').forEach((tile) => {
    tile.classList.toggle('selected', tile.dataset.card === cardId);
  });
}

async function ensureCardsUpToDate() {
  if (typeof window.requestCharacterGeneration !== 'function') return;
  await window.requestCharacterGeneration();
  const latestVersion = window.__characterManifest?.version;
  if (latestVersion && latestVersion !== state.manifestVersion) {
    if (!characterSyncPromise) {
      characterSyncPromise = (async () => {
        await bootstrapCharacters();
        renderDeck();
        renderCollection();
        renderCharacterData();
        characterSyncPromise = null;
      })();
    }
    await characterSyncPromise;
  }
}

function setActiveTab(tabName) {
  document.querySelectorAll('.tab').forEach((section) => {
    section.classList.toggle('active', section.dataset.tab === tabName);
  });
  document.querySelectorAll('.nav-button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tabTarget === tabName);
  });
  if (tabName === 'cards') {
    ensureCardsUpToDate();
    renderDeck();
    renderCollection();
  }
}

const regulationDuration = battlePhases.filter((p) => p.name !== 'overtime').reduce((sum, phase) => sum + phase.duration, 0);

function createBattleState(opponentProfile, deckCards = state.deck.filter((id) => state.characters[id])) {
  const field = elements.arenaField.getBoundingClientRect();
  const towers = {
    'friendly-left': { side: 'friendly', lane: 'left', type: 'princess', hp: towerDefaults.princess, max: towerDefaults.princess },
    'friendly-right': { side: 'friendly', lane: 'right', type: 'princess', hp: towerDefaults.princess, max: towerDefaults.princess },
    'friendly-king': { side: 'friendly', lane: 'middle', type: 'king', hp: towerDefaults.king, max: towerDefaults.king, active: true },
    'enemy-left': { side: 'enemy', lane: 'left', type: 'princess', hp: towerDefaults.princess, max: towerDefaults.princess },
    'enemy-right': { side: 'enemy', lane: 'right', type: 'princess', hp: towerDefaults.princess, max: towerDefaults.princess },
    'enemy-king': { side: 'enemy', lane: 'middle', type: 'king', hp: towerDefaults.king, max: towerDefaults.king, active: false }
  };
  const positions = {};
  Object.keys(towerElements).forEach((key) => {
    const rect = towerElements[key].getBoundingClientRect();
    positions[key] = {
      x: rect.left - field.left + rect.width / 2,
      y: rect.top - field.top + rect.height / 2
    };
  });
  return {
    globalTime: regulationDuration,
    phaseIndex: 0,
    phaseTimeLeft: battlePhases[0].duration,
    player: { elixir: 5, regenTimer: 0, cooldowns: {} },
    enemy: { elixir: 5, regenTimer: 0, nextPlay: 3 },
    crowns: { player: 0, enemy: 0 },
    towers,
    towerPositions: positions,
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
    elements.battleStatus.textContent = 'Select at least 4 unique cards in your deck before battling.';
    return;
  }
  const opponentProfile = pickOpponentProfile();
  state.battle = createBattleState(opponentProfile, playableDeck);
  elements.battleResult.textContent = '';
  elements.battleResult.classList.remove('show');
  elements.arenaField.classList.remove('card-ready', 'overtime-warning', 'spell-ready');
  elements.battleModal.classList.remove('hidden');
  elements.projectileLayer.innerHTML = '';
  if (elements.enemyName) {
    elements.enemyName.textContent = opponentProfile?.name || 'Opponent';
  }
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
  if (state.battle.phase === 'overtime') {
    elements.arenaField.classList.add('overtime-warning');
  }
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
  const currentPhase = battlePhases[state.battle.phaseIndex] || battlePhases[0];
  const regenRate = currentPhase.regen || 1;
  ['player', 'enemy'].forEach((side) => {
    const bar = state.battle[side];
    bar.regenTimer = (bar.regenTimer || 0) + delta;
    while (bar.regenTimer >= regenRate) {
      bar.regenTimer -= regenRate;
      bar.elixir = Math.min(10, (bar.elixir || 0) + 1);
    }
  });
}

function updateEnemyAI(delta) {
  if (!state.battle) return;
  state.battle.enemy.nextPlay -= delta;
  if (state.battle.enemy.nextPlay <= 0) {
    const deckIds = (state.battle.opponent?.deckIds || getAvailableCardIds());
    let troopPool = deckIds
      .map((id) => state.characters[id])
      .filter((card) => card && card.type !== 'spell');
    if (!troopPool.length) troopPool = getTroopCards();
    troopPool = troopPool.filter((card) => card.elixir <= state.battle.enemy.elixir);
    if (troopPool.length) {
      const card = troopPool[Math.floor(Math.random() * troopPool.length)];
      state.battle.enemy.elixir -= card.elixir;
      spawnEnemyUnit(card);
    }
    state.battle.enemy.nextPlay = randomBetween(3, 6);
  }
}

function renderBattleHUD() {
  if (!state.battle) return;
  const phase = battlePhases[state.battle.phaseIndex];
  const displayTime = phase.name === 'overtime' ? state.battle.phaseTimeLeft : state.battle.globalTime;
  elements.timerValue.textContent = formatTime(displayTime);
  elements.timerPhaseIcon.textContent = phase.icon;
  elements.battleTimer.classList.toggle('double', phase.name === 'double');
  elements.battleTimer.classList.toggle('overtime', phase.name === 'overtime');
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
  elements.elixirBar.classList.toggle('glow', elixir >= 10);
  elements.elixirBar.classList.toggle('double', battlePhases[state.battle.phaseIndex].name !== 'normal');
  elements.elixirBar.classList.toggle('full', elixir >= 10);
}

function renderBattleHand() {
  elements.battleHand.innerHTML = '';
  state.battle.hand.forEach((cardId) => {
    const card = state.characters[cardId];
    if (!card) return;
    const div = document.createElement('div');
    div.className = 'battle-card';
    div.dataset.card = cardId;
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
  if (friendly) return { allowed: true, lane };
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
  const width = elements.arenaField.clientWidth;
  const lane = ['left', 'middle', 'right'][Math.floor(Math.random() * 3)];
  const x = lane === 'left' ? width * 0.2 : lane === 'right' ? width * 0.75 : width * 0.5;
  spawnUnit(card, 'enemy', { x, y: 40, lane });
}

function spawnUnit(card, side, position) {
  for (let i = 0; i < (card.spawnCount || 1); i += 1) {
    const unit = createUnit(card, side, position.lane, position.x, position.y);
    state.battle.units.push(unit);
    elements.arenaField.appendChild(unit.element);
    showSummonFx(unit.x, unit.y);
  }
}

function createUnit(card, side, lane, x, y) {
  const fieldWidth = elements.arenaField.clientWidth;
  const adjustedX = Math.min(Math.max(x - 12, 0), fieldWidth - 24);
  const adjustedY = y - 12;
  const targetKey = resolveTargetTower(side, lane);
  const element = document.createElement('div');
  element.className = `unit ${side}`;
  element.innerHTML = getUnitMarkup(card);
  element.style.left = `${adjustedX}px`;
  element.style.top = `${adjustedY}px`;
  return {
    card,
    side,
    lane,
    element,
    x: adjustedX,
    y: adjustedY,
    speed: Math.max(40, card.speed || 50) * (side === 'friendly' ? 1 : 0.9),
    attackRange: card.attackRange || 1,
    attackPower: card.attackPower || 0,
    attackCooldown: 0,
    hp: card.health || 0,
    targetKey,
    targetY: getTargetY(side, targetKey),
    mode: 'move',
    done: false
  };
}

function resolveTargetTower(side, lane) {
  const prefix = side === 'friendly' ? 'enemy' : 'friendly';
  const ordered = lane === 'middle' ? [`${prefix}-king`, `${prefix}-left`, `${prefix}-right`] : [`${prefix}-${lane}`, `${prefix}-king`];
  return ordered.find((key) => state.battle.towers[key].hp > 0) || `${prefix}-king`;
}

function getTargetY(side, targetKey) {
  const fieldHeight = elements.arenaField.clientHeight;
  const margin = targetKey.includes('king') ? 60 : 90;
  return side === 'friendly' ? margin : fieldHeight - margin;
}

function updateUnits(delta) {
  state.battle.units = state.battle.units.filter((unit) => {
    if (unit.done) {
      unit.element.remove();
      return false;
    }
    if (unit.attackCooldown > 0) unit.attackCooldown -= delta;
    if (unit.mode === 'move') {
      const direction = unit.side === 'friendly' ? -1 : 1;
      unit.y += direction * unit.speed * delta;
      unit.element.style.top = `${unit.y}px`;
      if ((unit.side === 'friendly' && unit.y <= unit.targetY) || (unit.side === 'enemy' && unit.y >= unit.targetY)) {
        unit.mode = 'attack';
      }
    } else if (unit.mode === 'attack') {
      if (!isTowerAlive(unit.targetKey)) {
        const newTarget = resolveTargetTower(unit.side, unit.lane);
        if (!isTowerAlive(newTarget)) {
          unit.done = true;
          unit.element.remove();
          return false;
        }
        unit.targetKey = newTarget;
        unit.targetY = getTargetY(unit.side, unit.targetKey);
        unit.mode = 'move';
        return true;
      }
      if (unit.attackCooldown <= 0) {
        damageTower(unit.targetKey, unit.attackPower, unit.side);
        unit.attackCooldown = unit.card.attackSpeed || 1;
      }
    }
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

function showSummonFx(x, y) {
  const fx = document.createElement('div');
  fx.className = 'summon-fx';
  fx.style.left = `${x}px`;
  fx.style.top = `${y}px`;
  elements.arenaField.appendChild(fx);
  setTimeout(() => fx.remove(), 400);
}

function updateProjectiles(delta) {
  if (!state.battle.projectiles.length) return;
  state.battle.projectiles = state.battle.projectiles.filter((proj) => {
    proj.elapsed += delta;
    const progress = proj.elapsed / proj.duration;
    if (progress >= 1) {
      proj.element.remove();
      if (proj.onImpact) proj.onImpact();
      return false;
    }
    const x = proj.start.x + (proj.end.x - proj.start.x) * progress;
    const y = proj.start.y + (proj.end.y - proj.start.y) * progress;
    proj.element.style.transform = `translate(${x}px, ${y}px)`;
    return true;
  });
}

function spawnProjectile(start, end, onImpact) {
  const element = document.createElement('div');
  element.className = 'projectile';
  element.style.transform = `translate(${start.x}px, ${start.y}px)`;
  elements.projectileLayer.appendChild(element);
  state.battle.projectiles.push({ element, start, end, duration: 0.5, elapsed: 0, onImpact });
}

function updateTowers(delta) {
  Object.entries(state.battle.towers).forEach(([key, tower]) => {
    if (tower.hp <= 0) return;
    const config = towerConfig[tower.type];
    tower.cooldown = (tower.cooldown || 0) - delta;
    if (tower.cooldown > 0) return;
    const target = findUnitTarget(tower.side === 'friendly' ? 'enemy' : 'friendly', config.range, key);
    if (target) {
      tower.cooldown = config.speed;
      spawnProjectile(
        state.battle.towerPositions[key],
        { x: target.x, y: target.y },
        () => damageUnit(target, config.damage)
      );
      if (tower.type === 'king' && !tower.active) {
        tower.active = true;
        towerElements[key]?.classList.add('activated');
      }
    }
  });
}

function findUnitTarget(side, range, towerKey) {
  const origin = state.battle.towerPositions[towerKey];
  if (!origin) return null;
  const units = state.battle.units
    .filter((unit) => unit.side === side && !unit.done)
    .map((unit) => {
      const dist = Math.hypot(unit.x - origin.x, unit.y - origin.y);
      return { unit, dist };
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
    const bar = towerBars[key];
    if (bar) {
      bar.style.width = `${(tower.hp / tower.max) * 100}%`;
    }
    const node = towerElements[key];
    if (node) {
      node.classList.toggle('destroyed', tower.hp <= 0);
      node.classList.toggle('activated', tower.type === 'king' && tower.active);
    }
  });
}

function handleTowerDestroyed(key, attackerSide) {
  const isEnemy = key.startsWith('enemy');
  if (isEnemy) {
    state.battle.crowns.player += key.includes('king') ? 3 : 1;
  } else {
    state.battle.crowns.enemy += key.includes('king') ? 3 : 1;
  }
  if (isEnemy && key.includes('left')) {
    state.battle.deployUnlocked.left = true;
  }
  if (isEnemy && key.includes('right')) {
    state.battle.deployUnlocked.right = true;
  }
  updatePocketIndicators();
  renderBattleHUD();
  if (key.includes('king')) {
    endBattle(attackerSide === 'friendly' ? 'Victory!' : 'Defeat');
  }
}

function updatePocketIndicators() {
  elements.pocketLeft.classList.toggle('active', !!state.battle?.deployUnlocked.left);
  elements.pocketRight.classList.toggle('active', !!state.battle?.deployUnlocked.right);
}

function endBattle(resultText) {
  if (!state.battle) return;
  cancelAnimationFrame(state.battle.animationFrame);
  state.battle.units.forEach((unit) => unit.element.remove());
  state.battle.projectiles.forEach((proj) => proj.element.remove());
  state.battle = null;
  elements.battleResult.textContent = resultText || 'Draw';
  elements.battleResult.classList.add('show');
  setTimeout(() => {
    elements.battleModal.classList.add('hidden');
    playSoundtrack('menu');
  }, 1800);
}

function concludeBattle() {
  if (!state.battle) return;
  let result = 'Draw';
  if (state.battle.crowns.player !== state.battle.crowns.enemy) {
    result = state.battle.crowns.player > state.battle.crowns.enemy ? 'Victory!' : 'Defeat';
  }
  endBattle(result);
}

function initListeners() {
  document.querySelectorAll('.nav-button').forEach((btn) => {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.tabTarget));
  });
  elements.chestGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-chest]');
    if (!btn) return;
    handleChestAction(btn.dataset.chest, btn.dataset.action);
  });
  elements.deckList.addEventListener('click', (event) => {
    const infoBtn = event.target.closest('.card-info-btn');
    if (infoBtn) {
      openCardModal(infoBtn.dataset.card);
      return;
    }
    const card = event.target.closest('.card-tile');
    if (!card) return;
    const selected = document.querySelector('.collection-grid .card-tile.selected');
    if (selected) {
      const cardId = selected.dataset.card;
      const index = Number(card.dataset.slot);
      if (!cardId || Number.isNaN(index)) return;
      const duplicateIndex = state.deck.findIndex((id, idx) => id === cardId && idx !== index);
      if (duplicateIndex > -1) {
        alert('This card is already in your deck.');
        return;
      }
      state.deck[index] = cardId;
      selected.classList.remove('selected');
      renderDeck();
      saveDeckToStorage(state.deck);
    } else {
      if (card.dataset.card) {
        openCardModal(card.dataset.card);
      }
    }
  });
  elements.collectionGrid.addEventListener('click', (event) => {
    const infoBtn = event.target.closest('.card-info-btn');
    if (infoBtn) {
      openCardModal(infoBtn.dataset.card);
      return;
    }
    const tile = event.target.closest('.card-tile');
    if (!tile || tile.classList.contains('locked')) return;
    document.querySelectorAll('.collection-grid .card-tile').forEach((node) => node.classList.remove('selected'));
    tile.classList.add('selected');
  });
  elements.cardUpgradeButton.addEventListener('click', () => {
    if (state.ui.focusedCard) upgradeCard(state.ui.focusedCard);
  });
  elements.cardUseButton.addEventListener('click', () => {
    if (state.ui.focusedCard) useCardFromModal(state.ui.focusedCard);
  });
  elements.closeCardModal.addEventListener('click', closeCardModal);
  elements.cardModal.addEventListener('click', (event) => {
    if (event.target === elements.cardModal) closeCardModal();
  });
  elements.leaveBattle.addEventListener('click', () => {
    stopAllSound();
    elements.battleModal.classList.add('hidden');
    state.battle = null;
    playSoundtrack('menu');
  });
  elements.battleHand.addEventListener('click', (event) => {
    const card = event.target.closest('.battle-card');
    if (!card || card.classList.contains('disabled')) return;
    selectBattleCard(card.dataset.card);
  });
  elements.arenaField.addEventListener('click', handleArenaClick);
  document.getElementById('emoteToggle').addEventListener('click', () => elements.emotePanel.classList.toggle('active'));
  elements.emotePanel.addEventListener('click', (event) => {
    if (event.target.dataset.emote && !state.muted) {
      elements.battleStatus.textContent = `You: ${event.target.dataset.emote}`;
      elements.emotePanel.classList.remove('active');
    }
  });
  elements.muteToggle.addEventListener('click', () => {
    state.muted = !state.muted;
    elements.muteToggle.textContent = state.muted ? '🔈 Unmute' : '🔇 Mute';
    if (state.muted) stopAllSound();
    else playSoundtrack(state.battle ? 'battle' : 'menu');
  });
  elements.requestCardsButton.addEventListener('click', requestCards);
  elements.clanChat.addEventListener('click', (event) => {
    if (event.target.dataset.donate) handleDonate(event.target.dataset.donate);
  });
  document.getElementById('chatForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('chatInput');
    if (!input.value.trim()) return;
    state.clan.chat.unshift({ author: state.profile.name, text: input.value.trim(), type: 'message', timestamp: new Date() });
    input.value = '';
    renderClan();
  });
  elements.shopOffers.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-offer]');
    if (!btn) return;
    handleShopPurchase(btn.dataset.offer);
  });
  document.getElementById('passRoyaleOffer').addEventListener('click', () => alert('Pass Royale feature placeholder.'));
  elements.eventsList.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-event]');
    if (!btn) return;
    alert(`Entering event: ${btn.dataset.event}`);
  });
}

async function init() {
  setupSounds();
  playSoundtrack('menu');
  await bootstrapCharacters();
  state.dataLoaded = true;
  renderProfile();
  renderChests();
  await loadStatusPanel();
  renderDeck();
  renderCollection();
  renderShop();
  renderClan();
  renderEvents();
  renderCharacterData();
  initListeners();
  setActiveTab('battle');
  setInterval(() => tickOneSecond(), 1000);
}

function tickOneSecond() {
  state.chestSlots.forEach((chest) => {
    if (chest.status === 'unlocking' && chest.remaining > 0) {
      chest.remaining -= 1;
      if (chest.remaining <= 0) chest.status = 'ready';
    }
  });
  if (state.clan.requestCooldown > 0) state.clan.requestCooldown -= 1;
  state.events.forEach((event) => {
    if (event.timeLeft > 0) event.timeLeft -= 1;
  });
  if (state.battle) {
    Object.keys(state.battle.player.cooldowns).forEach((cardId) => {
      state.battle.player.cooldowns[cardId] = Math.max(0, state.battle.player.cooldowns[cardId] - 1);
    });
  }
  renderChests();
  renderClan();
  renderEvents();
}

init();
