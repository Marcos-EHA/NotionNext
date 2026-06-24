import { useEffect, useState } from 'react'

/**
 * Contador de vistas usando Umami
 * Muestra un ícono de ojo con el número de vistas de un artículo
 */
export default function UmamiViewCounter ({ slug }) {
  const [views, setViews] = useState(null)

  useEffect(() => {
    if (!slug) return

    const articleSlug = slug.startsWith('/') ? slug : `/article/${slug}`

    fetch(`/api/views?slug=${encodeURIComponent(articleSlug)}`)
      .then(res => res.json())
      .then(data => {
        if (data.views !== undefined) {
          setViews(data.views)
        }
      })
      .catch(() => {
        // Silencioso si falla
      })
  }, [slug])

  if (views === null) return null

  return (
    <span className="inline-flex items-center gap-1">
      <i className="fas fa-eye" />
      <span>{views}</span>
    </span>
  )
}
