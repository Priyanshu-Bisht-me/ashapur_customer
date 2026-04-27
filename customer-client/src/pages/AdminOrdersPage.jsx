import { useEffect, useMemo, useState } from "react";
import { getAdminOrders, updateAdminOrder } from "../api/adminApi";
import { getMeta } from "../api/productApi";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency } from "../utils/formatters";
import { pushToast } from "../utils/toastBus";

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ orderStatuses: [], deliverySlots: [] });
  const [filters, setFilters] = useState({ q: "", status: "" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [draft, setDraft] = useState({
    status: "",
    slot: "",
    riderName: "",
    riderPhone: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadData(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const [ordersPayload, metaPayload] = await Promise.all([getAdminOrders(nextFilters), getMeta()]);
      setOrders(ordersPayload.orders);
      setMeta(metaPayload);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const orderCountLabel = useMemo(() => `${orders.length} order${orders.length === 1 ? "" : "s"}`, [orders.length]);

  function openOrder(order) {
    setSelectedOrder(order);
    setDraft({
      status: order.status || "",
      slot: order.slot || "",
      riderName: order.rider?.name || "",
      riderPhone: order.rider?.phone || ""
    });
  }

  async function handleSaveOrder() {
    if (!selectedOrder) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const payload = {
        status: draft.status,
        slot: draft.slot,
        rider: {
          name: draft.riderName,
          phone: draft.riderPhone
        }
      };

      await updateAdminOrder(selectedOrder._id, payload);
      pushToast({ type: "success", message: "Order updated." });
      setSelectedOrder(null);
      await loadData(filters);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <LoaderBlock label="Loading orders..." />;
  }

  if (error && !orders.length) {
    return (
      <EmptyState
        title="Orders unavailable"
        description={error}
        action={
          <button type="button" className="button button--primary" onClick={() => loadData(filters)}>
            Retry
          </button>
        }
      />
    );
  }

  return (
    <>
      <section className="page-stack">
        <PageHeader
          eyebrow="Order operations"
          title="Orders"
          description="View the order queue, filter by status, and open a focused modal to update state or rider details."
        />

        <div className="table-wrap">
          <div className="table-tools">
            <div>
              <h2>{orderCountLabel}</h2>
              <p className="table-muted">The main list stays lightweight; deeper edits happen in the details modal.</p>
            </div>
            <div className="toolbar__group">
              <input
                type="search"
                value={filters.q}
                onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                placeholder="Search order or customer"
              />
              <select
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="">All statuses</option>
                {meta.orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button type="button" className="button button--primary" onClick={() => loadData(filters)}>
                Apply
              </button>
            </div>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                      <div className="table-muted">{order.createdAtLabel}</div>
                    </td>
                    <td>
                      <strong>{order.customer?.name || "Customer"}</strong>
                      <div className="table-muted">{order.customer?.phone || order.customer?.email || "No contact"}</div>
                    </td>
                    <td>{order.items.length}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <button type="button" className="button button--ghost" onClick={() => openOrder(order)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder?.orderNumber || "Order details"}
        description="Update only the operational fields that matter for fulfilment."
        size="wide"
      >
        {selectedOrder ? (
          <div className="page-stack">
            <div className="content-grid">
              <div className="panel">
                <div className="card-header">
                  <div>
                    <h2>Customer and delivery</h2>
                    <p>Address, slot, and rider details.</p>
                  </div>
                </div>

                <div className="summary-lines">
                  <div>
                    <span>Customer</span>
                    <strong>{selectedOrder.customer?.name || "Customer"}</strong>
                  </div>
                  <div>
                    <span>Address</span>
                    <strong>{selectedOrder.address.fullAddress}</strong>
                  </div>
                </div>

                <div className="two-col-form">
                  <label>
                    Status
                    <select
                      value={draft.status}
                      onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
                    >
                      {meta.orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Delivery slot
                    <select
                      value={draft.slot}
                      onChange={(event) => setDraft((current) => ({ ...current, slot: event.target.value }))}
                    >
                      {meta.deliverySlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Rider name
                    <input
                      type="text"
                      value={draft.riderName}
                      onChange={(event) => setDraft((current) => ({ ...current, riderName: event.target.value }))}
                    />
                  </label>
                  <label>
                    Rider phone
                    <input
                      type="text"
                      value={draft.riderPhone}
                      onChange={(event) => setDraft((current) => ({ ...current, riderPhone: event.target.value }))}
                    />
                  </label>
                </div>
              </div>

              <div className="panel">
                <div className="card-header">
                  <div>
                    <h2>Order summary</h2>
                    <p>{selectedOrder.items.length} item{selectedOrder.items.length === 1 ? "" : "s"} in this order.</p>
                  </div>
                  <StatusBadge status={selectedOrder.status} />
                </div>

                <div className="list-stack">
                  {selectedOrder.items.map((item) => (
                    <article key={`${selectedOrder._id}-${item.productId}`} className="list-row">
                      <div>
                        <strong>{item.name}</strong>
                        <p>
                          {item.quantity} x {item.unit}
                        </p>
                      </div>
                      <strong>{formatCurrency(item.lineTotal)}</strong>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <div className="summary-card__actions">
              <button type="button" className="button button--ghost" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
              <button type="button" className="button button--primary" disabled={busy} onClick={handleSaveOrder}>
                {busy ? "Saving..." : "Save updates"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default AdminOrdersPage;
