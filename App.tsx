import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { CATEGORIES } from './constants';
import { Post, PostType, DB_Post, BulletinItem } from './types';
import { CacheManager, debounce } from './lib/cache';
import Terminal from './components/Terminal';
import Tools from './components/Tools';
import CreatePostModal from './components/modals/CreatePostModal';
import FeedbackModal from './components/modals/FeedbackModal';
import LoginModal from './components/modals/LoginModal';
import AdminPanel from './components/AdminPanel';
import { HomeView } from './components/views/HomeView';
import EditProfileModal from './components/modals/EditProfileModal';
import EditWelcomeModal from './components/modals/EditWelcomeModal';
import EditBulletinModal from './components/modals/EditBulletinModal';
import BulletinViewModal from './components/modals/BulletinViewModal';
import PostViewModal from './components/modals/PostViewModal';
import { PostView } from './components/views/PostView';
import { MainLayout } from './components/layout/MainLayout';
import { WikiView } from './components/views/WikiView';
import { BlogView } from './components/views/BlogView';
import { ForumView } from './components/views/ForumView';
import { ProfileView } from './components/views/ProfileView';
import { PublicProfileView } from './components/views/PublicProfileView';
import { useToast } from './contexts/ToastContext';
import { useAuth } from './contexts/AuthContext';
import { FilterState } from './components/SearchFilters';
import { LoginRequiredView } from './components/views/LoginRequiredView';

const CATEGORY_KEYS = {
  [PostType.WIKI]: 'categories_wiki',
  [PostType.BLOG]: 'categories_blog',
  [PostType.THREAD]: 'categories_thread',
  [PostType.ARTICLE]: 'categories_article',
};

