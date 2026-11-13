import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect, authorize } from '../middleware/auth';
import {
  sendTestEmail,
  verifyConnection,
  sendOtp,
  verifyOtp,
  sendWelcomeEmail,
  sendNotification,
  resendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/email.controller';

const router = Router();

// Strict OTP rate limiter — 3 requests per minute per IP
const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many OTP requests. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth email rate limiter — 5 requests per 15 min per IP
const authEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Admin-only endpoints ─────────────────────────────────────────────────────
router.post('/test', protect, authorize('ADMIN'), sendTestEmail);
router.post('/verify-connection', protect, authorize('ADMIN'), verifyConnection);
router.post('/send-notification', protect, authorize('ADMIN'), sendNotification);
router.post('/send-welcome', protect, authorize('ADMIN'), sendWelcomeEmail);

// ── Public endpoints with rate limiting ─────────────────────────────────────
router.post('/send-otp', otpLimiter, sendOtp);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/forgot-password', authEmailLimiter, forgotPassword);
router.post('/reset-password', authEmailLimiter, resetPassword);
router.get('/verify-email', verifyEmail);

// ── Authenticated user endpoints ─────────────────────────────────────────────
router.post('/resend-verification', protect, resendVerification);

export default router;
