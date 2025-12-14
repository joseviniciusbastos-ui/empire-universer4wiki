-- Add rank column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'Civil / Recruta';

-- Update the reputation trigger function
CREATE OR REPLACE FUNCTION handle_reputation_change()
RETURNS TRIGGER AS $$
DECLARE
  impact INTEGER;
  user_id UUID;
  new_reputation INTEGER;
  new_rank TEXT;
BEGIN
  -- Default impact
  impact := 0;
  
  -- 1. Determine User and Impact based on Action
  IF (TG_TABLE_NAME = 'posts') THEN
    IF (TG_OP = 'INSERT') THEN
      user_id := NEW.author_id;
      IF (NEW.type = 'WIKI') THEN
        impact := 20;
      ELSIF (NEW.type = 'ARTICLE') THEN
        impact := 10;
      ELSE
         impact := 5; -- THREAD/BLOG
      END IF;
    ELSIF (TG_OP = 'DELETE') THEN
       user_id := OLD.author_id;
       IF (OLD.type = 'WIKI') THEN
        impact := -20;
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
      -- Fetch post author
      IF (TG_OP = 'INSERT') THEN
         SELECT author_id INTO user_id FROM posts WHERE id = NEW.post_id;
         
         -- Granular Reaction Points
         IF (NEW.reaction_type = 'INTEL') THEN impact := 5;
         ELSIF (NEW.reaction_type = 'STAR') THEN impact := 3;
         ELSIF (NEW.reaction_type = 'ROCKET') THEN impact := 2;
         ELSIF (NEW.reaction_type = 'LIKE') THEN impact := 1;
         ELSE impact := 0; -- WARNING or others
         END IF;

      ELSIF (TG_OP = 'DELETE') THEN
         SELECT author_id INTO user_id FROM posts WHERE id = OLD.post_id;
         
         -- Reverse points safely
         IF (OLD.reaction_type = 'INTEL') THEN impact := -5;
         ELSIF (OLD.reaction_type = 'STAR') THEN impact := -3;
         ELSIF (OLD.reaction_type = 'ROCKET') THEN impact := -2;
         ELSIF (OLD.reaction_type = 'LIKE') THEN impact := -1;
         ELSE impact := 0;
         END IF;
      END IF;
  END IF;

  -- 2. Update Profile Reputation and Calculate Rank
  IF (user_id IS NOT NULL AND impact != 0) THEN
    
    -- Update reputation and return the new value
    UPDATE profiles 
    SET reputation = reputation + impact
    WHERE id = user_id
    RETURNING reputation INTO new_reputation;

    -- Calculate Rank based on new_reputation
    IF (new_reputation >= 50000) THEN new_rank := 'Almirante da Frota';
    ELSIF (new_reputation >= 25000) THEN new_rank := 'Almirante';
    ELSIF (new_reputation >= 15000) THEN new_rank := 'Vice-Almirante';
    ELSIF (new_reputation >= 10000) THEN new_rank := 'Contra-Almirante';
    ELSIF (new_reputation >= 6000) THEN new_rank := 'Comodoro';
    ELSIF (new_reputation >= 3000) THEN new_rank := 'Capitão';
    ELSIF (new_reputation >= 1500) THEN new_rank := 'Comandante';
    ELSIF (new_reputation >= 800) THEN new_rank := 'Tenente-Comandante';
    ELSIF (new_reputation >= 400) THEN new_rank := 'Tenente';
    ELSIF (new_reputation >= 200) THEN new_rank := 'Tenente Júnior';
    ELSIF (new_reputation >= 100) THEN new_rank := 'Alferes';
    ELSIF (new_reputation >= 50) THEN new_rank := 'Suboficial';
    ELSIF (new_reputation >= 25) THEN new_rank := 'Tripulante';
    ELSIF (new_reputation >= 10) THEN new_rank := 'Cadete';
    ELSE new_rank := 'Civil / Recruta';
    END IF;

    -- Update Rank if changed
    UPDATE profiles 
    SET rank = new_rank
    WHERE id = user_id AND rank IS DISTINCT FROM new_rank;

  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
