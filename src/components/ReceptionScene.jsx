import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Editable from './Editable.jsx'
import BlessingLetter from './BlessingLetter.jsx'
import { wedding } from '../data/weddingDetails.js'
import { longDate, weekday } from '../lib/format.js'

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.9 } }

/* Soft evening light: drifting bokeh + two swags of string lights */
function Lights() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    const g = c.getContext('2d')
    let w, h, dots, bulbs, raf
    const setup = () => {
      const rect = c.getBoundingClientRect()
      const d = Math.min(window.devicePixelRatio || 1, 2)
      w = c.width = Math.max(1, rect.width * d)
      h = c.height = Math.max(1, rect.height * d)
      dots = Array.from({ length: Math.round(rect.width / 36) }, () => ({
        x: Math.random() * w, y: h * (0.1 + Math.random() * 0.8), r: (8 + Math.random() * 26) * d, p: Math.random() * 6.28, s: 0.3 + Math.random() * 0.6,
      }))
      bulbs = []
      const n = Math.max(2, Math.round(rect.width / 260))
      for (let k = 0; k < n; k++) {
        const x0 = (k / n) * w, x1 = ((k + 1) / n) * w, sag = 60 * d, y0 = 10 * d
        const count = 9
        for (let i = 0; i <= count; i++) {
          const t = i / count
          bulbs.push({ x: x0 + (x1 - x0) * t, y: y0 + Math.sin(t * Math.PI) * sag, p: Math.random() * 6, r: 11 * d })
        }
      }
    }
    const draw = (t) => {
      g.clearRect(0, 0, w, h)
      for (const o of dots) {
        const a = 0.07 + 0.05 * Math.sin((t / 1800) * o.s + o.p)
        const gr = g.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r)
        gr.addColorStop(0, `rgba(255,214,140,${a * 2})`)
        gr.addColorStop(1, 'rgba(255,190,100,0)')
        g.fillStyle = gr
        g.beginPath(); g.arc(o.x, o.y, o.r, 0, 6.3); g.fill()
      }
      for (const b of bulbs) {
        const a = 0.75 + 0.2 * Math.sin(t / 900 + b.p)
        const gr = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2.4)
        gr.addColorStop(0, `rgba(255,236,180,${a})`)
        gr.addColorStop(0.25, `rgba(255,205,120,${a * 0.5})`)
        gr.addColorStop(1, 'rgba(255,190,100,0)')
        g.fillStyle = gr
        g.beginPath(); g.arc(b.x, b.y, b.r * 2.4, 0, 6.3); g.fill()
      }
      if (!reduced) raf = requestAnimationFrame(draw)
    }
    setup(); draw(0)
    const onResize = () => { setup(); if (reduced) draw(0) }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [reduced])
  return <canvas ref={ref} className="evening-lights" aria-hidden="true" />
}

export default function ReceptionScene() {
  const { reception } = wedding
  return (
    <div className="evening">
      <div className="sun" aria-hidden="true" />
      <Lights />
      <section id="reception" className="sec sec-reception" aria-labelledby="reception-title">
        <div className="wrap">
          <motion.div {...fade}>
            <p className="chip chip-light">The reception</p>
            <h2 id="reception-title" className="h2 h2-light">A Soft Evening Celebration</h2>
            <p className="reception-date">
              {longDate(reception.date)}
              <span>{weekday(reception.date)}</span>
            </p>
          </motion.div>
          <motion.dl className="facts facts-light" {...fade}>
            <div><dt>Venue</dt><dd><Editable value={reception.venue} label="Venue to be announced" /></dd></div>
            <div><dt>Time</dt><dd><Editable value={reception.time} label="Time to be announced" /></dd></div>
            <div><dt>Address</dt><dd><Editable value={reception.address} label="Address to be announced" /></dd></div>
          </motion.dl>
        </div>
      </section>
      <BlessingLetter />
    </div>
  )
}
