// BIGSALE Email Templates
// Brand colors: #0F1B2D (navy header), #FF9900 (orange accent), #FFFFFF (white card)

const baseTemplate = (content: string, preheader = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BIGSALE</title>
<style>
  body { margin: 0; padding: 0; background-color: #F3F5F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
  .header { background: linear-gradient(135deg, #0F1B2D 0%, #152A45 100%); border-radius: 12px 12px 0 0; padding: 32px 40px; text-align: center; }
  .header-logo { color: #FF9900; font-size: 28px; font-weight: 900; letter-spacing: -1px; margin: 0; }
  .header-tagline { color: #94A3B8; font-size: 12px; margin: 4px 0 0 0; letter-spacing: 2px; text-transform: uppercase; }
  .card { background: #FFFFFF; border-radius: 0 0 12px 12px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .greeting { font-size: 22px; font-weight: 700; color: #172337; margin: 0 0 16px 0; }
  .body-text { font-size: 15px; color: #667085; line-height: 1.6; margin: 0 0 24px 0; }
  .btn { display: inline-block; background: #FF9900; color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; margin: 8px 0 24px 0; }
  .otp-box { background: #F3F5F8; border: 2px dashed #D9E0E8; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
  .otp-code { font-size: 42px; font-weight: 900; color: #0F1B2D; letter-spacing: 12px; margin: 0; font-family: monospace; }
  .otp-expires { font-size: 13px; color: #667085; margin: 8px 0 0 0; }
  .divider { border: none; border-top: 1px solid #D9E0E8; margin: 24px 0; }
  .warning-box { background: #FFF8F0; border-left: 4px solid #FF9900; border-radius: 4px; padding: 16px; margin: 24px 0; font-size: 14px; color: #172337; }
  .footer { text-align: center; padding: 24px 0 8px 0; font-size: 12px; color: #94A3B8; }
  .footer a { color: #FF9900; text-decoration: none; }
  .security-note { font-size: 12px; color: #94A3B8; margin: 16px 0 0 0; }
  @media (max-width: 600px) { .card { padding: 24px 20px; } .otp-code { font-size: 32px; letter-spacing: 8px; } }
</style>
</head>
<body>
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
<div class="wrapper">
  <div class="header">
    <p class="header-logo">BIGSALE</p>
    <p class="header-tagline">Global Electronics & Electricals</p>
  </div>
  <div class="card">
    ${content}
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} BIGSALE — Global Electronics & Electricals Marketplace</p>
    <p>Need help? <a href="mailto:support@bigsale.com">support@bigsale.com</a></p>
  </div>
</div>
</body>
</html>`;

export const welcomeTemplate = (firstName: string, verificationUrl: string): string =>
  baseTemplate(`
    <p class="greeting">Welcome to BIGSALE, ${firstName}! 🎉</p>
    <p class="body-text">
      Your account has been created successfully. You now have access to thousands of electronics, 
      exclusive deals, and our full marketplace experience.
    </p>
    <p class="body-text">
      Please verify your email address to unlock all features including order tracking, 
      wishlist, and trade-in services.
    </p>
    <div style="text-align: center;">
      <a class="btn" href="${verificationUrl}">Verify My Email</a>
    </div>
    <p class="body-text">
      Or copy this link into your browser:<br>
      <span style="font-size:12px;color:#94A3B8;word-break:break-all;">${verificationUrl}</span>
    </p>
    <div class="warning-box">
      ⏰ This verification link expires in <strong>24 hours</strong>. If it expires, you can request a new one from your account settings.
    </div>
    <p class="security-note">If you didn't create a BIGSALE account, you can safely ignore this email.</p>
  `, `Welcome to BIGSALE — please verify your email to get started`);

export const verificationTemplate = (firstName: string, verificationUrl: string, expiresHours = 24): string =>
  baseTemplate(`
    <p class="greeting">Verify your email, ${firstName}</p>
    <p class="body-text">
      Click the button below to verify your email address. This keeps your BIGSALE account secure.
    </p>
    <div style="text-align: center;">
      <a class="btn" href="${verificationUrl}">Verify Email Address</a>
    </div>
    <p class="body-text" style="font-size:13px;">
      Or copy this link:<br>
      <span style="color:#94A3B8;word-break:break-all;">${verificationUrl}</span>
    </p>
    <div class="warning-box">
      ⏰ This link expires in <strong>${expiresHours} hours</strong>.
    </div>
    <p class="security-note">If you didn't request this, ignore this email. Your account remains secure.</p>
  `, `Email verification for your BIGSALE account`);

export const otpTemplate = (firstName: string, otp: string, expiresMinutes = 10, purpose = 'verification'): string =>
  baseTemplate(`
    <p class="greeting">Your BIGSALE verification code</p>
    <p class="body-text">Hi ${firstName}, use the code below to complete your ${purpose}:</p>
    <div class="otp-box">
      <p class="otp-code">${otp}</p>
      <p class="otp-expires">⏰ Expires in ${expiresMinutes} minutes</p>
    </div>
    <div class="warning-box">
      🔒 <strong>Never share this code</strong> with anyone. BIGSALE will never ask for your OTP via phone or chat.
    </div>
    <p class="security-note">If you didn't request this code, your account may be at risk. Contact support immediately.</p>
  `, `Your BIGSALE OTP: ${otp} — expires in ${expiresMinutes} minutes`);

export const passwordResetTemplate = (firstName: string, resetUrl: string, expiresHours = 1): string =>
  baseTemplate(`
    <p class="greeting">Reset your password, ${firstName}</p>
    <p class="body-text">
      We received a request to reset the password for your BIGSALE account. 
      Click the button below to set a new password.
    </p>
    <div style="text-align: center;">
      <a class="btn" href="${resetUrl}">Reset My Password</a>
    </div>
    <p class="body-text" style="font-size:13px;">
      Or copy this link:<br>
      <span style="color:#94A3B8;word-break:break-all;">${resetUrl}</span>
    </p>
    <div class="warning-box">
      ⏰ This link expires in <strong>${expiresHours} hour${expiresHours !== 1 ? 's' : ''}</strong> and can only be used once.
    </div>
    <hr class="divider">
    <p class="security-note">
      🔒 If you didn't request a password reset, please ignore this email or contact our support team 
      immediately if you believe your account has been compromised.
    </p>
  `, `Password reset requested for your BIGSALE account`);

export const adminNotificationTemplate = (subject: string, body: string, metadata?: Record<string, any>): string =>
  baseTemplate(`
    <p class="greeting">🔔 Admin Notification</p>
    <p class="body-text"><strong>${subject}</strong></p>
    <div style="background:#F3F5F8;border-radius:8px;padding:20px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#172337;white-space:pre-wrap;">${body}</p>
    </div>
    ${metadata ? `
    <hr class="divider">
    <p style="font-size:13px;color:#667085;margin:0 0 8px 0;font-weight:600;">Metadata</p>
    <table style="width:100%;font-size:13px;color:#667085;border-collapse:collapse;">
      ${Object.entries(metadata).map(([k, v]) => `
        <tr>
          <td style="padding:4px 8px 4px 0;font-weight:600;white-space:nowrap;">${k}</td>
          <td style="padding:4px 0;word-break:break-all;">${String(v)}</td>
        </tr>
      `).join('')}
    </table>` : ''}
    <p class="security-note">This is an automated admin notification from BIGSALE backend.</p>
  `, `Admin: ${subject}`);

export const announcementTemplate = (
  subject: string,
  headline: string,
  body: string,
  ctaText?: string,
  ctaUrl?: string
): string =>
  baseTemplate(`
    <div style="background:linear-gradient(135deg,#FF9900,#FFD814);border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0F1B2D;">ANNOUNCEMENT</p>
      <p style="margin:8px 0 0 0;font-size:22px;font-weight:900;color:#0F1B2D;">${headline}</p>
    </div>
    <p class="body-text">${body}</p>
    ${ctaText && ctaUrl ? `<div style="text-align:center;"><a class="btn" href="${ctaUrl}">${ctaText}</a></div>` : ''}
    <p class="security-note">You received this because you are a registered BIGSALE customer. To unsubscribe, update your preferences in account settings.</p>
  `, headline);

