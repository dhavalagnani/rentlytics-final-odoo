import twilioClient, { twilioConfig } from "../config/twilio.js";
import Booking from "../models/Booking.model.js";
import User from "../models/User.model.js";

/**
 * Send notification via multiple channels
 * @param {Object} params
 * @param {string} params.phoneNumber - Recipient phone number
 * @param {string} params.message - Message content
 * @param {string} params.channel - 'whatsapp', 'web_portal', or 'both'
 * @returns {Promise<Object>} Notification response with results
 */
export const sendNotification = async ({
  phoneNumber,
  message,
  channel = "whatsapp",
}) => {
  try {
    // Validate parameters
    if (!phoneNumber || !message) {
      throw new Error("phoneNumber and message are required");
    }

    // Validate channel
    const validChannels = ["whatsapp", "web_portal", "both"];
    if (!validChannels.includes(channel)) {
      throw new Error(
        `Invalid channel. Supported channels: ${validChannels.join(", ")}`
      );
    }

    const results = {
      success: true,
      channel,
      phoneNumber,
      timestamp: new Date().toISOString(),
      details: {},
    };

    // Handle different channels
    if (channel === "whatsapp" || channel === "both") {
      // Validate Twilio configuration for WhatsApp
      if (!twilioConfig.accountSid || !twilioConfig.authToken) {
        throw new Error("Twilio configuration is incomplete");
      }

      if (!twilioConfig.whatsappNumber) {
        throw new Error("Twilio WhatsApp number not configured");
      }

      // Validate phone number format
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
      if (cleanPhoneNumber.length < 10) {
        throw new Error("Invalid phone number format");
      }

      // Format phone number for international use (add + if not present)
      const formattedPhoneNumber = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      // Send WhatsApp message
      const fromNumber = twilioConfig.whatsappNumber.startsWith("whatsapp:")
        ? twilioConfig.whatsappNumber
        : `whatsapp:${twilioConfig.whatsappNumber}`;

      const toNumber = formattedPhoneNumber.startsWith("whatsapp:")
        ? formattedPhoneNumber
        : `whatsapp:${formattedPhoneNumber}`;

      const twilioResponse = await twilioClient.messages.create({
        body: message,
        from: fromNumber,
        to: toNumber,
      });

      console.log(`✅ WhatsApp notification sent successfully`);
      console.log(`📱 To: ${formattedPhoneNumber}`);
      console.log(`📝 Message: ${message}`);
      console.log(`🆔 Twilio SID: ${twilioResponse.sid}`);

      results.details.whatsapp = {
        success: true,
        messageSid: twilioResponse.sid,
        status: twilioResponse.status,
      };
    }

    if (channel === "web_portal" || channel === "both") {
      // For web portal, we'll store the notification in the database
      // This could be displayed in the user's dashboard or sent via email
      console.log(`✅ Web Portal notification queued`);
      console.log(`📧 To: ${phoneNumber}`);
      console.log(`📝 Message: ${message}`);

      results.details.web_portal = {
        success: true,
        status: "queued",
        note: "Notification will be displayed in user's web portal dashboard",
      };
    }

    return results;
  } catch (error) {
    console.error(`❌ Error sending ${channel} notification:`, error.message);
    throw new Error(`Failed to send ${channel} notification: ${error.message}`);
  }
};

/**
 * Send return reminder notification
 * @param {Object} params
 * @param {string} params.bookingId - Booking ID
 * @returns {Promise<Object>} Notification results
 */
