-- ==========================================
-- SISTEMA DE CONQUISTAS E NOTIFICAÇÕES (Conquistas 2.0)
-- ==========================================

-- 1. Limpeza (Opcional - garante que não duplique se rodar 2x, mas cuidado com dados existentes)
-- DELETE FROM achievements WHERE category IN ('contribution', 'social', 'reputation');

-- 2. Inserção das 50 Conquistas (Níveis I a X)

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value) VALUES
-- Categoria: CONTRIBUIÇÃO (Posts/Tópicos/Wiki) - Icon: FileText
('{"pt": "Escriba Novato I", "en": "Novice Scribe I", "fr": "Scribe Novice I"}', '{"pt": "Criou sua primeira publicação.", "en": "Created your first post.", "fr": "A créé votre premier message."}', 'FileText', 'contribution', 'posts_count', 1),
('{"pt": "Escriba Aprendiz II", "en": "Apprentice Scribe II", "fr": "Scribe Apprenti II"}', '{"pt": "Contribuiu com 5 publicações.", "en": "Contributed 5 posts.", "fr": "A contribué 5 messages."}', 'FileText', 'contribution', 'posts_count', 5),
('{"pt": "Relator de Campo III", "en": "Field Reporter III", "fr": "Reporter de Terrain III"}', '{"pt": "Alcançou 10 publicações.", "en": "Reached 10 posts.", "fr": "A atteint 10 messages."}', 'FileText', 'contribution', 'posts_count', 10),
('{"pt": "Arquivista IV", "en": "Archivist IV", "fr": "Archiviste IV"}', '{"pt": "Um acervo de 25 publicações.", "en": "A collection of 25 posts.", "fr": "Une collection de 25 messages."}', 'FileText', 'contribution', 'posts_count', 25),
('{"pt": "Historiador V", "en": "Historian V", "fr": "Historien V"}', '{"pt": "Marcou a história com 50 publicações.", "en": "Marked history with 50 posts.", "fr": "A marqué l''histoire avec 50 messages."}', 'BookOpen', 'contribution', 'posts_count', 50),
('{"pt": "Curador Galáctico VI", "en": "Galactic Curator VI", "fr": "Curateur Galactique VI"}', '{"pt": "100 contribuições ao conhecimento.", "en": "100 contributions to knowledge.", "fr": "100 contributions à la connaissance."}', 'Library', 'contribution', 'posts_count', 100),
('{"pt": "Sábio do Império VII", "en": "Empire Sage VII", "fr": "Sage de l''Empire VII"}', '{"pt": "200 documentos registrados.", "en": "200 documents logged.", "fr": "200 documents enregistrés."}', 'Scroll', 'contribution', 'posts_count', 200),
('{"pt": "Oráculo Digital VIII", "en": "Digital Oracle VIII", "fr": "Oracle Numérique VIII"}', '{"pt": "500 publicações. Uma lenda viva.", "en": "500 posts. A living legend.", "fr": "500 messages. Une légende vivante."}', 'Database', 'contribution', 'posts_count', 500),
('{"pt": "Arquiteto da Matrix IX", "en": "Matrix Architect IX", "fr": "Architecte de la Matrice IX"}', '{"pt": "1000 blocos de informação construídos.", "en": "1000 information blocks built.", "fr": "1000 blocs d''information construits."}', 'Server', 'contribution', 'posts_count', 1000),
('{"pt": "Onisciente X", "en": "Omniscient X", "fr": "Omniscient X"}', '{"pt": "5000 publicações. O conhecimento é você.", "en": "5000 posts. You are knowledge.", "fr": "5000 messages. Vous êtes la connaissance."}', 'Brain', 'contribution', 'posts_count', 5000),

