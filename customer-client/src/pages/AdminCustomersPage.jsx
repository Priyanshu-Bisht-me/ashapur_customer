import { useEffect, useState } from "react";
import { getAdminCustomers } from "../api/adminApi";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import PageHeader from "../components/PageHeader";

function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function loadCustomers(search = query) {
    setLoading(true);
    setError("");

    try {
      const payload = await getAdminCustomers({ q: search });
      setCustomers(payload.customers);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  if (loading) {
    return <LoaderBlock label="Loading customers..." />;
  }

  if (error && !customers.length) {
    return (
      <EmptyState
        title="Customers unavailable"
        description={error}
        action={
          <button type="button" className="button button--primary" onClick={() => loadCustomers(query)}>
            Retry
          </button>
        }
      />
    );
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Customer accounts"
        title="Customers"
        description="A simple, scan-friendly customer list with only the fields that matter most."
      />

      <div className="table-wrap">
        <div className="table-tools">
          <div>
            <h2>Customer list</h2>
            <p className="table-muted">Search by name, email, or phone.</p>
          </div>
          <div className="toolbar__group">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customers"
            />
            <button type="button" className="button button--primary" onClick={() => loadCustomers(query)}>
              Search
            </button>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Addresses</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <strong>{customer.name}</strong>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || "No phone"}</td>
                  <td>{customer.addresses?.length || 0}</td>
                  <td>{customer.ordersCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AdminCustomersPage;
