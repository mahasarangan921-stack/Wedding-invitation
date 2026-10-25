// Shows the value, or a clearly marked placeholder when it is still empty.
export default function Editable({ value, label }) {
  if (value) return <>{value}</>
  return (
    <span className="tbc" title="Not confirmed yet — edit src/data/weddingDetails.js">
      {label || 'To be announced'}
    </span>
  )
}
