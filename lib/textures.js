// Procedurally painted textures (generated in the browser, no downloads).
import * as THREE from 'three'

const r = (a, b) => a + Math.random() * (b - a)
const cv = (w, h) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}
const mk = (c, rx = 1, ry = 1) => {
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(rx, ry)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}
function speckle(g, w, h, n) {
  for (let i = 0; i < n; i++) {
    const v = r(-1, 1)
    g.fillStyle = v > 0 ? `rgba(255,244,222,${v * 0.16})` : `rgba(20,12,6,${-v * 0.22})`
    g.fillRect(r(0, w), r(0, h), r(1, 6), r(1, 4))
  }
}

export function makeStone(base, rx = 1, ry = 1, blocks = true) {
  const c = cv(512, 512)
  const g = c.getContext('2d')
  g.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`
  g.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(${r(0, 1) > 0.5 ? '255,235,200' : '30,20,10'},${r(0.02, 0.07)})`
    g.fillRect(r(0, 512), r(0, 512), r(40, 160), r(30, 120))
  }
  speckle(g, 512, 512, 9000)
  if (blocks) {
    g.strokeStyle = 'rgba(30,20,12,.5)'
    g.lineWidth = 3
    for (let y = 0; y < 512; y += 128) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke()
      const off = (y / 128) % 2 ? 0 : 128
      for (let x = off; x < 512; x += 256) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 128); g.stroke() }
    }
  }
  return mk(c, rx, ry)
}

export function makeStripes(rx = 1, ry = 1) {
  const c = cv(512, 256)
  const g = c.getContext('2d')
  const n = 4, w = 512 / n
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? '#eadcbd' : '#b04a2e'; g.fillRect(i * w, 0, w, 256) }
  speckle(g, 512, 256, 7000)
  return mk(c, rx, ry)
}

export function makeWood() {
  const c = cv(256, 512)
  const g = c.getContext('2d')
  g.fillStyle = '#4b2a14'
  g.fillRect(0, 0, 256, 512)
  for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(${i % 2 ? '255,190,120' : '0,0,0'},.08)`; g.fillRect(i * 64, 0, 64, 512) }
  for (let i = 0; i < 260; i++) {
    g.strokeStyle = `rgba(${r(0, 1) > 0.5 ? '20,10,4' : '150,95,50'},${r(0.05, 0.18)})`
    g.lineWidth = r(0.5, 2)
    const x = r(0, 256)
    g.beginPath(); g.moveTo(x, 0)
    g.bezierCurveTo(x + r(-6, 6), 170, x + r(-6, 6), 340, x + r(-4, 4), 512)
    g.stroke()
  }
  g.strokeStyle = 'rgba(15,8,3,.7)'; g.lineWidth = 3
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 512); g.stroke() }
  g.strokeStyle = 'rgba(255,200,130,.18)'; g.lineWidth = 4
  g.strokeRect(14, 18, 228, 230); g.strokeRect(14, 264, 228, 230)
  const t = mk(c)
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
  return t
}

export function makeFlame() {
  const c = cv(128, 256)
  const g = c.getContext('2d')
  g.shadowColor = 'rgba(255,140,30,.9)'
  g.shadowBlur = 22
  const gr = g.createLinearGradient(0, 14, 0, 238)
  gr.addColorStop(0, 'rgba(255,160,50,0)')
  gr.addColorStop(0.25, 'rgba(255,165,55,.85)')
  gr.addColorStop(0.6, 'rgba(255,212,105,1)')
  gr.addColorStop(0.9, 'rgba(255,248,215,1)')
  gr.addColorStop(1, 'rgba(130,160,255,.75)')
  g.beginPath()
  g.moveTo(64, 14)
  g.bezierCurveTo(78, 70, 104, 120, 98, 168)
  g.bezierCurveTo(94, 212, 78, 236, 64, 238)
  g.bezierCurveTo(50, 236, 34, 212, 30, 168)
  g.bezierCurveTo(24, 120, 50, 70, 64, 14)
  g.closePath()
  g.fillStyle = gr
  g.fill()
  g.shadowBlur = 0
  const core = g.createRadialGradient(64, 195, 2, 64, 190, 40)
  core.addColorStop(0, 'rgba(255,255,255,.95)')
  core.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = core
  g.fillRect(0, 130, 128, 126)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function makeGlow() {
  const c = cv(128, 128)
  const g = c.getContext('2d')
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  gr.addColorStop(0, 'rgba(255,255,255,1)')
  gr.addColorStop(0.25, 'rgba(255,255,255,.4)')
  gr.addColorStop(0.6, 'rgba(255,255,255,.08)')
  gr.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = gr
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function makeSky() {
  const c = cv(8, 256)
  const g = c.getContext('2d')
  const gr = g.createLinearGradient(0, 0, 0, 256)
  gr.addColorStop(0, '#1d2954')
  gr.addColorStop(0.35, '#5f5688')
  gr.addColorStop(0.62, '#d27f68')
  gr.addColorStop(0.85, '#f3b178')
  gr.addColorStop(1, '#ffd9a2')
  g.fillStyle = gr
  g.fillRect(0, 0, 8, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
