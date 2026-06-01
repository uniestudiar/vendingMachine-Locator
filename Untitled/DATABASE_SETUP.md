# VendLocate Pro - Supabase Database Setup

## CRITICAL SECURITY NOTE
**NEVER STORE CREDIT CARD INFORMATION IN THE DATABASE**
- This violates PCI DSS compliance
- Exposes you to massive liability
- Can result in fines up to $500,000
- Use Stripe or similar payment processors only

## Database Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  outreach_email TEXT,
  smtp_app_password TEXT,
  search_address TEXT,
  search_city TEXT,
  search_state TEXT,
  search_zip TEXT,
  preferred_radius_miles INTEGER,
  email_template TEXT, -- Custom email template for outreach
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  radius_miles INTEGER NOT NULL,
  business_types JSONB NOT NULL, -- Array of selected business type IDs
  extra_selections INTEGER DEFAULT 0,
  premium_types JSONB DEFAULT '[]'::JSONB, -- Array of premium type IDs
  total_price DECIMAL(10,2) NOT NULL,
  location_address TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_state TEXT NOT NULL,
  location_zip TEXT NOT NULL,
  location_lat DECIMAL(10,7),
  location_lng DECIMAL(10,7),
  stripe_payment_intent_id TEXT, -- Stripe payment reference
  stripe_customer_id TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  leads_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  has_website BOOLEAN DEFAULT TRUE,
  place_id TEXT UNIQUE, -- Google Places ID
  profit_score INTEGER, -- 50-90 ranking
  estimated_foot_traffic TEXT,
  distance_from_client DECIMAL(5,2), -- in miles
  ranking INTEGER, -- 1-100 score
  status TEXT DEFAULT 'new', -- new, contacted_once, responded, follow_up_sent
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_date TIMESTAMP WITH TIME ZONE,
  responded BOOLEAN DEFAULT FALSE,
  response_date TIMESTAMP WITH TIME ZONE,
  follow_up_sent BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email tracking table
CREATE TABLE IF NOT EXISTS sent_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'initial', 'follow_up'
  subject TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- Email verification codes
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_purchase_id ON leads(purchase_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_place_id ON leads(place_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_lead_id ON sent_emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_user_id ON sent_emails(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sent_emails_user_email_type
  ON sent_emails(user_id, email_address, email_type);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Purchases policies
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sent emails policies
CREATE POLICY "Users can view own sent emails" ON sent_emails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sent emails" ON sent_emails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Email verification codes policies
CREATE POLICY "Users can view own codes" ON email_verification_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own codes" ON email_verification_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Environment Variables Needed

Add these to your Supabase Edge Function secrets:

```bash
# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_... # Get from https://dashboard.stripe.com/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email service (for sending outreach emails)
SMTP_EMAIL=your-email@gmail.com
SMTP_APP_PASSWORD=your-app-password

# Google Maps API (for finding locations)
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Hunter.io API (for finding business emails)
HUNTER_API_KEY=your-hunter-api-key

# Python CSV sync to Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_USER_ID=the-user-id-for-this-run
SUPABASE_PURCHASE_ID=optional-purchase-id-override
```

## Initial Data Migration

To import your existing CSV data into Supabase:

1. Go to your Supabase project
2. Navigate to Table Editor
3. Select the `leads` table
4. Click "Insert" > "Import data from CSV"
5. Upload `vending_leads.csv`
6. Map columns appropriately

## Next Steps

1. Run the SQL commands above in Supabase SQL Editor
2. Set up Stripe account and get API keys
3. Add environment variables to Supabase Edge Functions
4. Deploy the server code
5. Test authentication and payment flow
