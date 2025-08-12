import { v4 as uuidv4 } from "uuid";

class DocumentService {
  /**
   * Generate pickup document
   * @param {Object} booking - Booking object
   * @param {Object} pickupAddress - Pickup address details
   * @returns {Object} Generated pickup document
   */
  static generatePickupDocument(booking, pickupAddress) {
    try {
      const documentId = `PICKUP-${uuidv4().substring(0, 8).toUpperCase()}`;
      const generatedAt = new Date();

      const documentContent = {
        documentId,
        documentType: "PICKUP_DOCUMENT",
        generatedAt,
        bookingDetails: {
          bookingId: booking.bookingId,
          customerName:
            booking.userId?.firstName + " " + booking.userId?.lastName,
          customerEmail: booking.userId?.email,
          customerPhone: booking.userId?.phone,
          productName: booking.productId?.name,
          productDescription: booking.productId?.description,
          unitCount: booking.unitCount,
          startDate: booking.startDate,
          endDate: booking.endDate,
          durationDays: booking.durationDays,
          totalAmount: booking.pricingSnapshot?.totalPrice,
          deposit: booking.pricingSnapshot?.deposit,
        },
        pickupDetails: {
          pickupAddress,
          pickupDate: booking.startDate,
          pickupTime: "As scheduled",
          specialInstructions:
            booking.pickupDetails?.notes || "Standard pickup process",
        },
        terms: [
          "Customer must present valid ID for pickup",
          "Items must be inspected before pickup",
          "Deposit will be held until return",
          "Late returns may incur additional charges",
          "Damaged items will result in penalty charges",
        ],
        status: "GENERATED",
      };

      return {
        documentId,
        generatedAt,
        documentUrl: `/documents/pickup/${documentId}.pdf`, // Mock URL
        documentContent,
      };
    } catch (error) {
      console.error("Error generating pickup document:", error);
      throw new Error("Failed to generate pickup document");
    }
  }

  /**
   * Generate return document
   * @param {Object} booking - Booking object
   * @param {Object} dropAddress - Drop-off address details
   * @param {Object} returnDetails - Return details
   * @returns {Object} Generated return document
   */
  static generateReturnDocument(booking, dropAddress, returnDetails) {
    try {
      const documentId = `RETURN-${uuidv4().substring(0, 8).toUpperCase()}`;
      const generatedAt = new Date();

      const documentContent = {
        documentId,
        documentType: "RETURN_DOCUMENT",
        generatedAt,
        bookingDetails: {
          bookingId: booking.bookingId,
          customerName:
            booking.userId?.firstName + " " + booking.userId?.lastName,
          customerEmail: booking.userId?.email,
          customerPhone: booking.userId?.phone,
          productName: booking.productId?.name,
          productDescription: booking.productId?.description,
          unitCount: booking.unitCount,
          startDate: booking.startDate,
          endDate: booking.endDate,
          actualReturnDate: returnDetails.returnedAt,
          durationDays: booking.durationDays,
          totalAmount: booking.pricingSnapshot?.totalPrice,
          deposit: booking.pricingSnapshot?.deposit,
        },
        returnDetails: {
          dropAddress,
          returnedAt: returnDetails.returnedAt,
          returnedBy: returnDetails.returnedBy,
          condition: returnDetails.condition,
          notes: returnDetails.notes,
        },
        penalties: {
          damagePenalty: booking.penalties?.damagePenalty || {
            amount: 0,
            reason: "None",
          },
          latePenalty: booking.penalties?.latePenalty || {
            amount: 0,
            reason: "None",
          },
          totalPenalty: booking.penalties?.totalPenalty || 0,
        },
        finalSettlement: {
          originalDeposit: booking.pricingSnapshot?.deposit,
          penaltiesDeducted: booking.penalties?.totalPenalty || 0,
          refundAmount:
            (booking.pricingSnapshot?.deposit || 0) -
            (booking.penalties?.totalPenalty || 0),
          status:
            booking.penalties?.totalPenalty > 0
              ? "PENALTY_APPLIED"
              : "FULL_REFUND",
        },
        terms: [
          "Items have been inspected upon return",
          "Penalties have been calculated and applied",
          "Refund will be processed within 3-5 business days",
          "Any disputes must be reported within 24 hours",
          "Thank you for choosing our service",
        ],
        status: "GENERATED",
      };

      return {
        documentId,
        generatedAt,
        documentUrl: `/documents/return/${documentId}.pdf`, // Mock URL
        documentContent,
      };
    } catch (error) {
      console.error("Error generating return document:", error);
      throw new Error("Failed to generate return document");
    }
  }

