import { useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  CircleHelp,
  Database,
  LayoutGrid,
  Lock,
  LogOut,
  Package,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { Wordmark } from './Logo.jsx'
import SyncBadge from './SyncBadge.jsx'
import { ROLES } from '../data/fixtures.js'
import { initials, isClerk, isController, useWorkspace } from '../lib/workspace.jsx'

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutGrid, end: true, allowBhw: true },
  { to: '/app/patients', label: 'Patients & Records', icon: Users, perm: 'patients.read', allowBhw: true },
  { to: '/app/inventory', label: 'Inventory', icon: Package, perm: 'inventory.read', allowBhw: false },
  { to: '/app/sync', label: 'Sync Center', icon: Database, perm: 'sync.monitor', allowBhw: false },
]

const TITLES = {
  '/app': 'Dashboard',
  '/app/patients': 'Patients & Records',
  '/app/inventory': 'Inventory',
  '/app/sync': 'Sync Center',
}

export default function AppShell() {
  const { user, signOut, can, simulateOffline, setSimulateOffline } = useWorkspace()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [helpOpen, setHelpOpen] = useState(false)
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  if (!user) return null

  const isBhw = user.role === ROLES?.REGISTRATION || user.role === 'Barangay Health Worker'
  const clerk = isClerk(user) || user.role === ROLES?.CLERK
  const controller = isController(user) || user.role === ROLES?.CONTROLLER

  // Data Controller: ONLY /app/sync (blocks Dashboard, Patients & Records, and Inventory)
  if (controller && !pathname.startsWith('/app/sync')) {
    return <Navigate to="/app/sync" replace />
  }

  // Sync Center: EXCLUSIVELY accessible by Data Controller
  if (!controller && pathname.startsWith('/app/sync')) {
    return <Navigate to={clerk ? '/app/inventory' : '/app'} replace />
  }

  // Administrative Clerk: ONLY /app/inventory
  if (clerk && !pathname.startsWith('/app/inventory')) {
    return <Navigate to="/app/inventory" replace />
  }

  const isLocked = (n) => {
    // Sync Center is EXCLUSIVELY unlocked for Data Controller
    if (n.to === '/app/sync') return !controller
    if (controller) return true
    if (clerk) return n.to !== '/app/inventory'
    if (isBhw && n.allowBhw === false) return true
    if (isBhw && n.allowBhw === true) return false
    return Boolean(n.perm && !can(n.perm))
  }

  // For Data Controller and Administrative Clerk, only display their permitted tab
  const visibleNav = NAV.filter((n) => !(controller || clerk) || !isLocked(n))

  return (
    <div className="workspace-bg flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white/90 px-4 py-6 backdrop-blur lg:flex">
        <div className="px-2">
          <Wordmark />
        </div>
        <p className="tracked mt-10 px-3 text-[10px] font-bold uppercase text-slate-400">
          Workspace
        </p>
        <nav className="mt-3 space-y-1">
          {visibleNav.map((n) => {
            const locked = isLocked(n)
            if (locked) {
              return (
                <div
                  key={n.to}
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300"
                  title={`Not available for ${user.role}`}
                >
                  <n.icon className="h-4.5 w-4.5" /> {n.label}{' '}
                  <Lock className="ml-auto h-3.5 w-3.5" />
                </div>
              )
            }
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-indigo-deep text-white shadow-md shadow-indigo-900/20'
                      : 'text-indigo-deep/80 hover:bg-indigo-50'
                  }`
                }
              >
                <n.icon className="h-4.5 w-4.5" /> {n.label}
              </NavLink>
            )
          })}
          {!controller && !clerk && (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300">
              <CalendarDays className="h-4.5 w-4.5" /> Appointments{' '}
              <span className="ml-auto rounded bg-slate-100 px-1.5 text-[9px] text-slate-400">
                SOON
              </span>
            </div>
          )}
        </nav>

        <div className="mt-auto rounded-2xl bg-indigo-deep p-4 text-white">
          <CircleHelp className="h-6 w-6 rounded-md bg-white/15 p-1" />
          <p className="mt-3 text-sm font-bold">Try offline mode</p>
          <p className="mt-1 text-[11px] leading-relaxed text-white/70">
            Simulate a dropped connection, keep working, then reconnect to watch
            records sync.
          </p>
          <button
            onClick={() => setSimulateOffline(!simulateOffline)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/15 py-2 text-xs font-bold transition hover:bg-white/25"
          >
            {simulateOffline ? (
              <>
                <Wifi className="h-3.5 w-3.5" /> Reconnect
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" /> Go offline
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 px-2 pt-4">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-deep text-xs font-bold text-white">
            {initials(user.full_name)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-bold">{user.full_name}</p>
            <p className="truncate text-[11px] text-slate-500">{user.role}</p>
          </div>
          <button
            onClick={() => {
              signOut()
              navigate('/')
            }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/70 bg-white/80 px-5 py-3.5 backdrop-blur lg:px-8">
          <p className="text-sm text-slate-400">
            Workspace <span className="mx-1">/</span>{' '}
            <span className="font-bold text-ink">
              {TITLES[pathname] || 'Workspace'}
            </span>
          </p>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <SyncBadge
              onClick={() =>
                controller ? navigate('/app/sync') : setHelpOpen(!helpOpen)
              }
            />
            <button
              onClick={() => setSimulateOffline(!simulateOffline)}
              className="btn-ghost hidden py-1.5 text-xs sm:inline-flex lg:hidden"
            >
              {simulateOffline ? 'Reconnect' : 'Go offline'}
            </button>
            <button
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>
            <button
              onClick={() => {
                signOut()
                navigate('/')
              }}
              className="grid h-9 w-9 place-items-center rounded-full bg-indigo-deep text-xs font-bold text-white lg:hidden"
              title="Sign out"
            >
              {initials(user.full_name)}
            </button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200/70 bg-white/70 px-4 py-2 lg:hidden">
          {NAV.filter((n) => !isLocked(n)).map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
                  isActive
                    ? 'bg-indigo-deep text-white'
                    : 'text-indigo-deep'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        {helpOpen && (
          <div className="mx-5 mt-4 rounded-xl bg-white p-4 text-xs text-slate-600 shadow ring-1 ring-slate-200 lg:mx-8">
            Records you save while offline are stored on this device and pushed
            automatically within a minute of reconnecting. Pending items show an
            amber <b>Pending</b> tag.
          </div>
        )}

        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
            <p className="tracked text-xs font-extrabold uppercase text-indigo-deep">
              Ampayon Super Health Center
            </p>
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
              {today}
            </span>
          </div>
          <Outlet />
        </main>

        <footer className="flex justify-between px-8 pb-8 text-[11px] text-slate-400">
          <span>Ampayon CareSync · Butuan City</span>
          <span>Demo data · {user.role} view</span>
        </footer>
      </div>
    </div>
  )
}
