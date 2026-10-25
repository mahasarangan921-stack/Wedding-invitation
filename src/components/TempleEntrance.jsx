import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/weddingDetails.js'
import WeddingReveal from './WeddingReveal.jsx'

const TempleScene = lazy(() => import('./TempleScene.jsx'))

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFail?.() }
  render() { return this.state.failed ? null : this.props.children }
}

export default function TempleEntrance({ onFinish }) {
  const [stage, setStage] = useState('doors') // doors → opening → entering → lamp → lit → invite
  const reduced = useReducedMotion()
  const timers = useRef([])
  const later = (ms, fn) => timers.current.push(setTimeout(fn, reduced ? Math.min(ms, 400) : ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const openDoors = () => {
    if (stage !== 'doors') return
    setStage('opening')
    later(900, () => setStage('entering'))
    later(3300, () => setStage('lamp'))
  }
  const lightLamp = () => {
    if (stage !== 'lamp') return
    setStage('lit')
    later(2600, () => setStage('invite'))
  }

  return (
    <motion.div className="entrance" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
      <div className="entrance-sky" />
      <Suspense fallback={null}>
        <SceneBoundary onFail={onFinish}>
          <motion.div className="canvas-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }}>
            <TempleScene stage={stage} onDoors={openDoors} onLamp={lightLamp} reduced={!!reduced} />
          </motion.div>
        </SceneBoundary>
      </Suspense>
      <div className={`scrim ${stage === 'doors' || stage === 'lamp' ? 'scrim-on' : ''} ${stage === 'invite' ? 'scrim-top' : ''}`} />

      <button className="skip" onClick={onFinish}>Skip intro</button>

      <AnimatePresence mode="wait">
        {stage === 'doors' && (
          <motion.div key="welcome" className="welcome" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 1, delay: 0.6 }}>
            <p className="welcome-text">
              {wedding.welcome.lines.map((l, i) => (<span key={i}>{l}<br /></span>))}
            </p>
            <p className="welcome-sig">{wedding.welcome.signature}</p>
            <button className="cta" onClick={openDoors}>Tap the doors to enter</button>
          </motion.div>
        )}
        {stage === 'lamp' && (
          <motion.div key="lamphint" className="welcome welcome-lamp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <button className="cta" onClick={lightLamp}>Tap the lamp to light it</button>
          </motion.div>
        )}
        {stage === 'invite' && <WeddingReveal key="reveal" onContinue={onFinish} />}
      </AnimatePresence>
    </motion.div>
  )
}
