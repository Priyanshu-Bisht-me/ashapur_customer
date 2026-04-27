function SegmentTabs({ tabs, value, onChange }) {
  return (
    <div className="segment-tabs" role="tablist" aria-label="Page tabs">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={`segment-tabs__item ${value === tab.value ? "segment-tabs__item--active" : ""}`}
          onClick={() => onChange(tab.value)}
          role="tab"
          aria-selected={value === tab.value}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default SegmentTabs;
