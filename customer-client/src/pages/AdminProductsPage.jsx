import { useEffect, useMemo, useState } from "react";
import { createAdminProduct, getAdminProducts, updateAdminProduct } from "../api/adminApi";
import AppStatCard from "../components/AppStatCard";
import ProductImage from "../components/ProductImage";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency } from "../utils/formatters";
import { getProductImage } from "../utils/media";
import { pushToast } from "../utils/toastBus";

const emptyProduct = {
  name: "",
  slug: "",
  category: "",
  description: "",
  imageUrl: "",
  price: "",
  unit: "",
  stock: "",
  active: true,
  nutritionBadges: ""
};

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", active: "" });
  const [draft, setDraft] = useState(emptyProduct);
  const [editingId, setEditingId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [busyKey, setBusyKey] = useState("");

  async function loadProducts(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const payload = await getAdminProducts(nextFilters);
      setProducts(payload.products);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const lowStockCount = useMemo(() => products.filter((product) => Number(product.stock || 0) <= 20).length, [products]);

  function openCreateModal() {
    setEditingId("");
    setDraft(emptyProduct);
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingId(product._id);
    setDraft({
      name: product.name,
      slug: product.slug,
      category: product.category,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.price,
      unit: product.unit,
      stock: product.stock,
      active: product.active,
      nutritionBadges: (product.nutritionBadges || []).join(", ")
    });
    setModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusyKey("save");
    setError("");

    const payload = {
      ...draft,
      nutritionBadges: String(draft.nutritionBadges || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    try {
      if (editingId) {
        await updateAdminProduct(editingId, payload);
        pushToast({ type: "success", message: "Product updated." });
      } else {
        await createAdminProduct(payload);
        pushToast({ type: "success", message: "Product created." });
      }
      setModalOpen(false);
      setDraft(emptyProduct);
      setEditingId("");
      await loadProducts(filters);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function handleToggle(product) {
    setBusyKey(product._id);

    try {
      await updateAdminProduct(product._id, { active: !product.active });
      pushToast({ type: "success", message: "Product status updated." });
      await loadProducts(filters);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  if (loading) {
    return <LoaderBlock label="Loading products..." />;
  }

  if (error && !products.length) {
    return (
      <EmptyState
        title="Products unavailable"
        description={error}
        action={
          <button type="button" className="button button--primary" onClick={() => loadProducts(filters)}>
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
          eyebrow="Catalog management"
          title="Products"
          description="Manage products, stock, and availability."
          action={
            <button type="button" className="button button--primary" onClick={openCreateModal}>
              Add product
            </button>
          }
        />

        <div className="metric-grid">
          <AppStatCard label="Products" value={products.length} tone="soft" />
          <AppStatCard label="Active" value={products.filter((item) => item.active).length} />
          <AppStatCard label="Disabled" value={products.filter((item) => !item.active).length} />
          <AppStatCard label="Low stock" value={lowStockCount} tone="warning" />
        </div>

        <div className="table-wrap">
          <div className="table-tools">
            <div>
              <h2>Catalog list</h2>
              <p className="table-muted">Search and manage the catalog.</p>
            </div>
            <div className="toolbar__group">
              <input
                type="search"
                value={filters.q}
                onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                placeholder="Search products"
              />
              <select
                value={filters.active}
                onChange={(event) => setFilters((current) => ({ ...current, active: event.target.value }))}
              >
                <option value="">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </select>
              <button type="button" className="button button--primary" onClick={() => loadProducts(filters)}>
                Apply
              </button>
            </div>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="mini-media-row">
                        <ProductImage
                          src={getProductImage(product)}
                          alt={product.name}
                          className="mini-thumb"
                          imgClassName="media-frame__image"
                          fallbackLabel={product.name}
                        />
                        <div>
                          <strong>{product.name}</strong>
                          <div className="table-muted">{product.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <StatusBadge status={product.active ? "Active" : "Disabled"} />
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button type="button" className="button button--ghost" onClick={() => openEditModal(product)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button button--secondary"
                          disabled={busyKey === product._id}
                          onClick={() => handleToggle(product)}
                        >
                          {product.active ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit product" : "Add product"}
        description="Create or update one product."
        size="wide"
      >
        <form className="page-stack" onSubmit={handleSubmit}>
          <div className="two-col-form">
            <label>
              Name
              <input
                type="text"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Slug
              <input
                type="text"
                value={draft.slug}
                onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))}
              />
            </label>
            <label>
              Category
              <input
                type="text"
                value={draft.category}
                onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                required
              />
            </label>
            <label>
              Unit
              <input
                type="text"
                value={draft.unit}
                onChange={(event) => setDraft((current) => ({ ...current, unit: event.target.value }))}
                required
              />
            </label>
            <label>
              Price
              <input
                type="number"
                min="0"
                value={draft.price}
                onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))}
                required
              />
            </label>
            <label>
              Stock
              <input
                type="number"
                min="0"
                value={draft.stock}
                onChange={(event) => setDraft((current) => ({ ...current, stock: event.target.value }))}
                required
              />
            </label>
            <label className="form-grid__full">
              Image URL
              <input
                type="url"
                value={draft.imageUrl}
                onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))}
              />
            </label>
            <label className="form-grid__full">
              Description
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            <label className="form-grid__full">
              Detail chips
              <input
                type="text"
                value={draft.nutritionBadges}
                onChange={(event) => setDraft((current) => ({ ...current, nutritionBadges: event.target.value }))}
                placeholder="Calcium Rich, Farm Fresh, Daily Staple"
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))}
              />
              Active
            </label>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="summary-card__actions">
            <button type="button" className="button button--ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="button button--primary" disabled={busyKey === "save"}>
              {busyKey === "save" ? "Saving..." : editingId ? "Update product" : "Create product"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default AdminProductsPage;
