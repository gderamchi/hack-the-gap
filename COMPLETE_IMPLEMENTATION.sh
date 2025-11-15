#!/bin/bash

echo "🚀 Starting FirstToPay Implementation..."
echo ""

cd /Users/guillaume_deramchi/Documents/hack-the-gap/mobile-app/backend

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate

# Step 2: Run Migrations
echo "🗄️  Step 2: Running Database Migrations..."
npx prisma migrate dev --name add_firsttopay_models

# Step 3: Update .env file
echo "⚙️  Step 3: Updating Environment Variables..."
if [ ! -f .env ]; then
  cp .env.example .env
fi

# Add JWT_SECRET if not exists
if ! grep -q "JWT_SECRET" .env; then
  echo "" >> .env
  echo "# Authentication" >> .env
  echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
fi

# Add Stripe keys placeholders if not exists
if ! grep -q "STRIPE_SECRET_KEY" .env; then
  echo "" >> .env
  echo "# Stripe Payment (Add your keys)" >> .env
  echo "STRIPE_SECRET_KEY=sk_test_your_key_here" >> .env
  echo "STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here" >> .env
  echo "STRIPE_WEBHOOK_SECRET=whsec_your_secret_here" >> .env
fi

echo ""
echo "✅ Backend Implementation Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Add your Stripe API keys to mobile-app/backend/.env"
echo "2. Start the backend: cd mobile-app/backend && npm run dev"
echo "3. The new API endpoints are ready:"
echo "   - POST /api/auth/register"
echo "   - POST /api/auth/login"
echo "   - GET /api/auth/me"
echo "   - POST /api/community/signals"
echo "   - GET /api/community/trust/:influencerId"
echo ""
echo "🎉 FirstToPay models and authentication are now implemented!"
echo ""