  /**
   * Generate invoice document
   * @param {Object} booking - Booking object
   * @param {Object} penalties - Penalty details
   * @returns {Object} Generated invoice document
   */
  static generateInvoiceDocument(booking, penalties = {}) {
    try {
      const documentId = `INVOICE-${uuidv4().substring(0, 8).toUpperCase()}`;
      const generatedAt = new Date();

      const documentContent = {
        documentId,
        documentType: "INVOICE",
        generatedAt,
        customerDetails: {
          name: booking.userId?.firstName + " " + booking.userId?.lastName,
          email: booking.userId?.email,
          phone: booking.userId?.phone,
        },
        bookingDetails: {
          bookingId: booking.bookingId,
          startDate: booking.startDate,
          endDate: booking.endDate,
          durationDays: booking.durationDays,
        },
        items: [
          {
            description: booking.productId?.name,
            quantity: booking.unitCount,
            unitPrice: booking.pricingSnapshot?.baseRates?.daily,
            total: booking.pricingSnapshot?.totalPrice,
          },
        ],
        pricing: {
          subtotal: booking.pricingSnapshot?.totalPrice,
          discount: booking.pricingSnapshot?.discountAmount || 0,
          deposit: booking.pricingSnapshot?.deposit,
          totalAmount: booking.pricingSnapshot?.totalPrice,
        },
        penalties: {
          damagePenalty: penalties.damagePenalty || {
            amount: 0,
            reason: "None",
          },
          latePenalty: penalties.latePenalty || { amount: 0, reason: "None" },
          totalPenalties: penalties.totalPenalty || 0,
        },
        finalAmount: {
          originalAmount: booking.pricingSnapshot?.totalPrice,
          penalties: penalties.totalPenalty || 0,
          finalTotal:
            (booking.pricingSnapshot?.totalPrice || 0) +
            (penalties.totalPenalty || 0),
        },
        paymentStatus: booking.paymentStatus,
        status: "GENERATED",
      };

      return {
        documentId,
        generatedAt,
        documentUrl: `/documents/invoice/${documentId}.pdf`, // Mock URL
        documentContent,
      };
    } catch (error) {
      console.error("Error generating invoice document:", error);
      throw new Error("Failed to generate invoice document");
    }
  }

  /**
   * Get document by ID (mock implementation)
   * @param {string} documentId - Document ID
   * @returns {Object} Document content
   */
  static async getDocumentById(documentId) {
    try {
      // Mock implementation - in real app, this would fetch from database or file system
      return {
        documentId,
        exists: true,
        content: `Mock document content for ${documentId}`,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error getting document:", error);
      throw new Error("Failed to retrieve document");
    }
  }

  /**
   * Generate document summary for notifications
   * @param {Object} document - Document object
   * @returns {string} Document summary
   */
  static generateDocumentSummary(document) {
    try {
      const { documentType, documentId, generatedAt } = document;

      switch (documentType) {
        case "PICKUP_DOCUMENT":
          return `Pickup document ${documentId} generated on ${generatedAt.toLocaleDateString()}`;
        case "RETURN_DOCUMENT":
          return `Return document ${documentId} generated on ${generatedAt.toLocaleDateString()}`;
        case "INVOICE":
          return `Invoice ${documentId} generated on ${generatedAt.toLocaleDateString()}`;
        default:
          return `Document ${documentId} generated on ${generatedAt.toLocaleDateString()}`;
      }
    } catch (error) {
      console.error("Error generating document summary:", error);
      return "Document generated";
    }
  }
}

export default DocumentService;
