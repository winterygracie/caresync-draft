import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  CircleCheck,
  Copy,
  Database,
  Lock,
  PanelLeft,
  Plus,
  RefreshCw,
  Share,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { PulseMark } from '../components/Logo.jsx'
import SignInModal, { homeFor } from '../components/SignInModal.jsx'
import { useWorkspace } from '../lib/workspace.jsx'

export default function Landing() {
  const { user } = useWorkspace()
  const navigate = useNavigate()
  const [modal, setModal] = useState(null)

  const handleSignInAction = () => {
    if (user) {
      navigate(homeFor(user.role))
      return
    }
    setModal('signin')
  }

  return (
    <div className="mesh-bg relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full bg-violet-400/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[460px] w-[460px] rounded-full bg-indigo-400/30 blur-3xl"
      />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-4 sm:gap-12">
          <PulseMark className="h-9 w-9" />
          <p className="tracked hidden text-[11px] font-semibold uppercase text-ink sm:block">
            Ampayon Super Health Center{' '}
            <span className="mx-2 text-slate-400">·</span> Butuan City
          </p>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:pt-16">
        <section className="rise">
          <p className="text-sm font-extrabold uppercase tracking-tight text-ink">
            Care. Synced.
          </p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-ink sm:text-6xl lg:text-[68px]">
            Health center that{' '}
            <span className="bg-gradient-to-r from-violet-500 via-periwinkle to-indigo-500 bg-clip-text text-transparent">
              goes digital.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-700">
            A simpler, more connected workspace for the people caring for
            Ampayon, Butuan City.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleSignInAction}
              className="btn-dark px-7 py-3.5 text-[15px]"
            >
              Sign In
            </button>
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CircleCheck className="h-4 w-4 text-emerald-500" /> Works offline
              · syncs within 5 minutes
            </span>
          </div>
        </section>

        <PreviewFrame />
      </main>

      <SignInModal
        open={!!modal}
        mode={modal || 'signin'}
        onClose={() => setModal(null)}
      />
    </div>
  )
}

/* ---------------- system introduction & sign-in preview ---------------- */

function PreviewFrame() {
  return (
    <div className="rise relative" style={{ animationDelay: '.15s' }}>
      <div className="absolute inset-x-6 -bottom-5 h-10 rounded-b-2xl bg-white/60 shadow-lg" />
      <div className="absolute inset-x-12 -bottom-10 h-10 rounded-b-2xl bg-white/40 shadow" />
      <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_30px_80px_-30px_rgba(60,50,160,.45)]">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <PanelLeft className="h-3.5 w-3.5 text-slate-400" />
          <div className="mx-auto flex w-1/2 items-center justify-center gap-1.5 rounded-md bg-indigo-100/70 px-3 py-1 text-[11px] font-medium text-slate-600">
            <Lock className="h-2.5 w-2.5" /> care-sync.{' '}
            <RefreshCw className="ml-auto h-2.5 w-2.5 text-slate-400" />
          </div>
          <div className="flex gap-2 text-slate-400">
            <Share className="h-3.5 w-3.5" />
            <Plus className="h-3.5 w-3.5" />
            <Copy className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="grid-canvas relative flex min-h-[520px] items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_12px_40px_-12px_rgba(18,18,38,.22)] ring-1 ring-slate-200/70 sm:p-7">
            <p className="tracked text-[10px] font-bold uppercase text-indigo-500">
              System Overview · Ampayon CareSync
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-ink">
              About Ampayon CareSync
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              <strong>Ampayon CareSync</strong> is a local-first health center
              management system designed for the{' '}
              <strong>Ampayon Super Health Center</strong> in Butuan City. It
              helps health center staff coordinate patient profiles, visit
              records, medicine inventory with FEFO batch tracking, and offline
              synchronization.
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <div>
                  <p className="font-bold text-slate-800">
                    Patient Profiles &amp; Visit History
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Search patient records, check for duplicates, and log daily
                    health center visits.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <div>
                  <p className="font-bold text-slate-800">
                    FEFO Inventory &amp; Stock Alerts
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Track medicine batches by earliest expiration, monitor
                    low-stock thresholds, and keep audit trails.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <Database className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-bold text-slate-800">
                    Offline-First Sync &amp; Role Access
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Keep working when connectivity drops and sync records with
                    role-appropriate permissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-[11px] font-medium text-indigo-900/80">
              <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-500" />
              Sign in with your assigned staff account to access your modules.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
