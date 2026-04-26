import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../auth/authStorage";

function getTopbarTitle(pathname) {
  if (pathname.includes("/customer/shop")) {
    return "Shop essentials";
  }

  if (pathname.includes("/customer/cart")) {
    return "Cart summary";
  }

  if (pathname.includes("/customer/checkout")) {
    return "Checkout";
  }

  if (pathname.includes("/customer/orders")) {
    return "Order history";
  }

  if (pathname.includes("/customer/track/")) {
    return "Track order";
  }

  return "Dashboard overview";
}

function CustomerLayout() {
  const session = getSession();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    clearSession();
    navigate("/customer/login");
  }

  return (
    <div className="customer-shell">
      <aside className="customer-shell__sidebar">
        <div className="brand-block">
          <span className="brand-block__eyebrow">Fresh Daily</span>
          <h1>Aasapure</h1>
          <p>Customer Console</p>
        </div>

        <nav className="customer-nav">
          <NavLink to="/customer/dashboard">Dashboard</NavLink>
          <NavLink to="/customer/shop">Shop</NavLink>
          <NavLink to="/customer/cart">Cart</NavLink>
          <NavLink to="/customer/checkout">Checkout</NavLink>
          <NavLink to="/customer/orders">Orders</NavLink>
        </nav>

        <div className="customer-shell__profile">
          <div>
            <strong>{session?.name || "Customer"}</strong>
            <span>{session?.email}</span>
          </div>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="customer-shell__content">
        <header className="customer-shell__topbar">
          <div>
            <span className="topbar-label">Customer Module</span>
            <h2>{getTopbarTitle(location.pathname)}</h2>
          </div>
          <div className="topbar-chip">Role: {session?.role || "customer"}</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;
