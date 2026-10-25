import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { wedding, wishes } from '../data/weddingDetails.js'

export default function BlessingLetter() {
  const reduced = useReducedMotion()
  const [opened, setOpened] = useState(false)
  const [showLetter, setShowLetter] = useState(false)
  const [mode, setMode] = useState('own') // 'own' | 'pick'
  const [own, setOwn] = useState('')
  const [idx, setIdx] = useState(null)
  const [pick, setPick] = useState('')
  const [name, setName] = useState('')
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  const openEnvelope = () => {
    setOpened(true)
    setTimeout(() => setShowLetter(true), reduced ? 0 : 1100)
  }
  const pickAnother = () => {
    let n
    do { n = Math.floor(Math.random() * wishes.length) } while (n === idx && wishes.length > 1)
    setIdx(n)
    setPick(wishes[n].text)
    setSent(false)
  }
  const choose = (m) => {
    setMode(m)
    if (m === 'pick' && idx === null) pickAnother()
  }

  const text = mode === 'own' ? own : pick
  const message = `${text.trim()}\n\n— ${name.trim() || 'A well-wisher'}`
  const canSend = text.trim().length > 0
  const onChange = (v) => { mode === 'own' ? setOwn(v) : setPick(v); setSent(false) }

  const send = () => {
    if (!canSend) return
    const num = wedding.contact.whatsappNumber.replace(/\D/g, '')
    const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setSent(true)
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* ignore */ }
  }

  return (
    <section id="wish" className="sec sec-letter" aria-labelledby="letter-title">
      <div className="wrap">
        <AnimatePresence mode="wait">
          {!showLetter ? (
            <motion.div key="env" className="env-stage" exit={{ opacity: 0, y: 30, scale: 0.96 }} transition={{ duration: 0.5 }}>
              <h2 id="letter-title" className="h2 h2-light">A letter for you to open</h2>
              <button className={`env ${opened ? 'is-open' : ''}`} onClick={openEnvelope} disabled={opened} aria-label="Open the letter">
                <span className="env-back" />
                <span className="env-paper" />
                <span className="env-l" /><span className="env-r" /><span className="env-b" />
                <span className="env-flap" />
                <span className="env-seal">A&amp;S</span>
              </button>
              <p className="env-hint">Tap the envelope to open</p>
            </motion.div>
          ) : (
            <motion.div key="letter" className="paper" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h2 id="letter-title" className="paper-title">Leave a little love for Ashwin &amp; Swathi</h2>

              <label className="field-label" htmlFor="guest-name">Your name <em>(optional)</em></label>
              <input id="guest-name" className="input" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Aunty Lakshmi" />

              <div className="toggle" role="radiogroup" aria-label="How would you like to write your wish?">
                <button role="radio" aria-checked={mode === 'own'} className={mode === 'own' ? 'on' : ''} onClick={() => choose('own')}>Write my own</button>
                <button role="radio" aria-checked={mode === 'pick'} className={mode === 'pick' ? 'on' : ''} onClick={() => choose('pick')}>Pick a message for me</button>
              </div>

              {mode === 'pick' && idx !== null && <p className="wish-title">{wishes[idx].title}</p>}
              <textarea
                className="textarea"
                rows={6}
                maxLength={400}
                value={text}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Write your heartfelt wishes here…"
                aria-label="Your wish for Ashwin and Swathi"
              />
              <div className="under">
                {mode === 'pick' ? (
                  <button type="button" className="link" onClick={pickAnother}>↻ Pick another wish</button>
                ) : <span />}
                <span className="count">{text.length}/400</span>
              </div>

              <button className="btn btn-send" onClick={send} disabled={!canSend}>Send your wishes</button>
              <button className="link link-soft" onClick={copy} disabled={!canSend}>{copied ? 'Copied ✓' : 'Copy message instead'}</button>
              {sent && (
                <p className="note" role="status">
                  WhatsApp has opened with your message ready. It is only delivered once you press Send there.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
