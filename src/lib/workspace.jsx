import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  BATCHES, DEFAULT_ADDRESS, DISPENSING, PATIENTS, PERMISSIONS, STOCK_ADJUSTMENTS, SUPPLIES, USERS, VISITS,
} from '../data/fixtures.js'

const WorkspaceContext = createContext(null)
const SESSION_KEY = 'caresync.session'
const STATE_KEY = 'caresync.state'

export const todayISO = () => new Date().toISOString().slice(0, 10)
export const isExpired = (batch, today = todayISO()) => batch.expiration_date <= today
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2))

// Role matchers
export const isClerk = (u) => /clerk/i.test(`${u?.role || ''} ${u?.title || ''}`)
export const isController = (u) => /controller/i.test(`${u?.role || ''} ${u?.title || ''}`)

const PATIENT_PERM = /^(patients?|visits?)[._:\-]/i
const INVENTORY_PERM = /^(inventory|supplies|batches|dispens)/i
const SYNC_PERM = /^sync[._:\-]/i

const loadState = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STATE_KEY)) || {}
    if (Array.isArray(parsed.customSupplies)) {
      for (const item of parsed.customSupplies) {
        if (!SUPPLIES.some((s) => s.supply_id === item.supply_id)) {
          SUPPLIES.push(item)
        }
      }
    }
    return parsed
  } catch {
    return {}
  }
}

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')
function distance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}
const close = (a, b) => a && b && (a === b || (Math.min(a.length, b.length) >= 3 && distance(a, b) <= (a.length > 5 ? 2 : 1)))

export function findSimilarPatients(patients, { first_name, last_name, dob }) {
  const f = norm(first_name), l = norm(last_name)
  if (!l && !f) return []
  return patients
    .map((p) => {
      const pf = norm(p.first_name), pl = norm(p.last_name)
      let score = 0
      const reasons = []
      if (close(l, pl)) { score += 2; reasons.push('last name') }
      if (close(f, pf)) { score += 2; reasons.push('first name') }
      if (dob && p.dob === dob) { score += 2; reasons.push('date of birth') }
      return { patient: p, score, reasons }
    })
    .filter((m) => m.score >= 4)
    .sort((a, b) => b.score - a.score)
}

export function planFefo(batches, supply_id, quantity, today = todayISO()) {
  const eligible = batches
    .filter((b) => b.supply_id === supply_id && b.quantity_on_hand > 0 && !isExpired(b, today))
    .sort((a, b) => a.expiration_date.localeCompare(b.expiration_date))
  const available = eligible.reduce((s, b) => s + b.quantity_on_hand, 0)
  if (quantity > available) return { ok: false, available, allocations: [] }
  let remaining = quantity
  const allocations = []
  for (const b of eligible) {
    if (remaining <= 0) break
    const take = Math.min(b.quantity_on_hand, remaining)
    allocations.push({ batch: b, quantity: take })
    remaining -= take
  }
  return { ok: true, available, allocations }
}

