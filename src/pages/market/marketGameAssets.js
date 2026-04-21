const IMAGE_PARAMS = '?auto=format&fit=crop&w=1200&q=82'

const GAME_VISUALS = {
  'path-of-exile': {
    image:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429' + IMAGE_PARAMS,
    accent: '#39f0b1',
    kicker: 'Dark fantasy economy',
    tags: ['Currency', 'Leagues', 'Trade context'],
  },
  wow: {
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa' + IMAGE_PARAMS,
    accent: '#4fd8ff',
    kicker: 'Raid-ready trading',
    tags: ['Currency', 'Realms', 'Services soon'],
  },
  'world-of-warcraft': {
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa' + IMAGE_PARAMS,
    accent: '#4fd8ff',
    kicker: 'Raid-ready trading',
    tags: ['Gold', 'Crafting', 'Carry routes'],
  },
  diablo: {
    image:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5' + IMAGE_PARAMS,
    accent: '#ff5f6d',
    kicker: 'Loot and build market',
    tags: ['Currency', 'Seasonal', 'Items soon'],
  },
  dota: {
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420' + IMAGE_PARAMS,
    accent: '#7cff6b',
    kicker: 'Fast queue exchange',
    tags: ['Currency', 'Items soon', 'Services soon'],
  },
  'dota-2': {
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420' + IMAGE_PARAMS,
    accent: '#7cff6b',
    kicker: 'Fast queue exchange',
    tags: ['Skins', 'Boosts', 'Battle pass'],
  },
  tarkov: {
    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e' + IMAGE_PARAMS,
    accent: '#f3e35b',
    kicker: 'Extraction-grade supply',
    tags: ['Currency', 'Items soon', 'Services soon'],
  },
  'escape-from-tarkov': {
    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e' + IMAGE_PARAMS,
    accent: '#f3e35b',
    kicker: 'Extraction-grade supply',
    tags: ['Roubles', 'Keys', 'Cases'],
  },
}

const FALLBACK_VISUALS = [
  {
    image:
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8' + IMAGE_PARAMS,
    accent: '#44f4c8',
    kicker: 'Player-to-player market',
    tags: ['Currency live', 'Items soon', 'Services soon'],
  },
  {
    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f' + IMAGE_PARAMS,
    accent: '#ff4fd8',
    kicker: 'Arcade-speed deals',
    tags: ['Currency live', 'Category filters', 'Display currency'],
  },
  {
    image:
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f' + IMAGE_PARAMS,
    accent: '#6df25f',
    kicker: 'Competitive supply',
    tags: ['Currency live', 'Game context', 'Listing filters'],
  },
  {
    image:
      'https://images.unsplash.com/photo-1542751110-97427bbecf20' + IMAGE_PARAMS,
    accent: '#58d7ff',
    kicker: 'Digital goods exchange',
    tags: ['Currency live', 'Buy intent', 'Sell intent'],
  },
]

function normalize(value = '') {
  return value.toString().trim().toLowerCase()
}

function hashString(value = '') {
  return normalize(value)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function findKnownVisual(game) {
  const slug = normalize(game?.slug)
  const title = normalize(game?.title)
  if (GAME_VISUALS[slug]) return GAME_VISUALS[slug]

  return Object.entries(GAME_VISUALS).find(([key]) => {
    const normalizedKey = normalize(key)
    return slug.includes(normalizedKey) || title.includes(normalizedKey)
  })?.[1]
}

function readGameImage(game) {
  return (
    game?.imageUrl ||
    game?.image_url ||
    game?.coverUrl ||
    game?.cover_url ||
    game?.bannerUrl ||
    game?.banner_url ||
    game?.iconUrl ||
    game?.icon_url ||
    ''
  )
}

export function resolveMarketGameVisual(game) {
  const directImage = readGameImage(game)
  const known = findKnownVisual(game)
  const fallback = FALLBACK_VISUALS[hashString(game?.slug || game?.title) % FALLBACK_VISUALS.length]

  return {
    image: directImage || known?.image || fallback.image,
    accent: known?.accent || fallback.accent,
    kicker: known?.kicker || fallback.kicker,
    tags: known?.tags || fallback.tags,
  }
}

function createQuickRoute(label, description, values) {
  return {
    label,
    description,
    values,
  }
}

export function buildMarketQuickRoutes(schemaFilters, copy) {
  const labels = copy?.quickRoutes?.labels || ['Starter stack', 'Bulk lane', 'High demand']
  const filters = (Array.isArray(schemaFilters?.allFilters) ? schemaFilters.allFilters : [])
    .filter((filter) => Array.isArray(filter.options) && filter.options.length > 0)

  if (!filters.length) return []

  const routes = []
  const primary = filters[0]
  const secondary = filters[1]
  const tertiary = filters[2]

  if (primary && secondary) {
    routes.push(
      createQuickRoute(labels[0], `${primary.title} + ${secondary.title}`, {
        [primary.stateKey]: primary.options[0]?.slug || '',
        [secondary.stateKey]: secondary.options[0]?.slug || '',
      })
    )
  }

  if (primary?.options?.[1]) {
    routes.push(
      createQuickRoute(labels[1], primary.title, {
        [primary.stateKey]: primary.options[1].slug,
      })
    )
  }

  if (secondary?.options?.[1]) {
    routes.push(
      createQuickRoute(labels[2], secondary.title, {
        [secondary.stateKey]: secondary.options[1].slug,
      })
    )
  }

  if (!routes.length && primary?.options?.[0]) {
    routes.push(
      createQuickRoute(labels[0], primary.title, {
        [primary.stateKey]: primary.options[0].slug,
      })
    )
  }

  if (tertiary?.options?.[0] && routes.length < 3) {
    routes.push(
      createQuickRoute(tertiary.title, copy?.quickRoutes?.tertiary || 'Extra filter', {
        [tertiary.stateKey]: tertiary.options[0].slug,
      })
    )
  }

  return routes.slice(0, 3)
}
