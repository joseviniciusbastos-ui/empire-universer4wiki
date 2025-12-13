-- Reputation System Triggers

-- Function to handle reputation changes
CREATE OR REPLACE FUNCTION handle_reputation_change()
RETURNS TRIGGER AS $$
DECLARE
  impact INTEGER;
  user_id UUID;
BEGIN
  -- Default impact
  impact := 0;
  
  -- Determine context and impact
  IF (TG_TABLE_NAME = 'posts') THEN
    IF (TG_OP = 'INSERT') THEN
      user_id := NEW.author_id;
      IF (NEW.type = 'WIKI') THEN
        impact := 15;
      ELSIF (NEW.type = 'ARTICLE') THEN
        impact := 10;
      ELSE
         impact := 5; -- THREAD/BLOG
      END IF;
    ELSIF (TG_OP = 'DELETE') THEN
       user_id := OLD.author_id;
       IF (OLD.type = 'WIKI') THEN
        impact := -15;
       ELSIF (OLD.type = 'ARTICLE') THEN
        impact := -10;
       ELSE
         impact := -5;
       END IF;
    END IF;
  ELSIF (TG_TABLE_NAME = 'comments') THEN
     IF (TG_OP = 'INSERT') THEN
       user_id := NEW.author_id;
       impact := 2;
     ELSIF (TG_OP = 'DELETE') THEN
       user_id := OLD.author_id;
       impact := -2;
     END IF;
  ELSIF (TG_TABLE_NAME = 'post_reactions') THEN
      -- Assuming table post_reactions exists with post_id, user_id (the reactor). 
      -- We want to reward the POST AUTHOR, not the reactor.
      -- We need to fetch the post author.
      IF (TG_OP = 'INSERT') THEN
         SELECT author_id INTO user_id FROM posts WHERE id = NEW.post_id;
         impact := 1;
      ELSIF (TG_OP = 'DELETE') THEN
         SELECT author_id INTO user_id FROM posts WHERE id = OLD.post_id;
         impact := -1;
      END IF;
  END IF;

  -- Update Profile Reputation if user_id is found
  IF (user_id IS NOT NULL) THEN
    UPDATE profiles 
    SET reputation = reputation + impact
    WHERE id = user_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- 1. Posts
DROP TRIGGER IF EXISTS on_post_reputation ON posts;
CREATE TRIGGER on_post_reputation
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_reputation_change();

-- 2. Comments
DROP TRIGGER IF EXISTS on_comment_reputation ON comments;
CREATE TRIGGER on_comment_reputation
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_reputation_change();

-- 3. Reactions (Assuming post_reactions table)
-- If post_reactions doesn't exist yet, you might need to create it or skip this.
DROP TRIGGER IF EXISTS on_reaction_reputation ON post_reactions;
CREATE TRIGGER on_reaction_reputation
  AFTER INSERT OR DELETE ON post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_reputation_change();
