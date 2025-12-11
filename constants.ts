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