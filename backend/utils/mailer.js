import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send OTP email
export const sendOtpEmail = async (email, firstName, otp) => {
  try {
    // Check if email configuration is available
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('=== EMAIL CONFIGURATION MISSING ===');
      console.log('SMTP_HOST:', process.env.SMTP_HOST);
      console.log('SMTP_USER:', process.env.SMTP_USER);
      console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : '***NOT SET***');
      console.log('===================================');
      
      // In development, just log the OTP instead of sending email
      if (process.env.NODE_ENV === 'development') {
        console.log('=== DEVELOPMENT MODE: OTP LOGGED ===');
        console.log(`Email would be sent to: ${email}`);
        console.log(`OTP for ${firstName}: ${otp}`);
        console.log('=====================================');
        return true;
      } else {
        throw new Error('Email configuration is missing');
      }
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Email Verification - OTP',
      text: generateTextEmail(firstName, otp),
      html: generateHtmlEmail(firstName, otp),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    
    // In development, don't throw error, just log it
    if (process.env.NODE_ENV === 'development') {
      console.log('=== DEVELOPMENT MODE: EMAIL ERROR IGNORED ===');
      console.log(`Email would be sent to: ${email}`);
      console.log(`OTP for ${firstName}: ${otp}`);
      console.log('=============================================');
      return true;
    }
    
    throw new Error('Failed to send OTP email');
  }
};

// Generate plain text email
const generateTextEmail = (firstName, otp) => {
  return `
Hello ${firstName},

Thank you for signing up! Please use the following OTP to verify your email address:

OTP: ${otp}

This OTP is valid for 10 minutes and can only be used once.

If you didn't request this verification, please ignore this email.

Best regards,
Your App Team
  `.trim();
};

// Generate HTML email
const generateHtmlEmail = (firstName, otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .otp-box {
            background-color: #4F46E5;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 8px;
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
            letter-spacing: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Email Verification</h1>
    </div>
    <div class="content">
        <h2>Hello ${firstName},</h2>
        <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
        
        <div class="otp-box">
            ${otp}
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
            <li>This OTP is valid for 10 minutes</li>
            <li>It can only be used once</li>
            <li>Do not share this OTP with anyone</li>
        </ul>
        
        <p>If you didn't request this verification, please ignore this email.</p>
    </div>
    <div class="footer">
        <p>Best regards,<br>Your App Team</p>
    </div>
</body>
</html>
  `.trim();
};