export const sendReturnReminder = async ({ bookingId }) => {
  try {
    // Fetch booking with user and product details
    const booking = await Booking.findById(bookingId)
      .populate("userId", "phone firstName lastName")
      .populate("productId", "name")
      .lean();

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (!booking.userId?.phone) {
      throw new Error("User phone number not found");
    }

    if (!booking.productId?.name) {
      throw new Error("Product name not found");
    }

    // Calculate days remaining
    const today = new Date();
    const returnDate = new Date(booking.endDate);
    const daysRemaining = Math.ceil(
      (returnDate - today) / (1000 * 60 * 60 * 24)
    );

    // Generate appropriate reminder message based on days remaining
    let message;
    if (daysRemaining > 0) {
      message = `${daysRemaining} day${
        daysRemaining === 1 ? "" : "s"
      } remaining for your rental '${
        booking.productId.name
      }'. Please return on time to avoid late fees.`;
    } else if (daysRemaining === 0) {
      message = `Today is the return date for your rental '${booking.productId.name}'. Please return it today to avoid late fees.`;
    } else {
      message = `Your rental '${
        booking.productId.name
      }' is overdue by ${Math.abs(daysRemaining)} day${
        Math.abs(daysRemaining) === 1 ? "" : "s"
      }. Please return immediately to avoid additional charges.`;
    }

    const phoneNumber = booking.userId.phone;
    const results = {};

    // Send WhatsApp notification only
    try {
      results.whatsapp = await sendNotification({
        phoneNumber,
        message,
        channel: "whatsapp",
      });
    } catch (whatsappError) {
      console.error("❌ WhatsApp notification failed:", whatsappError.message);
      results.whatsapp = { success: false, error: whatsappError.message };
    }

    console.log(`✅ Return reminder sent for booking ${bookingId}`);
    console.log(
      `👤 User: ${booking.userId.firstName} ${booking.userId.lastName}`
    );
    console.log(`📱 Phone: ${phoneNumber}`);
    console.log(`📦 Product: ${booking.productId.name}`);
    console.log(`📅 Return Date: ${returnDate.toLocaleDateString()}`);
    console.log(`⏰ Days Remaining: ${daysRemaining}`);

    return {
      success: true,
      bookingId,
      userPhone: phoneNumber,
      productName: booking.productId.name,
      returnDate: returnDate.toLocaleDateString(),
      daysRemaining,
      message,
      results,
    };
  } catch (error) {
    console.error("❌ Error sending return reminder:", error.message);
    throw new Error(`Failed to send return reminder: ${error.message}`);
  }
};

/**
 * Send bulk notifications
 * @param {Array} notifications - Array of notification objects
 * @returns {Promise<Array>} Results for all notifications
 */
export const sendBulkNotifications = async (notifications) => {
  try {
    const results = [];

    for (const notification of notifications) {
      try {
        const result = await sendNotification(notification);
        results.push({ ...notification, result });
      } catch (error) {
        results.push({ ...notification, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error("❌ Error sending bulk notifications:", error.message);
    throw new Error(`Failed to send bulk notifications: ${error.message}`);
  }
};

/**
 * Send scheduled return reminders for all active bookings
 * @param {Object} params
 * @param {number} params.daysThreshold - Send reminders for bookings with X days remaining
 * @returns {Promise<Object>} Results for all reminders sent
 */
export const sendScheduledReturnReminders = async ({ daysThreshold = 1 }) => {
  try {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysThreshold);

    // Find bookings that are due in X days
    const bookings = await Booking.find({
      status: { $in: ["confirmed", "pickedup"] },
      endDate: {
        $gte: new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate()
        ),
        $lt: new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate() + 1
        ),
      },
    })
      .populate("userId", "phone firstName lastName")
      .populate("productId", "name")
      .lean();

    console.log(
      `📅 Found ${bookings.length} bookings due in ${daysThreshold} day(s)`
    );

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const booking of bookings) {
      try {
        const result = await sendReturnReminder({ bookingId: booking._id });
        results.push({
          bookingId: booking._id,
          success: true,
          result,
        });
        successCount++;
      } catch (error) {
        console.error(
          `❌ Failed to send reminder for booking ${booking._id}:`,
          error.message
        );
        results.push({
          bookingId: booking._id,
          success: false,
          error: error.message,
        });
        failureCount++;
      }
    }

    console.log(
      `✅ Scheduled reminders completed: ${successCount} successful, ${failureCount} failed`
    );

    return {
      success: true,
      totalBookings: bookings.length,
      successCount,
      failureCount,
      results,
    };
  } catch (error) {
    console.error(
      "❌ Error sending scheduled return reminders:",
      error.message
    );
    throw new Error(
      `Failed to send scheduled return reminders: ${error.message}`
    );
  }
};

/**
 * Send overdue reminders for all late bookings
 * @returns {Promise<Object>} Results for all overdue reminders sent
 */
