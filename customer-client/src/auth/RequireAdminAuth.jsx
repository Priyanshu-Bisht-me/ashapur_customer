import RequireAuth from "./RequireAuth";

function RequireAdminAuth() {
  return <RequireAuth role="admin" />;
}

export default RequireAdminAuth;