-- Categoria: SOCIAL (Comentários) - Icon: MessageSquare
('{"pt": "Voz Tímida I", "en": "Shy Voice I", "fr": "Voix Timide I"}', '{"pt": "Fez seu primeiro comentário.", "en": "Made your first comment.", "fr": "A fait votre premier commentaire."}', 'MessageSquare', 'social', 'comments_count', 1),
('{"pt": "Conversador II", "en": "Chatter II", "fr": "Bavard II"}', '{"pt": "Participou com 10 comentários.", "en": "Participated with 10 comments.", "fr": "A participé avec 10 commentaires."}', 'MessageSquare', 'social', 'comments_count', 10),
('{"pt": "Debatedor III", "en": "Debater III", "fr": "Débatteur III"}', '{"pt": "50 opiniões compartilhadas.", "en": "50 opinions shared.", "fr": "50 opinions partagées."}', 'MessageCircle', 'social', 'comments_count', 50),
('{"pt": "Diplomata IV", "en": "Diplomat IV", "fr": "Diplomate IV"}', '{"pt": "100 interações na comunidade.", "en": "100 interactions in the community.", "fr": "100 interactions dans la communauté."}', 'Users', 'social', 'comments_count', 100),
('{"pt": "Embaixador V", "en": "Ambassador V", "fr": "Ambassadeur V"}', '{"pt": "250 mensagens enviadas.", "en": "250 messages sent.", "fr": "250 messages envoyés."}', 'Globe', 'social', 'comments_count', 250),
('{"pt": "Porta-Voz VI", "en": "Spokesperson VI", "fr": "Porte-parole VI"}', '{"pt": "500 comentários. Sua voz ecoa.", "en": "500 comments. Your voice echoes.", "fr": "500 commentaires. Votre voix résonne."}', 'Mic', 'social', 'comments_count', 500),
('{"pt": "Senador VII", "en": "Senator VII", "fr": "Sénateur VII"}', '{"pt": "1000 intervenções em debates.", "en": "1000 interventions in debates.", "fr": "1000 interventions dans les débats."}', 'Landmark', 'social', 'comments_count', 1000),
('{"pt": "Chanceler VIII", "en": "Chancellor VIII", "fr": "Chancelier VIII"}', '{"pt": "2500 discursos registrados.", "en": "2500 speeches registered.", "fr": "2500 discours enregistrés."}', 'Award', 'social', 'comments_count', 2500),
('{"pt": "Voz da Galáxia IX", "en": "Voice of the Galaxy IX", "fr": "Voix de la Galaxie IX"}', '{"pt": "5000 comunicações.", "en": "5000 communications.", "fr": "5000 communications."}', 'Radio', 'social', 'comments_count', 5000),
('{"pt": "Mente Coletiva X", "en": "Hive Mind X", "fr": "Esprit de Ruche X"}', '{"pt": "10000 interações. Onipresença.", "en": "10000 interactions. Omnipresence.", "fr": "10000 interactions. Omniprésence."}', 'Wifi', 'social', 'comments_count', 10000),

