import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import { renderWithProviders } from './test-utils'
import { ADMIN } from './mocks/server'

function loginApp() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<div>DASHBOARD</div>} />
    </Routes>
  )
}

describe('LoginPage', () => {
  it('renders the form with email and password fields', () => {
    renderWithProviders(loginApp(), { route: '/login', withAuthProvider: true })
    expect(screen.getByText('Panel Administrateur')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('admin@trustlane.app')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument()
  })

  it('logs in, stores the tokens and navigates to the dashboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(loginApp(), { route: '/login', withAuthProvider: true })

    await user.type(screen.getByPlaceholderText('admin@trustlane.app'), ADMIN.email)
    await user.type(screen.getByPlaceholderText('••••••••'), 'good-password')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(await screen.findByText('DASHBOARD')).toBeInTheDocument()
    expect(localStorage.getItem('admin_token')).toBe('access-token')
    expect(localStorage.getItem('admin_refresh_token')).toBe('refresh-token')
  })

  it('shows an error message on invalid credentials and stays on the page', async () => {
    const user = userEvent.setup()
    renderWithProviders(loginApp(), { route: '/login', withAuthProvider: true })

    await user.type(screen.getByPlaceholderText('admin@trustlane.app'), ADMIN.email)
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(await screen.findByText('Email ou mot de passe incorrect')).toBeInTheDocument()
    expect(screen.queryByText('DASHBOARD')).not.toBeInTheDocument()
    expect(localStorage.getItem('admin_token')).toBeNull()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderWithProviders(loginApp(), { route: '/login', withAuthProvider: true })

    const pwd = screen.getByPlaceholderText('••••••••')
    expect(pwd).toHaveAttribute('type', 'password')
    const toggle = pwd.parentElement!.querySelector('button')!
    await user.click(toggle)
    expect(pwd).toHaveAttribute('type', 'text')
  })
})
