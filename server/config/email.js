const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} code - 6-digit OTP code
 * @param {string} purpose - 'registration' | 'login' | 'reset'
 */
const sendOTPEmail = async (email, code, purpose = 'registration') => {
  const purposeText = {
    registration: 'complete your registration',
    login: 'log in to your account',
    reset: 'reset your password',
  };

  const mailOptions = {
    from: `"Computer Match" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your Verification Code — ${code}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:linear-gradient(135deg,#FBBF24,#F59E0B);padding:32px 24px;text-align:center;">
              <h1 style="margin:0;color:#111827;font-size:24px;font-weight:700;">Computer Match</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.5;">
                Use the following code to ${purposeText[purpose] || 'verify your email'}:
              </p>
              <div style="background:#FEF3C7;border:2px dashed #FBBF24;border-radius:8px;padding:20px;text-align:center;margin:24px 0;">
                <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;">${code}</span>
              </div>
              <p style="margin:16px 0 0;color:#6B7280;font-size:14px;line-height:1.5;">
                This code expires in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:16px 24px;text-align:center;">
              <p style="margin:0;color:#9CA3AF;font-size:12px;">© ${new Date().getFullYear()} Computer Match. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { transporter, sendOTPEmail };
