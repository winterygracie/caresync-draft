import { useMemo, useState } from 'react'
import { Ban, CircleCheck, Clock, History, Package, PackagePlus, Pill, Scale, Search, TriangleAlert } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import { fmtDate, isExpired, planFefo, supplyById, todayISO, userName, useWorkspace } from '../lib/workspace.jsx'

const LOW_STOCK_THRESHOLD = 10 // Low-stock threshold set to 10 units

//Categories of medicine dropdown list
const THERAPEUTIC_TYPES = [
  'Antimicrobials (Antibiotics & Antivirals)',
  'Cardiovascular & Antihypertensive Medicines',
  'Respiratory & Anti-Allergy Medicines',
  'Analgesics, Antipyretics, Anti-Inflammatory & Gout Medicines',
  'Gastrointestinal & Antispasmodic Medicines',
  'Endocrine, Metabolic, Vitamins, Supplements & Herbal Medicines',
  'Dermatological, Ophthalmic, Vestibular, Hemostatic, Immunosuppressant & Local Anesthetic Medicines',
]

//Dosage form types
const DOSAGE_FORM_TYPES = [
  'Tablets (Standard, Film-Coated, Chewable, Modified Release)',
  'Capsules',
  'Syrups',
  'Oral Suspensions & Oral Solutions',
  'Oral Drops',
  'Oral Powders, Effervescents & Oral Rehydration Salts (ORS)',
  'Inhalers (Metered Dose Inhalers, Dry Powder Inhalers) & Respiratory Solutions',
  'Topical & Ophthalmic Creams and Ointments',
  'Injectables (Solutions & Powders for Injection)',
]

