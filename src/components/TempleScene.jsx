import { useEffect, useLayoutEffect, useMemo, useRef, forwardRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { makeStone, makeStripes, makeWood, makeFlame, makeGlow, makeSky } from '../lib/textures.js'

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (x) => x * x * (3 - 2 * x)

/* ───────── shared materials / textures (built once) ───────── */
let cache
function mats() {
  if (cache) return cache
  const std = (o) => new THREE.MeshStandardMaterial(o)
  cache = {
    stone: std({ map: makeStone([188, 156, 118], 2, 1.5), roughness: 0.93 }),
    stoneLight: std({ map: makeStone([216, 196, 160], 2, 1.5, false), roughness: 0.9 }),
    stoneDark: std({ map: makeStone([118, 98, 80], 3, 2), roughness: 0.95 }),
    floor: std({ map: makeStone([158, 134, 108], 6, 8), roughness: 0.48, metalness: 0.05 }),
    ground: std({ map: makeStone([128, 110, 92], 24, 24), roughness: 1 }),
    stripes: std({ map: makeStripes(6, 1), roughness: 0.95 }),
    wood: std({ map: makeWood(), roughness: 0.65 }),
    brass: std({ color: '#d4a345', metalness: 1, roughness: 0.25, envMapIntensity: 1.5 }),
    brassDk: std({ color: '#8d6523', metalness: 1, roughness: 0.4, envMapIntensity: 1.2 }),
    oil: std({ color: '#2a1608', roughness: 0.2, metalness: 0.3 }),
    wick: std({ color: '#1a1008', roughness: 1 }),
    niche: std({ color: '#17100a', roughness: 1 }),
    petalA: std({ color: '#f08a1c', roughness: 0.8 }),
    flameTex: makeFlame(),
    glowTex: makeGlow(),
  }
  return cache
}

/* ───────── scene setup: environment, sky, fog, lit progress ───────── */
function Setup({ litRef, lit, reduced }) {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl)
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.background = makeSky()
    scene.fog = new THREE.Fog('#d19a72', 28, 80)
    return () => { pm.dispose(); env.dispose(); scene.environment = null }
  }, [gl, scene])

  useFrame((_, dt) => {
    const target = lit ? 1 : 0
    const cur = litRef.current
    const step = dt / (reduced ? 0.05 : 1.8)
    litRef.current = cur < target ? Math.min(target, cur + step) : Math.max(target, cur - step)
    const l = smooth(litRef.current)
    scene.environmentIntensity = 0.3 + 0.4 * l
    gl.toneMappingExposure = 0.92 + 0.22 * l
  })
  return null
}

/* ───────── camera rig: doors view → walk inside → lamp view ───────── */
function Rig({ stage, reduced }) {
  const { camera, size } = useThree()
  const aspect = size.width / size.height
  const look = useRef(new THREE.Vector3())
  const pose = useMemo(() => {
    const z = Math.max(13, 6.2 / aspect)
    return {
      out: { p: new THREE.Vector3(0, 1.6, z), l: new THREE.Vector3(0, 5.6, 0) },
      inn: { p: new THREE.Vector3(0, 1.65, -1.8), l: new THREE.Vector3(0, 1.3, -6.6) },
      inv: { p: new THREE.Vector3(0, 1.7, -2.5), l: new THREE.Vector3(0, 2.7, -6.6) },
    }
  }, [aspect])

  useLayoutEffect(() => {
    camera.position.copy(pose.out.p)
    look.current.copy(pose.out.l)
    camera.lookAt(look.current)
    // eslint-disable-next-line
  }, [])

  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((s, dt) => {
    const inside = ['entering', 'lamp', 'lit', 'invite'].includes(stage)
    const k = stage === 'invite' ? pose.inv : inside ? pose.inn : pose.out
    const rate = stage === 'entering' ? 1.0 : 1.4
    const f = reduced ? 1 : 1 - Math.exp(-dt * rate)
    tmp.copy(k.p)
    if (!inside && !reduced) tmp.x += Math.sin(s.clock.elapsedTime * 0.35) * 0.18
    camera.position.lerp(tmp, f)
    look.current.lerp(k.l, f)
    camera.lookAt(look.current)
  })
  return null
}

