import React, { useState, useEffect } from "react";
import PricingCard from "../components/PricingCard";
import PricelistModal from "../components/PricelistModal";
import { pricelistAPI, pricingUtils } from "../services/pricingService";

function Pricing() {
  const [pricelists, setPricelists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPricelist, setEditingPricelist] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPricelists();
  }, [currentPage]);

  const fetchPricelists = async () => {
    try {
      setLoading(true);
      const response = await pricelistAPI.getAll(currentPage, 10);
      setPricelists(response.data.pricelists);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError("Failed to fetch pricelists");
      console.error("Error fetching pricelists:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPricelist = () => {
    setEditingPricelist(null);
    setShowModal(true);
  };

  const handleEditPricing = (pricelist) => {
    setEditingPricelist(pricelist);
    setShowModal(true);
  };

  const handleDeletePricing = async (pricelistId) => {
    if (window.confirm("Are you sure you want to delete this pricelist?")) {
      try {
        await pricelistAPI.delete(pricelistId);
        fetchPricelists();
      } catch (err) {
        setError("Failed to delete pricelist");
        console.error("Error deleting pricelist:", err);
      }
    }
  };

  const handleSavePricelist = async (pricelistData) => {
    try {
      if (editingPricelist) {
        await pricelistAPI.update(editingPricelist._id, pricelistData);
      } else {
        await pricelistAPI.create(pricelistData);
      }
      setShowModal(false);
      fetchPricelists();
    } catch (err) {
      throw err;
    }
  };

  // Transform backend data to frontend format
  const transformPricelistData = (pricelist) => {
    return {
      id: pricelist._id,
      name: pricelist.name,
      description: `${pricelist.targetCustomerTypes.join(", ")} customers in ${
        pricelist.region
      }`,
      hourly: pricingUtils.formatCurrency(
        pricelist.baseRates.hourly,
        pricelist.currency
      ),
      daily: pricingUtils.formatCurrency(
        pricelist.baseRates.daily,
        pricelist.currency
      ),
      weekly: pricingUtils.formatCurrency(
        pricelist.baseRates.weekly,
        pricelist.currency
      ),
      isDefault: pricelist.pricelistId === "PL001", // Assuming PL001 is default
      discount: getDiscountInfo(pricelist),
      validFrom: pricelist.validity?.startDate
        ? new Date(pricelist.validity.startDate).toLocaleDateString()
        : null,
      validTo: pricelist.validity?.endDate
        ? new Date(pricelist.validity.endDate).toLocaleDateString()
        : null,
      originalData: pricelist, // Keep original data for editing
    };
  };

  const getDiscountInfo = (pricelist) => {
    // This could be enhanced to show actual discounts from price rules
    if (pricelist.targetCustomerTypes.includes("corporate")) {
      return "10% off for bulk orders";
    } else if (pricelist.targetCustomerTypes.includes("vip")) {
      return "Free delivery & setup";
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading pricelists...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Pricing & Pricelists</h2>
        <button onClick={handleAddPricelist} className="btn btn-primary">
          Add New Pricelist
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
          <p className="text-danger">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pricelists.map((pricelist) => {
          const transformedData = transformPricelistData(pricelist);
          return (
            <PricingCard
              key={pricelist._id}
              pricing={transformedData}
              onEdit={handleEditPricing}
              onDelete={handleDeletePricing}
            />
          );
        })}
      </div>

      {pricelists.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-ink-muted">
            No pricelists found. Create your first pricelist to get started.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
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

      {/* Pricelist Modal */}
      {showModal && (
        <PricelistModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSavePricelist}
          pricelist={editingPricelist?.originalData || null}
          isEditing={!!editingPricelist}
        />
      )}
    </div>
  );
}

export default Pricing;
