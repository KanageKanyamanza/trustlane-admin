import '@testing-library/jest-dom/vitest'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'
import i18n from '../i18n/i18n'

beforeAll(async () => {
  await i18n.changeLanguage('fr')
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
})

afterAll(() => server.close())
