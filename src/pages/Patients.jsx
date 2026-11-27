import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowUpRight, ClipboardList, EyeOff, Pill, Plus, Search, Thermometer, Users } from 'lucide-react'
import RegisterPatientDialog from '../components/RegisterPatientDialog.jsx'
import VisitDialog from '../components/VisitDialog.jsx'
import { fmtDate, initials, supplyById, userName, useWorkspace } from '../lib/workspace.jsx'

export default function Patients() {
  const { patients, visits, can } = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [registerOpen, setRegisterOpen] = useState(params.get('register') === '1')
  const [visitFor, setVisitFor] = useState(null)

  useEffect(() => { if (params.get('register')) setParams({}, { replace: true }) }, []) // eslint-disable-line

  const visitCount = useMemo(() => visits.reduce((m, v) => m.set(v.patient_id, (m.get(v.patient_id) || 0) + 1), new Map()), [visits])
  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    const list = [...patients].sort((a, b) => a.patient_id.localeCompare(b.patient_id))
    if (!t) return list
    return list.filter((p) => p.patient_id.toLowerCase().includes(t) || `${p.first_name} ${p.last_name}`.toLowerCase().includes(t) || `${p.last_name} ${p.first_name}`.toLowerCase().includes(t))
  }, [patients, q])
  const selected = patients.find((p) => p.patient_id === selectedId)

  return (
    <div className="rise">
      <h1 className="text-4xl font-extrabold tracking-tight">Patients &amp; Records</h1>
      <p className="mt-1 text-slate-500">Find patient profiles, review visit history, and document care.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative flex-1 sm:max-w-md">
  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  <input
    value={q}
    onChange={(e) => setQ(e.target.value)}
    className="input w-full rounded-xl py-2.5 !pl-10"
    placeholder="Search by patient name or ID (e.g. AMP-2026-0003)"
    autoFocus
  />
</label>
        {can('patients.register') && (
          <button onClick={() => setRegisterOpen(true)} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-indigo-deep px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-900/20 transition hover:brightness-110">
            <Plus className="h-4 w-4" /> Register patient
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
          <div className="flex items-end justify-between bg-gradient-to-r from-indigo-100 to-sky-100 px-5 py-4">
            <div><h2 className="text-lg font-extrabold text-indigo-deep">Patient directory</h2><p className="text-xs text-indigo-900/60">{results.length} of {patients.length} records available on this device</p></div>
            <p className="tracked text-[10px] font-bold uppercase text-indigo-900/50">Patient ID · A–Z</p>
          </div>
          <ul className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto">
            {results.map((p) => (
              <li key={p.patient_id}>
                <button onClick={() => setSelectedId(p.patient_id)} className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-indigo-50/50 ${selectedId === p.patient_id ? 'bg-indigo-50' : ''}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-rose-400">{initials(`${p.first_name} ${p.last_name}`)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-indigo-deep">{p.first_name} {p.last_name}{p.sync_status === 'pending' && <Pending />}</span>
                    <span className="block truncate text-xs text-slate-500">{p.patient_id} · {p.gender} · DOB {fmtDate(p.dob)}</span>
                  </span>
                  <span className="text-[11px] text-slate-400">{visitCount.get(p.patient_id) || 0} visits</span>
                  <ArrowUpRight className="h-4 w-4 text-rose-300" />
                </button>
              </li>
            ))}
            {results.length === 0 && <li className="p-8 text-center text-sm text-slate-500">No patient matches “{q}”.</li>}
          </ul>
        </section>

        {selected
          ? <PatientChart patient={selected} onAddVisit={() => setVisitFor(selected)} />
          : (
            <section className="grid place-items-center rounded-2xl bg-sky-50 p-10 text-center">
              <div>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm"><Users className="h-5 w-5" /></span>
                <h3 className="mt-4 text-lg font-extrabold">Select a patient</h3>
                <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">Choose a patient from the directory to review their profile and visit history.</p>
                {can('patients.register') && <button onClick={() => setRegisterOpen(true)} className="btn-ghost mt-5"><Plus className="h-4 w-4" /> Register new patient</button>}
              </div>
            </section>
          )}
      </div>

      <RegisterPatientDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onDone={(id) => { setRegisterOpen(false); setSelectedId(id); setQ('') }}
      />
      <VisitDialog patient={visitFor} onClose={() => setVisitFor(null)} />
    </div>
  )
}

function Pending() {
  return <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">Pending</span>
}

function PatientChart({ patient, onAddVisit }) {
  const { visits, dispensing, can } = useWorkspace()
  const history = visits.filter((v) => v.patient_id === patient.patient_id).sort((a, b) => b.visit_date.localeCompare(a.visit_date))
  const meds = dispensing.filter((d) => d.patient_id === patient.patient_id)
  const clinical = can('patients.history')
  const canAdd = can('visits.intake') || can('visits.vitals') || can('visits.clinical')
  const age = Math.floor((Date.now() - new Date(patient.dob)) / 3.15576e10)

  return (
    <section className="card rise overflow-hidden">
      <div className="flex flex-wrap items-start gap-4 border-b border-slate-100 p-6">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-extrabold text-white">{initials(`${patient.first_name} ${patient.last_name}`)}</span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold">{patient.first_name} {patient.last_name}{patient.sync_status === 'pending' && <Pending />}</h2>
          <p className="font-mono text-sm font-bold text-indigo-600">{patient.patient_id}</p>
          <p className="mt-1 text-xs text-slate-500">{patient.gender} · {age} yrs · DOB {fmtDate(patient.dob)} · {patient.address} · {patient.contact_number || 'No contact recorded'}</p>
        </div>
        {canAdd && <button onClick={onAddVisit} className="btn-dark py-2"><Plus className="h-4 w-4" /> New visit</button>}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">Visit history · {history.length}</h3>
          {!clinical && <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500"><EyeOff className="h-3 w-3" /> Clinical notes hidden for your role</span>}
        </div>
        {history.length === 0 && <p className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No visits recorded yet.</p>}
        <ol className="relative mt-4 space-y-4 border-l-2 border-indigo-100 pl-5">
          {history.map((v) => {
            const vm = meds.filter((d) => d.visit_id === v.visit_id)
            return (
              <li key={v.visit_id} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-500 ring-2 ring-indigo-100" />
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold">{fmtDate(v.visit_date)}</p>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">{v.purpose_of_visit}</span>
                    {v.sync_status === 'pending' && <Pending />}
                    <span className="ml-auto text-[11px] text-slate-400">{userName(v.attending_staff_id)}</span>
                  </div>
                  {clinical ? (
                    <>
                      {v.vitals_json && Object.keys(v.vitals_json).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                          <Thermometer className="h-4 w-4 text-rose-400" />
                          {v.vitals_json.bp && <Vital k="BP" v={v.vitals_json.bp} />}
                          {v.vitals_json.temp && <Vital k="Temp" v={`${v.vitals_json.temp}°C`} />}
                          {v.vitals_json.weight && <Vital k="Wt" v={`${v.vitals_json.weight} kg`} />}
                          {v.vitals_json.pulse && <Vital k="Pulse" v={`${v.vitals_json.pulse} bpm`} />}
                        </div>
                      )}
                      {v.chief_complaint && <p className="mt-2 text-xs text-slate-600"><b>Complaint:</b> {v.chief_complaint}</p>}
                      {v.diagnosis && <p className="mt-1 text-xs text-slate-600"><b>Diagnosis:</b> {v.diagnosis}</p>}
                      {v.clinical_notes && <p className="mt-1 text-xs text-slate-600"><b>Notes:</b> {v.clinical_notes}</p>}
                      {v.prescription_notes && <p className="mt-1 flex items-center gap-1 text-xs text-slate-600"><ClipboardList className="h-3 w-3" /> {v.prescription_notes}</p>}
                      {vm.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {vm.map((d) => <span key={d.transaction_id} className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"><Pill className="h-3 w-3" /> {supplyById(d.supply_id)?.item_name} × {d.quantity_dispensed}</span>)}
                        </div>
                      )}
                    </>
                  ) : v.chief_complaint && can('visits.intake') ? <p className="mt-2 text-xs text-slate-600"><b>Intake:</b> {v.chief_complaint}</p> : null}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

const Vital = ({ k, v }) => <span className="rounded-md bg-white px-2 py-0.5 ring-1 ring-slate-200"><b className="text-slate-500">{k}</b> {v}</span>

