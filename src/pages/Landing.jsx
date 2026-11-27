this is the landing page: import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ShieldCheck, TriangleAlert, X, Lock, RefreshCw, Share, Plus, Copy, PanelLeft, CircleCheck } from 'lucide-react'
import { PulseMark } from '../components/Logo.jsx'
import SignInModal, { homeFor } from '../components/SignInModal.jsx'
import { findSimilarPatients, fmtDate, useWorkspace } from '../lib/workspace.jsx'
import { DEFAULT_ADDRESS, VISIT_PURPOSES } from '../data/fixtures.js'

export default function Landing() {
  const { user } = useWorkspace()
  const navigate = useNavigate()
  const [modal, setModal] = useState(null)
  const openSignIn = () => (user ? navigate(homeFor(user.role)) : setModal('signin'))

  return (
    <div className="mesh-bg relative min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full bg-violet-400/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[460px] w-[460px] rounded-full bg-indigo-400/30 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-4 sm:gap-12">
          <PulseMark className="h-9 w-9" />
          <p className="tracked hidden text-[11px] font-semibold uppercase text-ink sm:block">
            Ampayon Super Health Center <span className="mx-2 text-slate-400">·</span> Butuan City
          </p>
        </div>
        <button onClick={openSignIn} className="btn-dark px-6 py-3 text-[15px]">{user ? 'Open workspace' : 'Sign In'}</button>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:pt-16">
        <section className="rise">
          <p className="text-sm font-extrabold uppercase tracking-tight text-ink">Care. Synced.</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-ink sm:text-6xl lg:text-[68px]">
            Health center that <span className="bg-gradient-to-r from-violet-500 via-periwinkle to-indigo-500 bg-clip-text text-transparent">goes digital.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-700">
            A simpler, more connected workspace for the people caring for Ampayon, Butuan City.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button onClick={() => (user ? openSignIn() : setModal('create'))} className="btn-dark px-7 py-3.5 text-[15px]">Create Account</button>
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CircleCheck className="h-4 w-4 text-emerald-500" /> Works offline · syncs within 5 minutes
            </span>
          </div>
        </section>

        <PreviewFrame />
      </main>

      <SignInModal open={!!modal} mode={modal} onClose={() => setModal(null)} />
    </div>
  )
}

/* ---------------- interactive product preview ---------------- */

function PreviewFrame() {
  return (
    <div className="rise relative" style={{ animationDelay: '.15s' }}>
      <div className="absolute inset-x-6 -bottom-5 h-10 rounded-b-2xl bg-white/60 shadow-lg" />
      <div className="absolute inset-x-12 -bottom-10 h-10 rounded-b-2xl bg-white/40 shadow" />
      <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_30px_80px_-30px_rgba(60,50,160,.45)]">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <PanelLeft className="h-3.5 w-3.5 text-slate-400" />
          <div className="mx-auto flex w-1/2 items-center justify-center gap-1.5 rounded-md bg-indigo-100/70 px-3 py-1 text-[11px] font-medium text-slate-600">
            <Lock className="h-2.5 w-2.5" /> care-sync. <RefreshCw className="ml-auto h-2.5 w-2.5 text-slate-400" />
          </div>
          <div className="flex gap-2 text-slate-400"><Share className="h-3.5 w-3.5" /><Plus className="h-3.5 w-3.5" /><Copy className="h-3.5 w-3.5" /></div>
        </div>
        <div className="grid-canvas relative grid min-h-[520px] gap-5 p-5 sm:grid-cols-2 sm:p-8">
          <MiniRegister />
          <div className="hidden items-center sm:flex"><MiniRegister idle /></div>
        </div>
      </div>
    </div>
  )
}

