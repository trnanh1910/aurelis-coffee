import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import BranchesPage from '../pages/admin/BranchesPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import DashboardPage from '../pages/admin/DashboardPage';
import OrdersPage from '../pages/admin/OrdersPage';
import ProductsPage from '../pages/admin/ProductsPage';
import SettingsPage from '../pages/admin/SettingsPage';
import TablesPage from '../pages/admin/TablesPage';
import CustomersPage from '../pages/admin/CustomersPage';
import InventoryPage from '../pages/admin/InventoryPage';
import ReportsPage from '../pages/admin/ReportsPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AccountPage from '../pages/customer/AccountPage';
import ForbiddenPage from '../pages/common/ForbiddenPage';
import NotFoundPage from '../pages/common/NotFoundPage';
import HomePage from '../pages/customer/HomePage';
import MenuPage from '../pages/customer/MenuPage';
import StoresPage from '../pages/customer/StoresPage';
import StoryPage from '../pages/customer/StoryPage';
import ReservationPage from '../pages/customer/ReservationPage';
import CartPage from '../pages/customer/CartPage';
import UsersPage from '../pages/admin/UsersPage';
import BaristaPage from '../pages/staff/BaristaPage';
import POSPage from '../pages/staff/POSPage';
import ProtectedRoute from './ProtectedRoute';
import PageTransition from '../components/common/PageTransition';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>
      <Route
        path="/login"
        element={
          <PageTransition>
            <LoginPage />
          </PageTransition>
        }
      />
      <Route
        path="/register"
        element={
          <PageTransition>
            <RegisterPage />
          </PageTransition>
        }
      />
      <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
        <Route
          path="/account"
          element={
            <PageTransition>
              <AccountPage />
            </PageTransition>
          }
        />
      </Route>
      <Route
        path="/403"
        element={
          <PageTransition>
            <ForbiddenPage />
          </PageTransition>
        }
      />
      <Route element={<ProtectedRoute roles={['ADMIN', 'MANAGER']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['CASHIER', 'ADMIN', 'MANAGER']} />}>
        <Route
          path="/pos"
          element={
            <PageTransition>
              <POSPage />
            </PageTransition>
          }
        />
      </Route>
      <Route element={<ProtectedRoute roles={['BARISTA', 'ADMIN', 'MANAGER']} />}>
        <Route
          path="/barista"
          element={
            <PageTransition>
              <BaristaPage />
            </PageTransition>
          }
        />
      </Route>
      <Route
        path="*"
        element={
          <PageTransition>
            <NotFoundPage />
          </PageTransition>
        }
      />
    </Routes>
  );
}
