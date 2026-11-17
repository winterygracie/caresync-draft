export function PulseMark({ className = 'h-10 w-10' }) {
  return (
    <span className={`inline-grid place-items-center rounded-xl bg-[#14123a] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] ${className}`}>
      <svg viewBox="0 0 48 48" className="h-[70%] w-[70%]" aria-hidden="true">
        <path d="M3 26h9l3-8 5 15 5-22 4 15 3-6h13" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function Wordmark({ sub = 'Health center' }) {
  return (
    <div className="flex items-center gap-3">
      <PulseMark />
      <div className="leading-tight">
        <div className="text-[15px] font-bold text-ink">Ampayon CareSync</div>
        <div className="tracked text-[10px] font-semibold uppercase text-slate-500">{sub}</div>
      </div>
    </div>
  )
}
