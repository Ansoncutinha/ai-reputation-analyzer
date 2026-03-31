import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing       from './pages/Landing'
import Login         from './pages/Login'
import Signup        from './pages/Signup'
import Dashboard     from './pages/Dashboard'
import MyAnalytics   from './pages/MyAnalytics'
import SiteUsers     from './pages/SiteUsers'
import MyAccount     from './pages/MyAccount'
import Settings      from './pages/Settings'
import Insights      from './pages/Insights'
import ResetPassword from './pages/ResetPassword'
import MainLayout    from './components/MainLayout'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/"               element={<Landing />} />
      <Route path="/login"          element={<Login />} />
      <Route path="/signup"         element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/my-analytics" element={<MyAnalytics />} />
        <Route path="/site-users"   element={<SiteUsers />} />
        <Route path="/my-account"   element={<MyAccount />} />
        <Route path="/settings"     element={<Settings />} />
        <Route path="/insights"     element={<Insights />} />
      </Route>
    </Routes>
  )
}