/* ───────── lights (the interior warms up as the lamp is lit) ───────── */
function Lights({ litRef }) {
  const hemi = useRef(), a = useRef(), b = useRef()
  useFrame(() => {
    const l = smooth(litRef.current)
    hemi.current.intensity = 0.3 + 0.35 * l
    a.current.intensity = 20 * l
    b.current.intensity = 20 * l
  })
  return (
    <>
      <hemisphereLight ref={hemi} args={['#7d8cc0', '#3a2a22', 0.3]} />
      <pointLight position={[-4, 4.5, 7]} color="#ffb472" intensity={90} distance={13} decay={2} />
      <pointLight position={[3.5, 3, 5]} color="#ffcf9a" intensity={30} distance={10} decay={2} />
      <pointLight ref={a} position={[0, 3.8, -4]} color="#ffb061" intensity={0} distance={14} decay={2} />
      <pointLight ref={b} position={[0, 3.8, -9.5]} color="#ffb061" intensity={0} distance={14} decay={2} />
      <pointLight position={[0, 2, -14.5]} color="#ff9a3a" intensity={14} distance={9} decay={2} />
    </>
  )
}

/* ───────── gopuram facade ───────── */
function Facade() {
  const m = mats()
  const tiers = useMemo(
    () => [...Array(6)].map((_, i) => ({ i, w: 5.8 - i * 0.85, d: 2 - i * 0.22, y: 3.95 + i * 1.15, h: 1 })),
    []
  )
  const top = tiers[5]
  return (
    <group>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 20]} material={m.ground}>
        <planeGeometry args={[90, 90]} />
      </mesh>
      {/* entrance steps */}
      <mesh position={[0, 0.07, 1.55]} material={m.stoneLight}><boxGeometry args={[3.6, 0.14, 0.7]} /></mesh>
      <mesh position={[0, 0.035, 2.1]} material={m.stoneLight}><boxGeometry args={[4.0, 0.07, 0.5]} /></mesh>

      {/* pylons with carved niches */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 2.3, 0, 0]}>
          <mesh position={[0, 1.95, 0]} material={m.stone}><boxGeometry args={[2.2, 3.9, 2.4]} /></mesh>
          <mesh position={[0, 0.18, 1.2]} material={m.stoneLight}><boxGeometry args={[2.4, 0.36, 0.22]} /></mesh>
          <mesh position={[0, 3.72, 1.2]} material={m.stoneLight}><boxGeometry args={[2.4, 0.14, 0.22]} /></mesh>
          <mesh position={[0, 3.45, 1.2]} material={m.stoneLight}><boxGeometry args={[2.3, 0.06, 0.12]} /></mesh>
          <mesh position={[0, 2.0, 1.2]} material={m.stoneLight}><boxGeometry args={[1.1, 1.9, 0.04]} /></mesh>
          <mesh position={[0, 2.0, 1.21]} material={m.niche}><boxGeometry args={[0.92, 1.7, 0.05]} /></mesh>
          <mesh position={[0, 1.55, 1.25]} material={m.stoneLight}><capsuleGeometry args={[0.15, 0.55, 4, 8]} /></mesh>
          <mesh position={[0, 2.2, 1.25]} material={m.stoneLight}><sphereGeometry args={[0.13, 10, 8]} /></mesh>
          {[-0.95, 0.95].map((x) => (
            <mesh key={x} position={[x, 1.9, 1.2]} material={m.stoneLight}><boxGeometry args={[0.1, 3.4, 0.16]} /></mesh>
          ))}
        </group>
      ))}
      {/* lintel over the doorway */}
      <mesh position={[0, 3.55, 0]} material={m.stone}><boxGeometry args={[2.6, 0.7, 2.4]} /></mesh>
      <mesh position={[0, 3.2, 0.9]} material={m.wood}><boxGeometry args={[2.5, 0.12, 0.3]} /></mesh>

      {/* gopuram tiers */}
      {tiers.map((t) => {
        const n = Math.max(2, Math.floor(t.w / 1.1))
        const sp = (t.w - 0.6) / n
        return (
          <group key={t.i}>
            <mesh position={[0, t.y + 0.06, 0]} material={m.stoneLight}><boxGeometry args={[t.w + 0.2, 0.12, t.d + 0.15]} /></mesh>
            <mesh position={[0, t.y + t.h / 2, 0]} material={t.i % 2 ? m.stoneLight : m.stone}><boxGeometry args={[t.w, t.h, t.d]} /></mesh>
            <mesh position={[0, t.y + t.h + 0.07, 0]} material={m.stoneLight}><boxGeometry args={[t.w + 0.4, 0.14, t.d + 0.3]} /></mesh>
            {[...Array(n)].map((_, k) => {
              const x = -t.w / 2 + 0.3 + sp * (k + 0.5)
              return (
                <group key={k} position={[x, t.y + 0.5, t.d / 2]}>
                  <mesh material={m.stoneLight}><boxGeometry args={[0.66, 0.74, 0.05]} /></mesh>
                  <mesh position={[0, 0, 0.015]} material={m.niche}><boxGeometry args={[0.52, 0.6, 0.05]} /></mesh>
                  <mesh position={[0, -0.08, 0.04]} material={m.stoneLight}><capsuleGeometry args={[0.1, 0.2, 4, 8]} /></mesh>
                  <mesh position={[0, 0.16, 0.04]} material={m.stoneLight}><sphereGeometry args={[0.07, 8, 6]} /></mesh>
                </group>
              )
            })}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * (t.w / 2 - 0.05), t.y + 0.5, t.d / 2 + 0.03]} material={m.stoneLight}>
                <boxGeometry args={[0.14, t.h, 0.1]} />
              </mesh>
            ))}
          </group>
        )
      })}
      {/* barrel-vault crown and golden kalasams */}
      <mesh position={[0, top.y + top.h + 0.14, 0]} rotation={[0, 0, Math.PI / 2]} material={m.stone}>
        <cylinderGeometry args={[0.5, 0.5, top.w + 0.2, 24]} />
      </mesh>
      {[-0.55, 0, 0.55].map((x) => (
        <mesh key={x} position={[x, top.y + top.h + 0.62, 0]} material={m.brass} scale={[1, 1, 1]}>
          <latheGeometry args={[[[0.001, 0], [0.12, 0.02], [0.16, 0.12], [0.1, 0.24], [0.14, 0.34], [0.05, 0.46], [0.001, 0.56]].map(([a, b]) => new THREE.Vector2(a, b)), 20]} />
        </mesh>
      ))}

      {/* compound walls with the traditional red-and-white stripes */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 9.2, 1.2, 0]} material={m.stripes}><boxGeometry args={[11.6, 2.4, 1.2]} /></mesh>
          <mesh position={[s * 9.2, 2.5, 0]} material={m.stoneLight}><boxGeometry args={[11.8, 0.2, 1.4]} /></mesh>
          <mesh position={[s * 9.2, 0.12, 0]} material={m.stoneLight}><boxGeometry args={[11.8, 0.24, 1.4]} /></mesh>
        </group>
      ))}
    </group>
  )
}

