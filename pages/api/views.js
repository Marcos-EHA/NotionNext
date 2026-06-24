/**
 * API route para obtener el contador de vistas de un artículo desde Umami
 * Uso: /api/views?slug=/article/mi-articulo
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

  if (!res.ok) return null

  const data = await res.json()
  cachedToken = data.token
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000 // 23 horas
  return cachedToken
}

export default async function handler (req, res) {
  const { slug } = req.query

  if (!slug) {
    return res.status(400).json({ error: 'slug requerido' })
  }

  try {
    const token = await getUmamiToken()
    if (!token) {
      return res.status(500).json({ error: 'No se pudo autenticar con Umami' })
    }

    const websiteId = process.env.NEXT_PUBLIC_UMAMI_ID
    const now = Date.now()
    const startAt = 0 // Desde el inicio

    const metricsRes = await fetch(
      `${process.env.UMAMI_URL}/api/websites/${websiteId}/metrics?type=url&startAt=${startAt}&endAt=${now}&url=${encodeURIComponent(slug)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (!metricsRes.ok) {
      return res.status(500).json({ error: 'Error consultando Umami' })
    }

    const metrics = await metricsRes.json()
    const pageData = Array.isArray(metrics)
      ? metrics.find(m => m.x === slug)
      : null

    const views = pageData ? pageData.y : 0

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
    return res.status(200).json({ views })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
