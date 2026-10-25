import { motion } from 'framer-motion'
import Editable from './Editable.jsx'
import { wedding } from '../data/weddingDetails.js'

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.9 } }

export default function MarriageHallDetails() {
  const { hall } = wedding
  const mapUrl =
    hall.mapLink ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hall.name} ${hall.city}`)}`
  return (
    <section id="celebrations" className="sec sec-hall" aria-labelledby="hall-title">
      <div className="wrap">
        <motion.div {...fade}>
          <p className="chip">The celebrations</p>
          <h2 id="hall-title" className="h2">At the Marriage Hall</h2>
          <p className="lede">The remaining rituals and celebrations take place at the marriage hall.</p>
        </motion.div>

        <motion.div id="location" className="block" {...fade}>
          <p className="hall-name">{hall.name}</p>
          <p className="hall-addr">
            {hall.address && <>{hall.address}<br /></>}
            {hall.city}
          </p>
          <a className="btn" href={mapUrl} target="_blank" rel="noopener noreferrer">
            Open map &amp; directions
          </a>
        </motion.div>

        <motion.div className="block" {...fade}>
          <h3 className="h3">Rituals &amp; celebrations</h3>
          {hall.schedule.length ? (
            <ul className="schedule">
              {hall.schedule.map((s, i) => (
                <li key={i}><span>{s.time}</span>{s.title}</li>
              ))}
            </ul>
          ) : (
            <p className="lede"><Editable value="" label="Detailed timings to be announced" /></p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
