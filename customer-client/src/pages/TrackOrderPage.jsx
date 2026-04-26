import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderTracking } from "../api/customerApi";

function TrackOrderPage() {
  const { orderId } = useParams();
  const [tracking, setTracking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTracking() {
      try {
        const response = await getOrderTracking(orderId);
        setTracking(response);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadTracking();
  }, [orderId]);

  if (isLoading) {
    return <div className="dashboard-state">Loading tracking status...</div>;
  }

  if (error) {
    return <div className="dashboard-state dashboard-state--error">{error}</div>;
  }

  return (
    <section className="tracking-page">
      <div className="page-intro">
        <h1>Track order</h1>
        <p>
          {tracking.orderNumber} | Current status: <strong>{tracking.status}</strong>
        </p>
      </div>

      <ol className="tracking-timeline">
        {tracking.trackingSteps.map((step) => (
          <li
            key={step.status}
            className={`tracking-step ${step.isCompleted ? "tracking-step--completed" : ""} ${
              step.isCurrent ? "tracking-step--current" : ""
            }`}
          >
            <span>{step.status}</span>
            <small>{step.isCurrent ? "Current stage" : step.isCompleted ? "Completed" : "Pending"}</small>
          </li>
        ))}
      </ol>

      <div className="tracking-footer">
        <span>Expected delivery: {tracking.deliveryDateLabel}</span>
        <Link to="/customer/orders" className="inline-pill-link">
          Back to orders
        </Link>
      </div>
    </section>
  );
}

export default TrackOrderPage;
