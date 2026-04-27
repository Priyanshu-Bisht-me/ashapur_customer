import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductDetail } from "../api/productApi";
import { createSubscription } from "../api/subscriptionApi";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import PageHeader from "../components/PageHeader";
import QuantityStepper from "../components/QuantityStepper";
import StatusBadge from "../components/StatusBadge";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../utils/formatters";
import { getProductImage } from "../utils/media";
import { pushToast } from "../utils/toastBus";

function ProductDetailPage() {
  const { slug } = useParams();
  const routeNavigate = useNavigate();
  const { addItem } = useCart();
  const [payload, setPayload] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedQuantities, setRelatedQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState("");

  async function loadDetail() {
    setLoading(true);
    setError("");

    try {
      setPayload(await getProductDetail(slug));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [slug]);

  const detailChips = useMemo(() => {
    if (!payload?.product) {
      return [];
    }

    const tags = payload.product.nutritionBadges?.slice(0, 2) || [];
    return [tags[0] || "Fresh batch", tags[1] || "Cold handled", payload.product.category].filter(Boolean);
  }, [payload]);

  if (loading) {
    return <LoaderBlock label="Loading product..." />;
  }

  if (error || !payload?.product) {
    return (
      <EmptyState
        title="Product unavailable"
        description={error || "We couldn't find this product."}
        action={
          <Link to="/shop" className="button button--primary">
            Back to shop
          </Link>
        }
      />
    );
  }

  const { product, relatedProducts, details } = payload;
  const imageUrl = getProductImage(product);
  const isOutOfStock = product.stock <= 0;
  const subscriptionSummary = details.popularityNote || "Freshly stocked today";

  function handleAddToCart() {
    addItem(
      {
        productId: product._id,
        name: product.name,
        slug: product.slug,
        imageUrl,
        category: product.category,
        unit: product.unit,
        price: product.price
      },
      quantity
    );
    pushToast({ type: "success", message: `${product.name} added to cart.` });
    routeNavigate("/cart");
  }

  async function handleSubscribe() {
    setBusyAction("Daily");

    try {
      await createSubscription({
        productId: product._id,
        quantity,
        frequency: "Daily"
      });
      pushToast({ type: "success", message: "Subscription saved." });
      routeNavigate("/subscriptions");
    } catch (actionError) {
      pushToast({ type: "error", message: actionError.message });
    } finally {
      setBusyAction("");
    }
  }

  function addRelatedToCart(item) {
    const quantityValue = relatedQuantities[item._id] || 1;

    addItem(
      {
        productId: item._id,
        name: item.name,
        slug: item.slug,
        imageUrl: getProductImage(item),
        category: item.category,
        unit: item.unit,
        price: item.price
      },
      quantityValue
    );

    pushToast({ type: "success", message: `${item.name} added to cart.` });
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Product details"
        title={product.name}
        description={product.description}
        meta={<StatusBadge status={isOutOfStock ? "Sold Out" : "In Stock"} />}
        action={
          <Link to="/shop" className="button button--ghost">
            Back to shop
          </Link>
        }
      />

      <div className="detail-layout">
        <div className="detail-layout__media page-stack">
          <ProductImage
            src={imageUrl}
            alt={product.name}
            className="media-frame"
            imgClassName="media-frame__image"
            fallbackLabel={product.name}
            fetchPriority="high"
            aspectRatio="4 / 5"
            sizes="(max-width: 1024px) 100vw, 54vw"
          />

          <div className="panel detail-stack">
            <div className="card-header">
              <div>
                <h2>Trust badges</h2>
                <p>Freshness and delivery highlights.</p>
              </div>
            </div>
            <div className="pill-row">
              {detailChips.map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
              {(details.benefits || []).slice(0, 4).map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-panel">
          <div className="panel detail-stack detail-panel__sticky">
            <div className="detail-summary">
              <div className="detail-meta">
                <strong className="price-highlight">{formatCurrency(product.price)}</strong>
                <span className="helper-text">{product.unit}</span>
              </div>
              <p className="detail-summary__note">{subscriptionSummary}</p>
            </div>

            <div className="detail-chip-row">
              {detailChips.map((tag) => (
                <span key={tag} className="detail-chip">
                  {tag}
                </span>
              ))}
            </div>

            <div className="detail-buy-box">
              <label>
                Quantity
                <QuantityStepper value={quantity} max={product.stock} onChange={setQuantity} />
              </label>

              <div className="split-actions">
                <button type="button" className="button button--primary" disabled={isOutOfStock} onClick={handleAddToCart}>
                  Add to cart
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={busyAction === "Daily" || isOutOfStock}
                  onClick={handleSubscribe}
                >
                  {busyAction === "Daily" ? "Saving..." : "Subscribe daily"}
                </button>
              </div>
            </div>

            <div className="summary-lines">
              <div>
                <span>Category</span>
                <strong>{product.category}</strong>
              </div>
              <div>
                <span>Available stock</span>
                <strong>{product.stock}</strong>
              </div>
            </div>

            <div className="detail-trust-list">
              <div>
                <strong>Freshness guarantee</strong>
                <p className="helper-text">Cold-chain friendly delivery for everyday household essentials.</p>
              </div>
              <div>
                <strong>Flexible repeat orders</strong>
                <p className="helper-text">Subscribe when you need a dependable daily or weekly refill.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length ? (
          <div className="panel">
            <div className="card-header">
              <div>
                <h2>Related products</h2>
                <p>More from this category.</p>
              </div>
            </div>
          <div className="product-grid">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item._id}
                product={item}
                quantity={relatedQuantities[item._id] || 1}
                onQuantityChange={(value) =>
                  setRelatedQuantities((current) => ({
                    ...current,
                    [item._id]: value
                  }))
                }
                onAdd={() => addRelatedToCart(item)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProductDetailPage;
