import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { WorkspaceProvider, isClerk, isController, useWorkspace } from './lib/workspace.jsx'
import Landing from './pages/Landing.jsx'
import AppShell from './components/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Patients from './pages/Patients.jsx'
import Inventory from './pages/Inventory.jsx'
import SyncCenter from './pages/SyncCenter.jsx'

function Guard({ perm, children }) {
  const { user, can } = useWorkspace()
  const { pathname } = useLocation()

  if (!user) return <Navigate to="/" replace />

  const clerk = isClerk(user)
  const controller = isController(user)

  // Administrative Clerk: ONLY /app/inventory
  if (clerk && !pathname.startsWith('/app/inventory')) {
    return <Navigate to="/app/inventory" replace />
  }

  // Data Controller: ONLY /app/sync (blocks Dashboard, Patients & Records, and Inventory)
  if (controller && !pathname.startsWith('/app/sync')) {
    return <Navigate to="/app/sync" replace />
  }

  if (perm && !can(perm)) {
    return <Navigate to={clerk ? '/app/inventory' : controller ? '/app/sync' : '/app'} replace />
  }

  return children
}

export default function App() {
  return (
    <WorkspaceProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Guard><AppShell /></Guard>}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Guard perm="patients.read"><Patients /></Guard>} />
          <Route path="inventory" element={<Guard perm="inventory.read"><Inventory /></Guard>} />
          <Route path="sync" element={<Guard perm="sync.monitor"><SyncCenter /></Guard>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </WorkspaceProvider>
  )
}
