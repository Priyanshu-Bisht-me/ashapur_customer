import { Outlet } from "react-router-dom";
import CustomerNavbar from "../components/CustomerNavbar";

function CustomerLayout() {
  return (
    <div className="app-shell">
      <CustomerNavbar />
      <main className="shell-main shell-main--customer">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;
