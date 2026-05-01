import type {
  TriageRequest,
  TriageResponse,
  Session,
  SessionListResponse,
  FollowUpRecord,
  AdminStats
} from '@/types'

const API_BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed') as Error & {
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

  // Admin: 筛选会话
  filterAdminSessions(params: Record<string, string | number>) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') qs.set(k, String(v))
    }
    return request<SessionListResponse>(`/admin/sessions?${qs.toString()}`)
  }
}
