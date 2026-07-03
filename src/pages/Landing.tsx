import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { listPages } from '@/utils/api';
import { PageListItem } from '@/types';
import { Sparkles, ArrowRight, Search, LogOut, UserCircle, MessageCircle, Users } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user, myPage, logout, showToast } = useStore();
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const list = await listPages();
      setPages(list);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('已退出登录', 'info');
    navigate('/login');
  };

  // 其他用户的主页（排除自己）
  const otherPages = pages.filter(p => p.id !== myPage?.id);
  const filteredPages = otherPages.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8 pt-16 relative">
      <div className="w-full max-w-4xl animate-fadeIn">
        {/* Top bar */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass">
            <UserCircle className="w-5 h-5 text-primary-300" />
            <span className="text-white/70 text-sm">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg glass hover:bg-white/20 transition-colors"
            title="退出登录"
          >
            <LogOut className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* My Page Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <span className="text-xl">🌟</span>
            <span className="text-white/70 text-sm font-source">我的空间</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-outfit font-bold text-white mb-4">
            欢迎回来，<span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">{user?.username}</span>
          </h1>

          <p className="text-lg text-white/60 font-source max-w-2xl mb-8">
            欢迎来到Hi小呈同学，这里是你的专属空间，记录生活，分享精彩。
          </p>

          {/* My page card */}
          {myPage && (
            <button
              onClick={() => navigate(`/page/${myPage.id}`)}
              className="group w-full flex items-center gap-6 p-6 rounded-2xl glass hover:bg-white/15
                transition-all duration-300 hover:scale-[1.02] hover:shadow-xl text-left"
            >
              <img
                src={myPage.data.avatar}
                alt={myPage.data.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-outfit font-bold text-white mb-1">
                  {myPage.data.name}
                </h2>
                <p className="text-primary-300 mb-2">{myPage.data.title}</p>
                <p className="text-white/50 text-sm line-clamp-1">{myPage.data.bio}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-medium">
                  我的主页
                </div>
                <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12" />

        {/* Other pages */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-secondary-300" />
              <h2 className="text-2xl font-outfit font-semibold text-white">
                其他用户主页
              </h2>
            </div>
            {otherPages.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索..."
                  className="pl-9 pr-4 py-2 rounded-lg glass bg-white/5 text-white placeholder-white/40
                    focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all text-sm w-48"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass rounded-xl p-6 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-white/10 mb-4" />
                  <div className="h-4 bg-white/10 rounded mb-2" />
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 mb-2">
                {otherPages.length === 0 ? '暂无其他用户主页' : '未找到匹配的页面'}
              </p>
              <p className="text-white/30 text-sm">
                {otherPages.length === 0 ? '分享你的主页链接，邀请朋友加入吧！' : '试试其他关键词'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPages.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => navigate(`/page/${page.id}`)}
                  className="group glass rounded-xl p-6 text-left hover:bg-white/15 transition-all duration-300
                    hover:scale-105 hover:shadow-lg animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <img
                      src={page.avatar}
                      alt={page.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-outfit font-semibold text-white truncate">
                        {page.name}
                      </h3>
                      <p className="text-sm text-primary-300 truncate">
                        {page.title}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-xs">
                      @{page.username}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-white/30 text-sm font-source">
          🌟 Hi小呈同学 - 记录生活，分享精彩
        </div>
      </div>
    </div>
  );
}
