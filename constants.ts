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
  { min: 0, title: 'Civil / Recruta', icon: 'shield', color: 'text-space-muted' },
  { min: 10, title: 'Cadete', icon: 'shield', color: 'text-space-muted' },
  { min: 25, title: 'Tripulante', icon: 'shield', color: 'text-blue-300' },
  { min: 50, title: 'Suboficial', icon: 'award', color: 'text-blue-400' },
  { min: 100, title: 'Alferes', icon: 'award', color: 'text-space-neon' },
  { min: 200, title: 'Tenente Júnior', icon: 'award', color: 'text-space-neon' },
  { min: 400, title: 'Tenente', icon: 'zap', color: 'text-cyan-400' },
  { min: 800, title: 'Tenente-Comandante', icon: 'zap', color: 'text-cyan-500' },
  { min: 1500, title: 'Comandante', icon: 'star', color: 'text-indigo-400' },
  { min: 3000, title: 'Capitão', icon: 'star', color: 'text-indigo-500' },
  { min: 6000, title: 'Comodoro', icon: 'star', color: 'text-yellow-500' },
  { min: 10000, title: 'Contra-Almirante', icon: 'crown', color: 'text-orange-500' },
  { min: 15000, title: 'Vice-Almirante', icon: 'crown', color: 'text-red-400' },
  { min: 25000, title: 'Almirante', icon: 'crown', color: 'text-red-500' },
  { min: 50000, title: 'Almirante da Frota', icon: 'crown', color: 'text-red-600 font-black' }
];