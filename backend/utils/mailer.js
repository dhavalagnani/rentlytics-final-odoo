/**
 * Sends OTP email to user
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} otp - OTP code to send
 * @returns {Promise} Email sending result
 */
export const sendOtpEmail = async (email, firstName, otp) => {
  try {
    // This is a placeholder implementation
    // In production, you would integrate with a real email service like:
    // - Nodemailer with SMTP
    // - SendGrid
    // - AWS SES
    // - Mailgun

    console.log(`📧 Email would be sent to ${email}:`);
    console.log(`Subject: Verify your email address`);
    console.log(`Body: Hi ${firstName}, your OTP is: ${otp}`);

    // For now, we'll just log the email details
    // You can replace this with actual email sending logic

    return {
      success: true,
      message: "OTP email sent successfully",
    };
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send OTP email");
  }
};
