/**
 * API de contadores basada en Umami (credenciales solo en el servidor).
 *   GET /api/views?type=active            -> { active: N }  visitantes ahora mismo
 *   GET /api/views?type=page&slug=/ruta   -> { views: N }   vistas de una pagina
 *   GET /api/views?type=all               -> { views: { '/ruta': N, ... } }
 *
 * Esta version de Umami usa type=path (type=url devuelve 400) y responde una
 * lista [{ x: ruta, y: vistas }]. Se consulta una sola vez por minuto.
 */

let cachedToken = null
let tokenExpiry = 0
let cachedViews = null
let viewsExpiry = 0

async function getToken () {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  const { UMAMI_URL, UMAMI_USERNAME, UMAMI_PASSWORD } = process.env
  if (!UMAMI_URL || !UMAMI_USERNAME || !UMAMI_PASSWORD) return null
  const res = await fetch(`${UMAMI_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: UMAMI_USERNAME, password: UMAMI_PASSWORD })
  })
  if (!res.ok) return null
  const data = await res.json()
  cachedToken = data?.token || null
  tokenExpiry = Date.now() + 6 * 60 * 60 * 1000
  return cachedToken
}

async function umami (path, token) {
  const res = await fetch(`${process.env.UMAMI_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (res.status === 401) cachedToken = null
  if (!res.ok) throw new Error(`Umami respondio ${res.status}`)
  return res.json()
}

async function getViewsByPath (websiteId, token) {
  if (cachedViews && Date.now() < viewsExpiry) return cachedViews
  const rows = await umami(
    `/api/websites/${websiteId}/metrics?type=path&startAt=0&endAt=${Date.now()}&limit=500`,
    token
  )
  const map = {}
  for (const row of Array.isArray(rows) ? rows : []) {
    map[row.x] = Number(row.y) || 0
  }
  cachedViews = map
  viewsExpiry = Date.now() + 60 * 1000
  return map
}

export default async function handler (req, res) {
  const { type, slug } = req.query
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_ID

  if (!websiteId || !process.env.UMAMI_URL) {
    return res.status(500).json({ error: 'Umami no configurado' })
  }

  try {
    const token = await getToken()
    if (!token) {
      return res.status(500).json({ error: 'No se pudo autenticar con Umami' })
    }

    if (type === 'active') {
      const data = await umami(`/api/websites/${websiteId}/active`, token)
      const active = typeof data === 'number' ? data : (data?.visitors ?? data?.x ?? 0)
      res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate')
      return res.status(200).json({ active: Number(active) || 0 })
    }

    if (type === 'page' || type === 'all') {
      const map = await getViewsByPath(websiteId, token)
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
      if (type === 'all') return res.status(200).json({ views: map })
      if (!slug) return res.status(400).json({ error: 'slug requerido' })
      return res.status(200).json({ views: map[slug] || 0 })
    }

    return res.status(400).json({ error: 'type invalido' })
  } catch (error) {
    return res.status(500).json({ error: 'Error consultando Umami' })
  }
}
