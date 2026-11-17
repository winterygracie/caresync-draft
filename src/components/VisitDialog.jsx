import { useState } from 'react'
import Modal from './Modal.jsx'
import { VISIT_PURPOSES } from '../data/fixtures.js'
import { useWorkspace } from '../lib/workspace.jsx'

export default function VisitDialog({ patient, onClose }) {
  const { addVisit, can, user } = useWorkspace()
  const [f, setF] = useState({ purpose_of_visit: VISIT_PURPOSES[1], bp: '', temp: '', weight: '', pulse: '', chief_complaint: '', diagnosis: '', clinical_notes: '', prescription_notes: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  if (!patient) return null
  const vitals = can('visits.vitals') || can('visits.clinical')
  const clinical = can('visits.clinical')

  const save = (e) => {
    e.preventDefault()
    const v = {}
    if (f.bp) v.bp = f.bp
    if (f.temp) v.temp = Number(f.temp)
    if (f.weight) v.weight = Number(f.weight)
    if (f.pulse) v.pulse = Number(f.pulse)
    addVisit(patient.patient_id, {
      purpose_of_visit: f.purpose_of_visit, chief_complaint: f.chief_complaint, vitals_json: vitals ? v : {},
      clinical_notes: vitals ? f.clinical_notes : '', diagnosis: clinical ? f.diagnosis : '', prescription_notes: clinical ? f.prescription_notes : '',
    })
    onClose()
  }

  return (
    <Modal open onClose={onClose} width="max-w-xl" label="New visit">
      <form onSubmit={save}>
        <p className="tracked text-[10px] font-bold uppercase text-indigo-500">{user.role}</p>
        <h2 className="mt-1 text-xl font-extrabold">New visit · {patient.first_name} {patient.last_name}</h2>
        <p className="text-sm text-slate-500">Appended to {patient.patient_id}’s continuous history.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">Purpose of visit *</label><select className="input" value={f.purpose_of_visit} onChange={set('purpose_of_visit')}>{VISIT_PURPOSES.map((p) => <option key={p}>{p}</option>)}</select></div>
          <div className="sm:col-span-2"><label className="label">Chief complaint</label><input className="input" value={f.chief_complaint} onChange={set('chief_complaint')} /></div>
          {vitals && <>
            <div><label className="label">Blood pressure</label><input className="input" placeholder="120/80" value={f.bp} onChange={set('bp')} /></div>
            <div><label className="label">Temperature (°C)</label><input className="input" type="number" step="0.1" value={f.temp} onChange={set('temp')} /></div>
            <div><label className="label">Weight (kg)</label><input className="input" type="number" step="0.1" value={f.weight} onChange={set('weight')} /></div>
            <div><label className="label">Pulse (bpm)</label><input className="input" type="number" value={f.pulse} onChange={set('pulse')} /></div>
            <div className="sm:col-span-2"><label className="label">Clinical notes</label><textarea rows={2} className="input" value={f.clinical_notes} onChange={set('clinical_notes')} /></div>
          </>}
          {clinical && <>
            <div className="sm:col-span-2"><label className="label">Diagnosis</label><input className="input" value={f.diagnosis} onChange={set('diagnosis')} /></div>
            <div className="sm:col-span-2"><label className="label">Prescription notes</label><textarea rows={2} className="input" value={f.prescription_notes} onChange={set('prescription_notes')} /></div>
          </>}
        </div>
        {!clinical && <p className="mt-3 text-[11px] text-slate-400">Diagnosis and prescriptions are recorded by the attending doctor.</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-dark py-2">Save visit</button>
        </div>
      </form>
    </Modal>
  )
}
