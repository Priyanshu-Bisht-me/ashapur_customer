import { Navigate, Route, Routes } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";
import RequireCustomerAuth from "./auth/RequireCustomerAuth";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import TrackOrderPage from "./pages/TrackOrderPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/customer/login" replace />} />
      <Route path="/customer/login" element={<LoginPage />} />
      <Route path="/customer/signup" element={<SignupPage />} />
      <Route
        path="/customer"
        element={
          <RequireCustomerAuth>
            <CustomerLayout />
          </RequireCustomerAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="track/:orderId" element={<TrackOrderPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/customer/login" replace />} />
    </Routes>
  );
}

export default App;