/* ───────── doors ───────── */
function Studs() {
  const ref = useRef()
  const { brass } = mats()
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    let k = 0
    for (let ix = 0; ix < 4; ix++)
      for (let iy = 0; iy < 10; iy++) {
        m.makeTranslation(-0.45 + ix * 0.3, -1.35 + iy * 0.3, 0.085)
        ref.current.setMatrixAt(k++, m)
      }
    ref.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 40]} material={brass}>
      <sphereGeometry args={[0.042, 10, 8]} />
    </instancedMesh>
  )
}

const Panel = forwardRef(function Panel({ side }, ref) {
  const { wood, brass } = mats()
  return (
    <group ref={ref} position={[side * 1.2, 0, 0]}>
      <group position={[-side * 0.6, 1.6, 0]}>
        <mesh material={wood}><boxGeometry args={[1.2, 3.2, 0.14]} /></mesh>
        {[-1.15, 0, 1.15].map((y) => (
          <mesh key={y} position={[0, y, 0.01]} material={brass}><boxGeometry args={[1.22, 0.1, 0.17]} /></mesh>
        ))}
        <Studs />
        <mesh position={[-side * 0.44, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]} material={brass}>
          <cylinderGeometry args={[0.13, 0.13, 0.05, 20]} />
        </mesh>
        <mesh position={[-side * 0.44, -0.08, 0.14]} material={brass}><torusGeometry args={[0.1, 0.016, 8, 24]} /></mesh>
      </group>
    </group>
  )
})

