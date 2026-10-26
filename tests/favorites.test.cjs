const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const root = path.resolve(__dirname, '..')

function compile(file, mocks) {
  const filename = path.join(root, file)
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const loaded = new Module(filename, module)
  loaded.filename = filename
  loaded.paths = Module._nodeModulePaths(root)
  const original = loaded.require.bind(loaded)
  loaded.require = name => Object.hasOwn(mocks, name) ? mocks[name] : original(name)
  loaded._compile(compiled, filename)
  return loaded.exports
}

function setup() {
  let user = null
  const listeners = []
  const auth = {
    getState: () => ({ user, isAuthenticated: !!user }),
    subscribe: listener => { listeners.push(listener); return () => {} },
    login: id => { user = id ? { id } : null; listeners.forEach(listener => listener()) },
  }
  const context = compile('lib/api/favorite-context.ts', { '@/lib/store/auth': { useAuthStore: auth } })
  const calls = []
  let block
  let failure = false
  const api = { setFavorite: async (id, value) => {
    calls.push([id, value])
    if (failure) throw new Error('Network error')
    if (block) return block
    return value
  } }
  const { useFavoritesStore: store } = compile('lib/store/favorites.ts', {
    './auth': { useAuthStore: auth }, '@/lib/api/favorites': api, '@/lib/api/favorite-context': context,
  })
  return { auth, context, calls, store,
    block: promise => { block = promise }, fail: () => { failure = true } }
}

test('visitor cannot mutate favorites', async () => {
  const state = setup()
  await assert.rejects(state.store.getState().toggle('sub', false), /Connexion/)
  assert.equal(state.calls.length, 0)
})

test('mutations wait for success and block duplicate clicks', async () => {
  const state = setup()
  state.auth.login('A')
  let resolve
  state.block(new Promise(done => { resolve = done }))
  const pending = state.store.getState().toggle('sub', false)
  await state.store.getState().toggle('sub', false)
  assert.equal(state.calls.length, 1)
  assert.equal(state.store.getState().pending.sub, true)
  assert.equal(state.store.getState().flags.sub, undefined)
  resolve(true)
  await pending
  assert.equal(state.store.getState().flags.sub, true)
  assert.equal(state.store.getState().pending.sub, undefined)
})

test('network error preserves the previous flag and releases the pending state', async () => {
  const state = setup()
  state.auth.login('A')
  await state.store.getState().toggle('sub', false)
  state.fail()
  await assert.rejects(state.store.getState().toggle('sub', true))
  assert.equal(state.store.getState().flags.sub, true)
  assert.deepEqual(state.store.getState().pending, {})
})

test('account changes ignore stale mutation responses and clear private state', async () => {
  const state = setup()
  state.auth.login('A')
  let resolve
  state.block(new Promise(done => { resolve = done }))
  const pending = state.store.getState().toggle('sub', false)
  state.auth.login('B')
  resolve(true)
  await pending
  assert.equal(state.store.getState().accountId, 'B')
  assert.deepEqual(state.store.getState().flags, {})
  state.auth.login(null)
  assert.equal(state.store.getState().accountId, null)
  assert.deepEqual(state.store.getState().pending, {})
})

test('fresh server state is used when another device has changed a favorite', async () => {
  const state = setup()
  state.auth.login('A')
  await state.store.getState().toggle('sub', false)
  // After a fresh GET reports false, the next click must add, not delete.
  await state.store.getState().toggle('sub', false)
  assert.deepEqual(state.calls, [['sub', true], ['sub', true]])
})

test('API uses the correct POST, DELETE and paginated GET contracts', async () => {
  const state = setup()
  state.auth.login('A')
  const requests = []
  const client = {
    post: async (url, data) => { requests.push(['POST', url, data]); return { data: { data: { subscriptionId: 'sub', isFavorite: true } } } },
    delete: async url => { requests.push(['DELETE', url]); return { data: { data: { subscriptionId: 'sub', isFavorite: false } } } },
    get: async (url, options) => { requests.push(['GET', url, options]); return { data: { data: {
      favorites: [{ id: 'sub', isFavorite: true, isAvailable: false }],
      pagination: { page: 2, limit: 20, total: 30, totalPages: 2 },
    } } } },
  }
  const api = compile('lib/api/favorites.ts', { './client': { apiClient: client }, './favorite-context': state.context })
  assert.equal(await api.setFavorite('sub', true), true)
  assert.equal(await api.setFavorite('sub', false), false)
  const result = await api.getFavorites(2)
  assert.deepEqual(requests, [
    ['POST', '/favorites', { subscriptionId: 'sub' }], ['DELETE', '/favorites/sub'],
    ['GET', '/favorites', { params: { page: 2, limit: 20 } }],
  ])
  assert.equal(result.favorites[0].favoriteAccountId, 'A')
  assert.equal(result.favorites[0].isAvailable, false)
})

test('API rejects malformed mutation confirmations', async () => {
  const state = setup()
  const api = compile('lib/api/favorites.ts', {
    './client': { apiClient: { post: async () => ({ data: { data: { subscriptionId: 'other', isFavorite: false } } }) } },
    './favorite-context': state.context,
  })
  await assert.rejects(api.setFavorite('sub', true), /inattendue/)
})

