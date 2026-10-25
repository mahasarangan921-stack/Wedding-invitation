import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import TempleEntrance from './components/TempleEntrance.jsx'
import Invitation from './components/Invitation.jsx'

export default function App() {
  const [phase, setPhase] = useState('intro')
  useEffect(() => {
    document.body.style.overflow = phase === 'intro' ? 'hidden' : ''
  }, [phase])
  const enter = () => {
    window.scrollTo(0, 0)
    setPhase('main')
  }
  return (
    <>
      {phase === 'main' && <Invitation />}
      <AnimatePresence>{phase === 'intro' && <TempleEntrance key="intro" onFinish={enter} />}</AnimatePresence>
    </>
  )
}
