// ---------------------------------------------------------------------------
// Stubbed demo data for the CareSync product surface.
//
// Every screen reads from this single module (through src/lib/workspace.jsx).
// A later milestone replaces it with the Express API + IndexedDB cache while
// keeping the same record shapes, which mirror the planned database schema.
// ---------------------------------------------------------------------------

export const ROLES = {
  DOCTOR: 'Doctor',
  BARANGAY_HEALTH_WORKER: 'Barangay Health Worker',
  NURSE: 'Nurse',
  CLERK: 'Administrative Clerk',
  CONTROLLER: 'Data Controller',
}

// What each role can do. Enforced in the UI now; mirrored by API middleware later.
export const PERMISSIONS = {
  [ROLES.DOCTOR]: ['patients.read', 'patients.history', 'visits.clinical', 'visits.complete'],
  [ROLES.BARANGAY_HEALTH_WORKER]: ['patients.read', 'patients.register', 'visits.intake'],
  [ROLES.NURSE]: ['patients.read', 'patients.history', 'visits.vitals', 'visits.intake', 'visits.complete'],
  [ROLES.CLERK]: ['inventory.read', 'inventory.receive', 'inventory.dispense', 'inventory.adjust', 'patients.read'],
  [ROLES.CONTROLLER]: ['sync.monitor', 'patients.read', 'inventory.read'],
}

export const DEMO_PASSWORD = 'CareSync2026!'

export const USERS = [
  { id: 1, full_name: 'Dr. Liza Montero', email: 'doctor@caresync.ph', role: ROLES.DOCTOR, blurb: 'Consultations & diagnoses' },
  { id: 2, full_name: 'Grace Carmel', email: 'registration@caresync.ph', role: ROLES.BARANGAY_HEALTH_WORKER, blurb: 'Check-in & patient IDs' },
  { id: 3, full_name: 'Nurse Joy Abella', email: 'clinical@caresync.ph', role: ROLES.NURSE, blurb: 'Vitals & follow-up visits' },
  { id: 4, full_name: 'Remchon Cruz', email: 'clerk@caresync.ph', role: ROLES.CLERK, blurb: 'FEFO inventory & dispensing' },
  { id: 5, full_name: 'Arnel Tagupa', email: 'controller@caresync.ph', role: ROLES.CONTROLLER, blurb: 'Sync queues & audit status' },
]
export const DEFAULT_ADDRESS = 'Ampayon, Butuan City'

export const VISIT_PURPOSES = [
  'General consultation',
  'Follow-up check-up',
  'Prenatal check-up',
  'Immunization',
  'Blood pressure monitoring',
  'Wound care',
  'Family planning',
]

const P = (n, first_name, last_name, dob, gender, contact_number, address = DEFAULT_ADDRESS) => ({
  patient_id: `AMP-2026-${String(n).padStart(4, '0')}`,
  first_name,
  last_name,
  dob,
  gender,
  address,
  contact_number,
  created_at: `2026-0${(n % 9) + 1}-1${n % 9}T08:30:00+08:00`,
  sync_status: 'synced',
})

export const PATIENTS = [
  P(1, 'Maria', 'Santos', '1988-03-14', 'Female', '09171234501'),
  P(2, 'Jose', 'Dela Cruz', '1974-11-02', 'Male', '09181234502'),
  P(3, 'Ana', 'Reyes', '1997-06-19', 'Female', '09191234503', 'Purok 3, Ampayon, Butuan City'),
  P(4, 'Pedro', 'Lim', '2005-01-08', 'Male', ''),
  P(5, 'Joem', 'Valentin', '2002-11-20', 'Male', '09221234505'),
  P(6, 'Ann', 'Cahilig', '2003-02-10', 'Female', ''),
  P(7, 'Rosalinda', 'Bacus', '1961-08-27', 'Female', '09351234507', 'Purok 7, Ampayon, Butuan City'),
  P(8, 'Ernesto', 'Galido', '1958-04-03', 'Male', '09451234508'),
  P(9, 'Kristine', 'Ompad', '1994-12-11', 'Female', '09561234509', 'Purok 1, Ampayon, Butuan City'),
  P(10, 'Marvin', 'Sumalinog', '2019-09-30', 'Male', '09671234510'),
]

const V = (visit_id, patient_id, staff, visit_date, purpose, vitals, chief_complaint, diagnosis, clinical_notes, prescription_notes, queue_status = 'done') => ({
  visit_id, patient_id, attending_staff_id: staff, visit_date, purpose_of_visit: purpose,
  vitals_json: vitals, chief_complaint, diagnosis, clinical_notes, prescription_notes, queue_status, sync_status: 'synced',
}) 

