# Traders Vault - Complete Subscription System

A professional trading journal with integrated subscription management, payment processing, and broker connections.

## 🚀 Features

### Subscription System
- **7-day free trial** for all new users
- **Monthly (₹999)** and **Yearly (₹9,999)** plans with 17% savings
- **Razorpay integration** supporting Cards, UPI, Net Banking, and Wallets
- **Stripe fallback** for international card payments
- **Automated billing** with email notifications
- **Admin dashboard** for subscription management

### Trading Features
- Advanced analytics and performance tracking
- AI-powered trading insights
- Social trading and community features
- Multi-broker integration (Zerodha, Fyers, Upstox, etc.)
- Real-time market data streaming
- Options trading calculator
- Custom portfolio management

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Chart.js** for analytics
- **Razorpay Checkout** for payments

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **Razorpay API** for payments
- **JWT** authentication
- **Nodemailer** for emails
- **WebSocket** for real-time data

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Razorpay account (for payments)

### 1. Clone and Install
```bash
git clone <repository-url>
cd traders-vault
npm install
```

### 2. Database Setup
```bash
# Create database
createdb traders_vault

# Run schema
psql traders_vault < server/database/schema.sql
```

### 3. Environment Configuration
```bash
# Copy environment template
cp server/.env.example server/.env

# Edit server/.env with your credentials:
# - DATABASE_URL
# - RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET
# - JWT_SECRET
# - SMTP credentials
```

### 4. Start Development Servers
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Subscription API
npm run server

# Or run both together:
npm run dev:full
```

## 🔧 Configuration

### Razorpay Setup
1. Create account at [razorpay.com](https://razorpay.com)
2. Get API keys from Dashboard → Settings → API Keys
3. Set up webhook endpoint: `https://your-domain.com/webhooks/razorpay`
4. Configure webhook events: `payment.captured`, `payment.failed`

### Email Setup (Gmail example)
1. Enable 2-factor authentication
2. Generate app password
3. Use app password in `SMTP_PASS`

### Database Schema
The system automatically creates these tables:
- `users` - User accounts with subscription status
- `plans` - Subscription plans (monthly/yearly)
- `subscriptions` - Active subscription records
- `payments` - Payment transaction history
- `audit_logs` - System activity logs

## 🔄 Payment Flow

### 1. User Registration
```
POST /auth/register
→ Creates user with 7-day trial
→ Sets trial_ends_at = now() + 7 days
→ Sends welcome email
```

### 2. Subscription Purchase
```
Frontend: User selects plan → /pay?plan=monthly
Frontend: POST /checkout/session → Creates Razorpay order
Frontend: Opens Razorpay Checkout
User: Completes payment
Razorpay: Sends webhook to /webhooks/razorpay
Backend: Verifies signature → Updates subscription
Backend: Sends confirmation email
Frontend: Redirects to success page
```

### 3. Access Control
```
Middleware: requireActiveOrTrial
→ Checks trial_ends_at OR (subscription_status='active' AND now < plan_renews_at)
→ Allows access OR returns 403 with redirect to /pricing
```

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Create account with trial
- `POST /auth/login` - User login
- `GET /me` - Get user profile

### Subscriptions
- `GET /plans` - Get available plans (public)
- `POST /checkout/session` - Create payment session
- `GET /subscription/status` - Get subscription status
- `POST /subscription/cancel` - Cancel subscription

### Webhooks
- `POST /webhooks/razorpay` - Razorpay payment webhook
- `POST /webhooks/stripe` - Stripe payment webhook (optional)

### Admin
- `GET /admin/subscriptions` - List all users with filters
- `POST /admin/pricing` - Update plan pricing

## 🔒 Security Features

- **HMAC signature verification** for webhooks
- **Rate limiting** on auth and checkout endpoints
- **JWT token authentication** with secure secrets
- **Password hashing** with bcrypt
- **SQL injection protection** with parameterized queries
- **CORS configuration** for frontend domain
- **Helmet.js** for security headers

## 🤖 Automation

### Daily Cron Jobs (9 AM)
- Mark past due subscriptions
- Send trial ending reminders (T-2, T-1 days)
- Send renewal reminders (T-3 days)
- Update subscription statuses

### Email Notifications
- Welcome email on registration
- Trial ending warnings
- Subscription activation confirmation
- Renewal reminders
- Cancellation confirmation

## 🎨 Frontend Components

### Pages
- `/pricing` - Public pricing page with plan comparison
- `/pay` - Payment page with Razorpay integration
- `/pay/success` - Payment confirmation page
- `/subscription` - Subscription management
- `/admin/subscriptions` - Admin subscription dashboard

### Components
- `SubscriptionGuard` - Protects routes requiring active subscription
- `TrialBanner` - Shows trial status and upgrade prompts
- `SubscriptionModal` - In-app upgrade modal

## 🚀 Deployment

### Environment Variables (Production)
```bash
DATABASE_URL=postgresql://prod-db-url
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_live_secret
APP_BASE_URL=https://your-domain.com
JWT_SECRET=your-production-secret
```

### Build Commands
```bash
# Frontend build
npm run build

# Start production server
npm start
```

## 📈 Monitoring

### Key Metrics to Track
- Trial to paid conversion rate
- Monthly recurring revenue (MRR)
- Churn rate
- Payment success/failure rates
- User engagement during trial

### Logs
- All subscription events logged to `audit_logs`
- Payment webhooks logged with full payload
- Failed payments and errors tracked

## 🆘 Troubleshooting

### Common Issues

**Webhook not receiving events:**
- Check Razorpay webhook URL configuration
- Verify webhook secret matches environment variable
- Check server logs for signature verification errors

**Payment not activating subscription:**
- Verify webhook signature validation
- Check database connection
- Review audit logs for payment processing

**Trial not working:**
- Verify trial dates are set correctly on registration
- Check `requireActiveOrTrial` middleware logic
- Ensure frontend checks subscription status

### Support
- Email: support@tradersvaul.com
- Documentation: [Link to docs]
- Status Page: [Link to status page]

## 📄 License

Proprietary - All rights reserved