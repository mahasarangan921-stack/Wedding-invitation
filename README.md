# Ashwin & Swathi — Immersive Wedding Invitation

React + Vite + Framer Motion + React Three Fiber.
Temple doors → brass kuthu vilakku → invitation → marriage hall → evening reception → interactive letter.

## Run locally

```bash
npm install
npm run dev        # then open the URL it prints (usually http://localhost:5173)
npm run build      # production build in /dist
npm run preview    # preview the production build
```
Requires Node 18+.

## Edit the wedding details (one file only)

`src/data/weddingDetails.js`

Leave a value as `''` and the site shows a dashed "to be announced" placeholder.

| Still to fill in | Field |
|---|---|
| Murugan temple name | `ceremony.templeName` |
| Ceremony time | `ceremony.time` |
| **Google Maps share link for the hall** | `hall.mapLink` |
| Hall street address (optional) | `hall.address` |
| Hall rituals schedule (optional) | `hall.schedule` |
| Reception venue / time / address | `reception.venue`, `.time`, `.address` |
| WhatsApp number that receives wishes | `contact.whatsappNumber` (digits with country code, e.g. `919876543210`) |

If `hall.mapLink` is empty, the map button opens a Google Maps *search* for "Arya Vysya Satram Marriage Hall Kanchipuram" instead.
The six blessing messages are also in this file (`wishes`).

## Wishes / WhatsApp

"Send your wishes" opens a properly encoded `wa.me` link with the message prefilled. It is only delivered when the guest presses Send in WhatsApp; the page says so and never claims delivery. There is no server.

## Assets, honesty and licences

**There are no downloaded photos, stock images or 3D model files in this project.** Everything visible in the temple and lamp scene is generated at runtime:

- The gopuram, doors, pillars, interior and the five-wick brass kuthu vilakku are built from Three.js geometry (the lamp is a lathe-turned profile with a physically based brass material and an environment reflection).
- Stone, wood, stripe, flame and sky textures are painted procedurally on canvas (`src/lib/textures.js`).
- The reflection environment is Three.js's built-in `RoomEnvironment` (MIT).
- Fonts: Cinzel and Cormorant Garamond via `@fontsource` (SIL Open Font License), bundled locally.
- The sunset, evening lights and envelope are CSS / canvas.

This gives a lit, 3D, consistent look, but it is **stylised procedural 3D, not photographic realism**. For true photorealism, replace parts with a licensed/commissioned GLB model (a kuthu vilakku and a gopuram), loaded locally from `src/assets/models/` with `useGLTF` from `@react-three/drei`. Do not hotlink.
`src/assets/images`, `models` and `audio` are empty placeholders for that purpose.

## Structure

```
src/
  App.jsx                    intro ↔ main switching
  data/weddingDetails.js     ALL editable content
  lib/                       textures, date formatting
  components/
    TempleEntrance.jsx       stages, skip, welcome text
    TempleScene.jsx          3D temple, doors, interior, lamp, camera
    WeddingReveal.jsx        names/date revealed by the lamp light
    WeddingDetails.jsx  MarriageHallDetails.jsx  ReceptionScene.jsx
    BlessingLetter.jsx       envelope + wish writer
    Navigation.jsx           minimal floating section nav
  styles/                    global / entrance / wedding / reception / letter
```

## Accessibility & performance

Skip button, keyboard-accessible buttons for every 3D interaction, `prefers-reduced-motion` support (camera and doors snap), 44px+ touch targets, WebGL failure falls back straight to the invitation. The 3D chunk is lazy-loaded; the scene is rendered only during the intro and unmounted afterwards.
