import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

let transporter: nodemailer.Transporter | null = null;
let smtpVerified = false;

export function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
  }
  return transporter;
}

export async function verifySmtpConnection(): Promise<boolean> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass || user === 'your-email@gmail.com') {
    console.warn('[SMTP] SMTP credentials not configured — email sending running in simulated mode');
    smtpVerified = false;
    return false;
  }
  try {
    await getTransporter().verify();
    smtpVerified = true;
    console.log('[SMTP] ✅ SMTP connection verified successfully');
    return true;
  } catch (err: any) {
    smtpVerified = false;
    console.warn('[SMTP] ⚠️  SMTP connection failed:', err.message);
    return false;
  }
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass || user === 'your-email@gmail.com') {
    console.log(`[SMTP Simulated] Email To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to} | Subject: ${options.subject}`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }
  try {
    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM || `"BIGSALE" <${user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      replyTo: options.replyTo,
    });
    console.log(`[SMTP] ✅ Email sent — messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[SMTP] ❌ Email send failed:', err.message);
    return { success: false, error: err.message };
  }
}

export function isSmtpVerified(): boolean {
  return smtpVerified;
}

export function validateSmtpEnv(): void {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(k => !process.env[k] || process.env[k] === 'your-email@gmail.com');
  if (missing.length > 0) {
    console.warn(`[SMTP] Missing or default env vars: ${missing.join(', ')}`);
  }
}

export default { getTransporter, verifySmtpConnection, sendEmail, isSmtpVerified, validateSmtpEnv };
