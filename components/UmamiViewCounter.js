import { useEffect, useState } from 'react'

/**
 * Contador de vistas de un artículo específico usando Umami
 * Recibe href (ej: /article/example-1) o slug (ej: example-1)
 */
export default function UmamiViewCounter ({ slug, href }) {
  const [views, setViews] = useState(null)

  useEffect(() => {
    // Usar href si está disponible (ya tiene la ruta completa correcta)
    // si no, construir desde slug
    let articlePath = href || slug
    if (!articlePath) return

    // Asegurar que empieza con /
    if (!articlePath.startsWith('/')) {
      articlePath = '/' + articlePath
    }

    // Evitar doble prefijo /article/article/
    if (articlePath.includes('/article/article/')) {
      articlePath = articlePath.replace('/article/article/', '/article/')
    }

    fetch(`/api/views?type=page&slug=${encodeURIComponent(articlePath)}`)
      .then(r => r.json())
      .then(data => { if (data.views !== undefined) setViews(data.views) })
      .catch(() => {})
  }, [slug, href])

  if (views === null) return null

  return (
    <span className='inline-flex items-center gap-1 text-gray-500 dark:text-gray-400'>
      <i className='fas fa-eye text-xs' />
      <span className='text-xs'>{views}</span>
    </span>
  )
}
