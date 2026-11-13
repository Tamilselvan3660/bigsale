import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail, verifySmtpConnection, isSmtpVerified } from '../config/mailer';
import {
  welcomeTemplate,
  verificationTemplate,
  otpTemplate,
  passwordResetTemplate,
  adminNotificationTemplate,
  announcementTemplate,
} from '../config/emailTemplates';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generate6DigitOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

const OTP_EXPIRES_MS = parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10) * 60 * 1000;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const OTP_COOLDOWN_MS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10) * 1000;
const EMAIL_VERIFY_EXPIRES_MS = parseInt(process.env.EMAIL_VERIFICATION_EXPIRES_HOURS || '24', 10) * 60 * 60 * 1000;
const PWD_RESET_EXPIRES_MS = parseInt(process.env.PASSWORD_RESET_EXPIRES_HOURS || '1', 10) * 60 * 60 * 1000;

// ─── Admin: Test email ───────────────────────────────────────────────────────

const testEmailSchema = z.object({
  to: z.string().email('Invalid recipient email'),
  subject: z.string().min(1).optional(),
});

export const sendTestEmail = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { to, subject } = testEmailSchema.parse(req.body);
    const result = await sendEmail({
      to,
      subject: subject || 'BIGSALE — SMTP Test Email',
      html: adminNotificationTemplate(
        'SMTP Test',
        'This is a test email confirming your SMTP configuration is working correctly.',
        { sentAt: new Date().toISOString(), sentBy: req.user?.email || 'admin', environment: process.env.NODE_ENV || 'development' }
      ),
    });
    res.status(200).json({ success: true, message: result.success ? 'Test email sent' : 'SMTP not configured — simulated output logged', data: result });
  } catch (err) { next(err); }
};

// ─── Admin: Verify SMTP connection ──────────────────────────────────────────

export const verifyConnection = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ok = await verifySmtpConnection();
    res.status(200).json({
      success: true,
      data: {
        connected: ok,
        verified: isSmtpVerified(),
        host: process.env.SMTP_HOST || 'not set',
        port: process.env.SMTP_PORT || 'not set',
        user: process.env.SMTP_USER ? '***@' + (process.env.SMTP_USER.split('@')[1] || 'domain') : 'not set',
        message: ok ? 'SMTP connection established' : 'SMTP not configured or unreachable',
      },
    });
  } catch (err) { next(err); }
};

// ─── Send OTP ────────────────────────────────────────────────────────────────

const sendOtpSchema = z.object({
  email: z.string().email('Invalid email'),
  purpose: z.enum(['LOGIN', 'VERIFY', 'PASSWORD_RESET']),
});

export const sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, purpose } = sendOtpSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Don't reveal if email exists
      res.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
      return;
    }

    // Check cooldown
    const existing = await prisma.otpCode.findFirst({ where: { userId: user.id, purpose } });
    if (existing && existing.lastSentAt) {
      const cooldownEnd = new Date(existing.lastSentAt).getTime() + OTP_COOLDOWN_MS;
      if (Date.now() < cooldownEnd) {
        const secondsLeft = Math.ceil((cooldownEnd - Date.now()) / 1000);
        throw new AppError(`Please wait ${secondsLeft} seconds before requesting another OTP`, 429);
      }
    }

    const otp = generate6DigitOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_MS).toISOString();
    const now = new Date().toISOString();

    if (existing) {
      await prisma.otpCode.update({
        where: { id: existing.id },
        data: { otpHash, expiresAt, attempts: 0, lastSentAt: now, verified: false },
      });
    } else {
      await prisma.otpCode.create({
        data: { id: uuidv4(), userId: user.id, email: user.email, purpose, otpHash, expiresAt, attempts: 0, lastSentAt: now, verified: false, createdAt: now },
      });
    }

    const expiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10);
    await sendEmail({
      to: user.email,
      subject: `Your BIGSALE verification code: ${otp}`,
      html: otpTemplate(user.firstName || 'Customer', otp, expiresMinutes, purpose.toLowerCase().replace('_', ' ')),
    });

    res.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
  } catch (err) { next(err); }
};

