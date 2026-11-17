import { Navigate, Route, Routes } from 'react-router-dom'
import { WorkspaceProvider, useWorkspace } from './lib/workspace.jsx'
import Landing from './pages/Landing.jsx'
import AppShell from './components/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Patients from './pages/Patients.jsx'
import Inventory from './pages/Inventory.jsx'
import SyncCenter from './pages/SyncCenter.jsx'

function Guard({ perm, children }) {
  const { user, can } = useWorkspace()
  if (!user) return <Navigate to="/" replace />
  if (perm && !can(perm)) return <Navigate to="/app" replace />
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
