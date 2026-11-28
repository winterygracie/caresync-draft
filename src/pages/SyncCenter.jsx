import { CircleCheck, CloudOff, Info, RefreshCw, Server, Wifi, WifiOff } from 'lucide-react'
import { useWorkspace } from '../lib/workspace.jsx'

export default function SyncCenter() {
  const { patients, visits, dispensing, batches, isOnline, syncing, pendingCount, lastSync, syncLog, runSync, simulateOffline, setSimulateOffline } = useWorkspace()
  const queues = [
    { name: 'patients', list: patients },
    { name: 'visits', list: visits },
    { name: 'dispensing_transactions', list: dispensing },
    { name: 'supply_batches', list: batches },
  ].map((q) => ({ ...q, pending: q.list.filter((r) => r.sync_status === 'pending').length, total: q.list.length }))

  return (
    <div className="rise">
      <h1 className="text-4xl font-extrabold tracking-tight">Sync Center</h1>
      <p className="mt-1 text-slate-500">Monitor offline queues, inspect sync logs, and trigger reconciliation.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className={`rounded-2xl p-5 ${isOnline ? 'bg-emerald-50' : 'bg-amber-50'}`}>
          {isOnline ? <Wifi className="h-5 w-5 text-emerald-600" /> : <CloudOff className="h-5 w-5 text-amber-600" />}
          <p className="mt-3 text-2xl font-extrabold">{isOnline ? 'Online' : 'Offline'}</p>
          <p className="text-xs text-slate-600">{isOnline ? 'Health center server reachable' : 'Records are queued on this device'}</p>
        </div>
        <div className="rounded-2xl bg-indigo-50 p-5">
          <RefreshCw className={`h-5 w-5 text-indigo-600 ${syncing ? 'animate-spin' : ''}`} />
          <p className="mt-3 text-2xl font-extrabold">{pendingCount} pending</p>
          <p className="text-xs text-slate-600">Last sync {lastSync.toLocaleTimeString()} · auto every 60 s</p>
        </div>
        <div className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <button disabled={!isOnline || syncing} onClick={() => runSync('manual')} className="btn-dark disabled:opacity-40"><RefreshCw className="h-4 w-4" /> Run reconciliation now</button>
          <button onClick={() => setSimulateOffline(!simulateOffline)} className="btn-ghost">{simulateOffline ? <><Wifi className="h-4 w-4" /> Reconnect device</> : <><WifiOff className="h-4 w-4" /> Simulate offline</>}</button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <section className="card p-6">
          <h2 className="flex items-center gap-2 text-base font-extrabold"><Server className="h-4 w-4 text-indigo-500" /> Queues by table</h2>
          <ul className="mt-4 space-y-3">
            {queues.map((q) => (
              <li key={q.name} className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between text-sm"><span className="font-mono font-semibold">{q.name}</span>
                  {q.pending ? <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">{q.pending} pending</span> : <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600"><CircleCheck className="h-3.5 w-3.5" /> synced</span>}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${q.total ? ((q.total - q.pending) / q.total) * 100 : 100}%` }} /></div>
                <p className="mt-1 text-[11px] text-slate-400">{q.total - q.pending} / {q.total} records on server</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-6">
          <h2 className="text-base font-extrabold">Sync log</h2>
          <ul className="mt-3 max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
            {syncLog.map((l) => (
              <li key={l.id} className="flex gap-3 py-2.5 text-xs">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${l.kind === 'success' ? 'bg-emerald-500' : l.kind === 'pending' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                <p className="flex-1 text-slate-700">{l.message}</p>
                <span className="whitespace-nowrap text-slate-400">{l.at.toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 rounded-lg bg-indigo-50 p-3 text-[11px] text-indigo-900/80"><Info className="h-4 w-4 shrink-0" /> Each record carries a client UUID, so re-sending after a dropped connection never creates duplicates. Offline TMP- patient IDs are replaced by permanent AMP-2026 IDs on sync.</p>
        </section>
      </div>
    </div>
  )
}