export default function Inventory() {
  const { batches, supplies, adjustments, dispensing, can } = useWorkspace()
  const [q, setQ] = useState('')
  const [dialog, setDialog] = useState(null) // { type, supply_id?, batch? }
  const today = todayISO()

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return batches
      .filter((b) => b.quantity_on_hand > 0 || isExpired(b, today))
      .map((b) => ({ ...b, supply: supplyById(b.supply_id), expired: isExpired(b, today) }))
      .filter((b) => !t || b.supply.item_name.toLowerCase().includes(t) || b.batch_number.toLowerCase().includes(t) || b.supply_id.toLowerCase().includes(t))
      .sort((a, b) => a.expiration_date.localeCompare(b.expiration_date))
  }, [batches, q, today])

  const expired = rows.filter((r) => r.expired)
  const totalByItem = (id) => batches.filter((b) => b.supply_id === id && !isExpired(b, today)).reduce((s, b) => s + b.quantity_on_hand, 0)
  const lowItems = supplies.filter((s) => totalByItem(s.supply_id) <= s.reorder_level)
  const units = batches.filter((b) => !isExpired(b, today)).reduce((s, b) => s + b.quantity_on_hand, 0)
  // FEFO "next to dispense" batch per supply
  const nextBatch = useMemo(() => {
    const m = new Map()
    for (const r of rows) if (!r.expired && r.quantity_on_hand > 0 && !m.has(r.supply_id)) m.set(r.supply_id, r.batch_id)
    return m
  }, [rows])

  const stats = [
    { n: rows.filter((r) => !r.expired).length, label: 'Active batches', icon: Package, tone: 'bg-fuchsia-100', ic: 'text-emerald-600' },
    //Ensure 10 for low-stock threshold
    { n: lowItems.length, label: 'Items at reorder level' (< 10), icon: TriangleAlert, tone: 'bg-sky-100', ic: 'text-amber-600' },
    { n: expired.length, label: 'Expired batches (blocked)', icon: Clock, tone: 'bg-rose-100', ic: 'text-rose-600' },
    { n: units, label: 'Usable units in stock', icon: CircleCheck, tone: 'bg-indigo-100', ic: 'text-indigo-600' },
  ]

  return (
    <div className="rise">
      <h1 className="text-4xl font-extrabold tracking-tight">Inventory</h1>
      <p className="mt-1 text-slate-500">Manage batches, expiration dates, and stock movement using FEFO.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.tone}`}>
            <span className={`grid h-9 w-9 place-items-center rounded-lg bg-white/80 ${s.ic}`}><s.icon className="h-4.5 w-4.5" /></span>
            <p className="mt-4 text-3xl font-extrabold">{s.n}</p>
            <p className="text-sm font-bold text-slate-700">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input rounded-xl py-2.5 pl-10" placeholder="Search medicine or batch…" />
        </label>
        {can('inventory.dispense') && <button onClick={() => setDialog({ type: 'dispense' })} className="btn-ghost ml-auto rounded-xl py-2.5"><Pill className="h-4 w-4" /> Dispense to patient</button>}
        {can('inventory.receive') && <button onClick={() => setDialog({ type: 'receive' })} className="inline-flex items-center gap-2 rounded-xl bg-indigo-deep px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-900/20 hover:brightness-110"><PackagePlus className="h-4 w-4" /> Receive supplies</button>}
        {!can('inventory.dispense') && <span className="ml-auto rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">Read-only for your role</span>}
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="flex items-end justify-between px-6 pt-5">
          <div><h2 className="text-lg font-extrabold">Medicine &amp; supply stock</h2><p className="text-xs text-slate-500">FEFO: batches with the earliest expiry appear first</p></div>
          <p className="tracked text-[10px] font-bold uppercase text-slate-400">Sorted by expiry</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead><tr className="tracked bg-slate-50 text-left text-[10px] font-bold uppercase text-slate-400">
              <th className="px-6 py-3">Medicine / supply</th><th className="px-3">Batch</th><th className="px-3">Expiration</th><th className="px-3">Quantity</th><th className="px-3">Status</th><th className="px-6 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const low = !r.expired && totalByItem(r.supply_id) <= r.supply.reorder_level
                const isNext = nextBatch.get(r.supply_id) === r.batch_id
                return (
                  <tr key={r.batch_id} className={r.expired ? 'bg-rose-50/60' : ''}>
                    <td className="px-6 py-3.5"><p className={`font-bold ${r.expired ? 'text-rose-700' : ''}`}>{r.supply.item_name}</p><p className="text-[11px] text-slate-400">{r.supply_id} · {r.supply.category}</p></td>
                    <td className="px-3 font-mono text-xs">{r.batch_number}{isNext && <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 font-sans text-[9px] font-bold text-indigo-700">FEFO NEXT</span>}</td>
                    <td className={`px-3 ${r.expired ? 'font-bold text-rose-700' : ''}`}>{fmtDate(r.expiration_date)}</td>
                    <td className="px-3"><b>{r.quantity_on_hand}</b> <span className="text-[11px] text-slate-400">{r.supply.unit}s</span></td>
                    <td className="px-3">
                      {r.expired
                        ? <span className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1 text-[10px] font-extrabold text-white"><Ban className="h-3 w-3" /> EXPIRED</span>
                        : <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${low ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{low ? 'Low stock' : 'In stock'}</span>}
                    </td>
                    <td className="space-x-2 whitespace-nowrap px-6 text-right">
                      {can('inventory.dispense') && (
                        <button disabled={r.expired} title={r.expired ? 'Expired batches cannot be dispensed' : 'Dispense using FEFO'} onClick={() => setDialog({ type: 'dispense', supply_id: r.supply_id })}
                          className="btn-ghost py-1.5 text-xs disabled:cursor-not-allowed disabled:border-rose-200 disabled:bg-rose-50 disabled:text-rose-400">
                          {r.expired ? 'Blocked' : 'Dispense'}
                        </button>
                      )}
                      {can('inventory.adjust') && <button onClick={() => setDialog({ type: 'adjust', batch: r })} className="btn-ghost py-1.5 text-xs"><Scale className="h-3.5 w-3.5" /> Adjust</button>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="m-6 flex gap-3 rounded-xl bg-rose-100/70 p-4 text-sm">
          <TriangleAlert className="h-5 w-5 shrink-0 text-rose-600" />
          <div><p className="font-bold text-indigo-deep">FEFO rule applied</p><p className="text-xs text-slate-600">Dispensing always draws from the earliest-expiring valid batch and splits into the next batch when one runs short. Batches expiring on or before today are blocked.</p></div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AuditList title="Recent dispensing" icon={Pill} items={dispensing.slice(0, 6).map((d) => ({
          id: d.transaction_id, main: `${supplyById(d.supply_id)?.item_name} × ${d.quantity_dispensed}`,
          sub: `${batches.find((b) => b.batch_id === d.batch_id)?.batch_number} · ${d.patient_id || 'walk-in'} · ${userName(d.dispensed_by)}`, at: d.dispensed_at, pending: d.sync_status === 'pending',
        }))} />
        <AuditList title="Stock adjustment audit trail" icon={History} items={adjustments.slice(0, 6).map((a) => ({
          id: a.adjustment_id, main: `${batches.find((b) => b.batch_id === a.batch_id)?.batch_number}: ${a.previous_qty} → ${a.adjusted_qty} (${a.reason})`,
          sub: `${a.note || 'No note'} · ${userName(a.adjusted_by)}`, at: a.adjusted_at,
        }))} />
      </div>

      {dialog?.type === 'receive' && <ReceiveDialog onClose={() => setDialog(null)} />}
      {dialog?.type === 'dispense' && <DispenseDialog initialSupply={dialog.supply_id} onClose={() => setDialog(null)} />}
      {dialog?.type === 'adjust' && <AdjustDialog batch={dialog.batch} onClose={() => setDialog(null)} />}
    </div>
  )
}

function AuditList({ title, icon: Icon, items }) {
  return (
    <section className="card p-6">
      <h3 className="flex items-center gap-2 text-base font-extrabold"><Icon className="h-4 w-4 text-indigo-500" /> {title}</h3>
      <ul className="mt-3 divide-y divide-slate-100">
        {items.map((i) => (
          <li key={i.id} className="flex items-start gap-3 py-2.5 text-xs">
            <div className="min-w-0 flex-1"><p className="font-bold text-sm">{i.main}</p><p className="truncate text-slate-500">{i.sub}</p></div>
            {i.pending && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">PENDING</span>}
            <span className="whitespace-nowrap text-slate-400">{fmtDate(i.at)}</span>
          </li>
        ))}
        {items.length === 0 && <li className="py-4 text-sm text-slate-400">Nothing recorded yet.</li>}
      </ul>
    </section>
  )
}

function ReceiveDialog({ onClose }) {
  const { supplies, receiveBatch } = useWorkspace()
  const [f, setF] = useState({ supply_id: supplies[0].supply_id, batch_number: '', expiration_date: '', quantity: '' })
  const [err, setErr] = useState('')
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr('') }
  const submit = (e) => {
    e.preventDefault()
    if (f.expiration_date <= todayISO()) return setErr('This batch is already expired and cannot be received into usable stock.')
    if (!(Number(f.quantity) > 0)) return setErr('Enter a quantity greater than zero.')
    receiveBatch(f); onClose()
  }
  return (
    <Modal open onClose={onClose} label="Receive supplies">
      <form onSubmit={submit}>
        <h2 className="text-xl font-extrabold">Receive supplies</h2>
        <p className="text-sm text-slate-500">Log an incoming delivery as a new batch.</p>
        <div className="mt-5 space-y-3">
          <div><label className="label">Supply item *</label><select className="input" value={f.supply_id} onChange={set('supply_id')}>{supplies.map((s) => <option key={s.supply_id} value={s.supply_id}>{s.item_name} ({s.unit})</option>)}</select></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="label">Batch number *</label><input required className="input" placeholder="PCM-2611-C" value={f.batch_number} onChange={set('batch_number')} /></div>
            <div><label className="label">Expiration date *</label><input required type="date" className="input" value={f.expiration_date} onChange={set('expiration_date')} /></div>
            <div><label className="label">Quantity *</label><input required type="number" min="1" className="input" value={f.quantity} onChange={set('quantity')} /></div>
          </div>
        </div>
        {err && <p className="mt-3 text-xs font-semibold text-rose-600">{err}</p>}
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="btn-ghost">Cancel</button><button className="btn-dark py-2">Receive batch</button></div>
      </form>
    </Modal>
  )
}

function DispenseDialog({ initialSupply, onClose }) {
  const { supplies, batches, patients, visits, dispense } = useWorkspace()
  const [supply_id, setSupply] = useState(initialSupply || 'MED-01')
  //State for therapeutic type and dosage form type
  const [therapeutic_type, setTherapeuticType] = useState(THERAPEUTIC_TYPES[0])
  const [dosage_form, setDosageForm] = useState(DOSAGE_FORM_TYPES[0])
  const [quantity, setQty] = useState(initialSupply === undefined ? 40 : 1)
  const [patient_id, setPatient] = useState('')
  const [done, setDone] = useState(null)
  const supply = supplyById(supply_id)
  const plan = planFefo(batches, supply_id, Number(quantity) || 0)
  const expiredHere = batches.filter((b) => b.supply_id === supply_id && isExpired(b) && b.quantity_on_hand > 0)
  const lastVisit = visits.filter((v) => v.patient_id === patient_id).sort((a, b) => b.visit_date.localeCompare(a.visit_date))[0]

  if (done) return (
    <Modal open onClose={onClose} label="Dispensed">
      <div className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CircleCheck className="h-6 w-6" /></span>
        <h2 className="mt-3 text-xl font-extrabold">Dispensed {quantity} {supply.unit}s</h2>
        <ul className="mt-3 space-y-1 text-sm">{done.allocations.map((a) => <li key={a.batch.batch_id}>{a.quantity} from <b className="font-mono">{a.batch.batch_number}</b> <span className="text-slate-400">(exp {fmtDate(a.batch.expiration_date)})</span></li>)}</ul>
        <button onClick={onClose} className="btn-dark mt-5">Done</button>
      </div>
    </Modal>
  )

  return (
    <Modal open onClose={onClose} label="Dispense supply">
      <h2 className="text-xl font-extrabold">Dispense supply</h2>
      <p className="text-sm text-slate-500">Batches are picked automatically — earliest expiry first.</p>
      <div className="mt-5 space-y-3">
        <div><label className="label">Supply item</label><select className="input" value={supply_id} onChange={(e) => setSupply(e.target.value)}>{supplies.map((s) => <option key={s.supply_id} value={s.supply_id}>{s.item_name}</option>)}</select></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">Quantity ({supply.unit}s)</label><input type="number" min="1" className="input" value={quantity} onChange={(e) => setQty(e.target.value)} /></div>
          <div><label className="label">Patient (optional)</label><select className="input" value={patient_id} onChange={(e) => setPatient(e.target.value)}><option value="">Walk-in / not linked</option>{patients.map((p) => <option key={p.patient_id} value={p.patient_id}>{p.patient_id} · {p.first_name} {p.last_name}</option>)}</select></div>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="tracked text-[10px] font-bold uppercase text-slate-500">FEFO allocation preview</p>
        {expiredHere.map((b) => <p key={b.batch_id} className="mt-2 flex items-center gap-2 text-xs font-semibold text-rose-700"><Ban className="h-3.5 w-3.5" /> {b.batch_number} expired {fmtDate(b.expiration_date)} — skipped</p>)}
        {plan.ok && plan.allocations.map((a, i) => (
          <p key={a.batch.batch_id} className="mt-2 flex items-center gap-2 text-sm"><span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">{i + 1}</span><b>{a.quantity}</b> from <span className="font-mono">{a.batch.batch_number}</span> <span className="text-xs text-slate-400">exp {fmtDate(a.batch.expiration_date)} · {a.batch.quantity_on_hand - a.quantity} left</span></p>
        ))}
        {plan.ok && plan.allocations.length > 1 && <p className="mt-2 text-xs font-semibold text-indigo-700">Split across {plan.allocations.length} batches because the earliest batch is short.</p>}
        {!plan.ok && <p className="mt-2 text-sm font-semibold text-rose-700">Only {plan.available} usable {supply.unit}s available.</p>}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost">Cancel</button>
        <button disabled={!plan.ok || !(Number(quantity) > 0)} onClick={() => setDone(dispense({ supply_id, quantity, patient_id, visit_id: lastVisit?.visit_id }))} className="btn-dark py-2 disabled:opacity-40">Confirm dispensing</button>
      </div>
    </Modal>
  )
}

function AdjustDialog({ batch, onClose }) {
  const { adjustStock } = useWorkspace()
  const [qty, setQty] = useState(batch.quantity_on_hand)
  const [reason, setReason] = useState('Physical Count')
  const [note, setNote] = useState('')
  const submit = (e) => { e.preventDefault(); adjustStock({ batch_id: batch.batch_id, adjusted_qty: qty, reason, note }); onClose() }
  return (
    <Modal open onClose={onClose} label="Adjust stock">
      <form onSubmit={submit}>
        <h2 className="text-xl font-extrabold">Physical stock adjustment</h2>
        <p className="text-sm text-slate-500">{batch.supply.item_name} · <span className="font-mono">{batch.batch_number}</span> · system count {batch.quantity_on_hand}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div><label className="label">Counted quantity *</label><input required type="number" min="0" className="input" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
          <div><label className="label">Reason *</label><select className="input" value={reason} onChange={(e) => setReason(e.target.value)}><option>Physical Count</option><option>Damaged</option><option>Audit</option></select></div>
          <div className="sm:col-span-2"><label className="label">Reason note *</label><textarea required rows={2} className="input" placeholder="Explain the difference" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">Adjustments create a permanent audit record and cannot be edited.</p>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="btn-ghost">Cancel</button><button className="btn-dark py-2">Record adjustment</button></div>
      </form>
    </Modal>
  )
}
