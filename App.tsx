import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Book, MessageSquare, Terminal as TerminalIcon,
  Wrench, LogOut, Bell, Search, Menu, X, PlusCircle, User as UserIcon, BookOpen, History, Clock, LogIn, Shield, ShieldAlert
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { CURRENT_USER, CATEGORIES } from './constants';
import { Post, PostType, DB_Post } from './types';
import Terminal from './components/Terminal';
import Tools from './components/Tools';
import CreatePostModal from './components/CreatePostModal';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';
import { HomeView } from './components/HomeView';
import EditProfileModal from './components/EditProfileModal';
import { Button, Card, Badge, Input } from './components/Shared';

// --- SUB-COMPONENTS ---

const PostCard: React.FC<{ post: Post }> = ({ post }) => (
  <Card className="hover:border-space-muted transition-colors cursor-pointer group mb-4">
    <div className="flex justify-between items-start mb-2">
      <div className="flex gap-2">
        <Badge color={post.type === PostType.BLOG ? 'bg-space-neon text-black' : 'bg-space-steel'}>
          {post.type}
        </Badge>
        <span className="text-[10px] text-space-neon/80 uppercase font-mono border border-space-steel px-1">{post.category}</span>
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[10px] text-space-muted uppercase font-mono">#{tag}</span>
        ))}
      </div>
      <span className="text-[10px] text-space-muted font-mono">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
    </div>
    <h3 className="text-xl font-heading font-bold text-space-text group-hover:text-space-neon mb-2">
      {post.title}
    </h3>
    <p className="text-sm text-space-muted line-clamp-2 font-mono mb-4" dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]*>?/gm, '') }} />
    <div className="flex justify-between items-center border-t border-space-steel pt-3">
      <div className="flex items-center gap-2 text-xs text-space-muted">
        <UserIcon size={12} /> {post.authorName}
      </div>
      <div className="flex gap-4 text-xs font-mono">
        <span>CURTIDAS: {post.likes}</span>
        <span>VISUALIZAÇÕES: {post.views}</span>
      </div>
    </div>
  </Card>
);

// --- MAIN APP COMPONENT ---

const CATEGORY_KEYS = {
  [PostType.WIKI]: 'categories_wiki',
  [PostType.BLOG]: 'categories_blog',
  [PostType.THREAD]: 'categories_thread',
  [PostType.ARTICLE]: 'categories_article',
};

