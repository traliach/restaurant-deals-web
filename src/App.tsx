import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { DealsPage } from './pages/DealsPage'
import { DealDetailsPage } from './pages/DealDetailsPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { PortalPage } from './pages/PortalPage'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { RequireAuth } from './components/RequireAuth'
import { RequireRole } from './components/RequireRole'

type Role = 'customer' | 'owner' | 'admin' | null

function getRole(): Role {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return json?.role ?? null
  } catch {
    return null
  }
}

function App() {
  const navigate = useNavigate()
  const role = getRole()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 text-sm font-medium">
          <NavLink to="/" className="text-indigo-600">
            Restaurant Deals
          </NavLink>
          <NavLink to="/deals">Deals</NavLink>
          {role ? <NavLink to="/favorites">Favorites</NavLink> : null}
          {role === 'owner' || role === 'admin' ? <NavLink to="/portal">Portal</NavLink> : null}
          {role === 'admin' ? <NavLink to="/admin">Admin</NavLink> : null}
          {!role ? (
            <NavLink to="/login" className="ml-auto">
              Login
            </NavLink>
          ) : (
            <button
              onClick={logout}
              className="ml-auto rounded border px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          )}
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deals/:id" element={<DealDetailsPage />} />
          <Route
            path="/favorites"
            element={<FavoritesPage />}
          />
          <Route
            path="/portal"
            element={
              <RequireAuth>
                <RequireRole allowed={['owner', 'admin']}>
                  <PortalPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireRole allowed={['admin']}>
                  <AdminPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
