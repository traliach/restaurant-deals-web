import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useNavigate, Navigate } from 'react-router-dom'
import { logout } from './store/authSlice'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { HomePage } from './pages/HomePage'
import { DealsPage } from './pages/DealsPage'
import { DealDetailsPage } from './pages/DealDetailsPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { PortalPage } from './pages/PortalPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminQueuePage } from './pages/AdminQueuePage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminBotPage } from './pages/AdminBotPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ExplorePage } from './pages/ExplorePage'
import { OrdersPage } from './pages/OrdersPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AdminLayout } from './components/AdminLayout'
import { ChatWidget } from './components/ChatWidget'
import { NotificationsBell } from './components/NotificationsBell'
import { RequireAuth } from './components/RequireAuth'
import { RequireRole } from './components/RequireRole'

function App() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const role = useAppSelector((state) => state.auth.role)
  const count = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.qty, 0)
  )
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function handleExpired() {
      dispatch(logout())
    }

    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [dispatch])

  function handleLogout() {
    dispatch(logout())
    setMenuOpen(false)
    navigate('/login')
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <Routes>
      {/* Admin routes — use AdminLayout (no top navbar) */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireRole allowed={['admin']}>
              <AdminLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="queue" element={<AdminQueuePage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="bot" element={<AdminBotPage />} />
      </Route>

      {/* All other routes — use the standard layout with top navbar */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b bg-white">
              <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-0 px-4 py-3 text-sm font-medium">
                <NavLink to="/" className="text-indigo-600" onClick={closeMenu}>
                  Restaurant Deals
                </NavLink>

                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="ml-auto sm:hidden rounded border px-2 py-1 text-slate-600 hover:bg-slate-100"
                  aria-label="Toggle menu"
                >
                  {menuOpen ? '✕' : '☰'}
                </button>

                <div className={`${menuOpen ? 'flex' : 'hidden'} w-full flex-col gap-2 pt-2 sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-4 sm:pt-0`}>
                  <NavLink to="/deals" onClick={closeMenu}>Deals</NavLink>
                  <NavLink to="/favorites" onClick={closeMenu}>Favorites</NavLink>
                  {role === 'customer' && (
                    <NavLink to="/orders" onClick={closeMenu}>Orders</NavLink>
                  )}
                  <NavLink to="/cart" onClick={closeMenu} className="relative">
                    Cart
                    {count > 0 && (
                      <span className="ml-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs font-bold text-white">
                        {count}
                      </span>
                    )}
                  </NavLink>
                  {(role === 'owner' || role === 'admin') && (
                    <NavLink to="/portal" onClick={closeMenu}>Portal</NavLink>
                  )}
                  {role === 'owner' && (
                    <NavLink to="/explore" onClick={closeMenu}>Explore</NavLink>
                  )}
                  {role === 'admin' && (
                    <NavLink to="/admin/dashboard" onClick={closeMenu}>Admin</NavLink>
                  )}
                  {!role ? (
                    <span className="flex gap-3 sm:ml-auto">
                      <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
                      <NavLink to="/register" onClick={closeMenu}>Register</NavLink>
                    </span>
                  ) : (
                    <span className="flex items-center gap-3 sm:ml-auto">
                      <NotificationsBell />
                      <button
                        onClick={handleLogout}
                        className="rounded border px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        Logout
                      </button>
                    </span>
                  )}
                </div>
              </nav>
            </header>

            <div className="mx-auto max-w-5xl px-4 py-6">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/deals/:id" element={<DealDetailsPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route
                  path="/portal"
                  element={
                    <RequireAuth>
                      <RequireRole allowed={['owner']}>
                        <PortalPage />
                      </RequireRole>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/explore"
                  element={
                    <RequireAuth>
                      <RequireRole allowed={['owner']}>
                        <ExplorePage />
                      </RequireRole>
                    </RequireAuth>
                  }
                />
                <Route path="/cart" element={<CartPage />} />
                <Route
                  path="/orders"
                  element={
                    <RequireAuth>
                      <OrdersPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <RequireAuth>
                      <CheckoutPage />
                    </RequireAuth>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>

            <footer className="mt-12 border-t bg-white text-xs text-slate-400">
              <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-6 sm:flex-row sm:justify-between">
                <span>© {new Date().getFullYear()} Restaurant Deals</span>
                <nav className="flex gap-4">
                  <a href="/deals" className="hover:text-slate-600">Deals</a>
                  <a href="/favorites" className="hover:text-slate-600">Favorites</a>
                  <a href="/register" className="hover:text-slate-600">Register</a>
                </nav>
                <span>Built with MERN + TypeScript</span>
              </div>
            </footer>

            {role && <ChatWidget />}
          </div>
        }
      />
    </Routes>
  )
}

export default App
