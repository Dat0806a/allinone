-- 1. Profiles Table (User settings and health info)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  birthday DATE,
  phone TEXT,
  blood_type TEXT,
  weight NUMERIC,
  height NUMERIC,
  gender TEXT,
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Medications Table
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  times JSONB DEFAULT '[]',
  days JSONB DEFAULT '[]',
  note TEXT,
  icon TEXT,
  color TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns exist for existing tables (migration)
ALTER TABLE medications ADD COLUMN IF NOT EXISTS dosage TEXT;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS times JSONB DEFAULT '[]';
ALTER TABLE medications ADD COLUMN IF NOT EXISTS days JSONB DEFAULT '[]';

-- 3. Medication Records Table (Tracking when meds are taken)
CREATE TABLE IF NOT EXISTS medication_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
  medication_name TEXT,
  taken_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_records ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Drop first to avoid "already exists" errors)
-- Profiles
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Medications
DROP POLICY IF EXISTS "Users can manage their own medications" ON medications;
CREATE POLICY "Users can manage their own medications" ON medications
  FOR ALL USING (auth.uid() = user_id);

-- Medication Records
DROP POLICY IF EXISTS "Users can manage their own records" ON medication_records;
CREATE POLICY "Users can manage their own records" ON medication_records
  FOR ALL USING (auth.uid() = user_id);

-- 6. Trigger to automatically create a profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
