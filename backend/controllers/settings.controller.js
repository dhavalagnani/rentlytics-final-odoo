import Settings from "../models/Settings.model.js";
import PenaltyService from "../services/penaltyService.js";

// Get all settings
export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();

    res.json({
      success: true,
      data: settings,
      message: "Settings retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get penalty settings
export const getPenaltySettings = async (req, res, next) => {
  try {
    const penaltySettings = await PenaltyService.getPenaltySettings();

    res.json({
      success: true,
      data: penaltySettings,
      message: "Penalty settings retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update penalty settings
export const updatePenaltySettings = async (req, res, next) => {
  try {
    const {
      damagePenaltyRate,
      damagePenaltyType,
      latePenaltyRate,
      latePenaltyType,
      maxLatePenaltyDays,
    } = req.body;

    // Validate input
    const validationErrors = [];

    if (damagePenaltyRate !== undefined) {
      if (damagePenaltyRate < 0 || damagePenaltyRate > 100) {
        validationErrors.push("Damage penalty rate must be between 0 and 100");
      }
    }

    if (
      damagePenaltyType !== undefined &&
      !["percentage", "fixed"].includes(damagePenaltyType)
    ) {
      validationErrors.push(
        "Damage penalty type must be 'percentage' or 'fixed'"
      );
    }

    if (latePenaltyRate !== undefined) {
      if (latePenaltyRate < 0 || latePenaltyRate > 100) {
        validationErrors.push("Late penalty rate must be between 0 and 100");
      }
    }

    if (
      latePenaltyType !== undefined &&
      !["percentage", "fixed"].includes(latePenaltyType)
    ) {
      validationErrors.push(
        "Late penalty type must be 'percentage' or 'fixed'"
      );
    }

    if (maxLatePenaltyDays !== undefined) {
      if (maxLatePenaltyDays < 1) {
        validationErrors.push("Maximum late penalty days must be at least 1");
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: validationErrors,
      });
    }

    const updatedSettings = await PenaltyService.updatePenaltySettings({
      damagePenaltyRate,
      damagePenaltyType,
      latePenaltyRate,
      latePenaltyType,
      maxLatePenaltyDays,
    });

    res.json({
      success: true,
      data: updatedSettings,
      message: "Penalty settings updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update notification settings
export const updateNotificationSettings = async (req, res, next) => {
  try {
    const { pickupReminderHours, returnReminderHours } = req.body;

    // Validate input
    const validationErrors = [];

    if (pickupReminderHours !== undefined) {
      if (pickupReminderHours < 0 || pickupReminderHours > 72) {
        validationErrors.push("Pickup reminder hours must be between 0 and 72");
      }
    }

    if (returnReminderHours !== undefined) {
      if (returnReminderHours < 0 || returnReminderHours > 72) {
        validationErrors.push("Return reminder hours must be between 0 and 72");
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: validationErrors,
      });
    }

    const settings = await Settings.getSettings();

    if (pickupReminderHours !== undefined) {
      settings.notificationSettings.pickupReminderHours = pickupReminderHours;
    }

    if (returnReminderHours !== undefined) {
      settings.notificationSettings.returnReminderHours = returnReminderHours;
    }

    await settings.save();

    res.json({
      success: true,
      data: settings,
      message: "Notification settings updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Reset settings to defaults
export const resetSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();

    // Reset to default values
    settings.damagePenaltyRate = 10;
    settings.damagePenaltyType = "percentage";
    settings.latePenaltyRate = 5;
    settings.latePenaltyType = "percentage";
    settings.maxLatePenaltyDays = 7;
    settings.notificationSettings.pickupReminderHours = 2;
    settings.notificationSettings.returnReminderHours = 24;

    await settings.save();

    res.json({
      success: true,
      data: settings,
      message: "Settings reset to defaults successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get settings statistics
export const getSettingsStats = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();

    const stats = {
      penaltySettings: {
        damagePenaltyRate: settings.damagePenaltyRate,
        damagePenaltyType: settings.damagePenaltyType,
        latePenaltyRate: settings.latePenaltyRate,
        latePenaltyType: settings.latePenaltyType,
        maxLatePenaltyDays: settings.maxLatePenaltyDays,
      },
      notificationSettings: {
        pickupReminderHours: settings.notificationSettings.pickupReminderHours,
        returnReminderHours: settings.notificationSettings.returnReminderHours,
      },
      lastUpdated: settings.updatedAt,
    };

    res.json({
      success: true,
      data: stats,
      message: "Settings statistics retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};
