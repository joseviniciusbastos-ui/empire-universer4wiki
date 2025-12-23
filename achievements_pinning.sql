-- ==========================================
-- MIGRATION: SISTEMA DE DESTAQUE (PIN)
-- ==========================================

-- 1. ADICIONAR COLUNA "IS_PINNED"
-- Adiciona a flag para saber se a conquista está destacada
ALTER TABLE user_achievements 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- 2. FUNÇÃO TRIGGER PARA LIMITAR A 5 DESTAQUES
-- Garante que ninguém consiga destacar mais de 5 conquistas
CREATE OR REPLACE FUNCTION check_pinned_limit()
RETURNS TRIGGER AS $$
DECLARE
    pinned_count INTEGER;
BEGIN
    -- Se estiver tentando pinar (is_pinned = true)
    IF NEW.is_pinned = TRUE THEN
        -- Contar quantas já estão pinadas para esse usuário (excluindo a própria linha se for update)
        SELECT COUNT(*) INTO pinned_count 
        FROM user_achievements 
        WHERE user_id = NEW.user_id 
        AND is_pinned = TRUE
        AND achievement_id != NEW.achievement_id;

        -- Se já tiver 5 ou mais, impedir
        IF pinned_count >= 5 THEN
            RAISE EXCEPTION 'Limite de 5 conquistas destacadas atingido.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. APLICAR TRIGGER
DROP TRIGGER IF EXISTS trigger_check_pinned_limit ON user_achievements;
CREATE TRIGGER trigger_check_pinned_limit
BEFORE UPDATE OR INSERT ON user_achievements
FOR EACH ROW EXECUTE FUNCTION check_pinned_limit();
