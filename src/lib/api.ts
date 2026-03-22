// src/lib/api.ts
// Central API client — replace VITE_API_URL in .env.local with your Railway URL

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// ─── Token storage ────────────────────────────────────────────────────────────
export const tokens = {
  get access()  { return localStorage.getItem('vgm_token') ?? '' },
  get refresh() { return localStorage.getItem('vgm_refresh') ?? '' },
  set(access: string, refresh: string) {
    localStorage.setItem('vgm_token',   access)
    localStorage.setItem('vgm_refresh', refresh)
  },
  clear() {
    localStorage.removeItem('vgm_token')
    localStorage.removeItem('vgm_refresh')
  },
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retried = false
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (tokens.access) headers['Authorization'] = `Bearer ${tokens.access}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Auto-refresh on 401
  if (res.status === 401 && !retried && tokens.refresh) {
    const refreshed = await fetch(`${BASE}/api/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken: tokens.refresh }),
    })
    if (refreshed.ok) {
      const { data } = await refreshed.json()
      tokens.set(data.accessToken, data.refreshToken)
      return request<T>(method, path, body, true)  // retry once
    } else {
      tokens.clear()
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  const json = await res.json()
  if (!res.ok) throw new ApiError(res.status, json.message ?? 'Request failed', json.errors)
  return json.data as T
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public errors?: unknown[]) {
    super(message)
  }
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
export const api = {
  get:    <T>(path: string)                  => request<T>('GET',    path),
  post:   <T>(path: string, body: unknown)   => request<T>('POST',   path, body),
  patch:  <T>(path: string, body: unknown)   => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                  => request<T>('DELETE', path),
}

// ─── Typed API calls ──────────────────────────────────────────────────────────

// Auth
export const authApi = {
  login:    (email: string, password: string) =>
    api.post<LoginResponse>('/api/auth/login', { email, password }),
  register: (data: RegisterPayload) =>
    api.post<{ companyId: string; message: string }>('/api/auth/register', data),
  refresh:  () =>
    api.post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', { refreshToken: tokens.refresh }),
  logout:   () =>
    api.post<void>('/api/auth/logout', { refreshToken: tokens.refresh }),
  me:       () => api.get<User>('/api/auth/me'),
}

// Company
export const companyApi = {
  get:          () => api.get<Company>('/api/company'),
  update:       (data: Partial<Company>) => api.patch<Company>('/api/company', data),
  getUsers:     () => api.get<User[]>('/api/company/users'),
  inviteUser:   (data: InviteUserPayload) => api.post<User>('/api/company/users', data),
  updateUser:   (id: string, role: string) => api.patch<User>(`/api/company/users/${id}`, { role }),
  removeUser:   (id: string) => api.delete<void>(`/api/company/users/${id}`),
}

// Moves
export const movesApi = {
  list:         (params?: MoveListParams) => api.get<Paginated<Move>>(`/api/moves?${qs(params)}`),
  get:          (id: string) => api.get<MoveDetail>(`/api/moves/${id}`),
  create:       (data: CreateMovePayload) => api.post<Move>('/api/moves', data),
  updateStatus: (id: string, data: UpdateMoveStatus) => api.patch<Move>(`/api/moves/${id}/status`, data),
}

// Points
export const pointsApi = {
  balance:   () => api.get<PointsBalance>('/api/points/balance'),
  ledger:    (params?: PageParams) => api.get<Paginated<LedgerEntry>>(`/api/points/ledger?${qs(params)}`),
  expiring:  () => api.get<ExpiringPoints>('/api/points/expiring'),
}

// Rewards
export const rewardsApi = {
  list:       () => api.get<Reward[]>('/api/rewards'),
  redeem:     (rewardId: string) => api.post<RedemptionResult>('/api/redemptions', { rewardId }),
  history:    (params?: PageParams) => api.get<Paginated<Redemption>>(`/api/redemptions/history?${qs(params)}`),
  getVoucher: (id: string) => api.get<Redemption>(`/api/redemptions/${id}`),
}

// Group
export const groupApi = {
  get:        () => api.get<GroupData>('/api/group'),
  requestAdd: (data: { companyName: string; contactEmail: string; message?: string }) =>
    api.post<{ requestId: string; message: string }>('/api/group/request-add', data),
}

// Tier
export const tierApi = {
  benefits: () => api.get<TierBenefits>('/api/tier'),
}

// Reports
export const reportsApi = {
  yearly:      (year: number, format = 'json') => api.get<ReportData>(`/api/reports/yearly?year=${year}&format=${format}`),
  quarterly:   (year: number, q: number, format = 'json') => api.get<ReportData>(`/api/reports/quarterly?year=${year}&quarter=${q}&format=${format}`),
  statement:   (year: number, month: number, format = 'json') => api.get<ReportData>(`/api/reports/points-statement?year=${year}&month=${month}&format=${format}`),
  redemptions: (year: number, format = 'json') => api.get<ReportData>(`/api/reports/redemptions?year=${year}&format=${format}`),
  analytics:   () => api.get<AnalyticsData>('/api/reports/analytics'),
}

// Notifications
export const notifApi = {
  getPrefs:    () => api.get<NotifPrefs>('/api/notifications/preferences'),
  updatePrefs: (data: Partial<NotifPrefs>) => api.patch<NotifPrefs>('/api/notifications/preferences', data),
}