-- Categoria: REPUTAÇÃO (Likes/Pontos) - Icon: Star
('{"pt": "Notado I", "en": "Noticed I", "fr": "Remarqué I"}', '{"pt": "Alcançou 10 de reputação.", "en": "Reached 10 reputation.", "fr": "A atteint 10 de réputation."}', 'Star', 'reputation', 'reputation_value', 10),
('{"pt": "Respeitado II", "en": "Respected II", "fr": "Respecté II"}', '{"pt": "Alcançou 50 de reputação.", "en": "Reached 50 reputation.", "fr": "A atteint 50 de réputation."}', 'Star', 'reputation', 'reputation_value', 50),
('{"pt": "Admirado III", "en": "Admired III", "fr": "Admiré III"}', '{"pt": "100 pontos de honra.", "en": "100 honor points.", "fr": "100 points d''honneur."}', 'Heart', 'reputation', 'reputation_value', 100),
('{"pt": "Venerado IV", "en": "Venerated IV", "fr": "Vénéré IV"}', '{"pt": "250 de reputação acumulada.", "en": "250 accumulated reputation.", "fr": "250 de réputation accumulée."}', 'Award', 'reputation', 'reputation_value', 250),
('{"pt": "Herói Local V", "en": "Local Hero V", "fr": "Héros Local V"}', '{"pt": "500 de reputação.", "en": "500 reputation.", "fr": "500 de réputation."}', 'Medal', 'reputation', 'reputation_value', 500),
('{"pt": "Lenda Viva VI", "en": "Living Legend VI", "fr": "Légende Vivante VI"}', '{"pt": "1000 de reputação.", "en": "1000 reputation.", "fr": "1000 de réputation."}', 'Crown', 'reputation', 'reputation_value', 1000),
('{"pt": "Ícone Estelar VII", "en": "Stellar Icon VII", "fr": "Icône Stellaire VII"}', '{"pt": "2500 de reputação.", "en": "2500 reputation.", "fr": "2500 de réputation."}', 'Sun', 'reputation', 'reputation_value', 2500),
('{"pt": "Semideus VIII", "en": "Demigod VIII", "fr": "Demi-dieu VIII"}', '{"pt": "5000 de reputação.", "en": "5000 reputation.", "fr": "5000 de réputation."}', 'Zap', 'reputation', 'reputation_value', 5000),
('{"pt": "Ascendido IX", "en": "Ascended IX", "fr": "Ascensionné IX"}', '{"pt": "10000 de reputação.", "en": "10000 reputation.", "fr": "10000 de réputation."}', 'Sparkles', 'reputation', 'reputation_value', 10000),
('{"pt": "Divindade X", "en": "Deity X", "fr": "Divinité X"}', '{"pt": "25000 de reputação. Imortal.", "en": "25000 reputation. Immortal.", "fr": "25000 de réputation. Immortel."}', 'Infinity', 'reputation', 'reputation_value', 25000),

-- Categoria: EXPLORAÇÃO (Views - se rastreável, ou tenure) - Usando 'days_joined' (Mecânica simulada por enquanto, placeholder)
-- Vamos usar IDs fixos para facilitar testes
('{"pt": "Recruta I", "en": "Recruit I", "fr": "Recrue I"}', '{"pt": "Membro há 1 dia.", "en": "Member for 1 day.", "fr": "Membre depuis 1 jour."}', 'UserPlus', 'tenure', 'days_joined', 1),
('{"pt": "Cadete II", "en": "Cadet II", "fr": "Cadet II"}', '{"pt": "7 dias de serviço.", "en": "7 days of service.", "fr": "7 jours de service."}', 'Shield', 'tenure', 'days_joined', 7),
('{"pt": "Oficial III", "en": "Officer III", "fr": "Officier III"}', '{"pt": "30 dias na frota.", "en": "30 days in the fleet.", "fr": "30 jours dans la flotte."}', 'Anchor', 'tenure', 'days_joined', 30),
('{"pt": "Veterano IV", "en": "Veteran IV", "fr": "Vétéran IV"}', '{"pt": "90 dias de lealdade.", "en": "90 days of loyalty.", "fr": "90 jours de loyauté."}', 'Award', 'tenure', 'days_joined', 90),
('{"pt": "Elite V", "en": "Elite V", "fr": "Élite V"}', '{"pt": "6 meses de serviço honroso.", "en": "6 months of honorable service.", "fr": "6 mois de service honorable."}', 'Star', 'tenure', 'days_joined', 180),