// ─── Verify OTP ──────────────────────────────────────────────────────────────

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  purpose: z.enum(['LOGIN', 'VERIFY', 'PASSWORD_RESET']),
});

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp, purpose } = verifyOtpSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new AppError('Invalid or expired OTP', 400);

    const record = await prisma.otpCode.findFirst({ where: { userId: user.id, purpose } });
    if (!record) throw new AppError('No OTP found. Please request a new one.', 400);

    if (new Date(record.expiresAt) < new Date()) {
      await prisma.otpCode.deleteMany({ where: { id: record.id } });
      throw new AppError('OTP has expired. Please request a new one.', 400);
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.otpCode.deleteMany({ where: { id: record.id } });
      throw new AppError('Too many failed attempts. Please request a new OTP.', 429);
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: (record.attempts || 0) + 1 } });
      const remaining = OTP_MAX_ATTEMPTS - (record.attempts + 1);
      throw new AppError(`Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`, 400);
    }

    // Valid — clean up and mark user verified if applicable
    await prisma.otpCode.deleteMany({ where: { id: record.id } });
    if (purpose === 'VERIFY') {
      await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
    }

    res.status(200).json({ success: true, message: 'OTP verified successfully', data: { purpose, email: user.email } });
  } catch (err) { next(err); }
};

// ─── Send Welcome Email ───────────────────────────────────────────────────────

export const sendWelcomeEmail = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new AppError('User not found', 404);

    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFY_EXPIRES_MS).toISOString();
    await prisma.emailVerification.create({
      data: { id: uuidv4(), userId: user.id, tokenHash, expiresAt, createdAt: new Date().toISOString() },
    });

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    const result = await sendEmail({
      to: user.email,
      subject: 'Welcome to BIGSALE — Please Verify Your Email',
      html: welcomeTemplate(user.firstName || 'Customer', verificationUrl),
    });

    res.status(200).json({ success: true, message: 'Welcome email queued', data: result });
  } catch (err) { next(err); }
};

// ─── Admin: Send Notification ─────────────────────────────────────────────────

const notificationSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

export const sendNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { to, subject, message } = notificationSchema.parse(req.body);
    const result = await sendEmail({
      to,
      subject,
      html: adminNotificationTemplate(subject, message, { sentBy: req.user?.email, sentAt: new Date().toISOString() }),
    });
    res.status(200).json({ success: true, message: 'Notification sent', data: result });
  } catch (err) { next(err); }
};

// ─── Resend Verification ─────────────────────────────────────────────────────

export const resendVerification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new AppError('User not found', 404);
    if (user.isVerified) {
      res.status(200).json({ success: true, message: 'Email is already verified' });
      return;
    }

    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFY_EXPIRES_MS).toISOString();
    await prisma.emailVerification.create({
      data: { id: uuidv4(), userId: user.id, tokenHash, expiresAt, createdAt: new Date().toISOString() },
    });

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'BIGSALE — Verify Your Email Address',
      html: verificationTemplate(user.firstName || 'Customer', verificationUrl),
    });

    res.status(200).json({ success: true, message: 'Verification email sent. Check your inbox.' });
  } catch (err) { next(err); }
};

// ─── Verify Email (GET from link) ────────────────────────────────────────────

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.query.token as string;
    if (!token || typeof token !== 'string') throw new AppError('Invalid verification token', 400);

    const tokenHash = hashToken(token);
    const record = await prisma.emailVerification.findUnique({ where: { tokenHash } });
    if (!record) throw new AppError('Invalid or already used verification link', 400);
    if (record.usedAt) throw new AppError('This verification link has already been used', 400);
    if (new Date(record.expiresAt) < new Date()) throw new AppError('Verification link has expired. Please request a new one.', 400);

    await prisma.emailVerification.update({ where: { id: record.id }, data: { usedAt: new Date().toISOString() } });
    await prisma.user.update({ where: { id: record.userId }, data: { isVerified: true } });

    // Redirect or return success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/verify-email?success=true`);
  } catch (err) { next(err); }
};

// ─── Forgot Password ─────────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({ email: z.string().email() });

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (user) {
      const token = generateSecureToken();
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + PWD_RESET_EXPIRES_MS).toISOString();
      await prisma.passwordReset.create({
        data: { id: uuidv4(), userId: user.id, tokenHash, expiresAt, createdAt: new Date().toISOString() },
      });

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
      await sendEmail({
        to: user.email,
        subject: 'BIGSALE — Reset Your Password',
        html: passwordResetTemplate(user.firstName || 'Customer', resetUrl),
      });
    }

    res.status(200).json({
      success: true,
      message: 'If this email is registered, you will receive a password reset link shortly.',
    });
  } catch (err) { next(err); }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const tokenHash = hashToken(token);

    const record = await prisma.passwordReset.findUnique({ where: { tokenHash } });
    if (!record) throw new AppError('Invalid or expired reset token', 400);
    if (record.usedAt) throw new AppError('This reset link has already been used', 400);
    if (new Date(record.expiresAt) < new Date()) throw new AppError('Reset link has expired. Please request a new one.', 400);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({ where: { id: record.userId }, data: { password: hashedPassword } });
    await prisma.passwordReset.update({ where: { id: record.id }, data: { usedAt: new Date().toISOString() } });

    res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) { next(err); }
};