// Admin
export const adminApi = {
  dashboard:    () => api.get<AdminDashboard>('/api/admin/dashboard'),
  partners:     (params?: PageParams & { search?: string }) => api.get<Paginated<Company>>(`/api/admin/partners?${qs(params)}`),
  getPartner:   (id: string) => api.get<Company>(`/api/admin/partners/${id}`),
  createMove:   (data: CreateMovePayload) => api.post<Move>('/api/admin/moves', data),
  getMoves:     (params?: AdminMoveParams) => api.get<Paginated<Move>>(`/api/admin/moves?${qs(params)}`),
  approveMove:  (id: string) => api.patch<Move>(`/api/admin/moves/${id}/approve`, {}),
  adjustPoints: (data: { companyId: string; points: number; description: string }) =>
    api.patch<{ newBalance: number }>('/api/admin/points/adjust', data),
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  accessToken: string; refreshToken: string
  user: User & { company: { id: string; name: string; tier: string; pointsBalance: number } }
}
export interface RegisterPayload {
  companyName: string; contactPerson: string; email: string; password: string
  country: string; city: string; phone?: string; billingEntity?: string
}
export interface User { id: string; name: string; email: string; role: string; lastLoginAt?: string }
export interface Company {
  id: string; name: string; contactPerson: string; email: string; phone?: string
  country: string; city: string; billingEntity?: string; tier: string
  pointsBalance: number; groupCode?: { code: string; name: string }
}
export interface InviteUserPayload { name: string; email: string; role: string; password: string }
export interface Move {
  id: string; moveRef: string; origin: string; destination: string
  totalRevenue: number; eligibleRevenue: number; pointsAwarded: number
  status: string; invoiceNumber?: string; invoicePaidAt?: string; createdAt: string
}
export interface MoveDetail extends Move {
  excludedAmount: number; exclusionReason?: string; claimsFiled: boolean
  volumeM3?: number; weightKg?: number; containerType?: string; serviceType?: string
  invoiceDate?: string; timeline: TimelineStep[]
}
export interface TimelineStep { step: string; done: boolean; date?: string; description: string }
export interface MoveListParams extends PageParams { status?: string; search?: string }
export interface CreateMovePayload {
  companyId: string; moveRef: string; vendorCode: string; origin: string; destination: string
  totalRevenue: number; excludedAmount?: number; exclusionReason?: string
  invoiceNumber?: string; invoicePaid?: boolean; claimsFiled?: boolean
  volumeM3?: number; weightKg?: number; containerType?: string; serviceType?: string
}
export interface UpdateMoveStatus { invoicePaid?: boolean; claimsFiled?: boolean; claimsDetail?: string }
export interface PointsBalance {
  balance: number; tier: string; nextTier?: string; pointsToNextTier: number
  rollingPoints: number; tierThresholds: Record<string, number>
}
export interface LedgerEntry {
  id: string; type: string; points: number; balanceAfter: number
  description: string; createdAt: string
  move?: { moveRef: string; origin: string; destination: string }
  redemption?: { voucherCode: string; reward: { name: string } }
}
export interface ExpiringPoints { expiring: any[]; totalExpiring: number }
export interface Reward {
  id: string; name: string; description: string; pointsRequired: number
  category: string; tierRequired: string; isUnlocked: boolean
  canAfford: boolean; pointsShortfall: number
}
export interface RedemptionResult { redemption: Redemption; voucherCode: string; message: string }
export interface Redemption {
  id: string; voucherCode: string; pointsSpent: number; status: string
  redeemedAt: string; expiresAt: string; reward: { name: string; category: string }
}
export interface GroupData {
  hasGroup: boolean; groupCode?: string; groupName?: string
  totalMembers: number; totalPoints: number; totalMoves: number
  tierDistribution: Record<string, number>; members: GroupMember[]
}
export interface GroupMember {
  id: string; name: string; city: string; country: string
  tier: string; pointsBalance: number; totalMoves: number; lastMoveDate?: string
}
export interface TierBenefits {
  currentTier: string; currentPoints: number; nextTier?: string; pointsToNextTier: number
  tiers: TierDetail[]
}
export interface TierDetail {
  tier: string; range: string; redemptionCap: string; pointExpiry: string
  earningRate: string; perks: string[]; isCurrent: boolean; isUnlocked: boolean; threshold: number
}
export interface ReportData { summary: Record<string, unknown>; [key: string]: unknown }
export interface AnalyticsData { monthlyData: any[]; topDestinations: any[] }
export interface NotifPrefs {
  pointsEarned: boolean; moveConfirmed: boolean; tierProgress: boolean
  redemptionSuccess: boolean; monthlyStatement: boolean; marketing: boolean; systemUpdates: boolean
}
export interface AdminDashboard {
  totalCompanies: number; totalMoves: number; pendingMoves: number
  creditedMoves: number; totalPointsIssued: number
  tierBreakdown: Record<string, number>; monthlyStats: any[]
}
export interface AdminMoveParams extends PageParams { status?: string; companyId?: string }
export interface Paginated<T> { data: T[]; pagination: { total: number; page: number; limit: number; totalPages: number } }
export interface PageParams { page?: number; limit?: number }

// ─── Query string helper ──────────────────────────────────────────────────────
function qs(params?: Record<string, unknown>): string {
  if (!params) return ''
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&')
}
