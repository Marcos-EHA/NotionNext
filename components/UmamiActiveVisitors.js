import { useEffect, useState } from 'react'

/**
 * Muestra los visitantes activos en tiempo real
 * Se actualiza cada 30 segundos
 */
export default function UmamiActiveVisitors () {
  const [active, setActive] = useState(null)

  const fetchActive = () => {
    fetch('/api/views?type=active')
      .then(r => r.json())
      .then(data => {
        const count = Number(data?.active)
        if (!isNaN(count)) setActive(count)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchActive()
    const interval = setInterval(fetchActive, 30000)
    return () => clearInterval(interval)
  }, [])

  if (active === null) return null

  return (
    <span className='inline-flex items-center gap-1 text-xs text-green-500'>
      <span className='relative flex h-2 w-2'>
        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
        <span className='relative inline-flex rounded-full h-2 w-2 bg-green-500'></span>
      </span>
      <span>{active}</span>
    </span>
  )
}
