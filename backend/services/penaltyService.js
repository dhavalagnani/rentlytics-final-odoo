import Settings from "../models/Settings.model.js";

class PenaltyService {
  /**
   * Calculate damage penalty based on settings
   * @param {number} deposit - The deposit amount
   * @param {string} damageLevel - Level of damage (excellent, good, fair, damaged)
   * @returns {Object} Penalty calculation result
   */
  static async calculateDamagePenalty(deposit, damageLevel) {
    try {
      const settings = await Settings.getSettings();
      let penaltyAmount = 0;
      let reason = "";

      // Calculate penalty based on damage level
      switch (damageLevel) {
        case "excellent":
          penaltyAmount = 0;
          reason = "No damage detected";
          break;
        case "good":
          penaltyAmount = 0;
          reason = "Minor wear and tear - no penalty";
          break;
        case "fair":
          penaltyAmount = deposit * (settings.damagePenaltyRate / 100) * 0.5;
          reason = "Moderate damage - 50% of standard penalty";
          break;
        case "damaged":
          penaltyAmount = deposit * (settings.damagePenaltyRate / 100);
          reason = "Significant damage - full penalty applied";
          break;
        default:
          penaltyAmount = 0;
          reason = "Unknown damage level";
      }

      // Apply fixed rate if configured
      if (settings.damagePenaltyType === "fixed") {
        penaltyAmount = settings.damagePenaltyRate;
      }

      return {
        amount: Math.round(penaltyAmount * 100) / 100, // Round to 2 decimal places
        reason,
        appliedAt: new Date(),
        damageLevel,
      };
    } catch (error) {
      console.error("Error calculating damage penalty:", error);
      throw new Error("Failed to calculate damage penalty");
    }
  }

  /**
   * Calculate late return penalty
   * @param {Date} expectedReturnDate - Expected return date
   * @param {Date} actualReturnDate - Actual return date
   * @param {number} deposit - The deposit amount
   * @returns {Object} Late penalty calculation result
   */
  static async calculateLatePenalty(
    expectedReturnDate,
    actualReturnDate,
    deposit
  ) {
    try {
      const settings = await Settings.getSettings();

      // Calculate days late
      const expectedDate = new Date(expectedReturnDate);
      const actualDate = new Date(actualReturnDate);
      const timeDiff = actualDate.getTime() - expectedDate.getTime();
      const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysLate <= 0) {
        return {
          amount: 0,
          daysLate: 0,
          reason: "Returned on time or early",
          appliedAt: new Date(),
        };
      }

      // Cap the penalty at maximum days
      const effectiveDaysLate = Math.min(daysLate, settings.maxLatePenaltyDays);

      let penaltyAmount = 0;

      if (settings.latePenaltyType === "percentage") {
        penaltyAmount =
          deposit * (settings.latePenaltyRate / 100) * effectiveDaysLate;
      } else {
        penaltyAmount = settings.latePenaltyRate * effectiveDaysLate;
      }

      const reason = `Late return by ${effectiveDaysLate} day(s)`;

      return {
        amount: Math.round(penaltyAmount * 100) / 100,
        daysLate: effectiveDaysLate,
        reason,
        appliedAt: new Date(),
      };
    } catch (error) {
      console.error("Error calculating late penalty:", error);
      throw new Error("Failed to calculate late penalty");
    }
  }

  /**
   * Calculate total penalty for a booking
   * @param {Object} damagePenalty - Damage penalty object
   * @param {Object} latePenalty - Late penalty object
   * @returns {number} Total penalty amount
   */
  static calculateTotalPenalty(damagePenalty, latePenalty) {
    const damageAmount = damagePenalty?.amount || 0;
    const lateAmount = latePenalty?.amount || 0;
    return Math.round((damageAmount + lateAmount) * 100) / 100;
  }

  /**
   * Get penalty settings
   * @returns {Object} Current penalty settings
   */
  static async getPenaltySettings() {
    try {
      const settings = await Settings.getSettings();
      return {
        damagePenaltyRate: settings.damagePenaltyRate,
        damagePenaltyType: settings.damagePenaltyType,
        latePenaltyRate: settings.latePenaltyRate,
        latePenaltyType: settings.latePenaltyType,
        maxLatePenaltyDays: settings.maxLatePenaltyDays,
      };
    } catch (error) {
      console.error("Error getting penalty settings:", error);
      throw new Error("Failed to get penalty settings");
    }
  }

  /**
   * Update penalty settings
   * @param {Object} newSettings - New penalty settings
   * @returns {Object} Updated settings
   */
  static async updatePenaltySettings(newSettings) {
    try {
      const settings = await Settings.getSettings();

      // Update only penalty-related fields
      if (newSettings.damagePenaltyRate !== undefined) {
        settings.damagePenaltyRate = newSettings.damagePenaltyRate;
      }
      if (newSettings.damagePenaltyType !== undefined) {
        settings.damagePenaltyType = newSettings.damagePenaltyType;
      }
      if (newSettings.latePenaltyRate !== undefined) {
        settings.latePenaltyRate = newSettings.latePenaltyRate;
      }
      if (newSettings.latePenaltyType !== undefined) {
        settings.latePenaltyType = newSettings.latePenaltyType;
      }
      if (newSettings.maxLatePenaltyDays !== undefined) {
        settings.maxLatePenaltyDays = newSettings.maxLatePenaltyDays;
      }

      await settings.save();
      return settings;
    } catch (error) {
      console.error("Error updating penalty settings:", error);
      throw new Error("Failed to update penalty settings");
    }
  }
}

export default PenaltyService;
