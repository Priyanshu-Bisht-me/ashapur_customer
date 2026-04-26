import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "./authStorage";

function RequireCustomerAuth({ children }) {
  const location = useLocation();
  const session = getSession();

  if (!session || session.role !== "customer") {
    return <Navigate to="/customer/login" replace state={{ from: location }} />;
  }

  return children;
}

export default RequireCustomerAuth;