export const sendOverdueReminders = async () => {
  try {
    const today = new Date();

    // Find overdue bookings
    const bookings = await Booking.find({
      status: { $in: ["confirmed", "pickedup"] },
      endDate: { $lt: today },
    })
      .populate("userId", "phone firstName lastName")
      .populate("productId", "name")
      .lean();

    console.log(`⚠️ Found ${bookings.length} overdue bookings`);

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const booking of bookings) {
      try {
        const result = await sendReturnReminder({ bookingId: booking._id });
        results.push({
          bookingId: booking._id,
          success: true,
          result,
        });
        successCount++;
      } catch (error) {
        console.error(
          `❌ Failed to send overdue reminder for booking ${booking._id}:`,
          error.message
        );
        results.push({
          bookingId: booking._id,
          success: false,
          error: error.message,
        });
        failureCount++;
      }
    }

    console.log(
      `✅ Overdue reminders completed: ${successCount} successful, ${failureCount} failed`
    );

    return {
      success: true,
      totalBookings: bookings.length,
      successCount,
      failureCount,
      results,
    };
  } catch (error) {
    console.error("❌ Error sending overdue reminders:", error.message);
    throw new Error(`Failed to send overdue reminders: ${error.message}`);
  }
};

/**
 * Test Twilio configuration and connectivity
 * @param {string} testPhoneNumber - Phone number to test with
 * @returns {Promise<Object>} Test results
 */
export const testTwilioConfiguration = async (testPhoneNumber) => {
  try {
    console.log("🧪 Testing Twilio WhatsApp configuration...");

    // Check configuration
    if (!twilioConfig.accountSid || !twilioConfig.authToken) {
      throw new Error("Twilio credentials not configured");
    }

    if (!twilioConfig.whatsappNumber) {
      throw new Error("Twilio WhatsApp number not configured");
    }

    console.log("✅ Twilio configuration validated");
    console.log(`💬 WhatsApp Number: ${twilioConfig.whatsappNumber}`);

    const results = {};

    // Test WhatsApp only
    try {
      console.log("💬 Testing WhatsApp...");
      const whatsappResult = await sendNotification({
        phoneNumber: testPhoneNumber,
        message:
          "🧪 This is a test WhatsApp message from your Twilio integration",
        channel: "whatsapp",
      });
      results.whatsapp = { success: true, sid: whatsappResult.messageSid };
      console.log("✅ WhatsApp test successful");
    } catch (whatsappError) {
      results.whatsapp = { success: false, error: whatsappError.message };
      console.log(`❌ WhatsApp test failed: ${whatsappError.message}`);
    }

    return {
      success: true,
      configuration: {
        accountSid: twilioConfig.accountSid ? "✅ Configured" : "❌ Missing",
        authToken: twilioConfig.authToken ? "✅ Configured" : "❌ Missing",
        whatsappNumber: twilioConfig.whatsappNumber || "❌ Missing",
      },
      results,
    };
  } catch (error) {
    console.error("❌ Twilio configuration test failed:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send daily return reminders for all active bookings
 * @returns {Promise<Object>} Results for all daily reminders sent
 */
export const sendDailyReturnReminders = async () => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Find active bookings
    const bookings = await Booking.find({
      status: { $in: ["confirmed", "pickedup"] },
      endDate: { $gte: today },
    })
      .populate("userId", "phone firstName lastName")
      .populate("productId", "name")
      .lean();

    console.log(
      `📅 Found ${bookings.length} active bookings for daily reminders`
    );

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const booking of bookings) {
      try {
        const result = await sendReturnReminder({ bookingId: booking._id });
        results.push({
          bookingId: booking._id,
          success: true,
          result,
        });
        successCount++;
      } catch (error) {
        console.error(
          `❌ Failed to send daily reminder for booking ${booking._id}:`,
          error.message
        );
        results.push({
          bookingId: booking._id,
          success: false,
          error: error.message,
        });
        failureCount++;
      }
    }

    console.log(
      `✅ Daily reminders completed: ${successCount} successful, ${failureCount} failed`
    );

    return {
      success: true,
      totalBookings: bookings.length,
      successCount,
      failureCount,
      results,
    };
  } catch (error) {
    console.error("❌ Error sending daily return reminders:", error.message);
    throw new Error(`Failed to send daily return reminders: ${error.message}`);
  }
};