function Doors({ open, onTap, reduced }) {
  const L = useRef(), R = useRef(), ang = useRef(0)
  useFrame((_, dt) => {
    const tgt = open ? 1.45 : 0
    ang.current += (tgt - ang.current) * (reduced ? 1 : 1 - Math.exp(-dt * 2.4))
    L.current.rotation.y = ang.current
    R.current.rotation.y = -ang.current
  })
  const handlers = open
    ? {}
    : {
        onClick: (e) => { e.stopPropagation(); onTap() },
        onPointerOver: () => (document.body.style.cursor = 'pointer'),
        onPointerOut: () => (document.body.style.cursor = ''),
      }
  return (
    <group position={[0, 0, 0.45]} {...handlers}>
      <Panel ref={L} side={-1} />
      <Panel ref={R} side={1} />
    </group>
  )
}

/* ───────── interior: floor, walls, pillars, sanctum glow ───────── */
function Pillar({ x, z }) {
  const m = mats()
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.25, 0]} material={m.stone}><boxGeometry args={[0.8, 0.5, 0.8]} /></mesh>
      <mesh position={[0, 0.56, 0]} material={m.stoneLight}><boxGeometry args={[0.6, 0.14, 0.6]} /></mesh>
      <mesh position={[0, 2.4, 0]} material={m.stone}><cylinderGeometry args={[0.22, 0.26, 3.6, 20]} /></mesh>
      {[1.1, 2.0, 3.3].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.stoneLight}>
          <torusGeometry args={[0.25, 0.045, 8, 24]} />
        </mesh>
      ))}
      <mesh position={[0, 4.35, 0]} material={m.stoneLight}><boxGeometry args={[0.9, 0.3, 0.9]} /></mesh>
    </group>
  )
}

function Interior() {
  const m = mats()
  const { glowTex } = mats()
  const glowMat = useMemo(
    () => new THREE.SpriteMaterial({ map: glowTex, color: '#ff9d3c', blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8, depthWrite: false }),
    [glowTex]
  )
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -7.4]} material={m.floor}><planeGeometry args={[12.4, 17.2]} /></mesh>
      <mesh position={[0, 4.9, -8.7]} material={m.stoneDark}><boxGeometry args={[12.8, 0.3, 15]} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 6.2, 2.45, -8.7]} material={m.stoneDark}><boxGeometry args={[0.4, 4.9, 15]} /></mesh>
          <mesh position={[s * 3.7, 2.45, -1.4]} material={m.stoneDark}><boxGeometry args={[4.8, 4.9, 0.4]} /></mesh>
          {[-3.6, -6.6, -9.6, -12.6].map((z) => <Pillar key={z} x={s * 3.2} z={z} />)}
        </group>
      ))}
      {[-3.6, -6.6, -9.6, -12.6].map((z) => (
        <mesh key={z} position={[0, 4.62, z]} material={m.wood}><boxGeometry args={[12, 0.35, 0.5]} /></mesh>
      ))}
      <mesh position={[0, 2.45, -16.3]} material={m.stoneDark}><boxGeometry args={[12.8, 4.9, 0.4]} /></mesh>
      {/* sanctum doorway glow */}
      <mesh position={[0, 1.7, -16.05]} material={m.niche}><boxGeometry args={[2.4, 3.4, 0.1]} /></mesh>
      <sprite position={[0, 1.8, -15.9]} scale={[5, 5, 1]} material={glowMat} />
    </group>
  )
}

