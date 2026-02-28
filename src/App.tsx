import { useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useCart } from './context/CartContext'
import { HomePage } from './pages/HomePage'
import { DealsPage } from './pages/DealsPage'
import { DealDetailsPage } from './pages/DealDetailsPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { PortalPage } from './pages/PortalPage'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CartPage } from './pages/CartPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RequireAuth } from './components/RequireAuth'
import { RequireRole } from './components/RequireRole'

function App() {
  const navigate = useNavigate()
  const { role, logout } = useAuth()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/login')
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-0 px-4 py-3 text-sm font-medium">
          <NavLink to="/" className="text-indigo-600" onClick={closeMenu}>
            Restaurant Deals
          </NavLink>

          {/* Hamburger toggle — visible only on small screens */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="ml-auto sm:hidden rounded border px-2 py-1 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          {/* Nav links — hidden on mobile unless menu is open */}
          <div className={`${menuOpen ? 'flex' : 'hidden'} w-full flex-col gap-2 pt-2 sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-4 sm:pt-0`}>
            <NavLink to="/deals" onClick={closeMenu}>Deals</NavLink>
            <NavLink to="/favorites" onClick={closeMenu}>Favorites</NavLink>
            <NavLink to="/cart" onClick={closeMenu} className="relative">
              Cart
              {count > 0 && (
                <span className="ml-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs font-bold text-white">
                  {count}
                </span>
              )}
            </NavLink>
            {role === 'owner' || role === 'admin' ? <NavLink to="/portal" onClick={closeMenu}>Portal</NavLink> : null}
            {role === 'admin' ? <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink> : null}
            {!role ? (
              <span className="flex gap-3 sm:ml-auto">
                <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
                <NavLink to="/register" onClick={closeMenu}>Register</NavLink>
              </span>
            ) : (
              <button
                onClick={handleLogout}
                className="sm:ml-auto rounded border px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>
            )}
          </div>
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
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
