import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout'
import { renderWithProviders } from './test-utils'
import { ADMIN } from './mocks/server'

function layoutApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<div>CONTENU DASHBOARD</div>} />
        <Route path="/organizations" element={<div>CONTENU ORGS</div>} />
      </Route>
      <Route path="/login" element={<div>PAGE LOGIN</div>} />
    </Routes>
  )
}

function renderLayout(route = '/dashboard') {
  localStorage.setItem('admin_token', 'access-token')
  return renderWithProviders(layoutApp(), { route, withAuthProvider: true })
}

describe('AdminLayout (sidebar)', () => {
  it('renders all navigation entries', async () => {
    renderLayout()
    expect(await screen.findByText('CONTENU DASHBOARD')).toBeInTheDocument()
    for (const label of [
      'Tableau de bord', 'Organisations', 'Utilisateurs', 'Documents', 'Trust Scores',
      'Conformité', "Journaux d'audit", 'Alertes', 'Système', 'Admins',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('marks the current route as active', async () => {
    renderLayout('/organizations')
    expect(await screen.findByText('CONTENU ORGS')).toBeInTheDocument()
    const active = screen.getByRole('link', { name: 'Organisations' })
    const inactive = screen.getByRole('link', { name: 'Tableau de bord' })
    expect(active.className).toContain('bg-brand-500')
    expect(inactive.className).not.toContain('bg-brand-500')
  })

  it('navigates between sections on click', async () => {
    const user = userEvent.setup()
    renderLayout('/dashboard')
    await screen.findByText('CONTENU DASHBOARD')
    await user.click(screen.getByRole('link', { name: 'Organisations' }))
    expect(await screen.findByText('CONTENU ORGS')).toBeInTheDocument()
  })

  it('shows the connected admin identity', async () => {
    renderLayout()
    expect(await screen.findByText(`${ADMIN.firstName} ${ADMIN.lastName}`)).toBeInTheDocument()
    expect(screen.getByText(ADMIN.email)).toBeInTheDocument()
  })

  it('logs out: clears the session and redirects to /login', async () => {
    const user = userEvent.setup()
    renderLayout()
    await screen.findByText('CONTENU DASHBOARD')
    await user.click(screen.getByRole('button', { name: /Déconnexion/ }))
    expect(await screen.findByText('PAGE LOGIN')).toBeInTheDocument()
    expect(localStorage.getItem('admin_token')).toBeNull()
  })
})
