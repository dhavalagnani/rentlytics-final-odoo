import React, { useState, useEffect } from "react";
import { pricingUtils } from "../services/pricingService";

export default function PricelistModal({
  isOpen,
  onClose,
  onSave,
  pricelist = null,
  isEditing = false,
}) {
  const [formData, setFormData] = useState({
    pricelistId: "",
    name: "",
    targetCustomerTypes: [],
    region: "",
    baseRates: {
      hourly: 0,
      daily: 0,
      weekly: 0,
    },
    currency: "INR",
    validity: {
      startDate: "",
      endDate: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerTypes = [
    { value: "regular", label: "Regular" },
    { value: "vip", label: "VIP" },
    { value: "corporate", label: "Corporate" },
    { value: "partner", label: "Partner" },
  ];

  const regions = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Surat",
  ];

  useEffect(() => {
    if (isOpen) {
      if (pricelist && isEditing) {
        setFormData({
          pricelistId: pricelist.pricelistId || "",
          name: pricelist.name || "",
          targetCustomerTypes: pricelist.targetCustomerTypes || [],
          region: pricelist.region || "",
          baseRates: {
            hourly: pricelist.baseRates?.hourly || 0,
            daily: pricelist.baseRates?.daily || 0,
            weekly: pricelist.baseRates?.weekly || 0,
          },
          currency: pricelist.currency || "INR",
          validity: {
            startDate: pricelist.validity?.startDate
              ? new Date(pricelist.validity.startDate)
                  .toISOString()
                  .split("T")[0]
              : "",
            endDate: pricelist.validity?.endDate
              ? new Date(pricelist.validity.endDate).toISOString().split("T")[0]
              : "",
          },
        });
      } else {
        // Reset form for new pricelist
        setFormData({
          pricelistId: "",
          name: "",
          targetCustomerTypes: [],
          region: "",
          baseRates: {
            hourly: 0,
            daily: 0,
            weekly: 0,
          },
          currency: "INR",
          validity: {
            startDate: "",
            endDate: "",
          },
        });
      }
      setErrors({});
    }
  }, [isOpen, pricelist, isEditing]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleCustomerTypeChange = (customerType) => {
    setFormData((prev) => ({
      ...prev,
      targetCustomerTypes: prev.targetCustomerTypes.includes(customerType)
        ? prev.targetCustomerTypes.filter((type) => type !== customerType)
        : [...prev.targetCustomerTypes, customerType],
    }));
  };

  const validateForm = () => {
    const validation = pricingUtils.validatePricingData(formData);
    if (!validation.isValid) {
      const errorObj = {};
      validation.errors.forEach((error) => {
        if (error.includes("Name")) errorObj.name = error;
        if (error.includes("Base rates")) errorObj.baseRates = error;
        if (error.includes("Validity")) errorObj.validity = error;
        if (error.includes("Hourly")) errorObj.hourly = error;
        if (error.includes("Daily")) errorObj.daily = error;
        if (error.includes("Weekly")) errorObj.weekly = error;
        if (error.includes("End date")) errorObj.endDate = error;
      });
      setErrors(errorObj);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving pricelist:", error);
      setErrors({ submit: error.message || "Failed to save pricelist" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? "Edit Pricelist" : "Add New Pricelist"}
          </h2>
          <button onClick={onClose} className="text-ink-muted hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Pricelist ID *
              </label>
              <input
                type="text"
                value={formData.pricelistId}
                onChange={(e) =>
                  handleInputChange("pricelistId", e.target.value)
                }
                className="input w-full"
                placeholder="e.g., PL001"
                disabled={isEditing}
              />
              {errors.pricelistId && (
                <p className="text-danger text-sm mt-1">{errors.pricelistId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="input w-full"
                placeholder="e.g., Standard Pricing"
              />
              {errors.name && (
                <p className="text-danger text-sm mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Customer Types */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Target Customer Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {customerTypes.map((type) => (
                <label key={type.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.targetCustomerTypes.includes(type.value)}
                    onChange={() => handleCustomerTypeChange(type.value)}
                    className="checkbox"
                  />
                  <span className="text-sm text-white">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Region and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Region *
              </label>
              <select
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                className="select w-full"
              >
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              {errors.region && (
                <p className="text-danger text-sm mt-1">{errors.region}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                className="select w-full"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          {/* Base Rates */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Base Rates *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-ink-muted mb-1">
                  Hourly Rate
                </label>
                <input
                  type="number"
                  value={formData.baseRates.hourly}
                  onChange={(e) =>
                    handleInputChange(
                      "baseRates.hourly",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="input w-full"
                  min="0"
                  step="0.01"
                />
                {errors.hourly && (
                  <p className="text-danger text-sm mt-1">{errors.hourly}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1">
                  Daily Rate
                </label>
                <input
                  type="number"
                  value={formData.baseRates.daily}
                  onChange={(e) =>
                    handleInputChange(
                      "baseRates.daily",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="input w-full"
                  min="0"
                  step="0.01"
                />
                {errors.daily && (
                  <p className="text-danger text-sm mt-1">{errors.daily}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1">
                  Weekly Rate
                </label>
                <input
                  type="number"
                  value={formData.baseRates.weekly}
                  onChange={(e) =>
                    handleInputChange(
                      "baseRates.weekly",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="input w-full"
                  min="0"
                  step="0.01"
                />
                {errors.weekly && (
                  <p className="text-danger text-sm mt-1">{errors.weekly}</p>
                )}
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Validity Period *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-ink-muted mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.validity.startDate}
                  onChange={(e) =>
                    handleInputChange("validity.startDate", e.target.value)
                  }
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.validity.endDate}
                  onChange={(e) =>
                    handleInputChange("validity.endDate", e.target.value)
                  }
                  className="input w-full"
                />
                {errors.endDate && (
                  <p className="text-danger text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
              <p className="text-danger text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
