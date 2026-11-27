import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck, Copy, Lock, PanelLeft, Plus, RefreshCw, Share, ShieldCheck, Users, ClipboardList } from 'lucide-react'
import { PulseMark } from '../components/Logo.jsx'
import SignInModal, { homeFor } from '../components/SignInModal.jsx'
import { useWorkspace } from '../lib/workspace.jsx'

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
            <button onClick={() => (user ? openSignIn() : setModal('create'))} className="btn-dark px-7 py-3.5 text-[15px]">
              {user ? 'Open Workspace' : 'Create Account'}
            </button>
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CircleCheck className="h-4 w-4 text-emerald-500" /> Works offline · syncs within 5 minutes
            </span>
          </div>
        </section>

        <PreviewFrame onSignIn={openSignIn} signedIn={!!user} />
      </main>

      <SignInModal open={!!modal} mode={modal} onClose={() => setModal(null)} />
    </div>
  )
}

/* ---------------- interactive product preview ---------------- */

function PreviewFrame({ onSignIn, signedIn }) {
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

        <div className="grid-canvas relative flex min-h-[520px] flex-col items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_12px_40px_-12px_rgba(18,18,38,.22)] ring-1 ring-slate-200/70">
            <p className="tracked text-[10px] font-bold uppercase text-indigo-500">Ampayon Super Health Center</p>
            <h2 className="mt-1 text-xl font-extrabold text-ink">Barangay Health Workspace</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Sign in with your assigned staff role to access your workspace modules, patient records, and offline queue.
            </p>

            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <Users className="h-4 w-4 shrink-0 text-indigo-600" />
                <div>
                  <p className="font-bold text-slate-800">Patient Directory &amp; Intake</p>
                  <p className="text-[11px] text-slate-500">Search profiles, check duplicates, and record visits</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <ClipboardList className="h-4 w-4 shrink-0 text-indigo-600" />
                <div>
                  <p className="font-bold text-slate-800">Role-Based Access Control</p>
                  <p className="text-[11px] text-slate-500">Tailored views for BHW, Nurse, Doctor, and Admin</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-bold text-slate-800">Offline-First Reliability</p>
                  <p className="text-[11px] text-slate-500">Automatic sync when internet connection returns</p>
                </div>
              </div>
            </div>

            <button onClick={onSignIn} className="btn-dark mt-6 w-full py-2.5 text-xs">
              {signedIn ? 'Continue to Workspace' : 'Sign In to Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
