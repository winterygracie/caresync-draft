import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowUpRight, CheckCircle2, ClipboardList, Clock, EyeOff, Pill, Plus, Search, Thermometer, Users } from 'lucide-react'
import RegisterPatientDialog from '../components/RegisterPatientDialog.jsx'
import VisitDialog from '../components/VisitDialog.jsx'
import { fmtDate, initials, supplyById, userName, useWorkspace } from '../lib/workspace.jsx'

export default function Patients() {
  const { patients, visits, can, markVisitDone } = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [queueOnly, setQueueOnly] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [registerOpen, setRegisterOpen] = useState(params.get('register') === '1')
  const [visitFor, setVisitFor] = useState(null)

  useEffect(() => { if (params.get('register')) setParams({}, { replace: true }) }, []) // eslint-disable-line

  const visitCount = useMemo(
    () => visits.reduce((m, v) => m.set(v.patient_id, (m.get(v.patient_id) || 0) + 1), new Map()),
    [visits],
  )

  const queuedPatientIds = useMemo(
    () => new Set(visits.filter((v) => v.queue_status === 'waiting').map((v) => v.patient_id)),
    [visits],
  )

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    const list = [...patients].sort((a, b) => {
      const aQ = queuedPatientIds.has(a.patient_id) ? 0 : 1
      const bQ = queuedPatientIds.has(b.patient_id) ? 0 : 1
      if (aQ !== bQ) return aQ - bQ
      return a.patient_id.localeCompare(b.patient_id)
    })
    return list.filter((p) => {
      if (queueOnly && !queuedPatientIds.has(p.patient_id)) return false
      if (!t) return true
      return (
        p.patient_id.toLowerCase().includes(t) ||
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(t) ||
        `${p.last_name} ${p.first_name}`.toLowerCase().includes(t)
      )
    })
  }, [patients, q, queueOnly, queuedPatientIds])

  const selected = patients.find((p) => p.patient_id === selectedId)
  const activeWaitingVisit = useMemo(
    () => (selected ? visits.find((v) => v.patient_id === selected.patient_id && v.queue_status === 'waiting') : null),
    [selected, visits],
  )

  return (
    <div className="rise">
      <h1 className="text-4xl font-extrabold tracking-tight">Patients &amp; Records</h1>
      <p className="mt-1 text-slate-500">Find patient profiles, review visit history, and document care.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative flex flex-1 items-center sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-periwinkle focus:ring-2 focus:ring-periwinkle/20"
            placeholder="Search by patient name or ID (e.g. AMP-2026-0003)"
            autoFocus
          />
        </label>

        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setQueueOnly(false)}
            className={`rounded-lg px-3 py-1.5 transition ${!queueOnly ? 'bg-indigo-deep text-white' : 'text-slate-500 hover:text-ink'}`}
          >
            All ({patients.length})
          </button>
          <button
            type="button"
            onClick={() => setQueueOnly(true)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${queueOnly ? 'bg-indigo-deep text-white' : 'text-slate-500 hover:text-ink'}`}
          >
            <Clock className="h-3.5 w-3.5" /> In Queue ({queuedPatientIds.size})
          </button>
        </div>

        {can('visits.complete') && (
          <button
            type="button"
            disabled={!activeWaitingVisit}
            onClick={() => activeWaitingVisit && markVisitDone(activeWaitingVisit.visit_id)}
            title={activeWaitingVisit ? `Mark ${selected.first_name} ${selected.last_name}'s visit as done` : 'Select a queued patient to mark as done'}
            className={`ml-auto inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeWaitingVisit
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20 hover:bg-emerald-700'
                : 'cursor-not-allowed bg-slate-100 text-slate-400'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" /> Mark as Done
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
          <div className="flex items-end justify-between bg-gradient-to-r from-indigo-100 to-sky-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-extrabold text-indigo-deep">
                {queueOnly ? 'Active patient queue' : 'Patient directory'}
              </h2>
              <p className="text-xs text-indigo-900/60">
                {results.length} of {patients.length} records available on this device
              </p>
            </div>
            <p className="tracked text-[10px] font-bold uppercase text-indigo-900/50">
              {queuedPatientIds.size > 0 ? 'Queued first' : 'Patient ID · A–Z'}
            </p>
          </div>
          <ul className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto">
            {results.map((p) => {
              const inQueue = queuedPatientIds.has(p.patient_id)
              return (
                <li key={p.patient_id}>
                  <button
                    onClick={() => setSelectedId(p.patient_id)}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-indigo-50/50 ${selectedId === p.patient_id ? 'bg-indigo-50' : ''}`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-rose-400">
                      {initials(`${p.first_name} ${p.last_name}`)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-indigo-deep">
                        {p.first_name} {p.last_name}
                        {inQueue && <QueueBadge status="waiting" />}
                        {p.sync_status === 'pending' && <Pending />}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {p.patient_id} · {p.gender} · DOB {fmtDate(p.dob)}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400">{visitCount.get(p.patient_id) || 0} visits</span>
                    <ArrowUpRight className="h-4 w-4 text-rose-300" />
                  </button>
                </li>
              )
            })}
            {results.length === 0 && (
              <li className="p-8 text-center text-sm text-slate-500">
                {queueOnly ? 'No patients currently waiting in queue.' : `No patient matches “${q}”.`}
              </li>
            )}
          </ul>
        </section>

        {selected ? (
          <PatientChart patient={selected} onAddVisit={() => setVisitFor(selected)} />
        ) : (
          <section className="grid place-items-center rounded-2xl bg-sky-50 p-10 text-center">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <Users className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold">Select a patient</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
                Choose a patient from the directory to review their profile and visit history.
              </p>
              {can('patients.register') && (
                <button onClick={() => setRegisterOpen(true)} className="btn-ghost mt-5">
                  <Plus className="h-4 w-4" /> Register new patient
                </button>
              )}
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

function QueueBadge({ status }) {
  if (status === 'waiting') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">
        <Clock className="h-2.5 w-2.5" /> In Queue
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
      <CheckCircle2 className="h-2.5 w-2.5" /> Done
    </span>
  )
}

function PatientChart({ patient, onAddVisit }) {
  const { visits, dispensing, can, markVisitDone } = useWorkspace()
  const history = visits
    .filter((v) => v.patient_id === patient.patient_id)
    .sort((a, b) => b.visit_date.localeCompare(a.visit_date))
  const meds = dispensing.filter((d) => d.patient_id === patient.patient_id)
  const clinical = can('patients.history')
  const canAdd = can('visits.intake') || can('visits.vitals') || can('visits.clinical')
  const canComplete = can('visits.complete')
  const age = Math.floor((Date.now() - new Date(patient.dob)) / 3.15576e10)

  return (
    <section className="card rise overflow-hidden">
      <div className="flex flex-wrap items-start gap-4 border-b border-slate-100 p-6">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-extrabold text-white">
          {initials(`${patient.first_name} ${patient.last_name}`)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold">
            {patient.first_name} {patient.last_name}
            {patient.sync_status === 'pending' && <Pending />}
          </h2>
          <p className="font-mono text-sm font-bold text-indigo-600">{patient.patient_id}</p>
          <p className="mt-1 text-xs text-slate-500">
            {patient.gender} · {age} yrs · DOB {fmtDate(patient.dob)} · {patient.address} · {patient.contact_number || 'No contact recorded'}
          </p>
        </div>
        {canAdd && (
          <button onClick={onAddVisit} className="btn-dark py-2">
            <Plus className="h-4 w-4" /> New visit
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">
            Visit history · {history.length}
          </h3>
          {!clinical && (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
              <EyeOff className="h-3 w-3" /> Clinical notes hidden for your role
            </span>
          )}
        </div>
        {history.length === 0 && (
          <p className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No visits recorded yet.</p>
        )}
        <ol className="relative mt-4 space-y-4 border-l-2 border-indigo-100 pl-5">
          {history.map((v) => {
            const vm = meds.filter((d) => d.visit_id === v.visit_id)
            const isWaiting = v.queue_status === 'waiting'
            return (
              <li key={v.visit_id} className="relative">
                <span
                  className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white ring-2 ${
                    isWaiting ? 'bg-sky-500 ring-sky-100' : 'bg-indigo-500 ring-indigo-100'
                  }`}
                />
                <div
                  className={`rounded-xl border p-4 ${
                    isWaiting ? 'border-sky-200 bg-sky-50/40' : 'border-slate-100 bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold">{fmtDate(v.visit_date)}</p>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                      {v.purpose_of_visit}
                    </span>
                    <QueueBadge status={v.queue_status || 'done'} />
                    {v.sync_status === 'pending' && <Pending />}
                    <span className="ml-auto text-[11px] text-slate-400">
                      {userName(v.attending_staff_id)}
                    </span>
                  </div>

                  {isWaiting && canComplete && (
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-sky-200 bg-white px-3 py-2">
                      <span className="text-xs font-medium text-slate-600">
                        Patient is currently waiting in the clinical queue.
                      </span>
                      <button
                        type="button"
                        onClick={() => markVisitDone(v.visit_id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Done
                      </button>
                    </div>
                  )}

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
                      {v.chief_complaint && (
                        <p className="mt-2 text-xs text-slate-600">
                          <b>Complaint:</b> {v.chief_complaint}
                        </p>
                      )}
                      {v.diagnosis && (
                        <p className="mt-1 text-xs text-slate-600">
                          <b>Diagnosis:</b> {v.diagnosis}
                        </p>
                      )}
                      {v.clinical_notes && (
                        <p className="mt-1 text-xs text-slate-600">
                          <b>Notes:</b> {v.clinical_notes}
                        </p>
                      )}
                      {v.prescription_notes && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                          <ClipboardList className="h-3 w-3" /> {v.prescription_notes}
                        </p>
                      )}
                      {vm.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {vm.map((d) => (
                            <span
                              key={d.transaction_id}
                              className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                            >
                              <Pill className="h-3 w-3" /> {supplyById(d.supply_id)?.item_name} × {d.quantity_dispensed}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : v.chief_complaint && can('visits.intake') ? (
                    <p className="mt-2 text-xs text-slate-600">
                      <b>Intake:</b> {v.chief_complaint}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

const Vital = ({ k, v }) => (
  <span className="rounded-md bg-white px-2 py-0.5 ring-1 ring-slate-200">
    <b className="text-slate-500">{k}</b> {v}
  </span>
)
