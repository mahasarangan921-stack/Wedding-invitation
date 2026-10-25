import { motion } from 'framer-motion'
import WeddingDetails from './WeddingDetails.jsx'
import MarriageHallDetails from './MarriageHallDetails.jsx'
import ReceptionScene from './ReceptionScene.jsx'
import Navigation from './Navigation.jsx'

export default function Invitation() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <main>
        <div className="day">
          <div className="rays" aria-hidden="true" />
          <WeddingDetails />
          <MarriageHallDetails />
        </div>
        <ReceptionScene />
      </main>
      <Navigation />
    </motion.div>
  )
}