-- Categoria: ESPECIAIS (Ações Únicas) (Total: 35 até agora, adicionando 15)
('{"pt": "Primeiro Contato", "en": "First Contact", "fr": "Premier Contact"}', '{"pt": "Recebeu sua primeira curtida.", "en": "Received your first like.", "fr": "A reçu votre premier j''aime."}', 'Heart', 'special', 'likes_received', 1),
('{"pt": "Paparazzi", "en": "Paparazzi", "fr": "Paparazzi"}', '{"pt": "Postou uma imagem.", "en": "Posted an image.", "fr": "A posté une image."}', 'Camera', 'special', 'images_posted', 1),
('{"pt": "Carteiro", "en": "Mailman", "fr": "Facteur"}', '{"pt": "Enviou um feedback/report.", "en": "Sent a feedback/report.", "fr": "A envoyé un commentaire/rapport."}', 'Send', 'special', 'reports_sent', 1),
('{"pt": "Bug Hunter", "en": "Bug Hunter", "fr": "Chasseur de Bugs"}', '{"pt": "Teve um bug reportado resolvido.", "en": "Had a reported bug resolved.", "fr": "A eu un bug signalé résolu."}', 'Bug', 'special', 'bugs_resolved', 1),
('{"pt": "Wiki Master", "en": "Wiki Master", "fr": "Maître Wiki"}', '{"pt": "Criou um artigo Wiki.", "en": "Created a Wiki article.", "fr": "A créé un article Wiki."}', 'Book', 'special', 'wiki_created', 1),
('{"pt": "Forum Leader", "en": "Forum Leader", "fr": "Leader du Forum"}', '{"pt": "Criou um tópico popular (+10 comentários).", "en": "Created a popular thread (+10 comments).", "fr": "A créé un fil populaire (+10 commentaires)."}', 'MessageCircle', 'special', 'popular_thread', 1),
('{"pt": "Explorador de Arquivos", "en": "File Explorer", "fr": "Explorateur de Fichiers"}', '{"pt": "Visitou a Árvore Tecnológica.", "en": "Visited the Tech Tree.", "fr": "A visité l''Arbre Technologique."}', 'GitBranch', 'special', 'visited_tech_tree', 1),
('{"pt": "Colecionador", "en": "Collector", "fr": "Collectionneur"}', '{"pt": "Desbloqueou 10 conquistas.", "en": "Unlocked 10 achievements.", "fr": "A débloqué 10 réalisations."}', 'Trophy', 'special', 'achievements_count', 10),
('{"pt": "Mecânico", "en": "Mechanic", "fr": "Mécanicien"}', '{"pt": "Acessou o painel de Engenharia.", "en": "Accessed Engineering panel.", "fr": "A accédé au panneau d''Ingénierie."}', 'Wrench', 'special', 'visited_engineering', 1),
('{"pt": "Comandante", "en": "Commander", "fr": "Commandant"}', '{"pt": "Acessou o painel de Comando.", "en": "Accessed Command panel.", "fr": "A accédé au panneau de Commande."}', 'Shield', 'special', 'visited_command', 1),
('{"pt": "Influencer", "en": "Influencer", "fr": "Influenceur"}', '{"pt": "Recebeu 100 visualizações em um post.", "en": "Received 100 views on a post.", "fr": "A reçu 100 vues sur un message."}', 'Eye', 'special', 'views_received', 100),
('{"pt": "Pop Star", "en": "Pop Star", "fr": "Pop Star"}', '{"pt": "Recebeu 1000 visualizações em um post.", "en": "Received 1000 views on a post.", "fr": "A reçu 1000 vues sur un message."}', 'Zap', 'special', 'views_received', 1000),
('{"pt": "Poliglota", "en": "Polyglot", "fr": "Polyglotte"}', '{"pt": "Mudou o idioma do sistema.", "en": "Changed system language.", "fr": "A changé la langue du système."}', 'Languages', 'special', 'changed_language', 1),
('{"pt": "Noturno", "en": "Nocturnal", "fr": "Nocturne"}', '{"pt": "Acessou entre 00:00 e 04:00.", "en": "Accessed between 00:00 and 04:00.", "fr": "A accédé entre 00:00 et 04:00."}', 'Moon', 'special', 'night_access', 1),
('{"pt": "Madrugador", "en": "Early Bird", "fr": "Lève-tôt"}', '{"pt": "Acessou entre 05:00 e 07:00.", "en": "Accessed between 05:00 and 07:00.", "fr": "A accédé entre 05:00 et 07:00."}', 'Sun', 'special', 'morning_access', 1);

-- ==========================================
-- 3. TRIGGERS para Automação
-- ==========================================

-- Trigger Function: Concede Conquista + Notifica
-- Esta função verifica se o usuário atingiu os requisitos de alguma conquista não obtida
-- e a insere. A notificação será gerada por outro trigger na tabela user_achievements.

