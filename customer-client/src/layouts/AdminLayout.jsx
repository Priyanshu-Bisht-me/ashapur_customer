import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

function AdminLayout() {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="shell-main shell-main--admin">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