export const VISITS = [
  V('VIS-0001', 'AMP-2026-0001', 1, '2026-06-02', 'General consultation', { bp: '120/80', temp: 37.8, weight: 58, pulse: 88 }, 'Fever and body aches for 2 days', 'Viral fever', 'Advised rest and hydration. Return if fever persists beyond 3 days.', 'Paracetamol 500 mg, 1 tab every 6 hrs as needed'),
  V('VIS-0002', 'AMP-2026-0001', 3, '2026-09-15', 'Follow-up check-up', { bp: '118/78', temp: 36.6, weight: 58.5, pulse: 76 }, 'Follow-up', 'Recovered', 'No complaints. Vitals within normal range.', ''),
  V('VIS-0003', 'AMP-2026-0001', 1, '2026-11-10', 'Blood pressure monitoring', { bp: '130/85', temp: 36.7, weight: 59, pulse: 80 }, 'Occasional headache', 'Elevated blood pressure', 'Lifestyle counseling given; low-salt diet. Recheck in 2 weeks.', ''),
  V('VIS-0004', 'AMP-2026-0002', 1, '2026-07-21', 'Blood pressure monitoring', { bp: '150/95', temp: 36.5, weight: 72, pulse: 84 }, 'Dizziness in the morning', 'Hypertension, stage 1', 'Started maintenance medication. Monthly BP check.', 'Amlodipine 5 mg, once daily'),
  V('VIS-0005', 'AMP-2026-0002', 3, '2026-10-20', 'Follow-up check-up', { bp: '138/88', temp: 36.4, weight: 71, pulse: 78 }, 'Routine BP check', 'Hypertension, controlled', 'Compliant with medication.', 'Continue Amlodipine 5 mg'),
  V('VIS-0006', 'AMP-2026-0003', 3, '2026-08-05', 'Prenatal check-up', { bp: '110/70', temp: 36.6, weight: 61, pulse: 82 }, '2nd trimester check-up', 'Normal pregnancy, 20 weeks', 'Fetal heart tone normal. Advised iron supplementation.', 'Ferrous sulfate + folic acid, once daily'),
  V('VIS-0007', 'AMP-2026-0003', 3, '2026-10-02', 'Prenatal check-up', { bp: '112/72', temp: 36.5, weight: 64, pulse: 80 }, '3rd trimester check-up', 'Normal pregnancy, 28 weeks', 'Tetanus toxoid 2nd dose given.', ''),
  V('VIS-0008', 'AMP-2026-0004', 3, '2026-09-28', 'Wound care', { bp: '115/75', temp: 36.9, weight: 63, pulse: 86 }, 'Laceration on left forearm', 'Minor laceration', 'Wound cleaned and dressed. Tetanus vaccine given.', 'Mefenamic acid 500 mg as needed'),
  V('VIS-0009', 'AMP-2026-0005', 1, '2026-10-11', 'General consultation', { bp: '120/80', temp: 37.2, weight: 66, pulse: 90 }, 'Cough and colds for 5 days', 'Acute upper respiratory infection', 'Increase fluid intake.', 'Amoxicillin 500 mg, 3x a day for 7 days'),
  V('VIS-0010', 'AMP-2026-0007', 1, '2026-05-18', 'Blood pressure monitoring', { bp: '145/90', temp: 36.6, weight: 60, pulse: 74 }, 'Routine check', 'Hypertension', 'Maintenance continued.', 'Losartan 50 mg, once daily'),
  V('VIS-0011', 'AMP-2026-0007', 3, '2026-08-18', 'Follow-up check-up', { bp: '135/85', temp: 36.5, weight: 59.5, pulse: 72 }, 'Routine check', 'Hypertension, controlled', '', 'Continue Losartan 50 mg'),
  V('VIS-0012', 'AMP-2026-0007', 3, '2026-11-14', 'Follow-up check-up', { bp: '132/84', temp: 36.6, weight: 59, pulse: 70 }, 'Routine check', 'Hypertension, controlled', 'Stable.', ''),
  V('VIS-0013', 'AMP-2026-0008', 1, '2026-09-09', 'General consultation', { bp: '140/90', temp: 36.8, weight: 68, pulse: 82 }, 'Frequent urination, thirst', 'Type 2 diabetes mellitus (for confirmation)', 'Referred for FBS at city health office.', 'Metformin 500 mg, twice daily'),
  V('VIS-0014', 'AMP-2026-0008', 3, '2026-10-30', 'Follow-up check-up', { bp: '136/86', temp: 36.5, weight: 67, pulse: 80 }, 'FBS result review', 'Type 2 diabetes mellitus', 'Diet counseling done.', 'Continue Metformin 500 mg'),
  V('VIS-0015', 'AMP-2026-0009', 3, '2026-07-07', 'Family planning', { bp: '110/70', temp: 36.4, weight: 52, pulse: 76 }, 'Family planning counseling', 'Family planning – new acceptor', 'Counseled on available methods.', ''),
  V('VIS-0016', 'AMP-2026-0010', 3, '2026-08-12', 'Immunization', { bp: '—', temp: 36.7, weight: 21, pulse: 98 }, 'School-based immunization', 'Well child', 'MR booster given. No adverse reaction.', ''),
  V('VIS-0017', 'AMP-2026-0010', 1, '2026-10-25', 'General consultation', { bp: '—', temp: 38.1, weight: 21, pulse: 110 }, 'Diarrhea since yesterday', 'Acute gastroenteritis, no dehydration', 'Oral rehydration advised; return if vomiting.', 'ORS, 1 sachet after each loose stool'),
]

