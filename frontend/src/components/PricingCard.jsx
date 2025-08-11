import React from "react";

export default function PricingCard({
  pricing,
  onEdit,
  onDelete,
  isActive = false,
}) {
  const handleEdit = () => {
    onEdit(pricing);
  };

  const handleDelete = () => {
    onDelete(pricing.id);
  };

  return (
    <div
      className={`card p-5 transition-all hover:shadow-lg ${
        isActive ? "ring-2 ring-primary/50" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg">{pricing.name}</h3>
          <p className="text-sm text-ink-muted">{pricing.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {pricing.isDefault && (
            <span className="chip bg-primary/20 text-primary text-xs">
              Default
            </span>
          )}
          <button
            onClick={handleEdit}
            className="btn btn-outline text-xs px-2 py-1"
          >
            Edit
          </button>
          {!pricing.isDefault && (
            <button
              onClick={handleDelete}
              className="btn btn-ghost text-xs px-2 py-1 text-danger hover:text-danger/80"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 rounded-lg bg-white/5">
            <div className="text-white font-medium">Hourly</div>
            <div className="text-primary">{pricing.hourly}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <div className="text-white font-medium">Daily</div>
            <div className="text-primary">{pricing.daily}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <div className="text-white font-medium">Weekly</div>
            <div className="text-primary">{pricing.weekly}</div>
          </div>
        </div>

        {pricing.discount && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-sm text-green-300 font-medium">
              Discount Applied
            </div>
            <div className="text-xs text-green-300/80">{pricing.discount}</div>
          </div>
        )}

        {pricing.validFrom && pricing.validTo && (
          <div className="text-xs text-ink-muted">
            Valid: {pricing.validFrom} - {pricing.validTo}
          </div>
        )}
      </div>
    </div>
  );
}