export function WorkspaceProvider({ children }) {
  const saved = useMemo(() => loadState(), [])
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
  })
  const [patients, setPatients] = useState(() => saved.patients || PATIENTS)
  const [visits, setVisits] = useState(() => saved.visits || VISITS)
  const [batches, setBatches] = useState(() => saved.batches || BATCHES)
  const [dispensing, setDispensing] = useState(() => saved.dispensing || DISPENSING)
  const [adjustments, setAdjustments] = useState(() => saved.adjustments || STOCK_ADJUSTMENTS)
  const [supplies, setSupplies] = useState(() => [...SUPPLIES])
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [simulateOffline, setSimulateOffline] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(() => new Date())
  const [syncLog, setSyncLog] = useState([
    { id: uuid(), at: new Date(Date.now() - 1000 * 60 * 42), kind: 'info', message: 'Scheduled sync complete · 0 records pushed' },
  ])
  const seq = useRef({
    patient: (saved.patients || PATIENTS).length,
    visit: (saved.visits || VISITS).length,
    dispense: (saved.dispensing || DISPENSING).length,
    adjust: (saved.adjustments || STOCK_ADJUSTMENTS).length,
    offline: 0,
  })

  const isOnline = online && !simulateOffline

  useEffect(() => {
    try {
      localStorage.setItem(
        STATE_KEY,
        JSON.stringify({ patients, visits, batches, dispensing, adjustments, customSupplies: supplies })
      )
    } catch {}
  }, [patients, visits, batches, dispensing, adjustments, supplies])

  useEffect(() => {
    const up = () => setOnline(true), down = () => setOnline(false)
    window.addEventListener('online', up); window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])

  // Data Controller: ONLY sync permissions (blocks patients & inventory; Dashboard is open)
  // All other roles: NO sync permissions
  const can = useCallback((perm) => {
    if (!user) return false
    if (isController(user)) {
      return SYNC_PERM.test(perm)
    }
    if (SYNC_PERM.test(perm)) {
      return false
    }
    if (isClerk(user)) {
      if (!INVENTORY_PERM.test(perm)) return false
      return (PERMISSIONS[user.role] || []).includes(perm)
    }
    return (PERMISSIONS[user.role] || []).includes(perm)
  }, [user])

  const canAccessDashboard = !!user && !isClerk(user)
  const canAccessPatients = !!user && !isClerk(user) && !isController(user)
  const canAccessInventory = !!user && !isController(user)
  const canAccessSync = !!user && isController(user)

  const signIn = useCallback((email) => {
    const found = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!found) return null
    localStorage.setItem(SESSION_KEY, JSON.stringify(found))
    setUser(found)
    return found
  }, [])
  const signOut = useCallback(() => { localStorage.removeItem(SESSION_KEY); setUser(null) }, [])

  const log = (kind, message) => setSyncLog((l) => [{ id: uuid(), at: new Date(), kind, message }, ...l].slice(0, 40))
  const status = () => (isOnline ? 'synced' : 'pending')

  const registerPatient = (data) => {
    const temp = !isOnline
    let patient_id
    if (temp) { seq.current.offline += 1; patient_id = `TMP-${String(seq.current.offline).padStart(3, '0')}` }
    else { seq.current.patient += 1; patient_id = `AMP-2026-${String(seq.current.patient).padStart(4, '0')}` }
    const now = new Date().toISOString()
    const patient = {
      patient_id, client_uuid: uuid(), first_name: data.first_name.trim(), last_name: data.last_name.trim(), dob: data.dob,
      gender: data.gender, address: data.address?.trim() || DEFAULT_ADDRESS, contact_number: data.contact_number?.trim() || '',
      created_at: now, updated_at: now, sync_status: status(),
    }
    setPatients((p) => [patient, ...p])
    if (temp) log('pending', `Patient ${patient.first_name} ${patient.last_name} saved offline as ${patient_id}`)
    return patient
  }

  const addVisit = (patient_id, data) => {
    seq.current.visit += 1
    const visit = {
      visit_id: `VIS-${String(seq.current.visit).padStart(4, '0')}`, client_uuid: uuid(), patient_id,
      attending_staff_id: user?.id, visit_date: todayISO(), purpose_of_visit: data.purpose_of_visit,
      vitals_json: data.vitals_json || {}, chief_complaint: data.chief_complaint || '', diagnosis: data.diagnosis || '',
      clinical_notes: data.clinical_notes || '', prescription_notes: data.prescription_notes || '', sync_status: status(),
    }
    setVisits((v) => [visit, ...v])
    if (!isOnline) log('pending', `Visit ${visit.visit_id} queued for ${patient_id}`)
    return visit
  }

  const receiveBatch = ({ supply_id, item_name, medicine_type, dosage_form, unit, batch_number, expiration_date, quantity }) => {
    const trimmedName = (item_name || '').trim()
    const matchedSupply =
      SUPPLIES.find((s) => s.supply_id === supply_id) ||
      (trimmedName ? SUPPLIES.find((s) => s.item_name.toLowerCase() === trimmedName.toLowerCase()) : null)

    let resolvedSupplyId = matchedSupply?.supply_id
    if (!resolvedSupplyId && trimmedName) {
      resolvedSupplyId = `MED-${uuid().slice(0, 6).toUpperCase()}`
      const newSupply = {
        supply_id: resolvedSupplyId,
        item_name: trimmedName,
        category: medicine_type || 'Uncategorized',
        dosage_form: dosage_form || '',
        unit: unit || 'unit',
        reorder_level: 10,
      }
      SUPPLIES.push(newSupply)
      setSupplies([...SUPPLIES])
    } else if (matchedSupply && (medicine_type || dosage_form)) {
      if (medicine_type) matchedSupply.category = medicine_type
      if (dosage_form) matchedSupply.dosage_form = dosage_form
      setSupplies([...SUPPLIES])
    }

    const batch = {
      batch_id: `BAT-${uuid().slice(0, 6).toUpperCase()}`,
      supply_id: resolvedSupplyId || supply_id,
      medicine_type: medicine_type || matchedSupply?.category || null,
      dosage_form: dosage_form || matchedSupply?.dosage_form || null,
      batch_number: batch_number.trim(),
      expiration_date,
      quantity_on_hand: Number(quantity),
      received_date: todayISO(),
      received_by: user?.id,
      sync_status: status(),
    }
    setBatches((b) => [...b, batch])
    return batch
  }

  const dispense = ({ supply_id, therapeutic_type, dosage_form, quantity, patient_id, visit_id }) => {
    const plan = planFefo(batches, supply_id, Number(quantity))
    if (!plan.ok) return plan
    const take = new Map(plan.allocations.map((a) => [a.batch.batch_id, a.quantity]))
    setBatches((bs) => bs.map((b) => (take.has(b.batch_id) ? { ...b, quantity_on_hand: b.quantity_on_hand - take.get(b.batch_id) } : b)))
    const rows = plan.allocations.map((a) => {
      seq.current.dispense += 1
      return {
        transaction_id: `DSP-${String(seq.current.dispense).padStart(4, '0')}`, client_uuid: uuid(), patient_id: patient_id || null,
        visit_id: visit_id || null, supply_id, therapeutic_type: therapeutic_type || null, dosage_form: dosage_form || null,
        batch_id: a.batch.batch_id, quantity_dispensed: a.quantity, dispensed_by: user?.id,
        dispensed_at: new Date().toISOString(), sync_status: status(),
      }
    })
    setDispensing((d) => [...rows, ...d])
    if (!isOnline) log('pending', `${rows.length} dispensing record(s) queued offline`)
    return plan
  }

  const adjustStock = ({ batch_id, adjusted_qty, reason, note }) => {
    const batch = batches.find((b) => b.batch_id === batch_id)
    seq.current.adjust += 1
    const row = {
      adjustment_id: `ADJ-${String(seq.current.adjust).padStart(4, '0')}`, batch_id, previous_qty: batch.quantity_on_hand,
      adjusted_qty: Number(adjusted_qty), reason, note, adjusted_by: user?.id, adjusted_at: new Date().toISOString(),
    }
    setAdjustments((a) => [row, ...a])
    setBatches((bs) => bs.map((b) => (b.batch_id === batch_id ? { ...b, quantity_on_hand: Number(adjusted_qty) } : b)))
    return row
  }

  const pendingCount = useMemo(
    () => [patients, visits, dispensing, batches].reduce((n, list) => n + list.filter((r) => r.sync_status === 'pending').length, 0),
    [patients, visits, dispensing, batches],
  )

  const latest = useRef({ patients })
  latest.current = { patients }

  const runSync = useCallback(async (reason = 'manual') => {
    if (!isOnline || syncing) return
    setSyncing(true)
    await new Promise((r) => setTimeout(r, 1200))
    const snap = latest.current
    const pushed = pendingCount
    const idMap = new Map()
    for (const p of snap.patients) {
      if (p.sync_status === 'pending' && p.patient_id.startsWith('TMP-')) {
        seq.current.patient += 1
        idMap.set(p.patient_id, `AMP-2026-${String(seq.current.patient).padStart(4, '0')}`)
      }
    }
    const settle = (r) => (r.sync_status === 'pending' || idMap.has(r.patient_id)
      ? { ...r, patient_id: idMap.get(r.patient_id) || r.patient_id, sync_status: 'synced' }
      : r)
    setPatients((ps) => ps.map(settle))
    setVisits((v) => v.map(settle))
    setDispensing((d) => d.map(settle))
    setBatches((b) => b.map((x) => (x.sync_status === 'pending' ? { ...x, sync_status: 'synced' } : x)))
    const mapped = [...idMap.entries()].map(([a, b]) => `${a} → ${b}`).join(', ')
    const label = reason === 'auto' ? 'Scheduled' : reason === 'reconnect' ? 'Reconnect' : 'Manual'
    log('success', `${label} sync complete · ${pushed} record(s) pushed${mapped ? ` · IDs assigned: ${mapped}` : ''}`)
    setLastSync(new Date())
    setSyncing(false)
  }, [isOnline, syncing, pendingCount])

  const wasOnline = useRef(isOnline)
  useEffect(() => {
    if (isOnline && !wasOnline.current) runSync('reconnect')
    wasOnline.current = isOnline
  }, [isOnline, runSync])
  useEffect(() => {
    const t = setInterval(() => { if (pendingCount > 0) runSync('auto') }, 60_000)
    return () => clearInterval(t)
  }, [pendingCount, runSync])

  const value = {
    user, signIn, signOut, can, canAccessDashboard, canAccessPatients, canAccessInventory, canAccessSync,
    patients, visits, batches, dispensing, adjustments, supplies, users: USERS,
    registerPatient, addVisit, receiveBatch, dispense, adjustStock,
    isOnline, simulateOffline, setSimulateOffline, syncing, pendingCount, lastSync, syncLog, runSync,
  }
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export const useWorkspace = () => useContext(WorkspaceContext)
export const userName = (id) => USERS.find((u) => u.id === id)?.full_name || '—'
export const supplyById = (id) => SUPPLIES.find((s) => s.supply_id === id)
export const fmtDate = (iso) => (iso ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—')
export const initials = (name) => name.replace(/^(Dr|Nurse)\.?\s+/i, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
