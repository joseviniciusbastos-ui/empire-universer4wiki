-- SHIP DESIGNER SCHEMA

-- 1. SHIPS TABLE
CREATE TABLE IF NOT EXISTS ships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('fighter', 'corvette', 'frigate', 'destroyer', 'cruiser', 'battleship', 'capital', 'transport', 'mining')),
    image_url TEXT,
    base_stats JSONB NOT NULL DEFAULT '{}'::jsonb, -- { hull, shield, speed, cargo, etc. }
    slots_layout JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { type: 'engine'|'weapon'|'shield'|'cargo', count: int }
    base_cost JSONB NOT NULL DEFAULT '{}'::jsonb, -- { metal, crystal, deuterium }
    base_build_time INTEGER NOT NULL DEFAULT 0, -- Seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MODULES TABLE
CREATE TABLE IF NOT EXISTS ship_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('engine', 'weapon', 'shield', 'armor', 'cargo', 'special', 'mining')),
    description TEXT,
    level INTEGER DEFAULT 1,
    stats_modifier JSONB NOT NULL DEFAULT '{}'::jsonb, -- { speed_add, hull_add, damage, etc. }
    cost JSONB NOT NULL DEFAULT '{}'::jsonb,
    required_tech TEXT, -- Could be a tech ID or code
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. POLICIES TABLE (Empire / Government Modifiers)
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('government', 'empire', 'event')),
    description TEXT,
    modifiers JSONB NOT NULL DEFAULT '{}'::jsonb, -- { build_time_pct: -0.1, resource_cost_pct: 0.05 }
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SAVED DESIGNS TABLE (User Fits)
CREATE TABLE IF NOT EXISTS saved_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    modules_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Map { slot_index: module_id_or_code }
    total_stats JSONB, -- Cached calculations
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES

-- Enable RLS
ALTER TABLE ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ship_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_designs ENABLE ROW LEVEL SECURITY;

-- Read Policies (Public Read)
CREATE POLICY "Public Read Ships" ON ships FOR SELECT USING (true);
CREATE POLICY "Public Read Modules" ON ship_modules FOR SELECT USING (true);
CREATE POLICY "Public Read Policies" ON policies FOR SELECT USING (true);
CREATE POLICY "Public Designs" ON saved_designs FOR SELECT USING (is_public = true);
CREATE POLICY "User Own Designs" ON saved_designs FOR SELECT USING (auth.uid() = user_id);

-- Admin Write Policies (Assuming we have an is_admin function or role check, keeping it simple for now)
-- For now, allowing authenticated users to create designs, but only admins to manage base data
-- NOTE: In a real prod env, we'd check strict admin roles for ships/modules. 
-- For this prototype, we'll allow Authenticated Generic Updates for ease of testing Admin Panel if 'admin' role not strictly enforced yet.
-- Ideally: USING ( public.get_user_role(auth.uid()) = 'ADMIN' )

CREATE POLICY "Admin All Ships" ON ships FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'CREATOR', 'MODERATOR')
);
CREATE POLICY "Admin All Modules" ON ship_modules FOR ALL USING (
     (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'CREATOR', 'MODERATOR')
);
CREATE POLICY "Admin All Policies" ON policies FOR ALL USING (
     (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'CREATOR', 'MODERATOR')
);

-- User Design Policies
CREATE POLICY "Users Manage Own Designs" ON saved_designs FOR ALL USING (auth.uid() = user_id);

-- TRIGGERS
-- Auto-update updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TRIGGER handle_updated_at_ships BEFORE UPDATE ON ships
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

CREATE TRIGGER handle_updated_at_saved_designs BEFORE UPDATE ON saved_designs
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
