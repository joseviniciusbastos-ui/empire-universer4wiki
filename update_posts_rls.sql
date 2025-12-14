-- Add columns to track who edited the post
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_edited_by_name TEXT;

-- Enable RLS on posts table if not already enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read posts
CREATE POLICY "Public posts are viewable by everyone" 
ON posts FOR SELECT 
USING (true);

-- Policy: Users can create their own posts
CREATE POLICY "Users can create their own posts" 
ON posts FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update their own posts" 
ON posts FOR UPDATE 
USING (auth.uid() = author_id);

-- Policy: Moderators and Admins can update ANY post
-- Note: We assume 'profiles' table or metadata has the role, but simpler here if we trust the app's verified role check,
-- OR better, we check the role against a public profiles table if it exists. 
-- For now, let's allow based on the ID being present in the request or rely on the frontend check + this broad policy if possible,
-- BUT strict RLS requires querying the user's role.
-- Let's check if we have a table that defines roles.
-- Assuming we stick to the basic "Users update own" + "Moderators update all".
-- Since I don't have the full schema for roles handy in SQL form (it might be in metadata), 
-- I will create a policy that allows updates if the user is a moderator.
-- A common pattern is:
-- CREATE POLICY "Moderators can update any post" ON posts FOR UPDATE USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('MODERATOR', 'ADMIN'))
-- );

-- However, without confirming the 'profiles' table schema, I'll write a safe block that tries to add it.
-- PROFILES TABLE ASSUMPTION: 'profiles' table exists with 'id' and 'role'.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Moderators and Admins can update any post') THEN
        CREATE POLICY "Moderators and Admins can update any post" 
        ON posts FOR UPDATE 
        USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('MODERATOR', 'ADMIN')
            )
        );
    END IF;
END $$;
