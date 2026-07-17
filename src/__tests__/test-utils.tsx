import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { adminApi } from '../api/apiSlice'
import { AdminAuthProvider } from '../context/AdminAuthContext'

export function makeStore() {
  return configureStore({
    reducer: { [adminApi.reducerPath]: adminApi.reducer },
    middleware: (getDefault) => getDefault().concat(adminApi.middleware),
  })
}

interface Options {
  route?: string
  withAuthProvider?: boolean
}

export function renderWithProviders(ui: ReactElement, { route = '/', withAuthProvider = false }: Options = {}) {
  const store = makeStore()

  function Wrapper({ children }: { children: ReactNode }) {
    const inner = withAuthProvider ? <AdminAuthProvider>{children}</AdminAuthProvider> : children
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{inner}</MemoryRouter>
      </Provider>
    )
  }

  return { store, ...render(ui, { wrapper: Wrapper }) }
}
