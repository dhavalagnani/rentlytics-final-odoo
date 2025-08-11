import React, { useState, useEffect } from "react";
import { priceRuleAPI } from "../services/pricingService";

export default function PriceRules() {
  const [priceRules, setPriceRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPriceRules();
  }, [currentPage]);

  const fetchPriceRules = async () => {
    try {
      setLoading(true);
      const response = await priceRuleAPI.getAll(currentPage, 10);
      setPriceRules(response.data.priceRules);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError("Failed to fetch price rules");
      console.error("Error fetching price rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setShowModal(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setShowModal(true);
  };

  const handleDeleteRule = async (ruleId) => {
    if (window.confirm("Are you sure you want to delete this price rule?")) {
      try {
        await priceRuleAPI.delete(ruleId);
        fetchPriceRules();
      } catch (err) {
        setError("Failed to delete price rule");
        console.error("Error deleting price rule:", err);
      }
    }
  };

  const handleToggleRule = async (ruleId) => {
    try {
      await priceRuleAPI.toggle(ruleId);
      fetchPriceRules();
    } catch (err) {
      setError("Failed to toggle price rule");
      console.error("Error toggling price rule:", err);
    }
  };

  const handleSaveRule = async (ruleData) => {
    try {
      if (editingRule) {
        await priceRuleAPI.update(editingRule._id, ruleData);
      } else {
        await priceRuleAPI.create(ruleData);
      }
      setShowModal(false);
      fetchPriceRules();
    } catch (err) {
      throw err;
    }
  };

  const getEffectDescription = (effect) => {
    switch (effect.type) {
      case "percentDiscount":
        return `${effect.value}% discount`;
      case "flatDiscount":
        return `₹${effect.value} flat discount`;
      case "setPrice":
        return `Set price to ₹${effect.value}`;
      case "tieredPrice":
        return `Tiered pricing: ${JSON.stringify(effect.value)}`;
      case "surcharge":
        return `₹${effect.value} surcharge`;
      default:
        return "Custom effect";
    }
  };

  const getConditionDescription = (conditions) => {
    return conditions
      .map(
        (condition) =>
          `${condition.field} ${condition.operator} ${condition.value}`
      )
      .join(", ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading price rules...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Price Rules</h2>
        <button onClick={handleCreateRule} className="btn btn-primary">
          Add New Rule
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
          <p className="text-danger">{error}</p>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left text-white">Rule ID</th>
                <th className="text-left text-white">Name</th>
                <th className="text-left text-white">Priority</th>
                <th className="text-left text-white">Conditions</th>
                <th className="text-left text-white">Effect</th>
                <th className="text-left text-white">Status</th>
                <th className="text-left text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {priceRules.map((rule) => (
                <tr key={rule._id} className="border-t border-white/10">
                  <td className="text-white">{rule.ruleId}</td>
                  <td className="text-white">{rule.name}</td>
                  <td className="text-white">{rule.priority}</td>
                  <td className="text-white text-sm">
                    {getConditionDescription(rule.conditions)}
                  </td>
                  <td className="text-white text-sm">
                    {getEffectDescription(rule.effect)}
                  </td>
                  <td>
                    <span
                      className={`chip text-xs ${
                        rule.enabled
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {rule.enabled ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleRule(rule._id)}
                        className={`btn btn-xs ${
                          rule.enabled ? "btn-outline" : "btn-primary"
                        }`}
                      >
                        {rule.enabled ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="btn btn-xs btn-outline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule._id)}
                        className="btn btn-xs btn-ghost text-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {priceRules.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-ink-muted">No price rules found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn btn-outline btn-sm"
          >
            Previous
          </button>
          <span className="text-white flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="btn btn-outline btn-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Price Rule Modal would go here */}
      {showModal && (
        <PriceRuleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveRule}
          rule={editingRule}
          isEditing={!!editingRule}
        />
      )}
    </div>
  );
}

// Price Rule Modal Component
function PriceRuleModal({
  isOpen,
  onClose,
  onSave,
  rule = null,
  isEditing = false,
}) {
  const [formData, setFormData] = useState({
    ruleId: "",
    name: "",
    priority: 1,
    conditions: [],
    effect: {
      type: "percentDiscount",
      value: 0,
      applyTo: "total",
    },
    validity: {
      startDate: "",
      endDate: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectTypes = [
    { value: "percentDiscount", label: "Percentage Discount" },
    { value: "flatDiscount", label: "Flat Discount" },
    { value: "setPrice", label: "Set Price" },
    { value: "tieredPrice", label: "Tiered Price" },
    { value: "surcharge", label: "Surcharge" },
  ];

  const operators = [
    { value: "eq", label: "Equals" },
    { value: "gt", label: "Greater Than" },
    { value: "lt", label: "Less Than" },
    { value: "gte", label: "Greater Than or Equal" },
    { value: "lte", label: "Less Than or Equal" },
    { value: "in", label: "In" },
    { value: "not_in", label: "Not In" },
  ];

  useEffect(() => {
    if (isOpen) {
      if (rule && isEditing) {
        setFormData({
          ruleId: rule.ruleId || "",
          name: rule.name || "",
          priority: rule.priority || 1,
          conditions: rule.conditions || [],
          effect: rule.effect || {
            type: "percentDiscount",
            value: 0,
            applyTo: "total",
          },
          validity: {
            startDate: rule.validity?.startDate
              ? new Date(rule.validity.startDate).toISOString().split("T")[0]
              : "",
            endDate: rule.validity?.endDate
              ? new Date(rule.validity.endDate).toISOString().split("T")[0]
              : "",
          },
        });
      } else {
        setFormData({
          ruleId: "",
          name: "",
          priority: 1,
          conditions: [],
          effect: {
            type: "percentDiscount",
            value: 0,
            applyTo: "total",
          },
          validity: {
            startDate: "",
            endDate: "",
          },
        });
      }
      setErrors({});
    }
  }, [isOpen, rule, isEditing]);

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
  };

  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { field: "", operator: "eq", value: "" },
      ],
    }));
  };

  const removeCondition = (index) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const updateCondition = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || "Failed to save price rule" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? "Edit Price Rule" : "Add New Price Rule"}
          </h2>
          <button onClick={onClose} className="text-ink-muted hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Rule ID *
              </label>
              <input
                type="text"
                value={formData.ruleId}
                onChange={(e) => handleInputChange("ruleId", e.target.value)}
                className="input w-full"
                placeholder="e.g., RULE001"
                disabled={isEditing}
              />
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
                placeholder="e.g., Bulk Order Discount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Priority *
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  handleInputChange("priority", parseInt(e.target.value))
                }
                className="input w-full"
                min="1"
              />
            </div>
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-white">
                Conditions
              </label>
              <button
                type="button"
                onClick={addCondition}
                className="btn btn-outline btn-sm"
              >
                Add Condition
              </button>
            </div>
            <div className="space-y-3">
              {formData.conditions.map((condition, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-2 items-center"
                >
                  <input
                    type="text"
                    value={condition.field}
                    onChange={(e) =>
                      updateCondition(index, "field", e.target.value)
                    }
                    className="input"
                    placeholder="Field name"
                  />
                  <select
                    value={condition.operator}
                    onChange={(e) =>
                      updateCondition(index, "operator", e.target.value)
                    }
                    className="select"
                  >
                    {operators.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) =>
                      updateCondition(index, "value", e.target.value)
                    }
                    className="input"
                    placeholder="Value"
                  />
                  <button
                    type="button"
                    onClick={() => removeCondition(index)}
                    className="btn btn-ghost btn-sm text-danger"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Effect */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Effect Type
              </label>
              <select
                value={formData.effect.type}
                onChange={(e) =>
                  handleInputChange("effect.type", e.target.value)
                }
                className="select w-full"
              >
                {effectTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Value
              </label>
              <input
                type="number"
                value={formData.effect.value}
                onChange={(e) =>
                  handleInputChange(
                    "effect.value",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="input w-full"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Apply To
              </label>
              <select
                value={formData.effect.applyTo}
                onChange={(e) =>
                  handleInputChange("effect.applyTo", e.target.value)
                }
                className="select w-full"
              >
                <option value="unit">Per Unit</option>
                <option value="total">Total</option>
              </select>
            </div>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
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
              <label className="block text-sm font-medium text-white mb-2">
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
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
              <p className="text-danger text-sm">{errors.submit}</p>
            </div>
          )}

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
