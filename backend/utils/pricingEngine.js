/**
 * Applies price rules to calculate final pricing
 * @param {Object} baseRates - Base rates object with hourly, daily, weekly
 * @param {Array} priceRules - Array of price rules to apply
 * @param {Object} bookingData - Booking data for rule evaluation
 * @returns {Object} Pricing snapshot with calculated values
 */
export const applyPriceRules = async (baseRates, priceRules, bookingData) => {
  let finalRates = { ...baseRates };
  let appliedRules = [];
  let discountAmount = 0;
  let lateFee = 0;

  // Sort rules by priority (higher priority first)
  const sortedRules = priceRules.sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    if (!rule.enabled) continue;

    // Check if rule is valid for current date
    const now = new Date();
    if (now < rule.validity.startDate || now > rule.validity.endDate) continue;

    // Check if rule applies to this booking
    if (rule.productId && rule.productId.toString() !== bookingData.productId)
      continue;
    if (
      rule.categoryId &&
      rule.categoryId.toString() !== bookingData.categoryId
    )
      continue;

    // Evaluate conditions
    const conditionsMet = rule.conditions.every((condition) => {
      const fieldValue = bookingData[condition.field];

      switch (condition.operator) {
        case "equals":
          return fieldValue === condition.value;
        case "not_equals":
          return fieldValue !== condition.value;
        case "greater_than":
          return fieldValue > condition.value;
        case "less_than":
          return fieldValue < condition.value;
        case "greater_than_equal":
          return fieldValue >= condition.value;
        case "less_than_equal":
          return fieldValue <= condition.value;
        case "contains":
          return fieldValue && fieldValue.includes(condition.value);
        case "in":
          return (
            Array.isArray(condition.value) &&
            condition.value.includes(fieldValue)
          );
        default:
          return false;
      }
    });

    if (!conditionsMet) continue;

    // Apply rule effect
    const effect = rule.effect;
    let ruleDiscount = 0;

    switch (effect.type) {
      case "percentDiscount":
        if (effect.applyTo === "unit") {
          ruleDiscount =
            ((finalRates.hourly * effect.value) / 100) *
            bookingData.durationHours;
        } else {
          ruleDiscount =
            (finalRates.hourly * bookingData.durationHours * effect.value) /
            100;
        }
        break;

      case "flatDiscount":
        ruleDiscount = effect.value;
        break;

      case "setPrice":
        if (effect.applyTo === "unit") {
          finalRates.hourly = effect.value;
        }
        break;

      case "surcharge":
        if (effect.applyTo === "unit") {
          finalRates.hourly += effect.value;
        } else {
          lateFee += effect.value;
        }
        break;
    }

    discountAmount += ruleDiscount;
    appliedRules.push({
      ruleId: rule.ruleId,
      summary: `${rule.name}: ${effect.type} applied`,
    });
  }

  // Calculate total price
  const basePrice = finalRates.hourly * bookingData.durationHours;
  const totalPrice = basePrice - discountAmount + lateFee;
  const deposit = bookingData.depositAmount || 0;

  return {
    baseRates: finalRates,
    appliedRules,
    discountAmount,
    lateFee,
    deposit,
    totalPrice: Math.max(0, totalPrice), // Ensure price is not negative
  };
};
