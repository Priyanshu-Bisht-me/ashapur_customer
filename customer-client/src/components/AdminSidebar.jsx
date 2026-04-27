import { NavLink, useNavigate } from "react-router-dom";
import { clearSession } from "../auth/authStorage";

const ADMIN_LINKS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/subscriptions", label: "Subscriptions" }
];

function AdminSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    navigate("/admin/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <button type="button" className="brand-lockup brand-lockup--sidebar" onClick={() => navigate("/admin/dashboard")}>
          <span className="brand-lockup__mark">A</span>
          <span className="brand-lockup__text">
            <strong>Aasapure</strong>
            <small>Operations panel</small>
          </span>
        </button>
        <p>Products, orders, customers, and subscription operations in one calm workspace.</p>
      </div>

      <nav className="sidebar__nav">
        {ADMIN_LINKS.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="button button--ghost button--full" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

export default AdminSidebar;
