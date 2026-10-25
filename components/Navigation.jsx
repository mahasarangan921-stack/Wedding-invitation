import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const items = [
  ['wedding', 'Wedding'],
  ['celebrations', 'Celebrations'],
  ['location', 'Location'],
  ['reception', 'Reception'],
  ['wish', 'Leave a Wish'],
]

export default function Navigation() {
  const [active, setActive] = useState('wedding')
  const reduced = useReducedMotion()
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    items.forEach(([id]) => { const el = document.getElementById(id); el && io.observe(el) })
    return () => io.disconnect()
  }, [])
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  return (
    <nav className="nav" aria-label="Invitation sections">
      {items.map(([id, label]) => (
        <button key={id} className={active === id ? 'on' : ''} aria-current={active === id ? 'true' : undefined} onClick={() => go(id)}>
          {label}
        </button>
      ))}
    </nav>
  )
}
