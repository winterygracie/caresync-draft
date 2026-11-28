export function PulseMark({
  className = 'h-10 w-10',
  src = `${import.meta.env.BASE_URL}acslogo3.svg`,
  alt = 'Ampayon CareSync logo',
  ...props
}) {
  return (
    <span
      className={`inline-grid place-items-center overflow-hidden rounded-xl bg-[#14123a] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] ${className}`}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

export function Wordmark({
  sub = 'Health center',
  className = '',
  markClassName = '',
  ...props
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`} {...props}>
      <PulseMark className={markClassName} />
      <div className="leading-tight">
        <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
          Ampayon CareSync
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {sub}
        </div>
      </div>
    </div>
  );
}
