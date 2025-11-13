(function () {
  const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif']);
  const STORAGE_PREFIX = 'generated-card-';
  const isBrowser = typeof window !== 'undefined';

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randFloat = (min, max, precision = 1) => Number((Math.random() * (max - min) + min).toFixed(precision));
  const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const normalizeBaseName = (name = '') => {
    const cleaned = name.replace(/\\/g, '/').split('/').filter(Boolean).pop() || name;
    return cleaned;
  };

  function buildTemplate(id, ext = '.png') {
    const safeId = normalizeBaseName(id);
    const rarity = choose(['common', 'rare', 'epic', 'legendary']);
    const elixir = randInt(1, 8);
    const speed = randInt(40, 100);
    const attackSpeed = randFloat(0.7, 1.9, 2);
    const range = randFloat(0.5, 6, 1);
    const targeting = choose(['ground', 'air-ground', 'buildings']);
    const spawnCount = choose([1, 1, 1, 2, 3]);
    return {
      id: safeId,
      name: safeId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      type: 'troop',
      rarity,
      elixir,
      description: `Auto-generated stats for ${safeId}. Adjust to balance.`,
      sprite: `Characters/${safeId}${ext}`,
      stats: {
        health: randInt(300, 4000),
        damage: randInt(60, 400),
        attackSpeed,
        range,
        speed,
        targeting,
        spawnCount,
        splashRadius: choose([0, 0, 0, randFloat(1, 3, 1)])
      }
    };
  }

  if (isBrowser) {
    const generatedData = {};

    const loadStoredCards = () => {
      if (typeof localStorage === 'undefined') return;
      Object.keys(localStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .forEach((key) => {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data) {
              const safeId = normalizeBaseName(data.id || data.name || key.replace(STORAGE_PREFIX, ''));
              data.id = safeId;
              generatedData[safeId] = data;
              if (safeId && key !== `${STORAGE_PREFIX}${safeId}`) {
                localStorage.setItem(`${STORAGE_PREFIX}${safeId}`, JSON.stringify(data));
                localStorage.removeItem(key);
              }
            }
          } catch (err) {
            console.warn('[Generator] Failed to read cached card', key, err.message);
          }
        });
    };

    const saveGeneratedCard = (card) => {
      if (typeof localStorage === 'undefined' || !card?.id) return;
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${card.id}`, JSON.stringify(card));
      } catch (err) {
        console.warn('[Generator] Unable to cache generated card', card.id, err.message);
      }
    };

    const parseDirectoryListing = async () => {
      try {
        const resp = await fetch('Characters/', { cache: 'no-store' });
        if (!resp.ok) return [];
        const contentType = resp.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) return [];
        const html = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = Array.from(doc.querySelectorAll('a[href]'));
        return links
          .map((node) => decodeURIComponent(node.getAttribute('href') || ''))
          .filter((href) => href && !href.includes('..') && !href.endsWith('/'))
          .map((href) => href.replace(/^\//, ''))
          .map((filename) => {
            const dot = filename.lastIndexOf('.');
            if (dot <= 0) return null;
            const ext = filename.slice(dot).toLowerCase();
            const base = normalizeBaseName(filename.slice(0, dot));
            if (!IMAGE_EXTENSIONS.has(ext)) return null;
            return { base, ext };
          })
          .filter(Boolean);
      } catch (err) {
        console.warn('[Generator] Unable to inspect Characters directory.', err.message);
        return [];
      }
    };

    const runBrowserGenerator = async () => {
      if (window.__characterGeneratorInitialized) return window.__characterGeneratorPromise;
      window.__characterGeneratorInitialized = true;
      const manifest = await (async () => {
        try {
          const resp = await fetch('Characters/characters-manifest.json', { cache: 'no-store' });
          if (resp.ok) return await resp.json();
        } catch (err) {
          console.warn('[Generator] Unable to load manifest file.', err.message);
        }
        return { version: Date.now(), characters: [] };
      })();

      const discovered = new Set((manifest.characters || []).map((id) => normalizeBaseName(id)));
      loadStoredCards();
      Object.keys(generatedData).forEach((id) => discovered.add(id));

    const directoryEntries = await parseDirectoryListing();

    const manifestEntries = Array.isArray(manifest.images)
      ? manifest.images.map((entry) => {
          if (typeof entry === 'string') {
            const safe = normalizeBaseName(entry);
            return { base: safe, ext: '.png' };
          }
          const baseName = normalizeBaseName(entry.base || entry.id || entry.name || '');
          return { base: baseName, ext: entry.ext || entry.extension || '.png' };
        }).filter((entry) => entry.base)
      : [];

    const combinedEntries = new Map();
    directoryEntries.forEach(({ base, ext }) => combinedEntries.set(base, { base, ext }));
    manifestEntries.forEach((entry) => {
      if (!combinedEntries.has(entry.base)) {
        combinedEntries.set(entry.base, entry);
      }
    });

    combinedEntries.forEach(({ base, ext }) => {
      if (!discovered.has(base)) {
        const template = buildTemplate(base, ext);
        generatedData[base] = template;
        discovered.add(base);
        saveGeneratedCard(template);
      }
    });

      manifest.characters = Array.from(discovered).sort();
      window.__characterManifest = manifest;
      window.__generatedCardData = generatedData;
      console.info('[Generator] Available characters:', manifest.characters.length);
      return manifest;
    };

    window.requestCharacterGeneration = () => {
      if (!window.__characterGeneratorPromise) {
        window.__characterGeneratorPromise = runBrowserGenerator().finally(() => {
          // allow future refreshes
          setTimeout(() => {
            window.__characterGeneratorInitialized = false;
            window.__characterGeneratorPromise = null;
          }, 0);
        });
      }
      return window.__characterGeneratorPromise;
    };
    return;
  }

  const fs = require('fs');
  const path = require('path');

  const charactersDir = path.resolve(__dirname, '../Characters');
  const manifestFile = path.join(charactersDir, 'characters-manifest.json');

  if (!fs.existsSync(charactersDir)) {
    console.error('Characters directory does not exist:', charactersDir);
    process.exit(1);
  }

  const files = fs.readdirSync(charactersDir);
  const discovered = new Set();
  const imageEntries = new Map();

  for (const file of files) {
    if (path.resolve(charactersDir, file) === manifestFile) continue;
    const ext = path.extname(file).toLowerCase();
    const base = normalizeBaseName(path.basename(file, ext));
    if (IMAGE_EXTENSIONS.has(ext)) {
      discovered.add(base);
      if (!imageEntries.has(base)) {
        imageEntries.set(base, ext);
      }
      const jsonFile = path.join(charactersDir, `${base}.json`);
      if (!fs.existsSync(jsonFile)) {
        fs.writeFileSync(jsonFile, JSON.stringify(buildTemplate(base, ext), null, 2));
        console.log('Created template for', base);
      }
    } else if (ext === '.json') {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(charactersDir, file), 'utf8'));
        if (data && (data.id || data.name)) {
          const safeId = normalizeBaseName(data.id || data.name);
          if (safeId) discovered.add(safeId);
        } else {
          discovered.add(base);
        }
      } catch (err) {
        console.warn('Failed to parse', file, err.message);
      }
    }
  }

  if (!discovered.size) {
    console.warn('No characters found in', charactersDir);
  }

  const manifest = {
    version: Date.now(),
    characters: Array.from(discovered).sort(),
    images: Array.from(imageEntries.entries())
      .map(([base, ext]) => ({ base, ext }))
      .sort((a, b) => a.base.localeCompare(b.base))
  };

  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  console.log('Updated manifest with', manifest.characters.length, 'entries.');
})();
