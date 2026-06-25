import { useEffect, useState } from 'react'

/**
 * Muestra los visitantes activos en tiempo real en el blog
 * Se actualiza cada 30 segundos
 * Muestra: 🟢 3 visitantes ahora
 */
export default function UmamiActiveVisitors () {
  const [active, setActive] = useState(null)

  const fetchActive = () => {
    fetch('/api/views?type=active')
      .then(r => r.json())
      .then(data => { if (data.active !== undefined) setActive(data.active) })
      .catch(() => {})
  }

  useEffect(() => {
    fetchActive()
    const interval = setInterval(fetchActive, 30000) // actualiza cada 30s
    return () => clearInterval(interval)
  }, [])

  if (active === null) return null

  return (
    <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 my-2'>
      <span className='relative flex h-2 w-2'>
        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
        <span className='relative inline-flex rounded-full h-2 w-2 bg-green-500'></span>
      </span>
      <span>{active} visitante{active !== 1 ? 's' : ''} ahora mismo</span>
    </div>
  )
}
