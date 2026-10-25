import { motion } from 'framer-motion'
import Names from './Names.jsx'
import { wedding } from '../data/weddingDetails.js'
import { longDate } from '../lib/format.js'

export default function WeddingReveal({ onContinue }) {
  return (
    <motion.div className="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
      <motion.p className="eyebrow light" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}>
        Together with their families
      </motion.p>
      <motion.div initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ delay: 0.6, duration: 1.4 }}>
        <Names className="names-light" />
      </motion.div>
      <motion.p className="reveal-date" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }}>
        {longDate(wedding.ceremony.date)}
        <span>{wedding.ceremony.city}</span>
      </motion.p>
      <motion.button className="cta cta-solid" onClick={onContinue} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 0.8 }}>
        View the invitation
      </motion.button>
    </motion.div>
  )
}
