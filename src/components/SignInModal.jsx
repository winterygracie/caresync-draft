import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  ClipboardList,
  Database,
  HeartPulse,
  Lock,
  Stethoscope,
  Users,
} from 'lucide-react'
import Modal from './Modal.jsx'
import { PulseMark } from './Logo.jsx'
import { DEMO_PASSWORD, USERS } from '../data/fixtures.js'
import { useWorkspace } from '../lib/workspace.jsx'

const ROLES = {
  DOCTOR: 'Doctor',
  REGISTRATION: 'Barangay Health Worker',
  CLINICAL: 'Nurse',
  CLERK: 'Administrative Clerk',
  CONTROLLER: 'Data Controller',
}

const ROLE_ICON = {
  [ROLES.DOCTOR]: Stethoscope,
  [ROLES.REGISTRATION]: Users,
  [ROLES.CLINICAL]: HeartPulse,
  [ROLES.CLERK]: ClipboardList,
  [ROLES.CONTROLLER]: Database,
}

export const homeFor = (role) => {
  if (role === ROLES.CLERK) return '/app/inventory'
  if (role === ROLES.CONTROLLER) return '/app/sync'
  if (role === ROLES.DOCTOR) return '/app'
  return '/app/patients'
}

export default function SignInModal({ open, onClose, mode = 'signin' }) {
  const navigate = useNavigate()
  const { signIn } = useWorkspace()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const go = (user) => {
    if (!user) return
    onClose()
    navigate(homeFor(user.role))
  }

  const submit = (e) => {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    const known = USERS.find((u) => u.email.toLowerCase() === normalizedEmail)

    if (!known || password !== DEMO_PASSWORD) {
      setError('Those credentials don’t match a CareSync staff account.')
      return
    }

    go(signIn(known.email))
  }

  const quick = (user) => {
    setError('')
    go(signIn(user.email))
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-2xl" label="Sign in to CareSync">
      <div className="grid gap-6 md:grid-cols-[1fr_1.05fr]">
        <form onSubmit={submit} className="flex flex-col">
          <PulseMark className="h-9 w-9" />
          <p className="tracked mt-5 text-[10px] font-bold uppercase text-periwinkle">
            Staff access
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
            {mode === 'create' ? 'Join your workspace' : 'Sign in to CareSync'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'create'
              ? 'Staff accounts are issued by the health center. Try the workspace with any demo role.'
              : 'Use your health center email and password.'}
          </p>

          <label className="label mt-5" htmlFor="signin-email">
            Email
          </label>
          <input
            id="signin-email"
            className="input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder="name@caresync.ph"
            required
          />

          <label className="label mt-3" htmlFor="signin-password">
            Password
          </label>
          <input
            id="signin-password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            placeholder="••••••••"
            required
          />

          {error && (
            <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>
          )}

          <button type="submit" className="btn-dark mt-5 w-full">
            <Lock className="h-4 w-4" />
            Sign In
          </button>

          <p className="mt-3 text-[11px] text-slate-400">
            Demo password for every account:{' '}
            <span className="font-mono font-semibold text-slate-600">
              {DEMO_PASSWORD}
            </span>
          </p>
        </form>

        <div className="rounded-xl bg-gradient-to-br from-indigo-50 via-violet-50 to-sky-50 p-4">
          <p className="tracked text-[10px] font-bold uppercase text-slate-500">
            One-click demo login
          </p>
          <div className="mt-3 space-y-2">
            {USERS.map((u) => {
              const Icon = ROLE_ICON[u.role] || ClipboardList
              return (
                <button
                  key={u.id}
                  onClick={() => quick(u)}
                  className="group flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-periwinkle/40"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-500">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{u.role}</span>
                    <span className="block truncate text-[11px] text-slate-500">
                      {u.full_name} · {u.blurb}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-periwinkle" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}
