import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import RegistrationSuccessPage from './pages/auth/RegistrationSuccessPage'

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage'
import MoveHistoryPage from './pages/dashboard/MoveHistoryPage'
import MoveHistoryDetailsPage from './pages/dashboard/MoveHistoryDetailsPage'
import RedeemRewardsPage from './pages/dashboard/RedeemRewardsPage'
import ConfirmRedemptionPage from './pages/dashboard/ConfirmRedemptionPage'
import TierBenefitsPage from './pages/dashboard/TierBenefitsPage'
import GroupCodesPage from './pages/dashboard/GroupCodesPage'
import ReportsPage from './pages/dashboard/ReportsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import AdminPanelPage from './pages/dashboard/AdminPanelPage'

import DashboardLayout from './layouts/DashboardLayout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/success" element={<RegistrationSuccessPage />} />

          {/* Dashboard (protected) */}
          <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="moves" element={<MoveHistoryPage />} />
            <Route path="moves/:id" element={<MoveHistoryDetailsPage />} />
            <Route path="redeem" element={<RedeemRewardsPage />} />
            <Route path="redeem/confirm" element={<ConfirmRedemptionPage />} />
            <Route path="tier-benefits" element={<TierBenefitsPage />} />
            <Route path="group-codes" element={<GroupCodesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminPanelPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
