import { Post, PostType, User, UserRole, Comment, ToolModule, StarSystem } from './types';

export const CURRENT_USER: User = {
  id: 'u-1',
  username: 'ComandanteAdmin',
  role: UserRole.ADMIN,
  avatarUrl: 'https://picsum.photos/seed/admin/200/200',
  reputation: 9999,
  joinedAt: '2024-01-01T00:00:00Z',
  bio: 'Arquiteto de Sistemas e Imperador do Universo.'
};

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

export const MOCK_POSTS: Post[] = [
  {
    id: 'p-1',
    type: PostType.BLOG,
    title: 'Notas de Atualização v4.2: A Expansão do Vazio',
    content: '<p>O vazio está se expandindo. Novos setores desbloqueados no <strong>Quadrante Gama</strong>. Espere turbulência e novas anomalias gravitacionais.</p>',
    category: 'Oficial',
    authorId: 'u-1',
    authorName: 'ComandanteAdmin',
    slug: 'notas-atualizacao-4-2',
    tags: ['atualização', 'noticias'],
    likes: 154,
    createdAt: '2024-05-10T12:00:00Z',
    views: 1205
  },
  {
    id: 'p-2',
    type: PostType.WIKI,
    title: 'Mecânicas do Motor de Dobra',
    content: '<h3>Visão Geral</h3><p>O Motor de Dobra (Warp Drive) dobra o espaço-tempo para permitir viagens FTL (Faster Than Light).</p><h4>Consumo de Combustível</h4><p>Requer células de Antimatéria refinada.</p>',
    category: 'Mecânicas',
    authorId: 'u-2',
    authorName: 'OficialCiencia',
    slug: 'mecanicas-motor-dobra',
    tags: ['guia', 'tecnologia'],
    likes: 89,
    createdAt: '2024-02-15T09:30:00Z',
    views: 5402
  },
  {
    id: 'p-3',
    type: PostType.THREAD,
    title: 'Melhor loadout para classe Destroyer?',
    content: 'Tenho tentado otimizar minha build de Destroyer para PvE. O que acham de Canhões de Plasma vs Railguns para dano sustentado?',
    category: 'Estratégia',
    authorId: 'u-3',
    authorName: 'PilotoNovato',
    slug: 'ajuda-loadout-destroyer',
    tags: ['naves', 'combate'],
    likes: 12,
    createdAt: '2024-05-11T18:45:00Z',
    views: 300
  },
  {
    id: 'p-4',
    type: PostType.ARTICLE,
    title: 'A História da Guerra da Unificação',
    content: '<p>Antes da expansão para o Quadrante Gama, as facções solares lutaram por recursos escassos...</p>',
    category: 'História',
    authorId: 'u-4',
    authorName: 'HistoriadorGalactico',
    slug: 'historia-guerra-unificacao',
    tags: ['lore', 'historia'],
    likes: 342,
    createdAt: '2024-01-20T14:20:00Z',
    views: 8900
  }
];

export const MOCK_TOOLS: ToolModule[] = [
  { id: 't-1', name: 'Calculadora de Frota', status: 'active', description: 'Otimize o consumo de combustível e poder de fogo.' },
  { id: 't-2', name: 'Mapa Estelar v2.0', status: 'construction', description: 'Mapeamento 3D em tempo real dos setores conquistados.' },
  { id: 't-3', name: 'Simulador de Comércio', status: 'locked', description: 'Acesso restrito a mercadores de nível 5+.' },
];

export const MOCK_SYSTEMS: StarSystem[] = [
  { id: 'sys-1', name: 'Sol', type: 'star', x: 400, y: 300, connections: ['sys-2', 'sys-3'] },
  { id: 'sys-2', name: 'Alpha Centauri', type: 'star', x: 480, y: 250, connections: ['sys-1', 'sys-4'] },
  { id: 'sys-3', name: 'Sirius', type: 'star', x: 320, y: 380, connections: ['sys-1', 'sys-5'] },
  { id: 'sys-4', name: 'Cygnus', type: 'blackhole', x: 550, y: 200, connections: ['sys-2'] },
  { id: 'sys-5', name: 'Orion', type: 'nebula', x: 250, y: 420, connections: ['sys-3'] },
];

export const MOCK_COMMENTS: Comment[] = [
  { id: 'c-1', postId: 'p-3', authorId: 'u-1', authorName: 'ComandanteAdmin', content: 'Railguns para alcance, Plasma para DPS bruto.', createdAt: '2024-05-11T19:00:00Z' }
];