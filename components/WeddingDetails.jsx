import { motion } from 'framer-motion'
import Names from './Names.jsx'
import Editable from './Editable.jsx'
import { wedding } from '../data/weddingDetails.js'
import { longDate, weekday } from '../lib/format.js'

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.9 } }

export default function WeddingDetails() {
  const { groom, bride, ceremony } = wedding
  return (
    <section id="wedding" className="sec" aria-labelledby="wedding-title">
      <div className="wrap">
        <motion.p className="eyebrow" {...fade}>The wedding of</motion.p>
        <motion.div {...fade}><Names /></motion.div>
        <motion.p className="date-line" {...fade}>
          {longDate(ceremony.date)}
          <span>{weekday(ceremony.date)} · {ceremony.city}</span>
        </motion.p>
        <div className="rule" />

        <motion.div className="families" {...fade}>
          <div>
            <h2 className="who">{groom.fullName}</h2>
            <p className="parents">Son of<br />{groom.parents[0]}<br />{groom.parents[1]}</p>
          </div>
          <div>
            <h2 className="who">{bride.fullName}</h2>
            <p className="parents">Daughter of<br />{bride.parents[0]}<br />{bride.parents[1]}</p>
          </div>
        </motion.div>

        <motion.div className="block" {...fade}>
          <p className="chip">The marriage ceremony</p>
          <h2 id="wedding-title" className="h2">At the Murugan Temple</h2>
          <p className="lede">The sacred marriage takes place at a Murugan temple in {ceremony.city}.</p>
          <dl className="facts">
            <div><dt>Date</dt><dd>{longDate(ceremony.date)}</dd></div>
            <div><dt>Temple</dt><dd><Editable value={ceremony.templeName} label="Temple name to be announced" /></dd></div>
            <div><dt>Ceremony time</dt><dd><Editable value={ceremony.time} label="Time to be announced" /></dd></div>
            <div><dt>Place</dt><dd>{ceremony.city}</dd></div>
          </dl>
        </motion.div>
      </div>
    </section>
  )
}
