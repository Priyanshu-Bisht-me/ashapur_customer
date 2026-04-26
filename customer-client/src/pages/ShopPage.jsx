import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomerProducts } from "../api/customerApi";
import { addToCart, getCartCount, getCartTotal } from "../cart/cartStorage";

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartSnapshot, setCartSnapshot] = useState({ count: 0, total: 0 });

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await getCustomerProducts();
        setProducts(response);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    function refreshCartSnapshot() {
      setCartSnapshot({
        count: getCartCount(),
        total: getCartTotal()
      });
    }

    refreshCartSnapshot();
    window.addEventListener("storage", refreshCartSnapshot);

    return () => {
      window.removeEventListener("storage", refreshCartSnapshot);
    };
  }, []);

  const productQuantities = useMemo(
    () => Object.fromEntries(products.map((product) => [product._id, 1])),
    [products]
  );
  const [quantityByProduct, setQuantityByProduct] = useState({});

  useEffect(() => {
    setQuantityByProduct(productQuantities);
  }, [productQuantities]);

  function handleQuantityChange(productId, value) {
    const qty = Math.max(1, Number(value) || 1);
    setQuantityByProduct((current) => ({
      ...current,
      [productId]: qty
    }));
  }

  function handleAdd(product) {
    const quantity = quantityByProduct[product._id] || 1;
    const cart = addToCart(
      {
        productId: product._id,
        productName: product.name,
        price: product.price,
        unit: product.unit
      },
      quantity
    );

    setCartSnapshot({
      count: getCartCount(cart),
      total: getCartTotal(cart)
    });
  }

  if (isLoading) {
    return <div className="dashboard-state">Loading products...</div>;
  }

  if (error) {
    return <div className="dashboard-state dashboard-state--error">{error}</div>;
  }

  return (
    <section className="shop-page">
      <div className="page-intro">
        <h1>Shop daily essentials</h1>
        <p>Milk, curd, paneer and more are ready to add into your cart.</p>
      </div>

      <div className="shop-toolbar">
        <span>{products.length} product(s) available</span>
        <Link to="/customer/cart" className="inline-pill-link">
          Cart: {cartSnapshot.count} item(s) | Rs. {cartSnapshot.total}
        </Link>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <article key={product._id} className="product-card">
            <div>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
            </div>

            <div className="product-card__meta">
              <strong>Rs. {product.price}</strong>
              <span>{product.unit}</span>
            </div>

            <div className="product-card__controls">
              <label>
                Qty
                <input
                  type="number"
                  min="1"
                  value={quantityByProduct[product._id] || 1}
                  onChange={(event) => handleQuantityChange(product._id, event.target.value)}
                />
              </label>

              <button type="button" onClick={() => handleAdd(product)}>
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ShopPage;
