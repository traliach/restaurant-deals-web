import { NavLink, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { DealsPage } from './pages/DealsPage'
import { DealDetailsPage } from './pages/DealDetailsPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { PortalPage } from './pages/PortalPage'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 text-sm font-medium">
          <NavLink to="/" className="text-indigo-600">
            Restaurant Deals
          </NavLink>
          <NavLink to="/deals">Deals</NavLink>
          <NavLink to="/favorites">Favorites</NavLink>
          <NavLink to="/portal">Portal</NavLink>
          <NavLink to="/admin">Admin</NavLink>
          <NavLink to="/login" className="ml-auto">
            Login
          </NavLink>
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deals/:id" element={<DealDetailsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
