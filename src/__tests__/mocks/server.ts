import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const ADMIN = {
  id: 'admin-1',
  email: 'admin@trustlane.io',
  firstName: 'Ada',
  lastName: 'Admin',
  isSuperAdmin: false,
}

export const ORGS = [
  {
    id: 'org-1',
    name: 'Acme SARL',
    isSuspended: false,
    createdAt: '2026-05-01T00:00:00.000Z',
    _count: { users: 3, documents: 5 },
    trustScore: { score: 72 },
    owner: { email: 'owner@acme.com', firstName: 'Olga', lastName: 'Owner' },
  },
  {
    id: 'org-2',
    name: 'Beta SAS',
    isSuspended: true,
    createdAt: '2026-04-01T00:00:00.000Z',
    _count: { users: 1, documents: 0 },
    trustScore: null,
    owner: null,
  },
]

export const DOCUMENTS = [
  {
    id: 'doc-1',
    type: 'RCCM',
    name: 'RCCM Acme',
    status: 'SUBMITTED',
    createdAt: '2026-06-10T00:00:00.000Z',
    org: { id: 'org-1', name: 'Acme SARL' },
    versions: [{ id: 'v1', fileUrl: 'u', fileName: 'rccm.pdf', createdAt: '2026-06-10T00:00:00.000Z' }],
  },
]

// Handlers match any origin: the RTK Query base URL (VITE_API_URL) and the
// relative fetches from AdminAuthContext both hit the same paths.
export const handlers = [
  http.post('*/api/admin/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (body.email === ADMIN.email && body.password === 'good-password') {
      return HttpResponse.json({ accessToken: 'access-token', refreshToken: 'refresh-token', admin: ADMIN })
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),

  http.get('*/api/admin/auth/me', ({ request }) => {
    const auth = request.headers.get('authorization')
    if (auth === 'Bearer access-token') return HttpResponse.json(ADMIN)
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }),

  http.get('*/api/admin/organizations', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const data = search ? ORGS.filter((o) => o.name.toLowerCase().includes(search)) : ORGS
    return HttpResponse.json({ data, total: data.length, page: 1, pageSize: 20 })
  }),

  http.patch('*/api/admin/organizations/:id/suspend', ({ params }) =>
    HttpResponse.json({ id: params.id, isSuspended: true }),
  ),

  http.get('*/api/admin/documents', () =>
    HttpResponse.json({ data: DOCUMENTS, total: DOCUMENTS.length, page: 1, pageSize: 20 }),
  ),

  http.patch('*/api/admin/documents/:id/verify', ({ params }) =>
    HttpResponse.json({ id: params.id, status: 'VERIFIED' }),
  ),

  http.patch('*/api/admin/documents/:id/reject', async ({ request, params }) => {
    const body = (await request.json()) as { reason?: string }
    if (!body.reason) return HttpResponse.json({ error: 'Invalid body' }, { status: 400 })
    return HttpResponse.json({ id: params.id, status: 'REJECTED' })
  }),
]

export const server = setupServer(...handlers)
