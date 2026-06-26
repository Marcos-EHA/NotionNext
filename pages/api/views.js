/**
 * API route para obtener el contador de vistas desde Umami
 * GET /api/views?type=active — visitantes activos en tiempo real
 * GET /api/views?type=page&slug=/article/mi-articulo — vistas de un artículo
 */

let cachedToken = null
let tokenExpiry = 0

async function getUmamiToken () {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  const umamiUrl = process.env.UMAMI_URL
  const username = process.env.UMAMI_USERNAME
  const password = process.env.UMAMI_PASSWORD

  if (!umamiUrl || !username || !password) {
    console.error('[Umami] Missing env vars')
    return null
  }

  try {
    const res = await fetch(`${umamiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    const text = await res.text()
    console.log('[Umami] Auth response:', res.status, text.substring(0, 100))

    if (!res.ok) return null

    const data = JSON.parse(text)
    const token = data?.token || data?.data?.token
    if (!token) return null

    cachedToken = token
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000
    return cachedToken
  } catch (err) {
    console.error('[Umami] Auth error:', err.message)
    return null
  }
}

export default async function handler (req, res) {
  const { type, slug } = req.query
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_ID
  const baseUrl = process.env.UMAMI_URL

  if (!websiteId || !baseUrl) {
    return res.status(500).json({ error: 'Umami no configurado' })
  }

  try {
    const token = await getUmamiToken()
    if (!token) {
      return res.status(500).json({ error: 'No se pudo autenticar con Umami' })
    }

    const headers = { Authorization: `Bearer ${token}` }

    // Visitantes activos en tiempo real
    if (type === 'active') {
      const r = await fetch(`${baseUrl}/api/websites/${websiteId}/active`, { headers })
      const text = await r.text()
      console.log('[Umami] Active response:', r.status, text.substring(0, 100))
      if (!r.ok) return res.status(500).json({ error: 'Error en active', status: r.status })
      const data = JSON.parse(text)
      // Umami puede responder como { visitors: N } o { x: N } o un número
      const active = typeof data === 'number'
        ? data
        : (data?.visitors ?? data?.x ?? data?.active ?? 0)
      res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate')
      return res.status(200).json({ active: Number(active) })
    }

    // Vistas de un artículo específico
    if (type === 'page' && slug) {
      const now = Date.now()
      // Umami v1 usa snake_case: start_at, end_at
      const url = `${baseUrl}/api/websites/${websiteId}/metrics?type=url&start_at=0&end_at=${now}&url=${encodeURIComponent(slug)}`
      console.log('[Umami] Metrics URL:', url)
      const r = await fetch(url, { headers })
      const text = await r.text()
      console.log('[Umami] Metrics response:', r.status, text.substring(0, 200))
      if (!r.ok) return res.status(500).json({ error: 'Error en metrics', status: r.status, body: text })
      const metrics = JSON.parse(text)
      const pageData = Array.isArray(metrics) ? metrics.find(m => m.x === slug) : null
      const views = pageData ? pageData.y : 0
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
      return res.status(200).json({ views: Number(views) })
    }

    return res.status(400).json({ error: 'Parámetros inválidos' })
  } catch (error) {
    console.error('[Umami] Handler error:', error.message)
    return res.status(500).json({ error: error.message })
  }
}
