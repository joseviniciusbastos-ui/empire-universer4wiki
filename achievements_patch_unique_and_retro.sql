-- ==========================================
-- PATCH: ÍCONES ÚNICOS E CONCESSÃO RETROATIVA
-- ==========================================

-- 1. ATUALIZAÇÃO DE ÍCONES (Garantindo 50 ícones distintos)
-- ==========================================

-- Categoria: CONTRIBUIÇÃO
UPDATE achievements SET icon = 'Feather' WHERE name->>'pt' = 'Escriba Novato I';
UPDATE achievements SET icon = 'PenTool' WHERE name->>'pt' = 'Escriba Aprendiz II';
UPDATE achievements SET icon = 'FileText' WHERE name->>'pt' = 'Relator de Campo III'; -- Mantendo alguns clássicos mas variando
UPDATE achievements SET icon = 'Files' WHERE name->>'pt' = 'Arquivista IV';
UPDATE achievements SET icon = 'BookOpen' WHERE name->>'pt' = 'Historiador V';
UPDATE achievements SET icon = 'Library' WHERE name->>'pt' = 'Curador Galáctico VI';
UPDATE achievements SET icon = 'Scroll' WHERE name->>'pt' = 'Sábio do Império VII';
UPDATE achievements SET icon = 'Database' WHERE name->>'pt' = 'Oráculo Digital VIII';
UPDATE achievements SET icon = 'Server' WHERE name->>'pt' = 'Arquiteto da Matrix IX';
UPDATE achievements SET icon = 'Brain' WHERE name->>'pt' = 'Onisciente X';

-- Categoria: SOCIAL
UPDATE achievements SET icon = 'MessageSquare' WHERE name->>'pt' = 'Voz Tímida I';
UPDATE achievements SET icon = 'MessageCircle' WHERE name->>'pt' = 'Conversador II';
UPDATE achievements SET icon = 'MessageSquarePlus' WHERE name->>'pt' = 'Debatedor III';
UPDATE achievements SET icon = 'Users' WHERE name->>'pt' = 'Diplomata IV';
UPDATE achievements SET icon = 'UserPlus' WHERE name->>'pt' = 'Embaixador V';
UPDATE achievements SET icon = 'Megaphone' WHERE name->>'pt' = 'Porta-Voz VI';
UPDATE achievements SET icon = 'Mic' WHERE name->>'pt' = 'Senador VII';
UPDATE achievements SET icon = 'Radio' WHERE name->>'pt' = 'Chanceler VIII';
UPDATE achievements SET icon = 'Cast' WHERE name->>'pt' = 'Voz da Galáxia IX'; -- Cast/Broadcast
UPDATE achievements SET icon = 'Wifi' WHERE name->>'pt' = 'Mente Coletiva X';

-- Categoria: REPUTAÇÃO
UPDATE achievements SET icon = 'ThumbsUp' WHERE name->>'pt' = 'Notado I';
UPDATE achievements SET icon = 'Star' WHERE name->>'pt' = 'Respeitado II';
UPDATE achievements SET icon = 'Heart' WHERE name->>'pt' = 'Admirado III';
UPDATE achievements SET icon = 'Award' WHERE name->>'pt' = 'Venerado IV';
UPDATE achievements SET icon = 'Medal' WHERE name->>'pt' = 'Herói Local V';
UPDATE achievements SET icon = 'Crown' WHERE name->>'pt' = 'Lenda Viva VI';
UPDATE achievements SET icon = 'Sun' WHERE name->>'pt' = 'Ícone Estelar VII';
UPDATE achievements SET icon = 'Zap' WHERE name->>'pt' = 'Semideus VIII';
UPDATE achievements SET icon = 'Sparkles' WHERE name->>'pt' = 'Ascendido IX';
UPDATE achievements SET icon = 'Infinity' WHERE name->>'pt' = 'Divindade X';

-- Categoria: EXPLORAÇÃO (Tenure)
UPDATE achievements SET icon = 'Sprout' WHERE name->>'pt' = 'Recruta I';
UPDATE achievements SET icon = 'Compass' WHERE name->>'pt' = 'Cadete II';
UPDATE achievements SET icon = 'Anchor' WHERE name->>'pt' = 'Oficial III';
UPDATE achievements SET icon = 'ShieldCheck' WHERE name->>'pt' = 'Veterano IV';
UPDATE achievements SET icon = 'Flag' WHERE name->>'pt' = 'Elite V';

