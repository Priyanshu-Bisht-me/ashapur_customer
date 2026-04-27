import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearSession } from "../auth/authStorage";
import { useCart } from "../hooks/useCart";
import { useSession } from "../hooks/useSession";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/shop", label: "Shop" },
  { to: "/orders", label: "Orders" },
  { to: "/subscriptions", label: "Subscriptions" },
  { to: "/rewards", label: "Rewards" },
  { to: "/cart", label: "Cart" },
  { to: "/profile", label: "Profile" }
];

function CustomerNavbar() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <button type="button" className="topbar__menu" onClick={() => setOpen((current) => !current)}>
          Menu
        </button>

        <button type="button" className="brand-lockup" onClick={() => navigate("/dashboard")}>
          <span className="brand-lockup__mark">A</span>
          <span className="brand-lockup__text">
            <strong>Aasapure</strong>
            <small>Daily dairy delivery</small>
          </span>
        </button>

        <nav className={`topbar__nav ${open ? "topbar__nav--open" : ""}`}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.label === "Cart" ? `Cart (${count})` : item.label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar__actions">
          <div className="topbar__user">
            <span className="topbar__avatar">{String(user?.name || "A").trim()[0]?.toUpperCase() || "A"}</span>
            <div>
              <strong>{user?.name || "Customer"}</strong>
              <small>Customer account</small>
            </div>
          </div>
          <button type="button" className="button button--ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default CustomerNavbar;
