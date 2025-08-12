import express from "express";
import {
  sendNotification,
  sendReturnReminder,
  sendScheduledReturnReminders,
  sendOverdueReminders,
  sendDailyReturnReminders,
} from "../services/notificationService.js";
import { authenticateUser } from "../middleware/auth.js";
import Booking from "../models/Booking.model.js";
import notificationScheduler from "../utils/notificationScheduler.js";

const router = express.Router();

/**
 * POST /notification/test
 * Test endpoint for sending notifications via Twilio
 */
router.post("/test", async (req, res, next) => {
  try {
    const { phoneNumber, message, channel } = req.body;

    console.log("🧪 Test notification request:", {
      phoneNumber,
      message,
      channel,
    });

    // Validate required fields
    if (!phoneNumber || !message || !channel) {
      return res.status(400).json({
        success: false,
        message: "phoneNumber, message, and channel are required",
      });
    }

    // Validate channel
    const validChannels = ["whatsapp", "web_portal", "both"];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid channel. Supported channels: ${validChannels.join(
          ", "
        )}`,
      });
    }

    // Check Twilio configuration only if WhatsApp is being used
    if (channel === "whatsapp" || channel === "both") {
      const { twilioConfig } = await import("../config/twilio.js");

      if (!twilioConfig.accountSid || !twilioConfig.authToken) {
        return res.status(500).json({
          success: false,
          message:
            "Twilio credentials not configured. Please check your environment variables.",
        });
      }

      if (!twilioConfig.whatsappNumber) {
        return res.status(500).json({
          success: false,
          message:
            "Twilio WhatsApp number not configured. Please check TWILIO_WHATSAPP_NUMBER in your environment variables.",
        });
      }

      console.log("✅ Twilio configuration validated");
    }

    // Send notification
    const result = await sendNotification({
      phoneNumber,
      message,
      channel,
    });

    console.log("✅ Notification sent successfully:", result);

    res.json({
      success: true,
      message: `${channel.toUpperCase()} notification sent successfully`,
      data: result,
    });
  } catch (error) {
    console.error("❌ Notification test error:", error.message);
    console.error("❌ Full error:", error);

    // Provide more specific error messages
    let errorMessage = error.message || "Failed to send notification";

    if (error.message.includes("Invalid From and To pair")) {
      errorMessage =
        "WhatsApp number formatting error. Please check your TWILIO_WHATSAPP_NUMBER configuration.";
    } else if (
      error.message.includes("Permission to send an SMS has not been enabled")
    ) {
      errorMessage =
        "SMS not enabled for this region. Try using WhatsApp instead or check your Twilio account settings.";
    } else if (
      error.message.includes("Account not found") ||
      error.message.includes("Authentication failed")
    ) {
      errorMessage =
        "Invalid Twilio credentials. Please check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /notification/return-reminder
 * Send return reminder for a specific booking
 */
router.post("/return-reminder", authenticateUser, async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required",
      });
    }

    // Send return reminder
    const result = await sendReturnReminder({ bookingId });

    res.json({
      success: true,
      message: "Return reminder sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Return reminder error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send return reminder",
    });
  }
});

/**
 * GET /notification/status
 * Get notification service status
 */
router.get("/status", async (req, res, next) => {
  try {
    const { twilioConfig } = await import("../config/twilio.js");

    const status = {
      service: "Multi-Channel Notification Service",
      status: "active",
      timestamp: new Date().toISOString(),
      configuration: {
        accountSid: twilioConfig.accountSid ? "configured" : "not configured",
        authToken: twilioConfig.authToken ? "configured" : "not configured",
        whatsappNumber: twilioConfig.whatsappNumber
          ? "configured"
          : "not configured",
      },
      channels: ["whatsapp", "web_portal", "both"],
      environment: {
        nodeEnv: process.env.NODE_ENV || "not set",
        hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
        hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
        hasWhatsappNumber: !!process.env.TWILIO_WHATSAPP_NUMBER,
      },
    };

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("❌ Status check error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to get notification service status",
    });
  }
});

/**
 * POST /notification/scheduled-reminders
 * Send scheduled return reminders for bookings due in X days
 */
router.post(
  "/scheduled-reminders",
  authenticateUser,
  async (req, res, next) => {
    try {
      const { daysThreshold = 1 } = req.body;

      if (typeof daysThreshold !== "number" || daysThreshold < 0) {
        return res.status(400).json({
          success: false,
          message: "daysThreshold must be a positive number",
        });
      }

      // Send scheduled reminders
      const result = await sendScheduledReturnReminders({ daysThreshold });

      res.json({
        success: true,
        message: `Scheduled reminders sent for bookings due in ${daysThreshold} day(s)`,
        data: result,
      });
    } catch (error) {
      console.error("❌ Scheduled reminders error:", error.message);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to send scheduled reminders",
      });
    }
  }
);

/**
 * POST /notification/overdue-reminders
 * Send overdue reminders for all late bookings
 */
router.post("/overdue-reminders", authenticateUser, async (req, res, next) => {
  try {
    // Send overdue reminders
    const result = await sendOverdueReminders();

    res.json({
      success: true,
      message: "Overdue reminders sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Overdue reminders error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send overdue reminders",
    });
  }
});

/**
 * POST /notification/daily-reminders
 * Send daily return reminders for all active bookings
 */
router.post("/daily-reminders", authenticateUser, async (req, res, next) => {
  try {
    // Send daily reminders
    const result = await sendDailyReturnReminders();

    res.json({
      success: true,
      message: "Daily reminders sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Daily reminders error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send daily reminders",
    });
  }
});

/**
 * GET /notification/booking-status/:bookingId
 * Get notification status for a specific booking
 */
router.get(
  "/booking-status/:bookingId",
  authenticateUser,
  async (req, res, next) => {
    try {
      const { bookingId } = req.params;

      // Fetch booking details
      const booking = await Booking.findById(bookingId)
        .populate("userId", "phone firstName lastName")
        .populate("productId", "name")
        .lean();

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Calculate days remaining
      const today = new Date();
      const returnDate = new Date(booking.endDate);
      const daysRemaining = Math.ceil(
        (returnDate - today) / (1000 * 60 * 60 * 24)
      );

      // Generate status message
      let statusMessage;
      if (daysRemaining > 0) {
        statusMessage = `${daysRemaining} day${
          daysRemaining === 1 ? "" : "s"
        } remaining`;
      } else if (daysRemaining === 0) {
        statusMessage = "Due today";
      } else {
        statusMessage = `Overdue by ${Math.abs(daysRemaining)} day${
          Math.abs(daysRemaining) === 1 ? "" : "s"
        }`;
      }

      res.json({
        success: true,
        data: {
          bookingId: booking._id,
          productName: booking.productId?.name,
          userName: `${booking.userId?.firstName} ${booking.userId?.lastName}`,
          userPhone: booking.userId?.phone,
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status,
          daysRemaining,
          statusMessage,
          shouldSendReminder:
            daysRemaining <= 1 && booking.status !== "returned",
        },
      });
    } catch (error) {
      console.error("❌ Booking status error:", error.message);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get booking status",
      });
    }
  }
);

/**
 * POST /notification/scheduler/start
 * Start the notification scheduler
 */
router.post("/scheduler/start", authenticateUser, async (req, res, next) => {
  try {
    notificationScheduler.start();

    res.json({
      success: true,
      message: "Notification scheduler started successfully",
      data: notificationScheduler.getStatus(),
    });
  } catch (error) {
    console.error("❌ Scheduler start error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to start notification scheduler",
    });
  }
});

/**
 * POST /notification/scheduler/stop
 * Stop the notification scheduler
 */
router.post("/scheduler/stop", authenticateUser, async (req, res, next) => {
  try {
    notificationScheduler.stop();

    res.json({
      success: true,
      message: "Notification scheduler stopped successfully",
      data: notificationScheduler.getStatus(),
    });
  } catch (error) {
    console.error("❌ Scheduler stop error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to stop notification scheduler",
    });
  }
});

/**
 * GET /notification/scheduler/status
 * Get notification scheduler status
 */
router.get("/scheduler/status", authenticateUser, async (req, res, next) => {
  try {
    const status = notificationScheduler.getStatus();

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("❌ Scheduler status error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get scheduler status",
    });
  }
});

/**
 * POST /notification/scheduler/trigger
 * Manually trigger a specific reminder type
 */
router.post("/scheduler/trigger", authenticateUser, async (req, res, next) => {
  try {
    const { type, options = {} } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Reminder type is required (daily, overdue, scheduled)",
      });
    }

    const result = await notificationScheduler.triggerReminder(type, options);

    res.json({
      success: true,
      message: `${type} reminders triggered successfully`,
      data: result,
    });
  } catch (error) {
    console.error("❌ Scheduler trigger error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to trigger reminders",
    });
  }
});

export default router;
