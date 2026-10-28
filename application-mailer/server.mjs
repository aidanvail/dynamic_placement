import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { basename } from 'node:path';

const required = [
  'PUBLIC_ORIGIN', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD',
  'MAIL_FROM', 'TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET'
];
const missing = required.filter((name) => !process.env[name] || process.env[name].startsWith('REPLACE_'));
if (missing.length) {
  throw new Error('Missing configuration: ' + missing.join(', '));
}
const origin = new URL(process.env.PUBLIC_ORIGIN).origin;
const recipient = process.env.APPLICATION_TO || 'liesel@placedynamics.co.za';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  requireTLS: smtpPort !== 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  tls: { minVersion: 'TLSv1.2' },
  connectionTimeout: 12000,
  greetingTimeout: 8000,
  socketTimeout: 20000
});
const app = express();
app.disable('x-powered-by');
// Only trust the single HTTPS reverse proxy. Do not expose the application port publicly.
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://challenges.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://challenges.cloudflare.com'],
      frameSrc: ['https://challenges.cloudflare.com'],
      connectSrc: ["'self'", 'https://challenges.cloudflare.com'],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  }
}));
app.use(express.static(new URL('./public/', import.meta.url).pathname, { index: 'index.html', dotfiles: 'deny' }));

app.get('/healthz', (_, res) => res.json({ ok: true }));
app.get('/api/config', (_, res) => res.json({ siteKey: process.env.TURNSTILE_SITE_KEY }));

const upload = multer({
  storage: multer.memoryStorage(), // Never save uploaded CVs or photos on disk.
  limits: { files: 2, fields: 8, parts: 10, fileSize: 6 * 1024 * 1024, fieldSize: 2048 }
}).fields([{ name: 'cv', maxCount: 1 }, { name: 'photo', maxCount: 1 }]);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-8',
  legacyHeaders: false, message: { error: 'Too many attempts. Please try again later.' }
});
const clean = (value, max) => String(value || '')
  .replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const pdf = (b) => b.subarray(0, 5).toString('ascii') === '%PDF-';
const zip = (b) => b.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))
  && b.includes(Buffer.from('word/document.xml'));
const doc = (b) => b.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
const jpg = (b) => b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
const png = (b) => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
function validFile(file, kind) {
  if (!file || !file.buffer || file.size === 0) return false;
  const name = basename(file.originalname || '').toLowerCase();
  return kind === 'cv'
    ? ((name.endsWith('.pdf') && pdf(file.buffer))
      || (name.endsWith('.docx') && zip(file.buffer))
      || (name.endsWith('.doc') && doc(file.buffer)))
    : ((name.endsWith('.jpg') || name.endsWith('.jpeg')) && jpg(file.buffer))
      || (name.endsWith('.png') && png(file.buffer));
}
const safeFilename = (name, fallback) => (basename(name || fallback).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100) || fallback);
async function verifyTurnstile(token, ip) {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET, response: token, remoteip: ip || ''
    }),
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw new Error('Turnstile unavailable');
  const result = await response.json();
  return result.success === true && (!result.hostname || new URL(origin).hostname === result.hostname);
}
app.post('/api/apply', limiter, (req, res, next) => {
  if (req.get('origin') && req.get('origin') !== origin) {
    return res.status(403).json({ error: 'Invalid origin.' });
  }
  upload(req, res, next);
}, async (req, res) => {
  if (req.body.website) return res.json({ ok: true });
  const name = clean(req.body.name, 120);
  const email = clean(req.body.email, 254);
  const phone = clean(req.body.phone, 40);
  const job = clean(req.body.job, 150);
  const message = clean(req.body.message, 1500);
  const cv = req.files?.cv?.[0];
  const photo = req.files?.photo?.[0];
  if (!name || !job || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      req.body.consent !== 'yes' || !validFile(cv, 'cv') || !validFile(photo, 'photo')) {
    return res.status(422).json({ error: 'Complete the required fields and attach a valid CV and headshot.' });
  }
  const token = clean(req.body['cf-turnstile-response'], 2048);
  if (!token) return res.status(422).json({ error: 'Please complete the security check.' });
  let verified;
  try {
    verified = await verifyTurnstile(token, req.ip);
  } catch {
    return res.status(503).json({ error: 'Security verification is unavailable. Please try again.' });
  }
  if (!verified) return res.status(422).json({ error: 'Security verification failed. Please try again.' });

  const body = [
    'New direct application for Placement Dynamics',
    'Job: ' + job, 'Candidate: ' + name, 'Email: ' + email,
    'Phone: ' + (phone || 'Not supplied'), 'Message: ' + (message || 'None'),
    '', 'CV and headshot are attached.', 'Application consent: supplied.'
  ].join('\n');
  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: recipient,
      replyTo: { name, address: email },
      subject: '[Placement Dynamics] Application: ' + job,
      text: body,
      attachments: [
        { filename: safeFilename(cv.originalname, 'CV.pdf'), content: cv.buffer },
        { filename: safeFilename(photo.originalname, 'Photo.jpg'), content: photo.buffer }
      ]
    });
    // No application records, attachments or personal details are persisted by this service.
    return res.status(201).json({ ok: true });
  } catch {
    console.error('Application email delivery failed; no candidate data logged.');
    return res.status(503).json({ error: 'The application could not be delivered. Please retry.' });
  }
});
app.use((err, _, res, __) => {
  if (err instanceof multer.MulterError) {
    return res.status(413).json({ error: 'File size or submission limit exceeded (6 MB per file).' });
  }
  console.error('Application handler error:', err?.name || 'Unknown');
  return res.status(500).json({ error: 'Unable to process the application.' });
});
app.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => {
  console.info('Placement Dynamics application mailer listening.');
});
