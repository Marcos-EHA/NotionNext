import { useEffect, useState } from 'react'

/**
 * Contador de vistas de un artículo específico usando Umami
 * Muestra: 👁️ 42
 */
export default function UmamiViewCounter ({ slug }) {
  const [views, setViews] = useState(null)

  useEffect(() => {
    if (!slug) return
    const articleSlug = slug.startsWith('/') ? slug : `/article/${slug}`
    fetch(`/api/views?type=page&slug=${encodeURIComponent(articleSlug)}`)
      .then(r => r.json())
      .then(data => { if (data.views !== undefined) setViews(data.views) })
      .catch(() => {})
  }, [slug])

  if (views === null) return null

  return (
    <span className='inline-flex items-center gap-1 text-gray-500 dark:text-gray-400'>
      <i className='fas fa-eye text-xs' />
      <span className='text-xs'>{views}</span>
    </span>
  )
}
