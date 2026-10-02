import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../store/authSlice";
import api from "../services/api";

const emptyAddress = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  isDefault: false,
};

const addressFields = [
  ["fullName", "Full name", true],
  ["email", "Email", false],
  ["phone", "Phone", false],
  ["line1", "Address line 1", true],
  ["line2", "Address line 2", false],
  ["city", "City", true],
  ["state", "State / region", true],
  ["postalCode", "Postal code", true],
  ["country", "Country", true],
];

export default function AccountPage() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [addressDraft, setAddressDraft] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const [profileResponse, addressResponse] = await Promise.all([
          api.get("/auth/me"),
          api.get("/addresses"),
        ]);
        const currentUser = profileResponse.data?.data?.user;
        const addressList = addressResponse.data?.data?.addresses || [];

        if (currentUser) {
          setProfile({
            firstName: currentUser.firstName || "",
            lastName: currentUser.lastName || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
          });
          dispatch(setCredentials({ token, user: currentUser }));
        }
        setAddresses(addressList);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load your account.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadAccount();
    }
  }, [dispatch, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.patch("/auth/me", profile);
      const updatedUser = response.data?.data?.user;
      setProfile({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone || "",
      });
      dispatch(setCredentials({ token, user: updatedUser }));
      setMessage("Profile updated.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const refreshAddresses = async () => {
    const response = await api.get("/addresses");
    setAddresses(response.data?.data?.addresses || []);
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      ...addressDraft,
      email: addressDraft.email || null,
      phone: addressDraft.phone || null,
      line2: addressDraft.line2 || null,
    };

    try {
      if (editingAddressId) {
        await api.patch(`/addresses/${editingAddressId}`, payload);
      } else {
        await api.post("/addresses", payload);
      }
      await refreshAddresses();
      setAddressDraft(emptyAddress);
      setEditingAddressId(null);
      setMessage(editingAddressId ? "Address updated." : "Address saved.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to save this address.",
      );
    } finally {
      setSaving(false);
    }
  };

  const editAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressDraft({
      ...emptyAddress,
      ...address,
      email: address.email || "",
      phone: address.phone || "",
      line2: address.line2 || "",
    });
  };

  const setDefaultAddress = async (addressId) => {
    setError("");
    setMessage("");

    try {
      await api.patch(`/addresses/${addressId}`, { isDefault: true });
      await refreshAddresses();
      setMessage("Default address updated.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update default address.",
      );
    }
  };

  const removeAddress = async (addressId) => {
    setError("");
    setMessage("");

    try {
      await api.delete(`/addresses/${addressId}`);
      await refreshAddresses();
      if (editingAddressId === addressId) {
        setAddressDraft(emptyAddress);
        setEditingAddressId(null);
      }
      setMessage("Address removed.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to remove this address.",
      );
    }
  };

  if (loading) {
    return (
      <p className="py-12 text-center text-slate-500">Loading account...</p>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-orange-700">
          Your account
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">
          Profile & addresses
        </h1>
      </header>

      {(message || error) && (
        <p
          role={error ? "alert" : "status"}
          className={`rounded-md border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          {error || message}
        </p>
      )}

      <section className="border-b border-slate-200 pb-8">
        <h2 className="text-xl font-bold text-slate-900">Personal details</h2>
        <form onSubmit={handleProfileSubmit} className="mt-5 max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["firstName", "First name"],
              ["lastName", "Last name"],
              ["email", "Email"],
              ["phone", "Phone"],
            ].map(([name, label]) => (
              <label
                key={name}
                className="grid gap-1.5 text-sm font-medium text-slate-700"
              >
                {label}
                <input
                  type={name === "email" ? "email" : "text"}
                  required={name !== "phone"}
                  value={profile[name]}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      [name]: event.target.value,
                    }))
                  }
                  className="rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {editingAddressId ? "Edit address" : "Add an address"}
          </h2>
          <form onSubmit={handleAddressSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {addressFields.map(([name, label, required]) => (
                <label
                  key={name}
                  className={`grid gap-1.5 text-sm font-medium text-slate-700 ${
                    ["fullName", "line1", "line2"].includes(name)
                      ? "sm:col-span-2"
                      : ""
                  }`}
                >
                  {label}
                  <input
                    type={name === "email" ? "email" : "text"}
                    required={required}
                    value={addressDraft[name] || ""}
                    onChange={(event) =>
                      setAddressDraft((current) => ({
                        ...current,
                        [name]: event.target.value,
                      }))
                    }
                    className="rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-orange-500"
                  />
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={addressDraft.isDefault}
                onChange={(event) =>
                  setAddressDraft((current) => ({
                    ...current,
                    isDefault: event.target.checked,
                  }))
                }
              />
              Make this my default address
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingAddressId
                    ? "Update address"
                    : "Save address"}
              </button>
              {editingAddressId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressDraft(emptyAddress);
                  }}
                  className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Saved addresses</h2>
          {addresses.length === 0 ? (
            <p className="mt-5 border-t border-slate-200 py-5 text-sm text-slate-500">
              No saved addresses yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
              {addresses.map((address) => (
                <li key={address.id} className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="text-sm leading-6 text-slate-700">
                      <p className="font-semibold text-slate-900">
                        {address.fullName}
                        {address.isDefault && (
                          <span className="ml-2 text-xs font-medium text-emerald-700">
                            Default
                          </span>
                        )}
                      </p>
                      <p>
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}
                      </p>
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                      {address.phone && <p>{address.phone}</p>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(address.id)}
                          className="text-orange-700 hover:text-orange-900"
                        >
                          Make default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => editAddress(address)}
                        className="text-slate-700 hover:text-slate-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAddress(address.id)}
                        className="text-red-700 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
