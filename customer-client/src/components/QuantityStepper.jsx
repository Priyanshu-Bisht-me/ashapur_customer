function QuantityStepper({ value, onChange, min = 1, max }) {
  function adjust(nextValue) {
    const numeric = Math.max(min, Number(nextValue || min));
    onChange(max ? Math.min(max, numeric) : numeric);
  }

  return (
    <div className="quantity-stepper">
      <button type="button" onClick={() => adjust(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        -
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => adjust(event.target.value)}
      />
      <button
        type="button"
        onClick={() => adjust(value + 1)}
        disabled={Boolean(max) && value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export default QuantityStepper;
