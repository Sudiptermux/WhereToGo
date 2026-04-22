-- FINAL UUID-BASED SCHEMA (WITH AUTH TRIGGERS)
-- Run this in your Supabase SQL Editor

-- 1. Cleanup (Recommended for a fresh start)
DROP TABLE IF EXISTS user_activity CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS place_media CASCADE; -- Old table from previous version
DROP TABLE IF EXISTS places CASCADE;

-- 2. Create Places Table
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    description_short TEXT,
    location TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    avg_duration_mins INTEGER,
    opening_time TEXT,
    closing_time TEXT,
    best_visit_time TEXT,
    rating DOUBLE PRECISION,
    entry_fee TEXT,
    image_url TEXT,
    video_url TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    title TEXT NOT NULL,
    dates_display TEXT,
    status TEXT DEFAULT 'DRAFT',
    status_color TEXT,
    image_url TEXT,
    stay_location_id UUID REFERENCES places(id),
    trip_data JSONB, 
    visited_places JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create User Activity
CREATE TABLE IF NOT EXISTS user_activity (
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    is_liked BOOLEAN DEFAULT FALSE,
    is_visited BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, place_id)
);

-- 6. Enable RLS
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- 7. Setup Policies
CREATE POLICY "Places are manageable by everyone" ON places FOR ALL USING (true);
CREATE POLICY "Own Profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Update Own Profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Manage Own Trips" ON trips FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage Own Activity" ON user_activity FOR ALL USING (auth.uid() = user_id);

-- 8. AUTOMATIC PROFILE TRIGGER
-- This function creates a profile automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