test('discovery tags nested subscriptions with the requesting account and revision', () => {
  const state = setup()
  const before = state.context.favoriteRevision()
  const sub = state.context.tagFavoriteAccount({ id: 'sub', providerSubscriptions: [{ id: 'other' }] }, 'A', before)
  state.context.advanceFavoriteRevision()
  assert.equal(sub.favoriteAccountId, 'A')
  assert.equal(sub.providerSubscriptions[0].favoriteAccountId, 'A')
  assert.ok(sub.favoriteRevision < state.context.favoriteRevision())
})

function renderCard(overrides = {}) {
  const { SubscriptionCard } = compile('components/cards/subscription-card.tsx', {
    'next/link': { __esModule: true, default: ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children) },
    'next/image': { __esModule: true, default: ({ src, alt }) => React.createElement('img', { src, alt }) },
    '@/components/ui/favorite-button': { FavoriteButton: () => React.createElement('button', { type: 'button' }, 'Favori') },
    '@/lib/utils': { formatPrice: price => `${price} XOF`, SUBSCRIPTION_DURATION_LABELS: { WEEK: '1 semaine' } },
  })
  return renderToStaticMarkup(React.createElement(SubscriptionCard, { subscription: {
    id: 'sub', name: 'Riz et Alloco', duration: 'WEEK', price: 3111, isActive: true,
    provider: { name: 'Un long nom de prestataire', isVerified: true }, ...overrides,
  } }))
}

test('redesigned cards display duration, provider and total price with a separate heart button', () => {
  const html = renderCard()
  assert.match(html, /1 semaine/)
  assert.match(html, /Un long nom de prestataire/)
  assert.match(html, /pour toute la durée/)
  assert.ok(html.indexOf('</a>') < html.indexOf('<button'))
  assert.doesNotMatch(html, /avis/)
})

test('cards show real reviews and mark unavailable favorites', () => {
  const html = renderCard({ rating: 4.7, reviewCount: 12, isAvailable: false })
  assert.match(html, /4.7/)
  assert.match(html, /12/)
  assert.match(html, /avis/)
  assert.match(html, /Indisponible/)
  assert.match(html, /aria-disabled="true"/)
})

function animatedButtonHarness({ saved = false, reduced = false } = {}) {
  const state = setup()
  state.auth.login('A')
  const slots = []
  let cursor = 0
  function useState(initial) {
    const i = cursor++
    if (slots[i] === undefined) slots[i] = initial
    return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value }]
  }
  const notices = []
  const { FavoriteButton } = compile('components/ui/favorite-button.tsx', {
    react: { ...React, useState,
      useRef: initial => { const [ref] = useState({ current: initial }); return ref },
      useEffect: callback => { const i = cursor++; if (!slots[i]) { slots[i] = true; callback() } },
    },
    'framer-motion': { motion: { span: 'motion-span' }, useReducedMotion: () => reduced },
    'next/navigation': { useRouter: () => ({ push() {} }), usePathname: () => '/explorer' },
    '@/lib/store/auth': { useAuthStore: Object.assign(selector => selector(state.auth.getState()), state.auth) },
    '@/lib/store/favorites': { useFavoritesStore: Object.assign(selector => selector(state.store.getState()), { getState: state.store.getState }) },
    '@/lib/utils/api-error': { showApiError: error => notices.push(error) },
  })
  const subscription = { id: 'sub', name: 'Formule test', isFavorite: saved,
    favoriteAccountId: 'A', favoriteRevision: state.context.favoriteRevision() }
  const render = () => { cursor = 0; return FavoriteButton({ subscription }) }
  render() // Hydration effect.
  return { ...state, notices, render }
}

function fallingHearts(element) {
  if (!element || typeof element !== 'object') return []
  return [...(element.props?.initial?.y === -26 ? [element] : []),
    ...React.Children.toArray(element.props?.children).flatMap(fallingHearts)]
}

test('falling heart starts only after a confirmed addition, not while loading', async () => {
  const state = animatedButtonHarness()
  let resolve
  state.block(new Promise(done => { resolve = done }))
  const pending = state.render().props.onClick()
  assert.equal(fallingHearts(state.render()).length, 0)
  resolve(true)
  await pending
  const hearts = fallingHearts(state.render())
  assert.equal(hearts.length, 1)
  assert.equal(hearts[0].props['aria-hidden'], 'true')
  hearts[0].props.onAnimationComplete()
  assert.equal(fallingHearts(state.render()).length, 0)
})

test('an existing favorite and a successful removal do not trigger the animation', async () => {
  const state = animatedButtonHarness({ saved: true })
  assert.equal(fallingHearts(state.render()).length, 0)
  await state.render().props.onClick()
  assert.equal(state.store.getState().flags.sub, false)
  assert.equal(fallingHearts(state.render()).length, 0)
})

test('failed addition never plays the confirmation animation', async () => {
  const state = animatedButtonHarness()
  state.fail()
  await state.render().props.onClick()
  assert.equal(fallingHearts(state.render()).length, 0)
  assert.equal(state.notices.length, 1)
})

test('reduced motion disables animation but still saves the favorite', async () => {
  const state = animatedButtonHarness({ reduced: true })
  await state.render().props.onClick()
  assert.equal(state.store.getState().flags.sub, true)
  assert.equal(fallingHearts(state.render()).length, 0)
})

test('account changes cancel animation from a previous request', async () => {
  const state = animatedButtonHarness()
  let resolve
  state.block(new Promise(done => { resolve = done }))
  const pending = state.render().props.onClick()
  state.auth.login('B')
  resolve(true)
  await pending
  assert.equal(fallingHearts(state.render()).length, 0)
})