function MiniRegister({ idle = false }) {
  const { patients } = useWorkspace()
  const [form, setForm] = useState(idle
    ? { first_name: '', last_name: '', dob: '', gender: 'Female', purpose: VISIT_PURPOSES[0] }
    : { first_name: 'Ann', last_name: 'Cahilig', dob: '', gender: 'Female', purpose: VISIT_PURPOSES[0] })
  const [checked, setChecked] = useState(!idle)
  const [done, setDone] = useState(null)
  const matches = useMemo(() => (checked ? findSimilarPatients(patients, form) : []), [checked, patients, form])
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setDone(null) }

  return (
    <div className={`${idle ? 'floaty-delay' : 'floaty'} w-full rounded-xl bg-white p-4 text-[11px] shadow-[0_12px_40px_-12px_rgba(18,18,38,.25)] ring-1 ring-slate-200/70`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="tracked text-[8px] font-bold uppercase text-indigo-500">Ampayon CareSync</p>
          <p className="mt-1 text-[13px] font-bold">Register patient</p>
          <p className="mt-0.5 text-[10px] leading-snug text-slate-500">Register the patient and record why they came to the health center. Required fields are marked.</p>
        </div>
        <X className="h-3 w-3 text-slate-400" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Field label="First name *"><input className="mini" value={form.first_name} onChange={set('first_name')} /></Field>
        <Field label="Last name *"><input className="mini" value={form.last_name} onChange={set('last_name')} /></Field>
        <Field label="Date of birth *"><input type="date" className="mini" value={form.dob} onChange={set('dob')} /></Field>
        <Field label="Gender">
          <div className="relative"><select className="mini appearance-none" value={form.gender} onChange={set('gender')}><option>Female</option><option>Male</option></select><ChevronDown className="pointer-events-none absolute right-1.5 top-1.5 h-3 w-3 text-slate-500" /></div>
        </Field>
      </div>
      <Field label="Address" className="mt-2"><input className="mini" defaultValue={DEFAULT_ADDRESS} /></Field>
      <Field label="Contact number" className="mt-2"><input className="mini" placeholder="09XXXXXXXXX" /></Field>
      <Field label="Purpose of visit *" className="mt-2">
        <div className="relative"><select className="mini appearance-none" value={form.purpose} onChange={set('purpose')}>{VISIT_PURPOSES.map((p) => <option key={p}>{p}</option>)}</select><ChevronDown className="pointer-events-none absolute right-1.5 top-1.5 h-3 w-3 text-slate-500" /></div>
      </Field>
      <div className="mt-3 flex gap-1.5 rounded-md bg-indigo-50 p-2 text-[9px] leading-snug text-indigo-900/80">
        <ShieldCheck className="h-3 w-3 shrink-0 text-indigo-500" /> Duplicate check compares name and date of birth. Review any possible match before confirming a separate registration.
      </div>

      {checked && matches.length > 0 && !done && (
        <div className="mt-2 rounded-md border border-indigo-200 bg-indigo-50/70 p-2">
          <p className="flex items-center gap-1 text-[10px] font-bold text-indigo-900"><TriangleAlert className="h-3 w-3" /> Similar existing profile found — staff review required</p>
          <div className="mt-1.5 space-y-1.5">
            {matches.slice(0, 3).map(({ patient: p }) => (
              <button key={p.patient_id} onClick={() => setDone(`Visit added to ${p.patient_id}`)} className="block w-full rounded bg-amber-50/80 p-1.5 text-left ring-1 ring-amber-100 transition hover:ring-indigo-300">
                <span className="block font-bold text-indigo-900">{p.first_name} {p.last_name}</span>
                <span className="block text-[9px] text-slate-500">{p.patient_id} · DOB {fmtDate(p.dob)} · {p.gender}</span>
                <span className="block text-[9px] text-slate-500">{p.address} · {p.contact_number || 'No contact recorded'}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {checked && matches.length === 0 && !done && form.last_name && (
        <p className="mt-2 rounded-md bg-emerald-50 p-2 text-[10px] font-semibold text-emerald-700">No similar profiles — safe to register.</p>
      )}
      {done && <p className="mt-2 rounded-md bg-emerald-50 p-2 text-[10px] font-semibold text-emerald-700">✓ {done}</p>}

      <button
        onClick={() => (checked ? setDone('New Patient ID assigned: AMP-2026-0011') : setChecked(true))}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-sky-400 to-indigo-400 py-2 text-[10px] font-bold text-white transition hover:brightness-105"
      >
        <ShieldCheck className="h-3 w-3" /> {checked ? 'Confirm review & assign Patient ID' : 'Check existing profiles'}
      </button>
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-0.5 block text-[9px] font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  )
}
