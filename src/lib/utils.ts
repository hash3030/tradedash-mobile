export const TRADES = [
  { value: 'ELECTRICIAN', label: 'Electrician' },
  { value: 'PLUMBER', label: 'Plumber' },
  { value: 'CARPENTER', label: 'Carpenter' },
  { value: 'CONCRETER', label: 'Concreter' },
  { value: 'BRICKLAYER', label: 'Bricklayer' },
  { value: 'PAINTER', label: 'Painter' },
  { value: 'PLASTERER', label: 'Plasterer' },
  { value: 'TILER', label: 'Tiler' },
  { value: 'ROOFER', label: 'Roofer' },
  { value: 'WELDER', label: 'Welder' },
  { value: 'HVAC', label: 'HVAC' },
  { value: 'LANDSCAPER', label: 'Landscaper' },
  { value: 'DEMOLITION', label: 'Demolition' },
  { value: 'EXCAVATION', label: 'Excavation' },
  { value: 'GENERAL_LABOUR', label: 'General Labour' },
  { value: 'OTHER', label: 'Other' },
]

export const STATES = ['ACT','NSW','NT','QLD','SA','TAS','VIC','WA']

export const tradeLabel = (v: string) => TRADES.find(t => t.value === v)?.label || v

export const formatBudget = (budget: string, type: string) =>
  type === 'hourly' ? `$${budget}/hr` : `$${Number(budget).toLocaleString()}`

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })

export const planColor = (plan: string) =>
  plan === 'HIRER' ? '#0d9488' : plan === 'PRO' ? '#f59e0b' : '#6b7280'

// Colors
export const colors = {
  bg: '#0f0f0d',
  bg2: '#1a1a17',
  bg3: '#222220',
  border: 'rgba(255,255,255,0.08)',
  accent: '#f59e0b',
  accentDark: '#d97706',
  accentText: '#78350f',
  text: '#e8e6df',
  textMuted: '#6b6b67',
  teal: '#0d9488',
  green: '#16a34a',
  red: '#dc2626',
  blue: '#2563eb',
}
