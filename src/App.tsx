import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext'
import AdminGuard from './components/layout/AdminGuard'
import AdminLayout from './components/layout/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OrganizationsPage from './pages/OrganizationsPage'
import OrgDetailPage from './pages/OrgDetailPage'
import UsersPage from './pages/UsersPage'
import DocumentReviewPage from './pages/DocumentReviewPage'
import TrustScorePage from './pages/TrustScorePage'
import CompliancePage from './pages/CompliancePage'
import AuditLogsPage from './pages/AuditLogsPage'
import AlertsPage from './pages/AlertsPage'
import SystemPage from './pages/SystemPage'
import AdminsPage from './pages/AdminsPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH?.replace(/\/$/, '') || '/'}>
      <AdminAuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route path="/organizations/:id" element={<OrgDetailPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/documents" element={<DocumentReviewPage />} />
              <Route path="/trust-scores" element={<TrustScorePage />} />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/system" element={<SystemPage />} />
              <Route path="/admins" element={<AdminsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