/* ───────── the brass kuthu vilakku ───────── */
const V = (a) => a.map(([x, y]) => new THREE.Vector2(x, y))
function Lamp({ position = [0, 0, 0], scale = 1, always = false, litRef, interactive = false, onLight, intensity = 22 }) {
  const m = mats()
  const { flameTex, glowTex, brass, brassDk, oil, wick } = m
  const geo = useMemo(
    () =>
      new THREE.LatheGeometry(
        V([
          [0.001, 0], [0.44, 0], [0.465, 0.03], [0.455, 0.07], [0.4, 0.1], [0.33, 0.15], [0.24, 0.22], [0.17, 0.3],
          [0.15, 0.36], [0.175, 0.42], [0.13, 0.48], [0.1, 0.52], [0.1, 0.56], [0.19, 0.6], [0.225, 0.64], [0.19, 0.68],
          [0.1, 0.72], [0.09, 0.8], [0.13, 0.84], [0.13, 0.88], [0.09, 0.92], [0.09, 1.0], [0.16, 1.03], [0.3, 1.06],
          [0.4, 1.09], [0.425, 1.12], [0.4, 1.15], [0.28, 1.14], [0.1, 1.125], [0.001, 1.12],
        ]),
        64
      ),
    []
  )
  const fin = useMemo(() => new THREE.LatheGeometry(V([[0.001, 0], [0.05, 0.02], [0.075, 0.08], [0.045, 0.15], [0.001, 0.2]]), 20), [])
  const spouts = useMemo(
    () => [...Array(5)].map((_, i) => { const a = (i / 5) * Math.PI * 2 + Math.PI / 2; return { x: Math.cos(a) * 0.34, z: Math.sin(a) * 0.34 } }),
    []
  )
  const sm = (o) => new THREE.SpriteMaterial({ blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, ...o })
  const flameMats = useMemo(() => spouts.map(() => sm({ map: flameTex })), [])
  const glowMats = useMemo(() => spouts.map(() => sm({ map: glowTex, color: '#ff9a3c' })), [])
  const haloMat = useMemo(() => sm({ map: glowTex, color: '#ffb55a' }), [])
  const hintMat = useMemo(() => sm({ map: glowTex, color: '#fff0c8' }), [])
  const flames = useRef([]), glows = useRef([]), light = useRef(), halo = useRef(), hint = useRef()

  useFrame((s) => {
    const t = s.clock.elapsedTime
    let avg = 0
    spouts.forEach((_, i) => {
      const g = always ? 1 : smooth(clamp((litRef.current - 0.08 - i * 0.1) / 0.35))
      avg += g / 5
      const fl = 1 + 0.09 * Math.sin(t * 14 + i * 2.1) + 0.05 * Math.sin(t * 27 + i * 4.3) + 0.03 * Math.sin(t * 41 + i)
      flames.current[i].scale.set(0.085 * g * (1 + 0.04 * Math.sin(t * 9 + i)), 0.21 * g * fl, 1)
      flameMats[i].opacity = g
      glows.current[i].scale.setScalar(0.5 * g * (0.95 + 0.05 * fl))
      glowMats[i].opacity = 0.4 * g
    })
    const f2 = 1 + 0.06 * Math.sin(t * 13) + 0.04 * Math.sin(t * 29 + 1)
    light.current.intensity = intensity * avg * f2
    halo.current.scale.setScalar(3.2)
    haloMat.opacity = 0.3 * avg
    const showHint = interactive && litRef.current < 0.01
    hintMat.opacity = showHint ? 0.3 + 0.2 * Math.sin(t * 2.6) : 0
    hint.current.scale.setScalar(0.9 + 0.1 * Math.sin(t * 2.6))
  })

  const handlers = interactive
    ? {
        onClick: (e) => { e.stopPropagation(); onLight() },
        onPointerOver: () => (document.body.style.cursor = 'pointer'),
        onPointerOut: () => (document.body.style.cursor = ''),
      }
    : {}

  return (
    <group position={position} scale={scale} {...handlers}>
      <mesh geometry={geo} material={brass} />
      <mesh position={[0, 1.122, 0]} rotation={[-Math.PI / 2, 0, 0]} material={oil}><circleGeometry args={[0.27, 32]} /></mesh>
      <mesh geometry={fin} material={brassDk} position={[0, 1.12, 0]} />
      {spouts.map((p, i) => (
        <group key={i} position={[p.x, 1.12, p.z]}>
          <mesh material={brass} position={[0, 0.05, 0]}><cylinderGeometry args={[0.035, 0.05, 0.1, 12]} /></mesh>
          <mesh material={wick} position={[0, 0.12, 0]}><cylinderGeometry args={[0.009, 0.009, 0.06, 6]} /></mesh>
          <sprite ref={(el) => (glows.current[i] = el)} position={[0, 0.2, 0]} material={glowMats[i]} />
          <sprite ref={(el) => (flames.current[i] = el)} position={[0, 0.15, 0]} center={[0.5, 0.05]} material={flameMats[i]} />
        </group>
      ))}
      <pointLight ref={light} position={[0, 1.45, 0]} color="#ffb257" distance={14} decay={2} intensity={0} />
      <sprite ref={halo} position={[0, 1.3, 0]} material={haloMat} />
      <sprite ref={hint} position={[0, 1.3, 0]} material={hintMat} />
      {interactive && (
        <mesh position={[0, 1.15, 0]} visible={false}>
          <sphereGeometry args={[0.62, 8, 8]} />
          <meshBasicMaterial />
        </mesh>
      )}
    </group>
  )
}

