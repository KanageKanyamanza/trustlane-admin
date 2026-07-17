import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import DocumentReviewPage from '../pages/DocumentReviewPage'
import { renderWithProviders } from './test-utils'
import { server } from './mocks/server'

describe('DocumentReviewPage', () => {
  it('lists the submitted documents', async () => {
    renderWithProviders(<DocumentReviewPage />)
    expect(await screen.findByText('RCCM Acme')).toBeInTheDocument()
    expect(screen.getByText('RCCM')).toBeInTheDocument()
    expect(screen.getByText('Acme SARL')).toBeInTheDocument()
  })

  it('shows an empty state when there is nothing to review', async () => {
    server.use(
      http.get('*/api/admin/documents', () =>
        HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20 }),
      ),
    )
    renderWithProviders(<DocumentReviewPage />)
    expect(await screen.findByText('Aucun document en attente')).toBeInTheDocument()
  })

  it('verifies a document from the row action', async () => {
    const verifyCalls: string[] = []
    server.use(
      http.patch('*/api/admin/documents/:id/verify', ({ params }) => {
        verifyCalls.push(String(params.id))
        return HttpResponse.json({ id: params.id, status: 'VERIFIED' })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<DocumentReviewPage />)
    await screen.findByText('RCCM Acme')

    await user.click(screen.getByRole('button', { name: /Vérifier/ }))

    await waitFor(() => expect(verifyCalls).toEqual(['doc-1']))
  })

  it('opens the reject modal and disables submission until a reason is typed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentReviewPage />)
    await screen.findByText('RCCM Acme')

    await user.click(screen.getByRole('button', { name: /Rejeter/ }))

    const textarea = await screen.findByPlaceholderText('Motif de rejet')
    expect(textarea).toBeInTheDocument()

    const buttons = screen.getAllByRole('button', { name: /Rejeter/ })
    const submit = buttons[buttons.length - 1]
    expect(submit).toBeDisabled()

    await user.type(textarea, 'Document illisible')
    expect(submit).toBeEnabled()
  })

  it('sends the rejection with its reason and closes the modal', async () => {
    const rejectCalls: { id: string; body: unknown }[] = []
    server.use(
      http.patch('*/api/admin/documents/:id/reject', async ({ params, request }) => {
        rejectCalls.push({ id: String(params.id), body: await request.json() })
        return HttpResponse.json({ id: params.id, status: 'REJECTED' })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<DocumentReviewPage />)
    await screen.findByText('RCCM Acme')

    await user.click(screen.getByRole('button', { name: /Rejeter/ }))
    await user.type(await screen.findByPlaceholderText('Motif de rejet'), 'Document illisible')

    const buttons = screen.getAllByRole('button', { name: /Rejeter/ })
    await user.click(buttons[buttons.length - 1])

    await waitFor(() => expect(rejectCalls).toHaveLength(1))
    expect(rejectCalls[0]).toEqual({ id: 'doc-1', body: { reason: 'Document illisible' } })
    await waitFor(() => expect(screen.queryByPlaceholderText('Motif de rejet')).not.toBeInTheDocument())
  })

  it('can cancel the reject modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentReviewPage />)
    await screen.findByText('RCCM Acme')

    await user.click(screen.getByRole('button', { name: /Rejeter/ }))
    await screen.findByPlaceholderText('Motif de rejet')

    await user.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(screen.queryByPlaceholderText('Motif de rejet')).not.toBeInTheDocument()
  })
})
