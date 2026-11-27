export function PulseMark({ className = 'h-10 w-10' }) {
  return (
    <span
      className={`inline-grid place-items-center overflow-hidden rounded-xl bg-[#14123a] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] ${className}`}
    >
      <img
        src="/acslogo3.svg"
        alt="Ampayon CareSync logo"
        className="h-full w-full object-contain"
      />
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
