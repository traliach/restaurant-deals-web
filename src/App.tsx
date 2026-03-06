import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { AppShell } from "./components/layout/AppShell";
import { RequireAuth } from "./components/RequireAuth";
import { RequireRole } from "./components/RequireRole";
import { AdminBotPage } from "./pages/AdminBotPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminQueuePage } from "./pages/AdminQueuePage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { DealDetailsPage } from "./pages/DealDetailsPage";
import { DealsPage } from "./pages/DealsPage";
import { ExplorePage } from "./pages/ExplorePage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrdersPage } from "./pages/OrdersPage";
import { PortalPage } from "./pages/PortalPage";
import { RegisterPage } from "./pages/RegisterPage";
import { logout } from "./store/authSlice";
import { useAppDispatch } from "./store/hooks";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    function handleExpired() {
      dispatch(logout());
    }

    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [dispatch]);

  return (
    <Routes>
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

      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/deals/:id" element={<DealDetailsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route
          path="/portal"
          element={
            <RequireAuth>
              <RequireRole allowed={["owner"]}>
                <PortalPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/explore"
          element={
            <RequireAuth>
              <RequireRole allowed={["owner"]}>
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
      </Route>
    </Routes>
  );
}

export default App;