export default function App() {
  const [view, setView] = useState<'home' | 'wiki' | 'articles' | 'forum' | 'tools' | 'profile' | 'admin' | 'post-view' | 'public-profile'>('home');

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

  // Dynamic Categories State
  const [appCategories, setAppCategories] = useState(CATEGORIES);

  // Welcome Section State
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeContent, setWelcomeContent] = useState('');
  const [isEditWelcomeOpen, setIsEditWelcomeOpen] = useState(false);

  // Bulletin State
  const [bulletins, setBulletins] = useState<BulletinItem[]>([]);
  const [isEditBulletinOpen, setIsEditBulletinOpen] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinItem | null>(null);
  const [isBulletinViewOpen, setIsBulletinViewOpen] = useState(false);

  // Read Posts Tracking
  const [readPosts, setReadPosts] = useState<Set<string>>(new Set());
  const [onlineCount, setOnlineCount] = useState(1); // Default to at least 1 (the current user)

  // Fetch Categories and Settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('app_settings').select('*');
      if (data && data.length > 0) {
        const newCats = { ...CATEGORIES };
        let wTitle = '';
        let wContent = '';
        let currentBulletins: BulletinItem[] = [];

        data.forEach(setting => {
          // Categories
          const typeEntry = Object.entries(CATEGORY_KEYS).find(([_, value]) => value === setting.key);
          if (typeEntry) {
            newCats[typeEntry[0] as PostType] = setting.value;
          }
          // Welcome Section
          if (setting.key === 'welcome_title') wTitle = setting.value;
          if (setting.key === 'welcome_content') wContent = setting.value;
          // Bulletin
          if (setting.key === 'official_bulletin') currentBulletins = setting.value;
        });

        setAppCategories(newCats);
        setWelcomeTitle(wTitle);
        setWelcomeContent(wContent);
        setBulletins(currentBulletins);
      }
    };
    fetchSettings();
  }, []);

  // Load read posts from localStorage when user changes
  useEffect(() => {
    if (currentUser) {
      const stored = localStorage.getItem(`readPosts_${currentUser.id}`);
      if (stored) {
        try {
          setReadPosts(new Set(JSON.parse(stored)));
        } catch (e) {
          console.error('Error loading read posts:', e);
        }
      }

      // Heartbeat: Update last_seen every 3 minutes
      updateLastSeen();
      const heartbeat = setInterval(updateLastSeen, 3 * 60 * 1000);
      return () => clearInterval(heartbeat);
    } else {
      setReadPosts(new Set());
    }
  }, [currentUser?.id]);

  const updateLastSeen = async () => {
    if (!currentUser) return;
    await supabase
      .from('profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', currentUser.id);
  };

  // Fetch Online Count
  useEffect(() => {
    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchOnlineCount = async () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('last_seen', twentyFourHoursAgo);

    if (!error && count !== null) {
      setOnlineCount(count);
    }
  };

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
      .select('*, profiles(reputation)')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else if (data) {
      const mappedPosts: Post[] = data.map((dbPost: DB_Post | any) => ({
        id: dbPost.id.toString(),
        type: dbPost.type,
        title: dbPost.title,
        content: dbPost.content,
        category: dbPost.category,
        authorId: dbPost.author_id,
        authorName: dbPost.author_name,
        lastEditedBy: dbPost.last_edited_by,
        lastEditedByName: dbPost.last_edited_by_name,
        authorReputation: dbPost.profiles?.reputation || 0,
        slug: dbPost.slug,
        tags: dbPost.tags || [],
        likes: dbPost.likes,
        views: dbPost.views,
        displayOrder: dbPost.display_order || 0,
        deletedAt: dbPost.deleted_at,
        createdAt: dbPost.created_at,
        updatedAt: dbPost.updated_at
      }));
      setPosts(mappedPosts);
      CacheManager.setPosts(mappedPosts);
    }
    setIsLoading(false);
  };

  const filteredPosts = posts.filter(post => {
    // Exclude soft-deleted posts from normal views
    if (post.deletedAt) return false;

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
    setEditingPost(undefined); // Ensure we are in create mode
  };

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined);

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setCreatePostType(post.type);
    setIsCreateModalOpen(true);
    setIsPostViewOpen(false); // Close view modal
  };

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostViewOpen, setIsPostViewOpen] = useState(false);

  const openPostView = (post: Post) => {
    setSelectedPost(post);
    setView('post-view');
  };

  const handlePostDelete = async (deletedPostId: string) => {
    // Change hard-delete to soft-delete
    const { error } = await supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deletedPostId);

    if (error) throw error;

    // Optimistic UI: Remove from local state
    setPosts(posts.filter(p => p.id !== deletedPostId));
    CacheManager.clearPosts();
  };

  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);

  const handleProfileClick = (userId: string) => {
    setViewingProfileId(userId);
    setView('public-profile');
  };

  const handlePostCreated = () => {
    CacheManager.clearPosts();
    fetchPosts(true);
  };

  const handleSaveWelcome = async (title: string, content: string) => {
    try {
      // Upsert settings
      const updates = [
        { key: 'welcome_title', value: title },
        { key: 'welcome_content', value: content }
      ];

      const { error } = await supabase.from('app_settings').upsert(updates, { onConflict: 'key' });
      if (error) throw error;

      setWelcomeTitle(title);
      setWelcomeContent(content);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const handleSaveBulletin = async (newBulletins: BulletinItem[]) => {
    try {
      const { error } = await supabase.from('app_settings')
        .upsert([{ key: 'official_bulletin', value: newBulletins }], { onConflict: 'key' });

      if (error) throw error;
      setBulletins(newBulletins);
    } catch (error) {
      console.error('Error saving bulletins:', error);
      throw error;
    }
  };

  // Handle bulletin click (Post or Modal)
  const handleBulletinClick = async (item: BulletinItem) => {
    // If it has a postId, try to open the post
    if (item.postId) {
      const post = posts.find(p => p.id === item.postId);
      if (post) {
        openPostView(post);
        // Mark as read
        if (currentUser) {
          setReadPosts(prev => {
            const newSet = new Set(prev).add(item.postId!);
            localStorage.setItem(`readPosts_${currentUser.id}`, JSON.stringify([...newSet]));
            return newSet;
          });
        }
        return;
      }
      // If post not found (maybe deleted), fall through to show the bulletin text content
    }

    // Default: Open BulletinViewModal
    setSelectedBulletin(item);
    setIsBulletinViewOpen(true);
  };

  // Removed misplaced import

  // ... (existing imports)

  // ... (inside App component)

  // Helper to restrict access
  const RestrictedView = ({ children }: { children: React.ReactNode }) => {
    if (!currentUser) {
      return <LoginRequiredView onLoginClick={() => setIsLoginModalOpen(true)} />;
    }
    return <>{children}</>;
  };

  return (
    <MainLayout
      view={view}
      setView={setView}
      currentUser={currentUser}
      onLoginClick={() => setIsLoginModalOpen(true)}
      onFeedbackClick={() => setIsFeedbackModalOpen(true)}
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
        initialData={editingPost}
        availableCategories={appCategories[createPostType] || []}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onUpdate={refreshProfile}
      />

      {/* Removed PostViewModal for dedicated PostView */}

      {/* RENDER CURRENT VIEW */}
      {view === 'home' && (
        <HomeView
          stats={{
            wikiCount: posts.filter(p => p.type === PostType.WIKI).length,
            logsCount: posts.filter(p => p.type !== PostType.WIKI).length,
            contributorsCount: new Set(posts.map(p => p.authorId)).size,
            onlineCount: onlineCount,
            lastUpdate: posts.length > 0 ? 'Recente' : "N/A"
          }}
          recentPosts={filteredPosts}
          isLoading={isLoading}
          onNavigate={setView}
          onPostClick={(post) => openPostView(post)}
          aboutTitle={welcomeTitle}
          aboutContent={welcomeContent}
          currentUser={currentUser}
          onEditAbout={() => setIsEditWelcomeOpen(true)}
          onAuthorClick={handleProfileClick}
          bulletins={bulletins}
          onEditBulletin={() => setIsEditBulletinOpen(true)}
          onBulletinClick={handleBulletinClick}
          readPosts={readPosts}
        />
      )}

      <EditBulletinModal
        isOpen={isEditBulletinOpen}
        onClose={() => setIsEditBulletinOpen(false)}
        currentBulletins={bulletins}
        onSave={handleSaveBulletin}
      />

      <BulletinViewModal
        isOpen={isBulletinViewOpen}
        onClose={() => setIsBulletinViewOpen(false)}
        bulletin={selectedBulletin}
      />

      {view === 'wiki' && (
        <RestrictedView>
          <WikiView
            posts={filteredPosts}
            categories={appCategories[PostType.WIKI]}
            activeCategory={searchFilters.category}
            onCategoryClick={(cat) => setSearchFilters(prev => ({ ...prev, category: cat === searchFilters.category ? 'all' : cat }))}
            onCreateClick={() => openCreateModal(PostType.WIKI)}
            onPostClick={openPostView}
            currentUser={currentUser}
            onAuthorClick={handleProfileClick}
            searchQuery={searchQuery}
            onSearchChange={applySearch}
          />
        </RestrictedView>
      )}

      {view === 'articles' && (
        <RestrictedView>
          <BlogView
            posts={filteredPosts}
            categories={[...appCategories[PostType.ARTICLE], ...appCategories[PostType.BLOG]]}
            onCategoryClick={(cat) => setSearchFilters(prev => ({ ...prev, category: cat || 'all' }))}
            onCreateClick={() => openCreateModal(PostType.ARTICLE)}
            onPostClick={openPostView}
            onAuthorClick={handleProfileClick}
            searchQuery={searchQuery}
            onSearchChange={applySearch}
          />
        </RestrictedView>
      )}

      {view === 'forum' && (
        <RestrictedView>
          <ForumView
            posts={filteredPosts}
            categories={appCategories[PostType.THREAD]}
            onCategoryClick={(cat) => setSearchFilters(prev => ({ ...prev, category: cat || 'all' }))}
            onCreateClick={() => openCreateModal(PostType.THREAD)}
            onPostClick={openPostView}
            onAuthorClick={handleProfileClick}
            searchQuery={searchQuery}
            onSearchChange={applySearch}
          />
        </RestrictedView>
      )}

      {view === 'tools' && (
        <RestrictedView>
          <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold uppercase">Ferramentas de Engenharia</h2>
            <Tools />
            {/* Feedback Modal */}
            <FeedbackModal
              isOpen={isFeedbackModalOpen}
              onClose={() => setIsFeedbackModalOpen(false)}
              currentUser={currentUser}
            />
          </div>
        </RestrictedView>
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

      {view === 'public-profile' && viewingProfileId && (
        <PublicProfileView
          userId={viewingProfileId}
          onClose={() => setView('home')}
          onPostClick={openPostView}
        />
      )}

      {view === 'post-view' && selectedPost && (
        <div className="container mx-auto px-4 py-8">
          <PostView
            post={selectedPost}
            onClose={() => setView('home')} // Default back to home
            currentUser={currentUser}
            onDeleteConfirmed={handlePostDelete}
            onEdit={handleEditPost}
            onAuthorClick={handleProfileClick}
          />
        </div>
      )}

      <EditWelcomeModal
        isOpen={isEditWelcomeOpen}
        onClose={() => setIsEditWelcomeOpen(false)}
        initialTitle={welcomeTitle}
        initialContent={welcomeContent}
        onSave={handleSaveWelcome}
      />

    </MainLayout>
  );
}