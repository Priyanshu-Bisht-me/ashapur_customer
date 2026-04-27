import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/productApi";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import PageHeader from "../components/PageHeader";
import ProductCard from "../components/ProductCard";
import { useCart } from "../hooks/useCart";
import { pushToast } from "../utils/toastBus";

function ShopPage() {
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [catalog, setCatalog] = useState({ categories: ["All"], products: [] });
  const [filters, setFilters] = useState({
    q: initialQuery,
    category: "All",
    sort: "featured"
  });
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const payload = await getProducts(nextFilters);
      setCatalog(payload);
      setQuantities((current) => {
        const next = { ...current };
        payload.products.forEach((product) => {
          if (!next[product._id]) {
            next[product._id] = 1;
          }
        });
        return next;
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts(filters);
  }, []);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setFilters((current) => {
      if (current.q === query) {
        return current;
      }

      const next = { ...current, q: query };
      loadProducts(next);
      return next;
    });
  }, [searchParams]);

  const selectedCategory = useMemo(() => filters.category || "All", [filters.category]);
  const activeFilterCount = useMemo(
    () =>
      [
        filters.q?.trim(),
        selectedCategory !== "All" ? selectedCategory : "",
        filters.sort !== "featured" ? filters.sort : ""
      ].filter(Boolean).length,
    [filters.q, filters.sort, selectedCategory]
  );

  function updateFilters(field, value) {
    setFilters((current) => ({
      ...current,
      [field]: value
    }));
  }

  function applyFilters(nextFilters) {
    const q = nextFilters.q?.trim() || "";
    setSearchParams(q ? { q } : {});
    loadProducts(nextFilters);
  }

  function handleAdd(product) {
    addItem(
      {
        productId: product._id,
        name: product.name,
        slug: product.slug,
        imageUrl: product.imageUrl,
        category: product.category,
        unit: product.unit,
        price: product.price
      },
      quantities[product._id] || 1
    );
    pushToast({ type: "success", message: `${product.name} added to cart.` });
  }

  if (loading) {
    return <LoaderBlock label="Loading products..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load products"
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
    <section className="page-stack">
      <PageHeader
        eyebrow="Product catalog"
        title="Shop daily dairy essentials"
        description="Search, filter, and add essentials fast."
        action={
          <div className="catalog-header__meta">
            <span className="eyebrow-chip">{catalog.products.length} products</span>
            <span className="helper-text">
              {activeFilterCount ? `${activeFilterCount} filters active` : "Fresh essentials in stock"}
            </span>
          </div>
        }
      />

      <div className="panel catalog-shell">
        <div className="catalog-shell__top">
          <div>
            <h2>Find products faster</h2>
            <p>Compact filters. Product-first layout.</p>
          </div>
          <span className="catalog-shell__count">
            {catalog.products.length} result{catalog.products.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="catalog-toolbar">
          <label className="catalog-toolbar__search">
            <span className="helper-text">Search</span>
            <input
              type="search"
              value={filters.q}
              onChange={(event) => updateFilters("q", event.target.value)}
              placeholder="Search milk, paneer, curd..."
            />
          </label>

          <label>
            <span className="helper-text">Sort by</span>
            <select
              value={filters.sort}
              onChange={(event) => {
                const next = { ...filters, sort: event.target.value };
                setFilters(next);
                applyFilters(next);
              }}
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="name">Name</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
              <option value="stock">Best stocked</option>
            </select>
          </label>

          <div className="shop-toolbar__actions">
            <button type="button" className="button button--primary" onClick={() => applyFilters(filters)}>
              Search
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                const next = { q: "", category: "All", sort: "featured" };
                setFilters(next);
                applyFilters(next);
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="catalog-shell__bottom">
          <div className="chip-row">
            {catalog.categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`chip ${selectedCategory === category ? "chip--active" : ""}`}
                onClick={() => {
                  const next = { ...filters, category };
                  setFilters(next);
                  applyFilters(next);
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <p className="helper-text">
            {selectedCategory === "All" ? "All catalog categories" : `Showing ${selectedCategory} essentials`}
            {filters.q?.trim() ? ` for "${filters.q.trim()}"` : ""}
          </p>
        </div>
      </div>

      {catalog.products.length ? (
        <div className="product-grid">
          {catalog.products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              quantity={quantities[product._id] || 1}
              onQuantityChange={(value) =>
                setQuantities((current) => ({
                  ...current,
                  [product._id]: value
                }))
              }
              onAdd={() => handleAdd(product)}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No products found" description="Try another search or category." />
      )}
    </section>
  );
}

export default ShopPage;
