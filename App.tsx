import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { CURRENT_USER, CATEGORIES } from './constants';
import { Post, PostType, DB_Post } from './types';
import { CacheManager, debounce } from './lib/cache';
import Terminal from './components/Terminal';
import Tools from './components/Tools';
import CreatePostModal from './components/modals/CreatePostModal';
import LoginModal from './components/modals/LoginModal';
import AdminPanel from './components/AdminPanel';
import { HomeView } from './components/views/HomeView';
import EditProfileModal from './components/modals/EditProfileModal';
import PostViewModal from './components/modals/PostViewModal';
import { MainLayout } from './components/layout/MainLayout';
import { WikiView } from './components/views/WikiView';
import { BlogView } from './components/views/BlogView';
import { ForumView } from './components/views/ForumView';
import { ProfileView } from './components/views/ProfileView';
import { useToast } from './contexts/ToastContext';
import { useAuth } from './contexts/AuthContext';
import { FilterState } from './components/SearchFilters';
import EditAboutModal from './components/modals/EditAboutModal'; // Import new modal

const CATEGORY_KEYS = {
  [PostType.WIKI]: 'categories_wiki',
  [PostType.BLOG]: 'categories_blog',
  [PostType.THREAD]: 'categories_thread',
  [PostType.ARTICLE]: 'categories_article',
};

