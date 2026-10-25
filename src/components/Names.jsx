import { wedding } from '../data/weddingDetails.js'

export default function Names({ className = '' }) {
  return (
    <h1 className={`names ${className}`} aria-label={`${wedding.groom.firstName} and ${wedding.bride.firstName}`}>
      <span aria-hidden="true">{wedding.groom.firstName.toUpperCase()}</span>
      <span className="amp" aria-hidden="true">&amp;</span>
      <span aria-hidden="true">{wedding.bride.firstName.toUpperCase()}</span>
    </h1>
  )
}
