import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { adminOrgsApi } from '../api/adminOrgsApi'
import { makeStore } from './test-utils'
import { server, ORGS } from './mocks/server'

describe('adminOrgsApi (RTK Query slice)', () => {
  it('listOrgs fetches and caches the paginated list', async () => {
    const store = makeStore()
    const result = await store.dispatch(adminOrgsApi.endpoints.listOrgs.initiate({ page: 1 }))

    expect(result.status).toBe('fulfilled')
    expect(result.data?.total).toBe(2)
    expect(result.data?.data.map((o) => o.id)).toEqual(['org-1', 'org-2'])
  })

  it('sends the Authorization header from localStorage', async () => {
    localStorage.setItem('admin_token', 'access-token')
    let authHeader: string | null = null
    server.use(
      http.get('*/api/admin/organizations', ({ request }) => {
        authHeader = request.headers.get('authorization')
        return HttpResponse.json({ data: ORGS, total: 2, page: 1, pageSize: 20 })
      }),
    )

    const store = makeStore()
    await store.dispatch(adminOrgsApi.endpoints.listOrgs.initiate({ page: 1 }))
    expect(authHeader).toBe('Bearer access-token')
  })

  it('propagates API errors', async () => {
    server.use(
      http.get('*/api/admin/organizations', () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    )
    const store = makeStore()
    const result = await store.dispatch(adminOrgsApi.endpoints.listOrgs.initiate({ page: 1 }))
    expect(result.status).toBe('rejected')
    expect((result.error as { status: number }).status).toBe(401)
  })

  it('suspendOrg invalidates the Orgs cache and triggers a refetch', async () => {
    let listCalls = 0
    server.use(
      http.get('*/api/admin/organizations', () => {
        listCalls++
        return HttpResponse.json({ data: ORGS, total: 2, page: 1, pageSize: 20 })
      }),
    )

    const store = makeStore()
    // subscribe so the cache entry stays alive and refetches on invalidation
    const sub = store.dispatch(adminOrgsApi.endpoints.listOrgs.initiate({ page: 1 }))
    await sub
    expect(listCalls).toBe(1)

    await store.dispatch(adminOrgsApi.endpoints.suspendOrg.initiate({ id: 'org-1', suspend: true }))

    await waitFor(() => expect(listCalls).toBe(2))
    sub.unsubscribe()
  })
})
