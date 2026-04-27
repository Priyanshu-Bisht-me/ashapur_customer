import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSession } from "./authStorage";

function RequireAuth({ role }) {
  const location = useLocation();
  const session = getSession();

  if (!session?.token || !session?.user) {
    return (
      <Navigate
        to={role === "admin" ? "/admin/login" : "/login"}
        replace
        state={{ from: location }}
      />
    );
  }

  if (role && session.user.role !== role) {
    return (
      <Navigate
        to={session.user.role === "admin" ? "/admin" : "/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}

export default RequireAuth;
