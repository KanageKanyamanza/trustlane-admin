import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import AdminGuard from '../components/layout/AdminGuard'
import { renderWithProviders } from './test-utils'

function guardedApp() {
  return (
    <Routes>
      <Route element={<AdminGuard />}>
        <Route path="/dashboard" element={<div>ZONE PRIVÉE</div>} />
      </Route>
      <Route path="/login" element={<div>PAGE LOGIN</div>} />
    </Routes>
  )
}

describe('AdminGuard', () => {
  it('redirects to /login when there is no session', async () => {
    renderWithProviders(guardedApp(), { route: '/dashboard', withAuthProvider: true })
    expect(await screen.findByText('PAGE LOGIN')).toBeInTheDocument()
    expect(screen.queryByText('ZONE PRIVÉE')).not.toBeInTheDocument()
  })

  it('renders the protected outlet when the stored token is valid', async () => {
    localStorage.setItem('admin_token', 'access-token')
    renderWithProviders(guardedApp(), { route: '/dashboard', withAuthProvider: true })
    expect(await screen.findByText('ZONE PRIVÉE')).toBeInTheDocument()
  })

  it('redirects to /login when the stored token is rejected by the API', async () => {
    localStorage.setItem('admin_token', 'stale-token')
    renderWithProviders(guardedApp(), { route: '/dashboard', withAuthProvider: true })
    expect(await screen.findByText('PAGE LOGIN')).toBeInTheDocument()
    expect(localStorage.getItem('admin_token')).toBeNull()
  })
})
