-- ============================================================
-- Kappersklok Row Level Security Policies
-- Run this in the Supabase SQL editor to enable RLS
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE "Shop" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Barber" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessHours" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WaitlistEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PushToken" ENABLE ROW LEVEL SECURITY;

-- ── Shop ──
-- Public: anyone can read active shops
CREATE POLICY "shops_public_read" ON "Shop"
  FOR SELECT USING (status = 'ACTIVE');

-- Owner: shop owner can read/update their own shop
CREATE POLICY "shops_owner_all" ON "Shop"
  FOR ALL USING (
    "userId" = (SELECT id FROM "User" WHERE email = auth.jwt() ->> 'email')
  );

-- ── Barber ──
-- Public: anyone can read active barbers
CREATE POLICY "barbers_public_read" ON "Barber"
  FOR SELECT USING (active = true);

-- Owner: shop owner can manage barbers
CREATE POLICY "barbers_owner_all" ON "Barber"
  FOR ALL USING (
    "shopId" IN (SELECT id FROM "Shop" WHERE "userId" = (SELECT id FROM "User" WHERE email = auth.jwt() ->> 'email'))
  );

-- ── Service ──
-- Public: anyone can read active services
CREATE POLICY "services_public_read" ON "Service"
  FOR SELECT USING (active = true);

-- Owner: shop owner can manage services
CREATE POLICY "services_owner_all" ON "Service"
  FOR ALL USING (
    "shopId" IN (SELECT id FROM "Shop" WHERE "userId" = (SELECT id FROM "User" WHERE email = auth.jwt() ->> 'email'))
  );

-- ── BusinessHours ──
-- Public: anyone can read
CREATE POLICY "hours_public_read" ON "BusinessHours"
  FOR SELECT USING (true);

-- Owner: shop owner can manage
CREATE POLICY "hours_owner_all" ON "BusinessHours"
  FOR ALL USING (
    "shopId" IN (SELECT id FROM "Shop" WHERE "userId" = (SELECT id FROM "User" WHERE email = auth.jwt() ->> 'email'))
  );

-- ── Appointment ──
-- Customer: can read/create their own appointments
CREATE POLICY "appointments_customer_read" ON "Appointment"
  FOR SELECT USING ("customerEmail" = auth.jwt() ->> 'email');

CREATE POLICY "appointments_customer_insert" ON "Appointment"
  FOR INSERT WITH CHECK ("customerEmail" = auth.jwt() ->> 'email');

CREATE POLICY "appointments_customer_update" ON "Appointment"
  FOR UPDATE USING ("customerEmail" = auth.jwt() ->> 'email');

-- Barber: can read/update their shop's appointments
CREATE POLICY "appointments_barber_all" ON "Appointment"
  FOR ALL USING (
    "shopId" IN (SELECT id FROM "Shop" WHERE "userId" = (SELECT id FROM "User" WHERE email = auth.jwt() ->> 'email'))
  );

-- ── Review ──
-- Public: anyone can read approved reviews
CREATE POLICY "reviews_public_read" ON "Review"
  FOR SELECT USING (approved = true);

-- Customer: can create reviews
CREATE POLICY "reviews_customer_insert" ON "Review"
  FOR INSERT WITH CHECK ("customerEmail" = auth.jwt() ->> 'email');

-- ── Customer ──
-- Own profile only
CREATE POLICY "customer_own" ON "Customer"
  FOR ALL USING (email = auth.jwt() ->> 'email');

-- ── Favorite ──
-- Own favorites only
CREATE POLICY "favorites_own" ON "Favorite"
  FOR ALL USING ("customerEmail" = auth.jwt() ->> 'email');

-- ── WaitlistEntry ──
-- Customer: own entries
CREATE POLICY "waitlist_customer" ON "WaitlistEntry"
  FOR ALL USING ("customerEmail" = auth.jwt() ->> 'email');

-- Barber: read their shop's entries
CREATE POLICY "waitlist_barber_read" ON "WaitlistEntry"
  FOR SELECT USING (
    "shopId" IN (SELECT id FROM "Shop" WHERE "userId" = (SELECT id FROM "User" WHERE email = auth.jwt() ->> 'email'))
  );

-- ── PushToken ──
-- Own tokens only
CREATE POLICY "pushtoken_own" ON "PushToken"
  FOR ALL USING ("userEmail" = auth.jwt() ->> 'email');
