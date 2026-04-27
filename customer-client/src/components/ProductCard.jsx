import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatters";
import { getProductImage } from "../utils/media";
import ProductImage from "./ProductImage";
import QuantityStepper from "./QuantityStepper";
import StatusBadge from "./StatusBadge";

function ProductCard({ product, quantity, onQuantityChange, onAdd }) {
  const imageUrl = getProductImage(product);
  const isOutOfStock = Number(product.stock || 0) <= 0;
  const stockLabel = isOutOfStock ? "Out of stock" : `${product.stock} available`;
  const helperCopy =
    product.description || `${product.unit} of fresh ${String(product.category || "dairy").toLowerCase()}.`;

  return (
    <article className="product-card product-card--catalog">
      <Link to={`/products/${product.slug}`} className="product-card__image-link">
        <ProductImage
          src={imageUrl}
          alt={product.name}
          className="product-card__media"
          imgClassName="product-card__image"
          fallbackLabel={product.category || "Dairy"}
          aspectRatio="1 / 1"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>

      <div className="product-card__body">
        <div className="product-card__copy">
          <div className="product-card__meta-row">
            <span className="eyebrow-chip">{product.category}</span>
            <StatusBadge status={isOutOfStock ? "Sold Out" : "In Stock"} />
          </div>
          <Link to={`/products/${product.slug}`}>
            <h3>{product.name}</h3>
          </Link>
          <p>{helperCopy}</p>
        </div>

        <div className="product-card__footer">
          <div className="product-card__pricing">
            <span className="product-card__unit">{product.unit}</span>
            <span className="helper-text">{stockLabel}</span>
          </div>

          <div className="product-card__price-row">
            <div className="product-card__price">
              <strong>{formatCurrency(product.price)}</strong>
              <small>per pack</small>
            </div>
          </div>

          <div className="product-card__actions">
            <QuantityStepper value={quantity} max={product.stock} onChange={onQuantityChange} />
            <button type="button" className="button button--primary" disabled={isOutOfStock} onClick={onAdd}>
              {isOutOfStock ? "Unavailable" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
