import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api/profileApi";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import PageHeader from "../components/PageHeader";
import SegmentTabs from "../components/SegmentTabs";
import { useSession } from "../hooks/useSession";
import { getInitials } from "../utils/formatters";
import { pushToast } from "../utils/toastBus";

const emptyAddress = {
  label: "Home",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false
};

const PROFILE_TABS = [
  { label: "Personal info", value: "personal" },
  { label: "Addresses", value: "addresses" },
  { label: "Preferences", value: "preferences" }
];

function ProfilePage() {
  const { updateUser } = useSession();
  const [activeTab, setActiveTab] = useState("personal");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferences: {
      deliveryNotes: "",
      newsletter: false
    },
    addresses: []
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const payload = await getProfile();
      setForm({
        name: payload.profile.name || "",
        email: payload.profile.email || "",
        phone: payload.profile.phone || "",
        preferences: payload.profile.preferences || {
          deliveryNotes: "",
          newsletter: false
        },
        addresses: payload.profile.addresses.length ? payload.profile.addresses : [{ ...emptyAddress }]
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function updateAddress(index, field, value) {
    setForm((current) => ({
      ...current,
      addresses: current.addresses.map((address, addressIndex) =>
        addressIndex === index ? { ...address, [field]: value } : address
      )
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const payload = await updateProfile({
        name: form.name,
        phone: form.phone,
        preferences: form.preferences,
        addresses: form.addresses
      });
      updateUser(payload.profile);
      pushToast({ type: "success", message: "Profile updated." });
      await loadProfile();
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <LoaderBlock label="Loading profile..." />;
  }

  if (error && !form.name) {
    return (
      <EmptyState
        title="Unable to load profile"
        description={error}
        action={
          <button type="button" className="button button--primary" onClick={loadProfile}>
            Retry
          </button>
        }
      />
    );
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Account settings"
        title="Profile"
        description="Details, addresses, and preferences."
      />

      <div className="profile-panel">
        <div className="profile-summary">
          <div className="mobile-stack">
            <span className="avatar">{getInitials(form.name)}</span>
            <div>
              <strong>{form.name || "Customer"}</strong>
              <p className="helper-text">{form.email}</p>
            </div>
          </div>
          <SegmentTabs tabs={PROFILE_TABS} value={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      <form className="profile-layout" onSubmit={handleSubmit}>
        {activeTab === "personal" ? (
          <div className="profile-panel tab-panel">
            <div className="card-header">
              <div>
                <h2>Personal info</h2>
                <p>Basic account details</p>
              </div>
            </div>
            <div className="two-col-form">
              <label>
                Name
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label>
                Email
                <input type="email" value={form.email} disabled />
              </label>
              <label>
                Phone
                <input
                  type="text"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </label>
            </div>
          </div>
        ) : null}

        {activeTab === "addresses" ? (
          <div className="profile-panel tab-panel">
            <div className="card-header">
              <div>
                <h2>Addresses</h2>
                <p>Saved delivery addresses.</p>
              </div>
              <button
                type="button"
                className="button button--ghost"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    addresses: [...current.addresses, { ...emptyAddress }]
                  }))
                }
              >
                Add address
              </button>
            </div>

            <div className="list-stack">
              {form.addresses.map((address, index) => (
                <article key={`${address._id || "new"}-${index}`} className="address-card">
                  <div className="address-head">
                    <div>
                      <strong>{address.label || `Address ${index + 1}`}</strong>
                      {address.isDefault ? <p className="helper-text">Default address</p> : null}
                    </div>
                    <button
                      type="button"
                      className="button button--link"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          addresses: current.addresses.filter((_, addressIndex) => addressIndex !== index)
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className="address-form-grid">
                    <label>
                      Label
                      <input
                        type="text"
                        value={address.label || ""}
                        onChange={(event) => updateAddress(index, "label", event.target.value)}
                      />
                    </label>
                    <label>
                      Recipient
                      <input
                        type="text"
                        value={address.recipientName || ""}
                        onChange={(event) => updateAddress(index, "recipientName", event.target.value)}
                      />
                    </label>
                    <label>
                      Phone
                      <input
                        type="text"
                        value={address.phone || ""}
                        onChange={(event) => updateAddress(index, "phone", event.target.value)}
                      />
                    </label>
                    <label className="form-grid__full">
                      Line 1
                      <input
                        type="text"
                        value={address.line1 || ""}
                        onChange={(event) => updateAddress(index, "line1", event.target.value)}
                      />
                    </label>
                    <label>
                      Line 2
                      <input
                        type="text"
                        value={address.line2 || ""}
                        onChange={(event) => updateAddress(index, "line2", event.target.value)}
                      />
                    </label>
                    <label>
                      City
                      <input
                        type="text"
                        value={address.city || ""}
                        onChange={(event) => updateAddress(index, "city", event.target.value)}
                      />
                    </label>
                    <label>
                      State
                      <input
                        type="text"
                        value={address.state || ""}
                        onChange={(event) => updateAddress(index, "state", event.target.value)}
                      />
                    </label>
                    <label>
                      Pincode
                      <input
                        type="text"
                        value={address.pincode || ""}
                        onChange={(event) => updateAddress(index, "pincode", event.target.value)}
                      />
                    </label>
                    <label className="checkbox-row">
                      <input
                        type="radio"
                        name="default-address"
                        checked={Boolean(address.isDefault)}
                        onChange={() =>
                          setForm((current) => ({
                            ...current,
                            addresses: current.addresses.map((item, itemIndex) => ({
                              ...item,
                              isDefault: itemIndex === index
                            }))
                          }))
                        }
                      />
                      Set as default
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "preferences" ? (
          <div className="profile-panel tab-panel">
            <div className="card-header">
              <div>
                <h2>Preferences</h2>
                <p>Delivery notes and newsletter settings</p>
              </div>
            </div>

            <label>
              Delivery notes
              <textarea
                rows="4"
                value={form.preferences.deliveryNotes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    preferences: {
                      ...current.preferences,
                      deliveryNotes: event.target.value
                    }
                  }))
                }
              />
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.preferences.newsletter}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    preferences: {
                      ...current.preferences,
                      newsletter: event.target.checked
                    }
                  }))
                }
              />
              Receive updates and offers
            </label>
          </div>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}

        <div className="summary-card">
          <div className="summary-card__actions">
            <button type="submit" className="button button--primary" disabled={busy}>
              {busy ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default ProfilePage;
