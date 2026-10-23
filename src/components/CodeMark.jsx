// The logo's </> mark in its own colours: teal "<", grey "/", indigo ">".
export default function CodeMark({ className = '' }) {
  return (
    <span className={`font-mono font-bold ${className}`} aria-hidden="true">
      <span className="text-brand-teal">&lt;</span>
      <span className="text-brand-grey">/</span>
      <span className="text-brand-indigo">&gt;</span>
    </span>
  )
}
