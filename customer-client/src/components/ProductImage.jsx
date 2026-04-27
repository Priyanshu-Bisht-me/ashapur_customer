import { useEffect, useMemo, useState } from "react";

const DEFAULT_FALLBACK = "/fallback-product.svg";

function resolveAspectRatio(value) {
  if (!value) {
    return undefined;
  }

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return String(value);
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return undefined;
}

function ProductImage({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  fallbackSrc = DEFAULT_FALLBACK,
  fallbackLabel,
  fallbackTone = "soft",
  tone,
  aspectRatio,
  loading = "lazy",
  sizes,
  fetchPriority
}) {
  const effectiveTone = tone || fallbackTone;
  const ratio = useMemo(() => resolveAspectRatio(aspectRatio), [aspectRatio]);

  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const label = alt || fallbackLabel || "Product image";

  return (
    <div
      className={`media-frame media-frame--${effectiveTone} ${className}`.trim()}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <img
        src={currentSrc}
        alt={label}
        className={`media-frame__image ${imgClassName}`.trim()}
        loading={loading}
        decoding="async"
        sizes={sizes}
        fetchpriority={fetchPriority}
        onError={() => {
          if (hasError) {
            return;
          }

          setHasError(true);
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
          }
        }}
      />
    </div>
  );
}

export default ProductImage;
