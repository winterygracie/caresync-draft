import { useMemo, useState } from 'react'
import { CircleCheck, ShieldCheck, TriangleAlert, UserRound } from 'lucide-react'
import Modal from './Modal.jsx'
import { DEFAULT_ADDRESS, VISIT_PURPOSES } from '../data/fixtures.js'
import { findSimilarPatients, fmtDate, useWorkspace } from '../lib/workspace.jsx'

const EMPTY = { first_name: '', last_name: '', dob: '', gender: 'Female', address: DEFAULT_ADDRESS, contact_number: '', purpose_of_visit: VISIT_PURPOSES[0], chief_complaint: '' }

export default function RegisterPatientDialog({ open, onClose, onDone }) {
  const { patients, registerPatient, addVisit, isOnline } = useWorkspace()
  const [form, setForm] = useState(EMPTY)
  const [chosen, setChosen] = useState(null)
  const [result, setResult] = useState(null)
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setChosen(null) }

  const matches = useMemo(() => findSimilarPatients(patients, form), [patients, form])
  const valid = form.first_name.trim() && form.last_name.trim() && form.dob && form.purpose_of_visit
  const close = () => { setForm(EMPTY); setChosen(null); setResult(null); onClose() }

  const intake = { purpose_of_visit: form.purpose_of_visit, chief_complaint: form.chief_complaint }
  const confirmNew = () => {
    const p = registerPatient(form)
    addVisit(p.patient_id, intake)
    setResult({ kind: 'new', patient: p })
  }
  const appendExisting = () => {
    addVisit(chosen.patient_id, intake)
    setResult({ kind: 'existing', patient: chosen })
  }

  if (result) {
    const p = result.patient
    return (
      <Modal open={open} onClose={close} label="Registration complete">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CircleCheck className="h-7 w-7" /></span>
          <h2 className="mt-4 text-xl font-extrabold">{result.kind === 'new' ? 'Patient registered' : 'Visit added to existing profile'}</h2>
          <p className="mt-1 text-sm text-slate-500">{p.first_name} {p.last_name}</p>
          <p className="mx-auto mt-4 w-fit rounded-xl bg-indigo-50 px-5 py-3 font-mono text-2xl font-extrabold text-indigo-700">{p.patient_id}</p>
          {p.patient_id.startsWith('TMP-') && <p className="mt-3 text-xs text-amber-700">Saved offline with a temporary ID. A permanent AMP-2026 ID is assigned when this device syncs.</p>}
          <p className="mt-3 text-xs text-slate-500">Intake logged: {form.purpose_of_visit}</p>
          <button onClick={() => { const id = p.patient_id; close(); onDone(id) }} className="btn-dark mt-6">Open patient chart</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={close} width="max-w-2xl" label="Register patient">
      <p className="tracked text-[10px] font-bold uppercase text-indigo-500">Ampayon CareSync</p>
      <h2 className="mt-1 text-xl font-extrabold">Register patient</h2>
      <p className="text-sm text-slate-500">Register the patient and record why they came to the health center. Required fields are marked.</p>
      {!isOnline && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Offline — this registration is stored on the device and synced automatically.</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div><label className="label">First name *</label><input className="input" value={form.first_name} onChange={set('first_name')} autoFocus /></div>
        <div><label className="label">Last name *</label><input className="input" value={form.last_name} onChange={set('last_name')} /></div>
        <div><label className="label">Date of birth *</label><input type="date" max={new Date().toISOString().slice(0, 10)} className="input" value={form.dob} onChange={set('dob')} /></div>
        <div><label className="label">Gender</label><select className="input" value={form.gender} onChange={set('gender')}><option>Female</option><option>Male</option></select></div>
        <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={set('address')} /></div>
        <div><label className="label">Contact number</label><input className="input" inputMode="tel" placeholder="09XXXXXXXXX" value={form.contact_number} onChange={set('contact_number')} /></div>
        <div><label className="label">Purpose of visit *</label><select className="input" value={form.purpose_of_visit} onChange={set('purpose_of_visit')}>{VISIT_PURPOSES.map((p) => <option key={p}>{p}</option>)}</select></div>
        <div className="sm:col-span-2"><label className="label">Reason / chief complaint</label><input className="input" placeholder="e.g. fever for 2 days" value={form.chief_complaint} onChange={set('chief_complaint')} /></div>
      </div>

      <div className="mt-4 flex gap-2 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-900/80">
        <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-500" /> Duplicate check compares name and date of birth as you type. Review any possible match before confirming a separate registration.
      </div>

      {matches.length > 0 && (
        <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
          <p className="flex items-center gap-1.5 text-sm font-bold text-indigo-900"><TriangleAlert className="h-4 w-4 text-amber-500" /> Similar existing profile found — staff review required</p>
          <p className="mt-0.5 text-xs text-indigo-900/70">Compare the records below. If one belongs to this patient, select it to add today’s visit to their history. Only continue if the person is different.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {matches.slice(0, 4).map(({ patient: p, reasons }) => (
              <button key={p.patient_id} onClick={() => setChosen(chosen?.patient_id === p.patient_id ? null : p)}
                className={`rounded-lg p-3 text-left text-xs transition ${chosen?.patient_id === p.patient_id ? 'bg-white ring-2 ring-indigo-500' : 'bg-amber-50/80 ring-1 ring-amber-100 hover:ring-indigo-300'}`}>
                <p className="flex items-center gap-1.5 text-sm font-bold text-indigo-900"><UserRound className="h-3.5 w-3.5" /> {p.first_name} {p.last_name}</p>
                <p className="mt-0.5 text-slate-600">{p.patient_id} · DOB {fmtDate(p.dob)} · {p.gender}</p>
                <p className="text-slate-500">{p.address} · {p.contact_number || 'No contact recorded'}</p>
                <p className="mt-1 text-[10px] font-semibold text-amber-700">Matches on {reasons.join(', ')}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button onClick={close} className="btn-ghost">Cancel</button>
        {chosen ? (
          <button onClick={appendExisting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-deep px-4 py-2 text-sm font-bold text-white">
            <CircleCheck className="h-4 w-4" /> Returning patient — add visit to {chosen.patient_id}
          </button>
        ) : (
          <button disabled={!valid} onClick={confirmNew} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40">
            <ShieldCheck className="h-4 w-4" /> {matches.length ? 'Confirm review & assign Patient ID' : 'Assign Patient ID'}
          </button>
        )}
      </div>
    </Modal>
  )
}