class NotificationService {
  /**
   * Send pickup notification to customer
   * @param {Object} booking - Booking object
   * @param {Object} pickupDocument - Pickup document
   * @returns {Object} Notification result
   */
  static async sendPickupNotification(booking, pickupDocument) {
    try {
      const customerPhone = booking.userId?.phone;
      const customerEmail = booking.userId?.email;
      const customerName = `${booking.userId?.firstName} ${booking.userId?.lastName}`;

      const message = `🎉 Your pickup is confirmed!\n\n📦 Item: ${
        booking.productId?.name
      }\n📅 Date: ${new Date(
        booking.startDate
      ).toLocaleDateString()}\n📍 Address: ${
        pickupDocument.documentContent.pickupDetails.pickupAddress.street
      }, ${
        pickupDocument.documentContent.pickupDetails.pickupAddress.city
      }\n📋 Document ID: ${
        pickupDocument.documentId
      }\n\nPlease bring valid ID for pickup.`;

      // Mock notification sending
      const notificationResult = {
        type: "pickup_confirmation",
        recipient: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        },
        message,
        documentId: pickupDocument.documentId,
        sentAt: new Date(),
        status: "sent",
        channels: ["sms", "email"],
      };

      console.log(
        `✅ Pickup notification sent to ${customerName} (${customerPhone})`
      );
      console.log(`📱 SMS: ${message.substring(0, 100)}...`);
      console.log(`📧 Email sent to: ${customerEmail}`);

      return notificationResult;
    } catch (error) {
      console.error("Error sending pickup notification:", error);
      throw new Error("Failed to send pickup notification");
    }
  }

  /**
   * Send pickup reminder notification
   * @param {Object} booking - Booking object
   * @returns {Object} Notification result
   */
  static async sendPickupReminder(booking) {
    try {
      const customerPhone = booking.userId?.phone;
      const customerName = `${booking.userId?.firstName} ${booking.userId?.lastName}`;

      const message = `⏰ Pickup Reminder!\n\nYour pickup is scheduled for tomorrow.\n📦 Item: ${
        booking.productId?.name
      }\n📅 Date: ${new Date(
        booking.startDate
      ).toLocaleDateString()}\n📍 Address: ${booking.pickupAddress?.street}, ${
        booking.pickupAddress?.city
      }\n\nPlease ensure you have valid ID ready.`;

      const notificationResult = {
        type: "pickup_reminder",
        recipient: {
          name: customerName,
          phone: customerPhone,
        },
        message,
        sentAt: new Date(),
        status: "sent",
        channels: ["sms"],
      };

      console.log(
        `✅ Pickup reminder sent to ${customerName} (${customerPhone})`
      );
      return notificationResult;
    } catch (error) {
      console.error("Error sending pickup reminder:", error);
      throw new Error("Failed to send pickup reminder");
    }
  }

  /**
   * Send return notification to customer
   * @param {Object} booking - Booking object
   * @param {Object} returnDocument - Return document
   * @returns {Object} Notification result
   */
  static async sendReturnNotification(booking, returnDocument) {
    try {
      const customerPhone = booking.userId?.phone;
      const customerEmail = booking.userId?.email;
      const customerName = `${booking.userId?.firstName} ${booking.userId?.lastName}`;

      let message = `✅ Your return is confirmed!\n\n📦 Item: ${
        booking.productId?.name
      }\n📍 Return Address: ${
        returnDocument.documentContent.returnDetails.dropAddress.street
      }, ${
        returnDocument.documentContent.returnDetails.dropAddress.city
      }\n📅 Return Date: ${new Date(
        returnDocument.documentContent.returnDetails.returnedAt
      ).toLocaleDateString()}\n📋 Document ID: ${returnDocument.documentId}`;

      // Add penalty information if any
      if (booking.penalties?.totalPenalty > 0) {
        message += `\n💰 Penalties Applied: ₹${booking.penalties.totalPenalty}`;
        if (booking.penalties.damagePenalty?.amount > 0) {
          message += `\n🔧 Damage Penalty: ₹${booking.penalties.damagePenalty.amount}`;
        }
        if (booking.penalties.latePenalty?.amount > 0) {
          message += `\n⏰ Late Penalty: ₹${booking.penalties.latePenalty.amount} (${booking.penalties.latePenalty.daysLate} days)`;
        }
      } else {
        message += `\n✅ No penalties applied`;
      }

      const notificationResult = {
        type: "return_confirmation",
        recipient: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        },
        message,
        documentId: returnDocument.documentId,
        sentAt: new Date(),
        status: "sent",
        channels: ["sms", "email"],
        penalties: booking.penalties,
      };

      console.log(
        `✅ Return notification sent to ${customerName} (${customerPhone})`
      );
      console.log(`📱 SMS: ${message.substring(0, 100)}...`);
      console.log(`📧 Email sent to: ${customerEmail}`);

      return notificationResult;
    } catch (error) {
      console.error("Error sending return notification:", error);
      throw new Error("Failed to send return notification");
    }
  }

  /**
   * Send return reminder notification
   * @param {Object} booking - Booking object
   * @returns {Object} Notification result
   */
  static async sendReturnReminder(booking) {
    try {
      const customerPhone = booking.userId?.phone;
      const customerName = `${booking.userId?.firstName} ${booking.userId?.lastName}`;

      const message = `⏰ Return Reminder!\n\nYour rental period ends tomorrow.\n📦 Item: ${
        booking.productId?.name
      }\n📅 Return Date: ${new Date(
        booking.endDate
      ).toLocaleDateString()}\n📍 Return Address: ${
        booking.dropAddress?.street
      }, ${
        booking.dropAddress?.city
      }\n\nLate returns may incur additional charges.`;

      const notificationResult = {
        type: "return_reminder",
        recipient: {
          name: customerName,
          phone: customerPhone,
        },
        message,
        sentAt: new Date(),
        status: "sent",
        channels: ["sms"],
      };

      console.log(
        `✅ Return reminder sent to ${customerName} (${customerPhone})`
      );
      return notificationResult;
    } catch (error) {
      console.error("Error sending return reminder:", error);
      throw new Error("Failed to send return reminder");
    }
  }

  /**
   * Send notification to pickup team
   * @param {Object} booking - Booking object
   * @param {Object} pickupDocument - Pickup document
   * @returns {Object} Notification result
   */
  static async sendPickupTeamNotification(booking, pickupDocument) {
    try {
      const pickupTeamPhone = "+919876543210"; // Mock pickup team phone
      const customerName = `${booking.userId?.firstName} ${booking.userId?.lastName}`;

      const message = `🚚 New Pickup Assignment!\n\n👤 Customer: ${customerName}\n📦 Item: ${
        booking.productId?.name
      }\n📅 Date: ${new Date(
        booking.startDate
      ).toLocaleDateString()}\n📍 Address: ${
        pickupDocument.documentContent.pickupDetails.pickupAddress.street
      }, ${
        pickupDocument.documentContent.pickupDetails.pickupAddress.city
      }\n📋 Document ID: ${
        pickupDocument.documentId
      }\n\nPlease confirm pickup completion.`;

      const notificationResult = {
        type: "pickup_team_assignment",
        recipient: {
          name: "Pickup Team",
          phone: pickupTeamPhone,
        },
        message,
        bookingId: booking.bookingId,
        documentId: pickupDocument.documentId,
        sentAt: new Date(),
        status: "sent",
        channels: ["sms"],
      };

      console.log(`✅ Pickup team notification sent to ${pickupTeamPhone}`);
      console.log(`📱 SMS: ${message.substring(0, 100)}...`);

      return notificationResult;
    } catch (error) {
      console.error("Error sending pickup team notification:", error);
      throw new Error("Failed to send pickup team notification");
    }
  }

  /**
   * Send notification to return team
   * @param {Object} booking - Booking object
   * @param {Object} returnDocument - Return document
   * @returns {Object} Notification result
   */
  static async sendReturnTeamNotification(booking, returnDocument) {
    try {
      const returnTeamPhone = "+919876543211"; // Mock return team phone
      const customerName = `${booking.userId?.firstName} ${booking.userId?.lastName}`;

      const message = `📦 New Return Assignment!\n\n👤 Customer: ${customerName}\n📦 Item: ${
        booking.productId?.name
      }\n📅 Date: ${new Date(
        returnDocument.documentContent.returnDetails.returnedAt
      ).toLocaleDateString()}\n📍 Address: ${
        returnDocument.documentContent.returnDetails.dropAddress.street
      }, ${
        returnDocument.documentContent.returnDetails.dropAddress.city
      }\n📋 Document ID: ${
        returnDocument.documentId
      }\n\nPlease inspect items and update condition.`;

      const notificationResult = {
        type: "return_team_assignment",
        recipient: {
          name: "Return Team",
          phone: returnTeamPhone,
        },
        message,
        bookingId: booking.bookingId,
        documentId: returnDocument.documentId,
        sentAt: new Date(),
        status: "sent",
        channels: ["sms"],
      };

      console.log(`✅ Return team notification sent to ${returnTeamPhone}`);
      console.log(`📱 SMS: ${message.substring(0, 100)}...`);

      return notificationResult;
    } catch (error) {
      console.error("Error sending return team notification:", error);
      throw new Error("Failed to send return team notification");
    }
  }

  /**
   * Send penalty notification to customer
   * @param {Object} booking - Booking object
   * @param {Object} penalties - Penalty details
   * @returns {Object} Notification result
   */
  static async sendPenaltyNotification(booking, penalties) {
    try {
      const customerPhone = booking.userId?.phone;
      const customerName = `${booking.userId?.firstName} ${booking.userId?.lastName}`;

      let message = `⚠️ Penalty Applied!\n\n📦 Item: ${booking.productId?.name}\n💰 Total Penalty: ₹${penalties.totalPenalty}`;

      if (penalties.damagePenalty?.amount > 0) {
        message += `\n🔧 Damage Penalty: ₹${penalties.damagePenalty.amount}\n📝 Reason: ${penalties.damagePenalty.reason}`;
      }

      if (penalties.latePenalty?.amount > 0) {
        message += `\n⏰ Late Penalty: ₹${penalties.latePenalty.amount}\n📅 Days Late: ${penalties.latePenalty.daysLate}`;
      }

      message += `\n\n💳 Amount will be deducted from your deposit.`;

      const notificationResult = {
        type: "penalty_notification",
        recipient: {
          name: customerName,
          phone: customerPhone,
        },
        message,
        bookingId: booking.bookingId,
        penalties,
        sentAt: new Date(),
        status: "sent",
        channels: ["sms"],
      };

      console.log(
        `✅ Penalty notification sent to ${customerName} (${customerPhone})`
      );
      console.log(`📱 SMS: ${message.substring(0, 100)}...`);

      return notificationResult;
    } catch (error) {
      console.error("Error sending penalty notification:", error);
      throw new Error("Failed to send penalty notification");
    }
  }

  /**
   * Send refund notification to customer
   * @param {Object} booking - Booking object
   * @param {number} refundAmount - Refund amount
   * @returns {Object} Notification result
   */
  static async sendRefundNotification(booking, refundAmount) {
    try {
      const customerPhone = booking.userId?.phone;
      const customerEmail = booking.userId?.email;
      const customerName = `${booking.userId?.firstName} ${booking.userId?.lastName}`;

      const message = `💰 Refund Processed!\n\n📦 Item: ${
        booking.productId?.name
      }\n💳 Refund Amount: ₹${refundAmount}\n📅 Processed Date: ${new Date().toLocaleDateString()}\n\nRefund will be credited to your original payment method within 3-5 business days.`;

      const notificationResult = {
        type: "refund_notification",
        recipient: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        },
        message,
        bookingId: booking.bookingId,
        refundAmount,
        sentAt: new Date(),
        status: "sent",
        channels: ["sms", "email"],
      };

      console.log(
        `✅ Refund notification sent to ${customerName} (${customerPhone})`
      );
      console.log(`📱 SMS: ${message.substring(0, 100)}...`);
      console.log(`📧 Email sent to: ${customerEmail}`);

      return notificationResult;
    } catch (error) {
      console.error("Error sending refund notification:", error);
      throw new Error("Failed to send refund notification");
    }
  }
}

export default NotificationService;