export default function App() {
  const [view, setView] = useState<'home' | 'wiki' | 'articles' | 'forum' | 'tools' | 'profile' | 'admin'>('home');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // App State
  const [currentUser, setCurrentUser] = useState<any>(null); // Use null for logged out
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Categories State
  const [appCategories, setAppCategories] = useState(CATEGORIES);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('app_settings').select('*');
      if (data && data.length > 0) {
        const newCats = { ...CATEGORIES };

        // Map settings to categories
        // We need to reverse map keys or just check them
        data.forEach(setting => {
          // Find which PostType corresponds to this key
          const typeEntry = Object.entries(CATEGORY_KEYS).find(([_, value]) => value === setting.key);
          if (typeEntry) {
            newCats[typeEntry[0] as PostType] = setting.value;
          }
        });
        setAppCategories(newCats);
      }
    };
    fetchCategories();
  }, []);


  // Auth Listener
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user?.id, session?.user?.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session?.user?.id, session?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string | undefined, sessionEmail?: string) => {
    if (!userId) {
      setCurrentUser(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      // Map DB Profile to Frontend
      setCurrentUser({
        id: data.id,
        username: data.username,
        role: data.role,
        avatarUrl: data.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + data.username,
        reputation: data.reputation,
        bio: data.bio,
        joinedAt: data.joined_at
      });
    } else {
      // Self-Healing
      console.warn("Profile missing for user. Attempting self-healing...");
      const defaultUsername = sessionEmail?.split('@')[0] || `user_${userId.slice(0, 8)}`;

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: defaultUsername,
          role: 'USER',
          avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=' + defaultUsername,
          reputation: 0,
          joined_at: new Date().toISOString()
        })
        .select()
        .single();

      if (newProfile) {
        setCurrentUser({
          id: newProfile.id,
          username: newProfile.username,
          role: newProfile.role,
          avatarUrl: newProfile.avatar_url,
          reputation: newProfile.reputation,
          bio: newProfile.bio,
          joinedAt: newProfile.joined_at
        });
      }
    }
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
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
    }
    setIsLoading(false);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const applySearch = (query: string) => {
    setSearchQuery(query);
  };

  // Login Modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createPostType, setCreatePostType] = useState<PostType>(PostType.ARTICLE);

  const openCreateModal = (type: PostType) => {
    if (!currentUser) {
      alert("Você precisa estar logado para postar.");
      setIsLoginModalOpen(true);
      return;
    }
    setCreatePostType(type);
    setIsCreateModalOpen(true);
  };


  // Edit Profile Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-space-black text-space-text font-sans selection:bg-space-neon selection:text-black overflow-hidden flex">

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          // Profile fetch is handled by auth listener
        }}
      />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        postType={createPostType}
        currentUser={currentUser}
        onPostCreated={fetchPosts}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onUpdate={() => fetchProfile(currentUser.id)}
      />

      {/* Terminal Overlay */}
      <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-space-dark border-r border-space-steel transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}
      >
        <div className="p-6 border-b border-space-steel flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-space-neon flex items-center justify-center animate-pulse-slow shadow-[0_0_15px_rgba(0,194,255,0.5)]">
              <TerminalIcon className="text-black" size={20} />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-wider text-white leading-none">EU4</h1>
              <span className="text-[10px] text-space-neon tracking-[0.2em]">SPACE WIKI</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-space-muted">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs text-space-muted font-mono mb-2 px-2">NAVEGAÇÃO</p>
            <Button variant={view === 'home' ? 'primary' : 'ghost'} className="w-full justify-start mb-1" onClick={() => setView('home')}>
              <BookOpen size={18} className="mr-3" /> CONTROLE DA MISSÃO
            </Button>
            <Button variant={view === 'wiki' ? 'primary' : 'ghost'} className="w-full justify-start mb-1" onClick={() => setView('wiki')}>
              <Book size={18} className="mr-3" /> ENCYCLOPEDIA GALACTICA
            </Button>
            <Button variant={view === 'articles' ? 'primary' : 'ghost'} className="w-full justify-start mb-1" onClick={() => setView('articles')}>
              <TerminalIcon size={18} className="mr-3" /> DATA LOGS
            </Button>
            <Button variant={view === 'forum' ? 'primary' : 'ghost'} className="w-full justify-start mb-1" onClick={() => setView('forum')}>
              <MessageSquare size={18} className="mr-3" /> REDE DE COMMS
            </Button>
            <Button variant={view === 'tools' ? 'primary' : 'ghost'} className="w-full justify-start mb-1" onClick={() => setView('tools')}>
              <Wrench size={18} className="mr-3" /> ENGENHARIA
            </Button>
          </div>

          <div>
            <p className="text-xs text-space-muted font-mono mb-2 px-2">PESSOAL</p>
            {currentUser ? (
              <>
                <Button variant={view === 'profile' ? 'primary' : 'ghost'} className="w-full justify-start mb-1" onClick={() => setView('profile')}>
                  <UserIcon size={18} className="mr-3" /> PERFIL: {currentUser.username.toUpperCase()}
                </Button>

                {currentUser.role === 'ADMIN' && (
                  <Button variant={view === 'admin' ? 'primary' : 'ghost'} className="w-full justify-start mb-1 text-space-neon" onClick={() => setView('admin')}>
                    <Shield size={18} className="mr-3" /> COMANDO
                  </Button>
                )}
                <div className="px-2 py-2">
                  <div className="bg-space-darker rounded border border-space-steel p-3">
                    <div className="flex justify-between text-xs text-space-muted mb-1">
                      <span>REPUTAÇÃO</span>
                      <span>NÍVEL {currentUser.reputation > 100 ? '99' : '1'}</span>
                    </div>
                    <div className="w-full bg-space-steel h-1 rounded-full overflow-hidden">
                      <div className="bg-space-neon h-full w-[45%]"></div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => supabase.auth.signOut()}>
                  <LogOut size={18} className="mr-3" /> ABORTAR SESSÃO
                </Button>
              </>
            ) : (
              <Button variant="primary" className="w-full justify-start animate-pulse-slow" onClick={() => setIsLoginModalOpen(true)}>
                <LogIn size={18} className="mr-3" /> ACESSAR SISTEMA
              </Button>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-space-steel">
          <div className="bg-space-darker rounded p-3 border border-space-steel/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-space-neon font-mono">SISTEMAS OPERANTES</span>
            </div>
            <p className="text-[10px] text-space-muted font-mono">v2.4.0-stable build 8921</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-space-steel bg-space-dark/80 backdrop-blur-md flex justify-between items-center px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-space-neon">
              <Menu size={24} />
            </button>
          </div>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-space-muted group-focus-within:text-space-neon transition-colors" size={18} />
              <input
                type="text"
                placeholder="Pesquisar na base de dados..."
                className="w-full bg-space-black border border-space-steel rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-space-neon focus:shadow-[0_0_10px_rgba(0,194,255,0.2)] transition-all placeholder:text-space-muted/50 font-mono"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="p-2 text-space-neon hover:bg-space-neon/10 rounded transition-colors"
              onClick={() => setIsTerminalOpen(true)}
              title="Abrir Terminal"
            >
              <TerminalIcon size={20} />
            </button>
            <button className="p-2 text-space-muted hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-space-alert rounded-full"></span>
            </button>
            {currentUser && (
              <div className="w-8 h-8 rounded border border-space-neon overflow-hidden">
                <img src={currentUser.avatarUrl} alt="User" />
              </div>
            )}
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-space-steel scrollbar-track-space-darker">


          {view === 'home' && (
            <HomeView
              stats={{
                population: "42.8K",
                todayGrowth: 128,
                archiveEntries: posts.filter(p => p.type === PostType.WIKI).length + 840,
                lastUpdate: "14m atrás",
                serverStatus: "99.9%"
              }}
              recentPosts={posts}
              isLoading={isLoading}
              onNavigate={setView}
              onPostClick={(post) => {
                // Ideally open a PostView, for now just log or could open modal
                console.log("Clicked post:", post);
              }}
            />
          )}

          {view === 'wiki' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display font-bold uppercase">Encyclopedia Galactica</h2>
                <Button variant="primary" onClick={() => openCreateModal(PostType.WIKI)}>NOVA ENTRADA</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-2">
                  <Card title="Categorias" className="p-4">
                    <ul className="space-y-3 font-heading text-lg text-space-muted uppercase tracking-wider">
                      <li onClick={() => applySearch('')} className="hover:text-space-neon cursor-pointer text-space-neon font-bold">Todas as Entradas</li>
                      {appCategories[PostType.WIKI].map(cat => (
                        <li key={cat} onClick={() => applySearch(cat)} className="hover:text-space-neon cursor-pointer transition-colors">
                          {cat}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
                <div className="md:col-span-3 space-y-4">
                  {filteredPosts.filter(p => p.type === PostType.WIKI).map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {filteredPosts.filter(p => p.type === PostType.WIKI).length === 0 && (
                    <div className="text-space-muted font-mono">Nenhuma entrada encontrada.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === 'articles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display font-bold uppercase">Data Logs (Blog)</h2>
                <Button variant="primary" onClick={() => openCreateModal(PostType.ARTICLE)}>NOVO LOG</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-2">
                  <Card title="Temas de Pesquisa" className="p-4">
                    <ul className="space-y-3 font-heading text-lg text-space-muted uppercase tracking-wider">
                      <li onClick={() => applySearch('')} className="hover:text-space-neon cursor-pointer text-space-neon font-bold">Todos os Artigos</li>
                      {appCategories[PostType.ARTICLE].map(cat => (
                        <li key={cat} onClick={() => applySearch(cat)} className="hover:text-space-neon cursor-pointer transition-colors">
                          {cat}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
                <div className="md:col-span-3 space-y-4">
                  {filteredPosts.filter(p => p.type === PostType.ARTICLE).map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {filteredPosts.filter(p => p.type === PostType.ARTICLE).length === 0 && (
                    <div className="text-space-muted font-mono">Nenhum artigo encontrado.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === 'forum' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display font-bold uppercase">Rede de Comms</h2>
                <Button variant="primary" onClick={() => openCreateModal(PostType.THREAD)}>INICIAR TÓPICO</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-2">
                  <Card title="Frequências de Rádio" className="p-4">
                    <ul className="space-y-3 font-heading text-lg text-space-muted uppercase tracking-wider">
                      <li onClick={() => applySearch('')} className="hover:text-space-neon cursor-pointer text-space-neon font-bold">Global Feed</li>
                      {appCategories[PostType.THREAD].map(cat => (
                        <li key={cat} onClick={() => applySearch(cat)} className="hover:text-space-neon cursor-pointer transition-colors">
                          {cat}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
                <div className="md:col-span-3 space-y-4">
                  {filteredPosts.filter(p => p.type === PostType.THREAD).map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {filteredPosts.filter(p => p.type === PostType.THREAD).length === 0 && (
                    <div className="text-space-muted font-mono">Nenhum tópico encontrado.</div>
                  )}
                </div>
              </div>
            </div>
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

          {view === 'profile' && currentUser && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
              <div className="flex gap-6 items-start relative">

                {/* Profile Card */}
                <div className="w-full bg-space-dark/50 border border-space-neon/30 rounded-xl overflow-hidden p-6 relative">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                    {/* Avatar Column */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative group">
                        <div className="w-40 h-40 rounded-full border-4 border-space-neon p-1 bg-black/50 overflow-hidden shadow-[0_0_30px_rgba(0,194,255,0.3)]">
                          <img src={currentUser.avatarUrl} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-space-black border border-space-neon rounded-full px-2 py-0.5 shadow-lg">
                          <span className="text-[10px] font-bold text-space-neon">LVL {currentUser.reputation > 100 ? '99' : '1'}</span>
                        </div>
                      </div>

                      <Button size="sm" variant="secondary" className="w-full" onClick={() => setIsEditProfileOpen(true)}>
                        <Wrench size={14} className="mr-2" /> EDITAR PERFIL
                      </Button>
                    </div>

                    {/* Info Column */}
                    <div className="flex-1 text-center md:text-left space-y-4 pt-2">
                      <div>
                        <h2 className="text-5xl font-display font-bold text-white tracking-wide mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{currentUser.username}</h2>
                        <div className="flex justify-center md:justify-start">
                          <Badge color="bg-space-neon text-black font-bold tracking-widest">{currentUser.role}</Badge>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-space-steel hidden md:block"></div>
                        <p className="font-mono text-space-muted text-sm md:pl-4 italic leading-relaxed max-w-2xl">
                          "{currentUser.bio || 'Sem dados biográficos registrados no arquivo. O silêncio é o som do espaço.'}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 bg-space-black/40 rounded-lg p-6 border border-space-steel/20 backdrop-blur-sm">
                    <div className="text-center group cursor-default">
                      <p className="text-[10px] text-space-muted uppercase tracking-widest group-hover:text-space-neon transition-colors">Entrou em</p>
                      <p className="font-mono text-white text-sm">{new Date(currentUser.joinedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-center group cursor-default">
                      <p className="text-[10px] text-space-muted uppercase tracking-widest group-hover:text-space-neon transition-colors">Reputação</p>
                      <p className="font-mono text-space-neon text-xl font-bold">{currentUser.reputation}</p>
                    </div>
                    <div className="text-center group cursor-default">
                      <p className="text-[10px] text-space-muted uppercase tracking-widest group-hover:text-space-neon transition-colors">Missões</p>
                      <p className="font-mono text-white text-xl">0</p>
                    </div>
                    <div className="text-center group cursor-default">
                      <p className="text-[10px] text-space-muted uppercase tracking-widest group-hover:text-space-neon transition-colors">ID do Agente</p>
                      <p className="font-mono text-space-muted text-xs">{currentUser.id.split('-')[0]}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {view === 'profile' && !currentUser && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <h2 className="text-2xl font-bold text-space-neon">ACESSO RESTRITO</h2>
              <p className="text-space-muted">Faça login para visualizar seu perfil.</p>
              <Button onClick={() => setIsLoginModalOpen(true)}>LOGIN</Button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}