export const SUPPLIES = [
  { supply_id: 'MED-01', item_name: 'Paracetamol 500 mg', category: 'Medicine', unit: 'tablet', reorder_level: 100 },
  { supply_id: 'MED-02', item_name: 'Amoxicillin 500 mg', category: 'Medicine', unit: 'capsule', reorder_level: 60 },
  { supply_id: 'MED-03', item_name: 'Oral Rehydration Salts', category: 'Medicine', unit: 'sachet', reorder_level: 50 },
  { supply_id: 'MED-04', item_name: 'Vitamin A 200,000 IU', category: 'Medicine', unit: 'capsule', reorder_level: 30 },
  { supply_id: 'MED-05', item_name: 'Amlodipine 5 mg', category: 'Medicine', unit: 'tablet', reorder_level: 90 },
  { supply_id: 'VAC-01', item_name: 'Tetanus Toxoid Vaccine', category: 'Vaccine', unit: 'vial', reorder_level: 10 },
  { supply_id: 'VAC-02', item_name: 'Measles-Rubella Vaccine', category: 'Vaccine', unit: 'vial', reorder_level: 8 },
  { supply_id: 'CON-01', item_name: 'Sterile Gauze Pads', category: 'Consumable', unit: 'box', reorder_level: 5 },
]

const B = (batch_id, supply_id, batch_number, expiration_date, quantity_on_hand, received_date) => ({
  batch_id, supply_id, batch_number, expiration_date, quantity_on_hand, received_date, received_by: 4,
})

// Demo story:
//  • AMX-2605-A has already expired → shown in red and blocked from dispensing.
//  • Paracetamol has two active batches (Dec 2026 + Jun 2027) → dispensing more
//    than 30 tablets automatically splits across both, earliest expiry first.
export const BATCHES = [
  B('BAT-001', 'MED-01', 'PCM-2608-A', '2026-12-15', 30, '2026-08-04'),
  B('BAT-002', 'MED-01', 'PCM-2702-B', '2027-06-30', 200, '2026-10-12'),
  B('BAT-003', 'MED-02', 'AMX-2605-A', '2026-11-05', 24, '2026-05-20'),
  B('BAT-004', 'MED-02', 'AMX-2606-B', '2027-01-18', 42, '2026-06-15'),
  B('BAT-005', 'MED-03', 'ORS-2609-C', '2027-08-30', 120, '2026-09-02'),
  B('BAT-006', 'MED-04', 'VTA-2604-A', '2026-12-02', 16, '2026-04-11'),
  B('BAT-007', 'MED-05', 'AML-2610-A', '2027-10-01', 150, '2026-10-01'),
  B('BAT-008', 'VAC-01', 'TTV-2610-D', '2027-03-01', 24, '2026-10-05'),
  B('BAT-009', 'VAC-02', 'MRV-2607-A', '2027-02-14', 6, '2026-07-19'),
  B('BAT-010', 'CON-01', 'GAU-2603-A', '2028-03-01', 12, '2026-03-22'),
]

export const DISPENSING = [
  { transaction_id: 'DSP-0001', patient_id: 'AMP-2026-0001', visit_id: 'VIS-0001', supply_id: 'MED-01', batch_id: 'BAT-001', quantity_dispensed: 10, dispensed_by: 4, dispensed_at: '2026-06-02T10:12:00+08:00', sync_status: 'synced' },
  { transaction_id: 'DSP-0002', patient_id: 'AMP-2026-0002', visit_id: 'VIS-0004', supply_id: 'MED-05', batch_id: 'BAT-007', quantity_dispensed: 30, dispensed_by: 4, dispensed_at: '2026-07-21T11:02:00+08:00', sync_status: 'synced' },
  { transaction_id: 'DSP-0003', patient_id: 'AMP-2026-0005', visit_id: 'VIS-0009', supply_id: 'MED-02', batch_id: 'BAT-004', quantity_dispensed: 21, dispensed_by: 4, dispensed_at: '2026-10-11T09:40:00+08:00', sync_status: 'synced' },
  { transaction_id: 'DSP-0004', patient_id: 'AMP-2026-0010', visit_id: 'VIS-0017', supply_id: 'MED-03', batch_id: 'BAT-005', quantity_dispensed: 6, dispensed_by: 4, dispensed_at: '2026-10-25T14:20:00+08:00', sync_status: 'synced' },
]

export const STOCK_ADJUSTMENTS = [
  { adjustment_id: 'ADJ-0001', batch_id: 'BAT-006', previous_qty: 18, adjusted_qty: 16, reason: 'Damaged', note: 'Two capsules crushed in transit', adjusted_by: 4, adjusted_at: '2026-10-24T15:30:00+08:00' },
]
