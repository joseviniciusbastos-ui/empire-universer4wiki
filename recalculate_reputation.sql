-- Function to Recalculate Reputation for ALL users
CREATE OR REPLACE FUNCTION recalculate_all_reputations()
RETURNS void AS $$
DECLARE
  u RECORD;
  total_rep INTEGER;
  new_rank TEXT;
BEGIN
  -- Loop through all profiles
  FOR u IN SELECT id FROM profiles LOOP
    total_rep := 0;

    -- 1. Sum Post Points
    -- Wiki: 20, Article: 10, Other: 5
    SELECT COALESCE(SUM(
      CASE 
        WHEN type = 'WIKI' THEN 20 
        WHEN type = 'ARTICLE' THEN 10 
        ELSE 5 
      END
    ), 0) INTO total_rep
    FROM posts 
    WHERE author_id = u.id;

    -- 2. Sum Comment Points (2 per comment)
    total_rep := total_rep + (
      SELECT COUNT(*) * 2 FROM comments WHERE author_id = u.id
    );

    -- 3. Sum Reaction Points (Received on Authored Posts)
    -- Intel: 5, Star: 3, Rocket: 2, Like: 1
    total_rep := total_rep + (
      SELECT COALESCE(SUM(
        CASE 
          WHEN r.reaction_type = 'INTEL' THEN 5 
          WHEN r.reaction_type = 'STAR' THEN 3 
          WHEN r.reaction_type = 'ROCKET' THEN 2 
          WHEN r.reaction_type = 'LIKE' THEN 1 
          ELSE 0 
        END
      ), 0)
      FROM post_reactions r
      JOIN posts p ON p.id = r.post_id
      WHERE p.author_id = u.id
    );

    -- 4. Determine Rank
    IF (total_rep >= 50000) THEN new_rank := 'Almirante da Frota';
    ELSIF (total_rep >= 25000) THEN new_rank := 'Almirante';
    ELSIF (total_rep >= 15000) THEN new_rank := 'Vice-Almirante';
    ELSIF (total_rep >= 10000) THEN new_rank := 'Contra-Almirante';
    ELSIF (total_rep >= 6000) THEN new_rank := 'Comodoro';
    ELSIF (total_rep >= 3000) THEN new_rank := 'Capitão';
    ELSIF (total_rep >= 1500) THEN new_rank := 'Comandante';
    ELSIF (total_rep >= 800) THEN new_rank := 'Tenente-Comandante';
    ELSIF (total_rep >= 400) THEN new_rank := 'Tenente';
    ELSIF (total_rep >= 200) THEN new_rank := 'Tenente Júnior';
    ELSIF (total_rep >= 100) THEN new_rank := 'Alferes';
    ELSIF (total_rep >= 50) THEN new_rank := 'Suboficial';
    ELSIF (total_rep >= 25) THEN new_rank := 'Tripulante';
    ELSIF (total_rep >= 10) THEN new_rank := 'Cadete';
    ELSE new_rank := 'Civil / Recruta';
    END IF;

    -- 5. Update Profile
    UPDATE profiles 
    SET 
      reputation = total_rep,
      rank = new_rank
    WHERE id = u.id;
    
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the Recalculation immediately
SELECT recalculate_all_reputations();

-- (Optional) Drop the function after use if you want it to be a one-time script
-- DROP FUNCTION recalculate_all_reputations();
