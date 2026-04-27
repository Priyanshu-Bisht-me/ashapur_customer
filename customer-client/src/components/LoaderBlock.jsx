function LoaderBlock({ label = "Loading..." }) {
  return (
    <div className="loader-block">
      <div className="loader-ring" />
      <p>{label}</p>
    </div>
  );
}

export default LoaderBlock;
