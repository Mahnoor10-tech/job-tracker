import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'

const ApplicationDetails = lazy(() => import('./pages/ApplicationDetails'))
const ApplicationForm = lazy(() => import('./pages/ApplicationForm'))
const Applications = lazy(() => import('./pages/Applications'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loading">Loading your workspace…</div>
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

function WorkspaceLayout() {
  return <><Navbar /><Outlet /></>
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="page-loading">Loading your workspace…</div>}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<WorkspaceLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/new" element={<ApplicationForm />} />
            <Route path="/applications/:id/edit" element={<ApplicationForm />} />
            <Route path="/applications/:id" element={<ApplicationDetails />} />
          </Route>
        </Route>
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>
}
