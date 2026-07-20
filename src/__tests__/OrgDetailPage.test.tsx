import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import OrgDetailPage from '../pages/OrgDetailPage'
import { renderWithProviders } from './test-utils'
import { server, ADMIN } from './mocks/server'

const ORG_DETAIL = {
  id: 'org-1',
  name: 'Acme SARL',
  isSuspended: false,
  createdAt: '2026-05-01T00:00:00.000Z',
  _count: { users: 1, documents: 0, transactions: 0, alerts: 0 },
  trustScore: { score: 72 },
  users: [],
  accounts: [],
  documents: [],
  trustScores: [],
  smeProfile: null,
  consentGrants: [],
  publicProfile: null,
  budget: [],
  recurringRules: [],
}

function orgDetailApp() {
  return (
    <Routes>
      <Route path="/organizations/:id" element={<OrgDetailPage />} />
      <Route path="/organizations" element={<div>LISTE ORGANISATIONS</div>} />
    </Routes>
  )
}

function withServerHandlers(admin = ADMIN) {
  server.use(
    http.get('*/api/admin/auth/me', () => HttpResponse.json(admin)),
    http.get('*/api/admin/organizations/:id', () => HttpResponse.json(ORG_DETAIL)),
    http.get('*/api/admin/organizations/:id/audit-logs', () => HttpResponse.json([])),
    http.get('*/api/admin/organizations/:id/transactions', () =>
      HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20 }),
    ),
  )
}

function renderOrgDetail() {
  localStorage.setItem('admin_token', 'access-token')
  return renderWithProviders(orgDetailApp(), { route: '/organizations/org-1', withAuthProvider: true })
}

describe('OrgDetailPage — delete organization', () => {
  it('does not show the delete button for a regular (non-super) admin', async () => {
    withServerHandlers({ ...ADMIN, isSuperAdmin: false })
    renderOrgDetail()
    expect(await screen.findByText('Acme SARL')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Supprimer' })).not.toBeInTheDocument()
  })

  it('navigates back to the list when the delete succeeds', async () => {
    withServerHandlers({ ...ADMIN, isSuperAdmin: true })
    server.use(
      http.delete('*/api/admin/organizations/:id', () => new HttpResponse(null, { status: 204 })),
    )

    const user = userEvent.setup()
    renderOrgDetail()
    await screen.findByText('Acme SARL')

    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    await user.click(screen.getByRole('button', { name: 'Oui, supprimer' }))

    expect(await screen.findByText('LISTE ORGANISATIONS')).toBeInTheDocument()
  })

  it('shows an error and stays on the page when the delete fails (e.g. cascade failure)', async () => {
    withServerHandlers({ ...ADMIN, isSuperAdmin: true })
    server.use(
      http.delete('*/api/admin/organizations/:id', () =>
        HttpResponse.json({ error: 'Failed to delete organization' }, { status: 500 }),
      ),
    )

    const user = userEvent.setup()
    renderOrgDetail()
    await screen.findByText('Acme SARL')

    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    await user.click(screen.getByRole('button', { name: 'Oui, supprimer' }))

    expect(await screen.findByText(/Échec de la suppression/)).toBeInTheDocument()
    expect(screen.queryByText('LISTE ORGANISATIONS')).not.toBeInTheDocument()
    // org still on screen: nothing was actually removed
    expect(screen.getByText('Acme SARL')).toBeInTheDocument()
  })

  it('can cancel the confirmation step without deleting', async () => {
    withServerHandlers({ ...ADMIN, isSuperAdmin: true })
    let deleteCalls = 0
    server.use(
      http.delete('*/api/admin/organizations/:id', () => {
        deleteCalls++
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const user = userEvent.setup()
    renderOrgDetail()
    await screen.findByText('Acme SARL')

    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    await user.click(screen.getByRole('button', { name: 'Annuler' }))

    expect(screen.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument()
    await waitFor(() => expect(deleteCalls).toBe(0))
  })
})

describe('OrgDetailPage — financial & KYC visibility', () => {
  it('shows account balances, transactions and the SME/KYC profile', async () => {
    withServerHandlers({ ...ADMIN, isSuperAdmin: true })
    server.use(
      http.get('*/api/admin/organizations/:id', () =>
        HttpResponse.json({
          ...ORG_DETAIL,
          _count: { users: 1, documents: 0, transactions: 1, alerts: 0 },
          accounts: [{ id: 'acc-1', name: 'Compte principal', type: 'CHECKING', currency: 'XAF', balance: 1500000 }],
          smeProfile: {
            id: 'sme-1',
            legalName: 'Acme SARL',
            registrationNo: 'RCCM-123',
            taxId: null,
            country: 'Cameroun',
            address: null,
            industry: 'Commerce',
            employeeCount: 12,
            annualTurnover: null,
            currency: 'XAF',
            beneficialOwners: [{ id: 'bo-1', name: 'Jean Dupont', role: 'CEO', ownershipPct: 60, nationality: 'CM', email: null, phone: null }],
          },
        }),
      ),
      http.get('*/api/admin/organizations/:id/transactions', () =>
        HttpResponse.json({
          data: [{
            id: 'txn-1', occurredAt: '2026-07-01T00:00:00.000Z', direction: 'OUT', amount: 250000,
            currency: 'XAF', method: 'BANK_TRANSFER', category: 'PAYROLL', counterparty: 'Fournisseur X', notes: null,
            account: { id: 'acc-1', name: 'Compte principal' },
          }],
          total: 1, page: 1, pageSize: 20,
        }),
      ),
    )

    renderOrgDetail()
    await screen.findAllByText('Acme SARL')

    // Account balance visible
    expect(screen.getByText('Compte principal')).toBeInTheDocument()
    expect(screen.getAllByText(/1[\s ]?500[\s ]?000/)[0]).toBeInTheDocument()

    // Transaction visible
    expect(screen.getByText('Fournisseur X')).toBeInTheDocument()

    // KYC / beneficial owner visible
    expect(screen.getByText('RCCM-123')).toBeInTheDocument()
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
  })
})
