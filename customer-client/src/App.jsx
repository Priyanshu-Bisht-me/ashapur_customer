import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./auth/RequireAuth";
import RequireAdminAuth from "./auth/RequireAdminAuth";
import LoaderBlock from "./components/LoaderBlock";
import ToastViewport from "./components/ToastViewport";
import AdminLayout from "./layouts/AdminLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import { getSession } from "./auth/authStorage";

const AdminCustomersPage = lazy(() => import("./pages/AdminCustomersPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrdersPage"));
const AdminProductsPage = lazy(() => import("./pages/AdminProductsPage"));
const AdminSubscriptionsPage = lazy(() => import("./pages/AdminSubscriptionsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const RewardsPage = lazy(() => import("./pages/RewardsPage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage"));

function HomeRedirect() {
  const session = getSession();

  if (!session?.token || !session?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={session.user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
}

function App() {
  return (
    <>
      <Suspense fallback={<LoaderBlock label="Loading page..." />}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route element={<RequireAuth role="customer" />}>
            <Route element={<CustomerLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route element={<RequireAdminAuth />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/customers" element={<AdminCustomersPage />} />
              <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </Suspense>
      <ToastViewport />
    </>
  );
}

export default App;
