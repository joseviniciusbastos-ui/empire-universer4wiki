export enum UserRole {
  ADMIN = 'ADMIN',
  CREATOR = 'CREATOR',
  MODERATOR = 'MODERATOR',
  USER = 'USER'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  avatarUrl: string;
  reputation: number;
  bio?: string;
  joinedAt: string;
}

export enum PostType {
  WIKI = 'WIKI',
  BLOG = 'BLOG',
  THREAD = 'THREAD',
  ARTICLE = 'ARTICLE'
}

export interface Post {
  id: string; // Transformed from number usually, or keep as string if we cast it
  type: PostType;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  authorReputation?: number; // Added
  slug: string;
  tags: string[];
  likes: number;
  createdAt: string;
  updatedAt?: string;
  views?: number;
  reactions?: Record<ReactionType, number>;
  userReaction?: ReactionType | null;
  lastEditedBy?: string;
  lastEditedByName?: string;
}

export type ReactionType = 'LIKE' | 'ROCKET' | 'INTEL' | 'STAR' | 'WARNING';

export interface PostReaction {
  id: number;
  post_id: number;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

// Database Row Type
export interface DB_Post {
  id: number;
  type: PostType;
  title: string;
  content: string;
  category: string;
  author_id: string;
  author_name: string;
  slug: string;
  tags: string[];
  likes: number;
  views: number;
  created_at: string;
  updated_at?: string;
  last_edited_by?: string;
  last_edited_by_name?: string;
  profiles?: {
    reputation: number;
  };
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface StarSystem {
  id: string;
  name: string;
  type: 'star' | 'blackhole' | 'nebula';
  x: number;
  y: number;
  connections: string[];
}

export interface ToolModule {
  id: string;
  name: string;
  status: 'active' | 'construction' | 'locked';
  description: string;
}

export interface BulletinItem {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'alert';
  createdAt: string;
}