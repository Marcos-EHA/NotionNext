/**
 * API routes para Umami Analytics
 * GET /api/views?type=active — visitantes activos en tiempo real (para página principal)
 * GET /api/views?type=page&slug=/article/mi-articulo — vistas de un artículo específico
 */

let cachedToken = null
let tokenExpiry = 0

async function getUmamiToken () {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  const res = await fetch(`${process.env.UMAMI_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.UMAMI_USERNAME,
      password: process.env.UMAMI_PASSWORD
    })
  })

  if (!res.ok) {
    console.error('Umami auth failed:', res.status)
    return null
  }

  const data = await res.json()
  cachedToken = data.token
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000
  return cachedToken
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

    // Visitantes activos en tiempo real (página principal)
    if (type === 'active') {
      const r = await fetch(`${baseUrl}/api/websites/${websiteId}/active`, { headers })
      if (!r.ok) return res.status(500).json({ error: 'Error en Umami active' })
      const data = await r.json()
      // Umami devuelve { x: count } o un número directamente
      const active = data?.x ?? data ?? 0
      res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate')
      return res.status(200).json({ active })
    }

    // Vistas de un artículo específico
    if (type === 'page' && slug) {
      const now = Date.now()
      const r = await fetch(
        `${baseUrl}/api/websites/${websiteId}/metrics?type=url&startAt=0&endAt=${now}&url=${encodeURIComponent(slug)}`,
        { headers }
      )
      if (!r.ok) return res.status(500).json({ error: 'Error en Umami metrics' })
      const metrics = await r.json()
      const pageData = Array.isArray(metrics) ? metrics.find(m => m.x === slug) : null
      const views = pageData ? pageData.y : 0
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
      return res.status(200).json({ views })
    }

    return res.status(400).json({ error: 'Parámetros inválidos. Usa type=active o type=page&slug=/ruta' })
  } catch (error) {
    console.error('Umami API error:', error)
    return res.status(500).json({ error: error.message })
  }
}