-- Categoria: ESPECIAIS
UPDATE achievements SET icon = 'HeartHandshake' WHERE name->>'pt' = 'Primeiro Contato';
UPDATE achievements SET icon = 'Camera' WHERE name->>'pt' = 'Paparazzi';
UPDATE achievements SET icon = 'Send' WHERE name->>'pt' = 'Carteiro';
UPDATE achievements SET icon = 'Bug' WHERE name->>'pt' = 'Bug Hunter';
UPDATE achievements SET icon = 'Book' WHERE name->>'pt' = 'Wiki Master';
UPDATE achievements SET icon = 'TrendingUp' WHERE name->>'pt' = 'Forum Leader';
UPDATE achievements SET icon = 'GitBranch' WHERE name->>'pt' = 'Explorador de Arquivos';
UPDATE achievements SET icon = 'Trophy' WHERE name->>'pt' = 'Colecionador';
UPDATE achievements SET icon = 'Wrench' WHERE name->>'pt' = 'Mecânico';
UPDATE achievements SET icon = 'Crosshair' WHERE name->>'pt' = 'Comandante';
UPDATE achievements SET icon = 'Eye' WHERE name->>'pt' = 'Influencer';
UPDATE achievements SET icon = 'Activity' WHERE name->>'pt' = 'Pop Star'; -- Viral activity
UPDATE achievements SET icon = 'Languages' WHERE name->>'pt' = 'Poliglota';
UPDATE achievements SET icon = 'Moon' WHERE name->>'pt' = 'Noturno';
UPDATE achievements SET icon = 'Sunrise' WHERE name->>'pt' = 'Madrugador';


-- 2. ROTINA DE CONCESSÃO RETROATIVA (DO BLOCK)
-- ==========================================
-- Este bloco anônimo percorre os usuários e verifica suas estatísticas atuais
-- comparando-as com os requisitos das conquistas.

DO $$
DECLARE
    user_rec RECORD;
    post_c INTEGER;
    comment_c INTEGER;
    rep_val NUMERIC;
    
    ach_rec RECORD;
BEGIN
    -- Percorrer todos os perfis existentes
    FOR user_rec IN SELECT id, reputation FROM profiles LOOP
        
        -- A. Contar Posts
        SELECT COUNT(*) INTO post_c FROM posts WHERE author_id = user_rec.id;
        
        -- B. Contar Comentários
        SELECT COUNT(*) INTO comment_c FROM comments WHERE author_id = user_rec.id;
        
        -- C. Pegar Reputação Direta
        rep_val := user_rec.reputation;
        
        -- --- CHECAGEM E INSERÇÃO ---
        
        -- 1. Checar Conquistas de POSTS
        FOR ach_rec IN SELECT id, requirement_value FROM achievements WHERE requirement_type = 'posts_count' LOOP
            IF post_c >= ach_rec.requirement_value THEN
                -- Inserir se não existir (ON CONFLICT DO NOTHING evita duplicidade simples se houver unique constraint, 
                -- mas como não temos unique constraint explicita no create table anterior, usamos NOT EXISTS)
                IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = user_rec.id AND achievement_id = ach_rec.id) THEN
                    INSERT INTO user_achievements (user_id, achievement_id, earned_at) VALUES (user_rec.id, ach_rec.id, NOW());
                END IF;
            END IF;
        END LOOP;

        -- 2. Checar Conquistas de COMENTÁRIOS
        FOR ach_rec IN SELECT id, requirement_value FROM achievements WHERE requirement_type = 'comments_count' LOOP
            IF comment_c >= ach_rec.requirement_value THEN
                IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = user_rec.id AND achievement_id = ach_rec.id) THEN
                    INSERT INTO user_achievements (user_id, achievement_id, earned_at) VALUES (user_rec.id, ach_rec.id, NOW());
                END IF;
            END IF;
        END LOOP;

        -- 3. Checar Conquistas de REPUTAÇÃO
        FOR ach_rec IN SELECT id, requirement_value FROM achievements WHERE requirement_type = 'reputation_value' LOOP
            IF rep_val >= ach_rec.requirement_value THEN
                IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = user_rec.id AND achievement_id = ach_rec.id) THEN
                    INSERT INTO user_achievements (user_id, achievement_id, earned_at) VALUES (user_rec.id, ach_rec.id, NOW());
                END IF;
            END IF;
        END LOOP;
        
        -- 4. Especial: Primeiro Contato (Likes Received > 0)
        -- (Implementação simplificada: se reputação > 0, assume que recebeu like, ou count real se possível)
        -- Vamos assumir reputação > 0 para simplificar este retroativo
        IF rep_val > 0 THEN
             -- Buscar ID da conquista "Primeiro Contato"
             FOR ach_rec IN SELECT id FROM achievements WHERE name->>'pt' = 'Primeiro Contato' LOOP
                IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = user_rec.id AND achievement_id = ach_rec.id) THEN
                    INSERT INTO user_achievements (user_id, achievement_id, earned_at) VALUES (user_rec.id, ach_rec.id, NOW());
                END IF;
             END LOOP;
        END IF;

    END LOOP;
END $$;
