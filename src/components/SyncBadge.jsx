import { CloudOff, RefreshCw, CircleCheck } from 'lucide-react'
import { useWorkspace } from '../lib/workspace.jsx'

export default function SyncBadge({ onClick }) {
  const { isOnline, syncing, pendingCount } = useWorkspace()
  let tone, Icon, label
  if (syncing) { tone = 'bg-indigo-50 text-indigo-700 ring-indigo-200'; Icon = RefreshCw; label = 'Syncing…' }
  else if (!isOnline) { tone = 'bg-amber-50 text-amber-800 ring-amber-200'; Icon = CloudOff; label = `Offline · ${pendingCount} Pending Record${pendingCount === 1 ? '' : 's'}` }
  else if (pendingCount > 0) { tone = 'bg-sky-50 text-sky-800 ring-sky-200'; Icon = RefreshCw; label = `Online · ${pendingCount} Pending` }
  else { tone = 'bg-emerald-50 text-emerald-700 ring-emerald-200'; Icon = CircleCheck; label = 'Online · All Synced' }
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition hover:brightness-95 ${tone}`} aria-live="polite">
      <Icon className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
      {label}
    </button>
  )
}