CREATE OR REPLACE FUNCTION check_and_award_achievements()
RETURNS TRIGGER AS $$
DECLARE
    user_id_target UUID;
    stat_type TEXT;
    current_value NUMERIC;
    achievement_row RECORD;
BEGIN
    -- Determinar o usuário e o tipo de estatística baseado na tabela de origem
    IF TG_TABLE_NAME = 'posts' THEN
        -- Novo Post inserido
        user_id_target := NEW.author_id;
        stat_type := 'posts_count';
        -- Calcular valor atual (count posts)
        SELECT COUNT(*) INTO current_value FROM posts WHERE author_id = user_id_target;
        
    ELSIF TG_TABLE_NAME = 'comments' THEN
        -- Novo Comentário inserido
        user_id_target := NEW.author_id; -- Assumindo author_id ou user_id na tb comments
        stat_type := 'comments_count';
        SELECT COUNT(*) INTO current_value FROM comments WHERE author_id = user_id_target;
        
    ELSIF TG_TABLE_NAME = 'users' THEN
        -- Update na Reputação
        user_id_target := NEW.id;
        stat_type := 'reputation_value';
        current_value := NEW.reputation;
        
    ELSE
        RETURN NEW;
    END IF;

    -- Loop por todas as conquistas desse tipo que o usuário AINDA NÃO TEM
    FOR achievement_row IN
        SELECT * FROM achievements 
        WHERE requirement_type = stat_type 
        AND requirement_value <= current_value
        AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = user_id_target)
    LOOP
        -- Inserir a conquista para o usuário
        INSERT INTO user_achievements (user_id, achievement_id, earned_at)
        VALUES (user_id_target, achievement_row.id, NOW());
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Function: Cria Notificação ao Ganhar Conquista
CREATE OR REPLACE FUNCTION notify_achievement_unlock()
RETURNS TRIGGER AS $$
DECLARE
    ach_name JSONB;
    ach_name_pt TEXT;
BEGIN
    -- Buscar o nome da conquista
    SELECT name INTO ach_name FROM achievements WHERE id = NEW.achievement_id;
    -- Extrair PT (fallback simples)
    ach_name_pt := ach_name->>'pt';
    
    -- Inserir Notificação
    INSERT INTO notifications (user_id, type, message, read, created_at, link)
    VALUES (
        NEW.user_id, 
        'ACHIEVEMENT', 
        'Conquista Desbloqueada: ' || ach_name_pt || '!', 
        FALSE, 
        NOW(), 
        '/achievements'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 4. APLICAÇÃO DOS TRIGGERS
-- ==========================================

-- Trigger para POSTS
DROP TRIGGER IF EXISTS trigger_check_post_achievements ON posts;
CREATE TRIGGER trigger_check_post_achievements
AFTER INSERT ON posts
FOR EACH ROW EXECUTE FUNCTION check_and_award_achievements();

-- Trigger para REPUTAÇÃO (Users)
DROP TRIGGER IF EXISTS trigger_check_reputation_achievements ON users;
CREATE TRIGGER trigger_check_reputation_achievements
AFTER UPDATE OF reputation ON users
FOR EACH ROW EXECUTE FUNCTION check_and_award_achievements();

-- Trigger para USER_ACHIEVEMENTS (Notificação)
DROP TRIGGER IF EXISTS trigger_notify_new_achievement ON user_achievements;
CREATE TRIGGER trigger_notify_new_achievement
AFTER INSERT ON user_achievements
FOR EACH ROW EXECUTE FUNCTION notify_achievement_unlock();

-- Nota: Trigger de comments precisa verificar o nome correto da coluna de author/user id na tabela real.
-- Assumindo 'comments' com 'author_id'.
-- DROP TRIGGER IF EXISTS trigger_check_comment_achievements ON comments;
-- CREATE TRIGGER trigger_check_comment_achievements
-- AFTER INSERT ON comments
-- FOR EACH ROW EXECUTE FUNCTION check_and_award_achievements();
