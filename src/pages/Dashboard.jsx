import { Link } from 'react-router-dom'
import { ArrowUpRight, Ban, ClipboardList, Package, RefreshCw, Search, UserPlus, Users } from 'lucide-react'
import { PulseMark } from '../components/Logo.jsx'
import { fmtDate, isExpired, supplyById, todayISO, useWorkspace } from '../lib/workspace.jsx'

export default function Dashboard() {
  const { user, patients, visits, batches, can, isOnline, pendingCount, lastSync } = useWorkspace()
  const today = todayISO()
  const expired = batches.filter((b) => isExpired(b, today) && b.quantity_on_hand > 0)
  const active = batches.filter((b) => !isExpired(b, today) && b.quantity_on_hand > 0).sort((a, b) => a.expiration_date.localeCompare(b.expiration_date))
  const low = active.filter((b) => b.quantity_on_hand <= (supplyById(b.supply_id)?.reorder_level || 0) / 2)
  const todaysVisits = visits.filter((v) => v.visit_date === today).length
  const first = user.full_name.replace(/^(Dr|Nurse)\.?\s+/i, '').split(' ')[0]

  const stats = [
    { label: 'Registered patients', value: patients.length, icon: Users, tone: 'bg-emerald-50 text-emerald-600', note: 'Across local records' },
    { label: 'Visits logged today', value: todaysVisits, icon: ClipboardList, tone: 'bg-indigo-50 text-indigo-600', note: `${visits.length} visits in history` },
    { label: 'Stock alerts', value: expired.length + low.length, icon: Package, tone: 'bg-amber-50 text-amber-600', note: `${expired.length} expired · ${low.length} low stock` },
  ]
  const actions = [
    can('patients.register') && { to: '/app/patients?register=1', label: 'Register patient', sub: 'Duplicate check & new Patient ID', icon: UserPlus },
    can('patients.read') && { to: '/app/patients', label: 'Search records', sub: 'Find by name or Patient ID', icon: Search },
    can('inventory.read') && { to: '/app/inventory', label: 'Manage stock', sub: 'Receive, dispense (FEFO), adjust', icon: Package },
    can('sync.monitor') && { to: '/app/sync', label: 'Sync Center', sub: 'Queues, logs & reconciliation', icon: RefreshCw },
  ].filter(Boolean)

  return (
    <div className="rise space-y-6">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Welcome back, {first}!</h1>
        <p className="mt-1 text-lg text-slate-500">Here’s what’s happening across your health center today.</p>
      </div>

      <section className="rounded-3xl bg-gradient-to-br from-rose-200 via-indigo-300 to-sky-300 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="tracked text-[10px] font-bold uppercase text-ink">Ampayon CareSync · Live overview</p>
            <h2 className="mt-1 bg-gradient-to-r from-indigo-700 to-fuchsia-500 bg-clip-text text-2xl font-extrabold text-transparent">Health center at a glance</h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${isOnline ? 'bg-white/70 text-emerald-700' : 'bg-white/70 text-amber-700'}`}>● {isOnline ? 'Connected' : 'Offline'}</span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}><s.icon className="h-5 w-5" /></span>
              <p className="mt-4 text-4xl font-extrabold">{s.value}</p>
              <p className="mt-1 text-sm font-bold">{s.label}</p>
              <p className="text-xs text-slate-400">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-baseline justify-between">
            <div><h3 className="text-2xl font-extrabold">Quick actions</h3><p className="text-slate-500">Available for {user.role}</p></div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {actions.map((a) => (
              <Link key={a.label} to={a.to} className="group rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><a.icon className="h-4.5 w-4.5" /></span>
                <p className="mt-3 flex items-center text-sm font-bold">{a.label}<ArrowUpRight className="ml-auto h-4 w-4 text-slate-300 group-hover:text-indigo-500" /></p>
                <p className="text-xs text-slate-500">{a.sub}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-baseline justify-between">
            <div><h3 className="text-2xl font-extrabold">Inventory watch</h3><p className="text-slate-500">Earliest expiration first</p></div>
            {can('inventory.read') && <Link to="/app/inventory" className="flex items-center gap-1 text-sm font-bold text-indigo-deep">Manage stock <ArrowUpRight className="h-4 w-4" /></Link>}
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {[...expired, ...active].slice(0, 5).map((b) => {
              const s = supplyById(b.supply_id), exp = isExpired(b, today), isLow = low.includes(b)
              return (
                <li key={b.batch_id} className="flex items-center gap-3 py-3">
                  <span className={`grid h-9 w-9 place-items-center rounded-lg ${exp ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>{exp ? <Ban className="h-4 w-4" /> : <Package className="h-4 w-4" />}</span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-bold">{s.item_name}</p><p className="text-xs text-slate-400">Batch {b.batch_number} · Expires {fmtDate(b.expiration_date)}</p></div>
                  <div className="text-right"><p className="text-sm font-extrabold">{b.quantity_on_hand}</p><p className="text-[10px] text-slate-400">{s.unit}s</p></div>
                  <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${exp ? 'bg-rose-100 text-rose-700' : isLow ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{exp ? 'EXPIRED' : isLow ? 'Low stock' : 'In stock'}</span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <section className="card flex flex-col items-center gap-5 bg-gradient-to-r from-white to-emerald-50/60 p-6 sm:flex-row">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-white shadow-inner ring-8 ring-slate-50"><PulseMark className="h-11 w-11" /></div>
        <div>
          <p className="tracked text-[10px] font-bold uppercase text-rose-400">Local-first workflow</p>
          <h3 className="text-lg font-extrabold text-indigo-deep">{isOnline ? (pendingCount ? `${pendingCount} record(s) waiting to sync` : 'Your workspace is connected') : 'Working offline'}</h3>
          <p className="text-sm text-slate-500">Patients, visits and dispensing are saved on this device first and pushed to the health center server automatically. Last sync: {lastSync.toLocaleTimeString()}.</p>
        </div>
      </section>
    </div>
  )
}
