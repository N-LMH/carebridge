import type {
  TriageRequest,
  TriageResponse,
  Session,
  SessionListResponse,
  FollowUpRecord,
  AdminStats,
  AdminSessionSummary,
  AuthResponse,
  User,
  Message,
  DoctorSessionSummary,
  DoctorSession,
  DoctorDashboardResponse
} from '@/types'

const API_BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('carebridge_token')
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Request failed') as Error & {
      status?: number
      errors?: typeof data.errors
    }
    error.status = response.status
    error.errors = data.errors
    throw error
  }

  return data as T
}

export const api = {
  // Auth
  login(username: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
  },

  getMe() {
    return request<{ user: User }>('/auth/me')
  },

  // 健康检查
  health() {
    return request<{ status: string }>('/health')
  },

  // 获取会话列表
  getSessions(limit = 8) {
    return request<SessionListResponse>(`/sessions?limit=${limit}`)
  },

  // 获取单个会话
  getSession(sessionId: string) {
    return request<{ session: Session }>(`/sessions/${sessionId}`)
  },

  // 提交分诊
  submitTriage(payload: TriageRequest) {
    return request<TriageResponse>('/triage', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  // 添加随访记录
  addFollowUp(sessionId: string, record: Partial<FollowUpRecord>) {
    return request<{ session: Session }>(`/sessions/${sessionId}/follow-ups`, {
      method: 'POST',
      body: JSON.stringify(record)
    })
  },

  // Patient messages
  getSessionMessages(sessionId: string) {
    return request<{ messages: Message[] }>(`/sessions/${sessionId}/messages`)
  },

  sendSessionMessage(sessionId: string, content: string) {
    return request<{ message: Message }>(`/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  },

  // Admin: 获取统计信息
  getAdminStats() {
    return request<AdminStats>('/admin/stats')
  },

  // Admin: 更新会话管理字段
  updateAdminSession(sessionId: string, data: { adminNote?: string; adminStatus?: string; tags?: string[] }) {
    return request<{ session: Session }>(`/admin/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  },

  // Admin: 获取会话列表
  getAdminSessions(params?: Record<string, string | number>) {
    const qs = new URLSearchParams()
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') qs.set(k, String(v))
      }
    }
    const queryStr = qs.toString()
    return request<{ sessions: AdminSessionSummary[] }>(`/admin/sessions${queryStr ? '?' + queryStr : ''}`)
  },

  // Admin: 获取会话详情
  getAdminSession(sessionId: string) {
    return request<{ session: Session }>(`/admin/sessions/${sessionId}`)
  },

  // Admin: 筛选会话
  filterAdminSessions(params: Record<string, string | number>) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') qs.set(k, String(v))
    }
    return request<{ sessions: AdminSessionSummary[] }>(`/admin/sessions?${qs.toString()}`)
  },

  // Doctor: 获取工作台概览
  getDoctorDashboard() {
    return request<DoctorDashboardResponse>('/doctor/dashboard')
  },

  // Doctor: 更新会话
  patchDoctorSession(sessionId: string, data: { doctorStatus?: string; doctorNote?: string; priorityLevel?: string }) {
    return request<{ session: DoctorSession }>(`/doctor/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  },

  // Doctor: 获取会话列表
  getDoctorSessions(params?: Record<string, string>) {
    const qs = new URLSearchParams()
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v) qs.set(k, v)
      }
    }
    const queryStr = qs.toString()
    return request<{ sessions: DoctorSessionSummary[] }>(`/doctor/sessions${queryStr ? '?' + queryStr : ''}`)
  },

  // Doctor: 获取会话详情
  getDoctorSession(sessionId: string) {
    return request<{ session: DoctorSession }>(`/doctor/sessions/${sessionId}`)
  },

  // Doctor: 获取消息
  getDoctorMessages(sessionId: string) {
    return request<{ messages: Message[] }>(`/doctor/sessions/${sessionId}/messages`)
  },

  // Doctor: 发送消息
  sendDoctorMessage(sessionId: string, content: string) {
    return request<{ message: Message }>(`/doctor/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  }
}