export default function App() {
  const [view, setView] = useState<'home' | 'wiki' | 'articles' | 'forum' | 'tools' | 'profile' | 'admin' | 'post-view'>('home');

  // App State
  const { currentUser, isLoading: isAuthLoading, refreshProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<FilterState>({
    category: 'all',
    author: '',
    dateRange: 'all',
    tags: []
  });

  // About Wiki State
  const [aboutTitle, setAboutTitle] = useState('Bem-vindo à Wiki EU4');
  const [aboutContent, setAboutContent] = useState('Esta é a enciclopédia colaborativa dedicada ao universo de Empire Universe 4.');
  const [isEditAboutModalOpen, setIsEditAboutModalOpen] = useState(false);

  // Dynamic Categories State
  const [appCategories, setAppCategories] = useState(CATEGORIES);

  // Fetch Categories and About Content
  useEffect(() => {
    const fetchSettings = async () => {
      // Fetch Categories
      const { data: catData } = await supabase.from('app_settings').select('*');
      if (catData && catData.length > 0) {
        const newCats = { ...CATEGORIES };
        catData.forEach(setting => {
          const typeEntry = Object.entries(CATEGORY_KEYS).find(([_, value]) => value === setting.key);
          if (typeEntry) {
            newCats[typeEntry[0] as PostType] = setting.value;
          }
        });
        setAppCategories(newCats);
      }

      // Fetch About Content
      const { data: siteData } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['about_title', 'about_content']);

      if (siteData) {
        const title = siteData.find(s => s.key === 'about_title')?.value || 'Bem-vindo à Wiki EU4';
        const content = siteData.find(s => s.key === 'about_content')?.value || 'Esta é a enciclopédia colaborativa dedicada ao universo de Empire Universe 4.';
        setAboutTitle(title);
        setAboutContent(content);
      }
    };
    fetchSettings();
  }, []);

  // Search State with debounce
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounced search
  const debouncedSearch = useRef(
    debounce((query: string) => {
      setDebouncedQuery(query);
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedPosts = CacheManager.getPosts();
      if (cachedPosts) {
        setPosts(cachedPosts);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else if (data) {
      const mappedPosts: Post[] = data.map((dbPost: DB_Post) => ({
        id: dbPost.id.toString(),
        type: dbPost.type,
        title: dbPost.title,
        content: dbPost.content,
        category: dbPost.category,
        authorId: dbPost.author_id,
        authorName: dbPost.author_name,
        slug: dbPost.slug,
        tags: dbPost.tags || [],
        likes: dbPost.likes,
        views: dbPost.views,
        createdAt: dbPost.created_at,
        updatedAt: dbPost.updated_at
      }));
      setPosts(mappedPosts);
      CacheManager.setPosts(mappedPosts);
    }
    setIsLoading(false);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(debouncedQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (searchFilters.category !== 'all' && post.category !== searchFilters.category) return false;
    if (searchFilters.author && !post.authorName.toLowerCase().includes(searchFilters.author.toLowerCase())) return false;

    if (searchFilters.dateRange !== 'all') {
      const date = new Date(post.createdAt);
      const now = new Date();
      if (searchFilters.dateRange === 'today') {
        if (date.toDateString() !== now.toDateString()) return false;
      } else if (searchFilters.dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (date < weekAgo) return false;
      } else if (searchFilters.dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (date < monthAgo) return false;
      }
    }
    return true;
  });

  const applySearch = (query: string) => {
    setSearchQuery(query);
  };

  // Modals & User Actions
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createPostType, setCreatePostType] = useState<PostType>(PostType.ARTICLE);
  const { showToast } = useToast();

  const openCreateModal = (type: PostType) => {
    if (!currentUser) {
      showToast("Você precisa estar logado para postar.", "error");
      setIsLoginModalOpen(true);
      return;
    }
    setCreatePostType(type);
    setIsCreateModalOpen(true);
  };

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostViewOpen, setIsPostViewOpen] = useState(false);

  const openPostView = (post: Post) => {
    setSelectedPost(post);
    setIsPostViewOpen(true);
  };

  // REFACTORED DELETION LOGIC
  const handleDeletePostConfirmed = async (postId: string) => {
    // 1. Perform deletion in Supabase
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) {
        console.error('[DEBUG] Supabase DELETE Error:', error);
        // Throwing the error ensures the modal's catch block handles the toast error message
        throw new Error(error.message); 
    }

    // 2. Update local state (optimistic update)
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    
    // 3. Clear cache and force a re-fetch to ensure data integrity
    CacheManager.clearPosts();
    await fetchPosts(true);
    
    // 4. Close the modal and clear selection
    setIsPostViewOpen(false);
    setSelectedPost(null); 
    
    showToast('Post excluído com sucesso!', 'success');
  };

  const handlePostCreated = () => {
    CacheManager.clearPosts();
    fetchPosts(true);
  };

  const handleAboutSave = async () => {
    // Re-fetch site settings to update local state after admin save
    const { data: siteData } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['about_title', 'about_content']);

    if (siteData) {
        const title = siteData.find(s => s.key === 'about_title')?.value || 'Bem-vindo à Wiki EU4';
        const content = siteData.find(s => s.key === 'about_content')?.value || 'Esta é a enciclopédia colaborativa dedicada ao universo de Empire Universe 4.';
        setAboutTitle(title);
        setAboutContent(content);
    }
  };

  return (
    <MainLayout
      view={view}
      setView={setView}
      currentUser={currentUser}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onLoginClick={() => setIsLoginModalOpen(true)}
    >
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => { }}
      />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        postType={createPostType}
        currentUser={currentUser}
        onPostCreated={handlePostCreated}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onUpdate={refreshProfile}
      />

      <PostViewModal
        post={selectedPost}
        isOpen={isPostViewOpen}
        onClose={() => setIsPostViewOpen(false)}
        currentUser={currentUser}
        onDeleteConfirmed={handleDeletePostConfirmed} // Using the new centralized function
      />

      <EditAboutModal
        isOpen={isEditAboutModalOpen}
        onClose={() => setIsEditAboutModalOpen(false)}
        currentTitle={aboutTitle}
        currentContent={aboutContent}
        onSave={handleAboutSave}
      />

      {/* RENDER CURRENT VIEW */}
      {view === 'home' && (
        <HomeView
          stats={{
            wikiCount: posts.filter(p => p.type === PostType.WIKI).length,
            logsCount: posts.filter(p => p.type !== PostType.WIKI).length,
            contributorsCount: new Set(posts.map(p => p.authorId)).size,
            lastUpdate: posts.length > 0 ? 'Recente' : "N/A" // Simplified
          }}
          recentPosts={filteredPosts}
          isLoading={isLoading}
          onNavigate={setView}
          onPostClick={(post) => openPostView(post)}
          aboutTitle={aboutTitle}
          aboutContent={aboutContent}
          currentUser={currentUser}
          onEditAbout={() => setIsEditAboutModalOpen(true)}
        />
      )}

      {view === 'wiki' && (
        <WikiView
          posts={filteredPosts}
          categories={appCategories[PostType.WIKI]}
          onCategoryClick={applySearch}
          onCreateClick={() => openCreateModal(PostType.WIKI)}
          onPostClick={openPostView}
        />
      )}

      {view === 'articles' && (
        <BlogView
          posts={filteredPosts}
          categories={appCategories[PostType.ARTICLE]}
          onCategoryClick={applySearch}
          onCreateClick={() => openCreateModal(PostType.ARTICLE)}
          onPostClick={openPostView}
        />
      )}

      {view === 'forum' && (
        <ForumView
          posts={filteredPosts}
          categories={appCategories[PostType.THREAD]}
          onCategoryClick={applySearch}
          onCreateClick={() => openCreateModal(PostType.THREAD)}
          onPostClick={openPostView}
        />
      )}

      {view === 'tools' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-display font-bold uppercase">Ferramentas de Engenharia</h2>
          <Tools />
        </div>
      )}

      {view === 'admin' && currentUser && (
        <AdminPanel currentUser={currentUser} />
      )}

      {view === 'profile' && (
        <ProfileView
          currentUser={currentUser}
          onEditProfile={() => setIsEditProfileOpen(true)}
          onLoginClick={() => setIsLoginModalOpen(true)}
        />
      )}

    </MainLayout>
  );
}