function Flowers({ count = 38, y = 0.6, r0 = 0.52, r1 = 0.7 }) {
  const ref = useRef()
  const { petalA } = mats()
  useLayoutEffect(() => {
    const mx = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color()
    const cols = ['#f08a1c', '#f5b324', '#e86a10', '#f7c948']
    for (let i = 0; i < count; i++) {
      const a = (i / count) * 6.283 + Math.random() * 0.2
      const r = r0 + Math.random() * (r1 - r0)
      e.set(Math.random() * 0.6 - 0.3, Math.random() * 6, Math.random() * 0.6 - 0.3)
      q.setFromEuler(e)
      mx.compose(new THREE.Vector3(Math.cos(a) * r, y + Math.random() * 0.03, Math.sin(a) * r), q, new THREE.Vector3(1, 0.5, 1))
      ref.current.setMatrixAt(i, mx)
      ref.current.setColorAt(i, c.set(cols[i % cols.length]))
    }
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor.needsUpdate = true
  }, [count, y, r0, r1])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={petalA}>
      <sphereGeometry args={[0.085, 10, 8]} />
    </instancedMesh>
  )
}

function Altar({ litRef, interactive, onLight }) {
  const m = mats()
  return (
    <group position={[0, 0, -6.6]}>
      <mesh position={[0, 0.25, 0]} material={m.stone}><boxGeometry args={[1.3, 0.5, 1.3]} /></mesh>
      <mesh position={[0, 0.54, 0]} material={m.stoneLight}><boxGeometry args={[1.5, 0.08, 1.5]} /></mesh>
      <Flowers y={0.6} />
      <Lamp position={[0, 0.58, 0]} scale={1.25} litRef={litRef} interactive={interactive} onLight={onLight} intensity={22} />
    </group>
  )
}

function EntranceLamps({ litRef }) {
  return (
    <>
      {[-1, 1].map((s) => (
        <Lamp key={s} position={[s * 2.7, 0, 2.5]} scale={0.85} always litRef={litRef} intensity={9} />
      ))}
    </>
  )
}

export default function TempleScene({ stage, onDoors, onLamp, reduced }) {
  const litRef = useRef(0)
  const open = stage !== 'doors'
  const lit = stage === 'lit' || stage === 'invite'
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 120, position: [0, 1.6, 14] }}
      aria-hidden="true"
    >
      <Setup litRef={litRef} lit={lit} reduced={reduced} />
      <Rig stage={stage} reduced={reduced} />
      <Lights litRef={litRef} />
      <Facade />
      <Doors open={open} onTap={onDoors} reduced={reduced} />
      <Interior />
      <EntranceLamps litRef={litRef} />
      <Altar litRef={litRef} interactive={stage === 'lamp'} onLight={onLamp} />
    </Canvas>
  )
}
