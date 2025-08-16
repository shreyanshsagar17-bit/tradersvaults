const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/traders_vault',
});

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Email transporter
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit auth attempts
});

const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit checkout attempts
});

app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));

// Raw body parser for webhooks
app.use('/webhooks', express.raw({ type: 'application/json' }));

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Subscription middleware
const requireActiveOrTrial = async (req, res, next) => {
  const user = req.user;
  const now = new Date();

  // Check trial
  if (user.trial_ends_at && now <= new Date(user.trial_ends_at)) {
    return next();
  }

  // Check active subscription
  if (user.subscription_status === 'active' && user.plan_renews_at && now < new Date(user.plan_renews_at)) {
    return next();
  }

  return res.status(403).json({ 
    error: 'Subscription required',
    redirect: '/pricing',
    trialExpired: true 
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Utility functions
const logAudit = async (userId, action, meta = {}) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, meta) VALUES ($1, $2, $3)',
      [userId, action, meta]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

const sendEmail = async (to, subject, html) => {
  try {
    await emailTransporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@tradersvaul.com',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
};

// Routes

// Auth routes
app.post('/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with trial
    const trialStartsAt = new Date();
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const result = await pool.query(
      `INSERT INTO users (email, name, password_hash, trial_started_at, trial_ends_at, subscription_status) 
       VALUES ($1, $2, $3, $4, $5, 'trial') RETURNING id, email, name, trial_ends_at`,
      [email, name, passwordHash, trialStartsAt, trialEndsAt]
    );

    const user = result.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    await logAudit(user.id, 'user_registered', { email, trialEndsAt });

    // Send welcome email
    await sendEmail(
      email,
      'Welcome to Traders Vault - Your 7-Day Trial Starts Now!',
      `
        <h1>Welcome to Traders Vault!</h1>
        <p>Hi ${name},</p>
        <p>Your 7-day free trial has started. You have full access to all features until ${trialEndsAt.toLocaleDateString()}.</p>
        <p><a href="${process.env.APP_BASE_URL}/dashboard">Start Trading</a></p>
      `
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        trialEndsAt: user.trial_ends_at,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    await logAudit(user.id, 'user_login');

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscription_status,
        currentPlan: user.current_plan,
        trialEndsAt: user.trial_ends_at,
        planRenewsAt: user.plan_renews_at,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User profile
app.get('/me', authenticateToken, async (req, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    subscriptionStatus: user.subscription_status,
    currentPlan: user.current_plan,
    trialStartedAt: user.trial_started_at,
    trialEndsAt: user.trial_ends_at,
    planRenewsAt: user.plan_renews_at,
  });
});

// Plans (public)
app.get('/plans', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plans WHERE active = true ORDER BY price_cents');
    res.json(result.rows);
  } catch (error) {
    console.error('Plans fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Checkout session
app.post('/checkout/session', authenticateToken, checkoutLimiter, async (req, res) => {
  try {
    const { plan_code, provider = 'razorpay' } = req.body;
    const user = req.user;

    // Validate plan
    const planResult = await pool.query('SELECT * FROM plans WHERE code = $1 AND active = true', [plan_code]);
    if (planResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const plan = planResult.rows[0];

    if (provider === 'razorpay') {
      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: plan.price_cents, // amount in paise
        currency: plan.currency,
        receipt: `order_${user.id}_${Date.now()}`,
        notes: {
          user_id: user.id,
          plan_code: plan_code,
        },
      });

      // Store payment record
      await pool.query(
        `INSERT INTO payments (user_id, plan_code, provider, order_id, amount_cents, currency, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'created')`,
        [user.id, plan_code, provider, order.id, plan.price_cents, plan.currency]
      );

      await logAudit(user.id, 'checkout_initiated', { plan_code, provider, order_id: order.id });

      res.json({
        orderId: order.id,
        amount: plan.price_cents,
        currency: plan.currency,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        userEmail: user.email,
        userName: user.name,
      });
    } else {
      res.status(400).json({ error: 'Provider not supported yet' });
    }
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Razorpay webhook
app.post('/webhooks/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(body.toString());

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      // Find payment record
      const paymentResult = await pool.query(
        'SELECT * FROM payments WHERE order_id = $1',
        [orderId]
      );

      if (paymentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const paymentRecord = paymentResult.rows[0];

      // Update payment status
      await pool.query(
        `UPDATE payments SET 
         status = 'paid', 
         payment_id = $1, 
         signature = $2, 
         raw_payload = $3 
         WHERE order_id = $4`,
        [payment.id, signature, event, orderId]
      );

      // Get plan details
      const planResult = await pool.query('SELECT * FROM plans WHERE code = $1', [paymentRecord.plan_code]);
      const plan = planResult.rows[0];

      // Calculate subscription period
      const startDate = new Date();
      const endDate = new Date();
      if (plan.interval_type === 'month') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Update user subscription
      await pool.query(
        `UPDATE users SET 
         subscription_status = 'active',
         current_plan = $1,
         plan_renews_at = $2,
         updated_at = now()
         WHERE id = $3`,
        [paymentRecord.plan_code, endDate, paymentRecord.user_id]
      );

      // Create/update subscription record
      await pool.query(
        `INSERT INTO subscriptions (user_id, plan_code, status, started_at, current_period_end)
         VALUES ($1, $2, 'active', $3, $4)
         ON CONFLICT (user_id) DO UPDATE SET
         plan_code = $2,
         status = 'active',
         started_at = $3,
         current_period_end = $4,
         updated_at = now()`,
        [paymentRecord.user_id, paymentRecord.plan_code, startDate, endDate]
      );

      await logAudit(paymentRecord.user_id, 'subscription_activated', {
        plan_code: paymentRecord.plan_code,
        payment_id: payment.id,
        amount: payment.amount,
      });

      // Send confirmation email
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [paymentRecord.user_id]);
      const user = userResult.rows[0];

      await sendEmail(
        user.email,
        'Subscription Activated - Welcome to Traders Vault Pro!',
        `
          <h1>Subscription Activated!</h1>
          <p>Hi ${user.name},</p>
          <p>Your ${plan.code} subscription has been activated successfully.</p>
          <p>Plan: ${plan.code.charAt(0).toUpperCase() + plan.code.slice(1)}</p>
          <p>Amount: ₹${(plan.price_cents / 100).toFixed(2)}</p>
          <p>Renews on: ${endDate.toLocaleDateString()}</p>
          <p><a href="${process.env.APP_BASE_URL}/dashboard">Access Your Dashboard</a></p>
        `
      );

      console.log(`Subscription activated for user ${paymentRecord.user_id}`);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Subscription status
app.get('/subscription/status', authenticateToken, async (req, res) => {
  const user = req.user;
  const now = new Date();

  let status = 'none';
  let daysLeft = 0;

  if (user.trial_ends_at && now <= new Date(user.trial_ends_at)) {
    status = 'trial';
    daysLeft = Math.ceil((new Date(user.trial_ends_at) - now) / (1000 * 60 * 60 * 24));
  } else if (user.subscription_status === 'active' && user.plan_renews_at && now < new Date(user.plan_renews_at)) {
    status = 'active';
    daysLeft = Math.ceil((new Date(user.plan_renews_at) - now) / (1000 * 60 * 60 * 24));
  }

  res.json({
    status,
    currentPlan: user.current_plan,
    trialEndsAt: user.trial_ends_at,
    planRenewsAt: user.plan_renews_at,
    daysLeft,
    subscriptionStatus: user.subscription_status,
  });
});

// Cancel subscription
app.post('/subscription/cancel', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    await pool.query(
      `UPDATE subscriptions SET 
       status = 'canceled', 
       canceled_at = now(), 
       updated_at = now() 
       WHERE user_id = $1`,
      [user.id]
    );

    await pool.query(
      `UPDATE users SET 
       subscription_status = 'canceled', 
       updated_at = now() 
       WHERE id = $1`,
      [user.id]
    );

    await logAudit(user.id, 'subscription_canceled');

    await sendEmail(
      user.email,
      'Subscription Canceled - Traders Vault',
      `
        <h1>Subscription Canceled</h1>
        <p>Hi ${user.name},</p>
        <p>Your subscription has been canceled. You'll continue to have access until your current billing period ends.</p>
        <p>We're sorry to see you go! If you change your mind, you can resubscribe anytime.</p>
      `
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Admin routes
app.get('/admin/subscriptions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.email, u.name, u.subscription_status, u.current_plan, 
             u.trial_ends_at, u.plan_renews_at, u.created_at,
             s.status as sub_status, s.started_at, s.current_period_end
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE u.subscription_status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY u.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    // Get total count
    const countQuery = status 
      ? 'SELECT COUNT(*) FROM users WHERE subscription_status = $1'
      : 'SELECT COUNT(*) FROM users';
    const countResult = await pool.query(countQuery, status ? [status] : []);
    
    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Admin subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

app.post('/admin/pricing', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { monthly_price, yearly_price } = req.body;

    if (monthly_price) {
      await pool.query(
        'UPDATE plans SET price_cents = $1 WHERE code = $2',
        [monthly_price * 100, 'monthly']
      );
    }

    if (yearly_price) {
      await pool.query(
        'UPDATE plans SET price_cents = $1 WHERE code = $2',
        [yearly_price * 100, 'yearly']
      );
    }

    await logAudit(req.user.id, 'pricing_updated', { monthly_price, yearly_price });

    res.json({ success: true });
  } catch (error) {
    console.error('Pricing update error:', error);
    res.status(500).json({ error: 'Failed to update pricing' });
  }
});

// Protected route example
app.get('/protected/data', authenticateToken, requireActiveOrTrial, async (req, res) => {
  res.json({ message: 'This is protected data', user: req.user.email });
});

// Cron jobs for subscription management
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily subscription checks...');
  
  try {
    const now = new Date();

    // Mark past due subscriptions
    await pool.query(
      `UPDATE users SET 
       subscription_status = 'past_due', 
       updated_at = now() 
       WHERE subscription_status = 'active' 
       AND plan_renews_at < $1`,
      [now]
    );

    // Send trial ending reminders (2 days before)
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const trialEndingUsers = await pool.query(
      `SELECT * FROM users 
       WHERE subscription_status = 'trial' 
       AND trial_ends_at BETWEEN $1 AND $2`,
      [now, twoDaysFromNow]
    );

    for (const user of trialEndingUsers.rows) {
      const daysLeft = Math.ceil((new Date(user.trial_ends_at) - now) / (1000 * 60 * 60 * 24));
      await sendEmail(
        user.email,
        `Your Traders Vault Trial Ends in ${daysLeft} Days`,
        `
          <h1>Trial Ending Soon</h1>
          <p>Hi ${user.name},</p>
          <p>Your 7-day trial ends in ${daysLeft} days. Don't lose access to your trading data!</p>
          <p><a href="${process.env.APP_BASE_URL}/pricing">Subscribe Now</a></p>
        `
      );
    }

    // Send renewal reminders (3 days before)
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const renewalUsers = await pool.query(
      `SELECT * FROM users 
       WHERE subscription_status = 'active' 
       AND plan_renews_at BETWEEN $1 AND $2`,
      [now, threeDaysFromNow]
    );

    for (const user of renewalUsers.rows) {
      const daysLeft = Math.ceil((new Date(user.plan_renews_at) - now) / (1000 * 60 * 60 * 24));
      await sendEmail(
        user.email,
        `Your Traders Vault Subscription Renews in ${daysLeft} Days`,
        `
          <h1>Subscription Renewal</h1>
          <p>Hi ${user.name},</p>
          <p>Your ${user.current_plan} subscription renews in ${daysLeft} days.</p>
          <p>Amount: ₹${(await pool.query('SELECT price_cents FROM plans WHERE code = $1', [user.current_plan])).rows[0]?.price_cents / 100}</p>
          <p><a href="${process.env.APP_BASE_URL}/subscription">Manage Subscription</a></p>
        `
      );
    }

    console.log('Daily subscription checks completed');
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'subscription-api'
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Subscription API server running on port ${PORT}`);
  console.log(`💳 Razorpay integration: ${process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Not configured'}`);
  console.log(`📧 Email service: ${process.env.SMTP_USER ? 'Configured' : 'Not configured'}`);
});