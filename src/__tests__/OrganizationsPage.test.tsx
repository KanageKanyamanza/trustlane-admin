import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import OrganizationsPage from '../pages/OrganizationsPage'
import { renderWithProviders } from './test-utils'
import { server } from './mocks/server'

describe('OrganizationsPage', () => {
  it('renders the table with orgs, trust score, owner and status badges', async () => {
    renderWithProviders(<OrganizationsPage />)

    expect(await screen.findByText('Acme SARL')).toBeInTheDocument()
    expect(screen.getByText('Beta SAS')).toBeInTheDocument()
    expect(screen.getByText('owner@acme.com')).toBeInTheDocument()
    expect(screen.getByText('72')).toBeInTheDocument()
    expect(screen.getByText('Actif')).toBeInTheDocument()
    expect(screen.getByText('Suspendu')).toBeInTheDocument()
    expect(screen.getByText('2 total')).toBeInTheDocument()
  })

  it('filters the list through the search input', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OrganizationsPage />)
    await screen.findByText('Acme SARL')

    await user.type(screen.getByPlaceholderText('Rechercher'), 'acme')

    await waitFor(() => expect(screen.queryByText('Beta SAS')).not.toBeInTheDocument())
    expect(screen.getByText('Acme SARL')).toBeInTheDocument()
    expect(screen.getByText('1 total')).toBeInTheDocument()
  })

  it('sends a suspend request when clicking the suspend action', async () => {
    const suspendCalls: { id: string; body: unknown }[] = []
    server.use(
      http.patch('*/api/admin/organizations/:id/suspend', async ({ params, request }) => {
        suspendCalls.push({ id: String(params.id), body: await request.json() })
        return HttpResponse.json({ id: params.id, isSuspended: true })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<OrganizationsPage />)
    await screen.findByText('Acme SARL')

    // Acme (active) → its action button offers "Suspendre"
    await user.click(screen.getByTitle('Suspendre'))

    await waitFor(() => expect(suspendCalls).toHaveLength(1))
    expect(suspendCalls[0]).toEqual({ id: 'org-1', body: { suspend: true } })
  })

  it('sends a reactivate request for a suspended org', async () => {
    const suspendCalls: { id: string; body: unknown }[] = []
    server.use(
      http.patch('*/api/admin/organizations/:id/suspend', async ({ params, request }) => {
        suspendCalls.push({ id: String(params.id), body: await request.json() })
        return HttpResponse.json({ id: params.id, isSuspended: false })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<OrganizationsPage />)
    await screen.findByText('Beta SAS')

    await user.click(screen.getByTitle('Réactiver'))

    await waitFor(() => expect(suspendCalls).toHaveLength(1))
    expect(suspendCalls[0]).toEqual({ id: 'org-2', body: { suspend: false } })
  })
})
