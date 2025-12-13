import { PostType } from './types';

export const ALLOWED_TAGS = [
  'atualização', 'noticias', 'guia', 'tutorial', 'naves', 'combate',
  'economia', 'lore', 'diplomacia', 'bugs', 'pvp', 'pve'
];

export const CATEGORIES = {
  [PostType.WIKI]: ['Mecânicas', 'Naves', 'Tecnologia', 'Planetas', 'Facções'],
  [PostType.THREAD]: ['Geral', 'Estratégia', 'Recrutamento', 'Off-Topic', 'Suporte'],
  [PostType.ARTICLE]: ['Análise', 'História', 'Entrevistas', 'Meta-Game'],
  [PostType.BLOG]: ['Oficial', 'DevLog', 'Eventos']
};

export const RANK_THRESHOLDS = [
  { min: 0, title: 'Cadete', icon: 'shield', color: 'text-space-muted' },
  { min: 50, title: 'Oficial', icon: 'award', color: 'text-space-neon' },
  { min: 200, title: 'Comandante', icon: 'star', color: 'text-blue-400' },
  { min: 500, title: 'Capitão', icon: 'zap', color: 'text-yellow-400' },
  { min: 1000, title: 'Almirante', icon: 'crown', color: 'text-red-500' }
];