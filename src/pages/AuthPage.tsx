import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { checkHasUsers, register, login } from '@/utils/api';
import { User, Lock, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const { setAuth, showToast } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [hasUsers, setHasUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = '登录 - Hi小呈同学';
    checkHasUsers().then((exists) => {
      setHasUsers(exists);
      if (!exists) {
        setMode('register');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('请输入用户名和密码', 'error');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const result = await register(username.trim(), password);
        setAuth(result.user, result.page);
        showToast('注册成功！欢迎加入', 'success');
        navigate('/');
      } else {
        const result = await login(username.trim(), password);
        setAuth(result.user, result.page);
        showToast('登录成功', 'success');
        navigate('/');
      }
    } catch (err: any) {
      showToast(err.message || '操作失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="glass rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10 pointer-events-none" />

          {/* Logo */}
          <div className="text-center mb-8 relative">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500
                flex items-center justify-center text-3xl shadow-lg shadow-primary-500/30">
                🌟
              </div>
            </div>
            <h1 className="text-3xl font-outfit font-bold text-white mb-2">
              Hi小呈同学
            </h1>
            <p className="text-white/50 text-sm font-source">
              {mode === 'register'
                ? '首次使用，创建你的专属空间'
                : '欢迎回来，继续你的旅程'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div>
              <label className="block text-white/70 text-sm mb-2 font-medium">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg glass bg-white/5 text-white placeholder-white/30
                    focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                  placeholder="输入用户名"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2 font-medium">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-lg glass bg-white/5 text-white placeholder-white/30
                    focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                  placeholder="输入密码"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg
                bg-gradient-to-r from-primary-400 to-secondary-500
                hover:from-primary-500 hover:to-secondary-600 transition-all
                text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed
                hover:shadow-lg hover:shadow-primary-500/30"
            >
              {mode === 'register' ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              {loading ? '处理中...' : mode === 'register' ? '创建账号' : '登录'}
            </button>
          </form>

          {/* Switch mode */}
          {hasUsers && (
            <div className="text-center mt-6 text-sm text-white/40 relative">
              {mode === 'login' ? (
                <>
                  没有账号？
                  <button
                    onClick={() => setMode('register')}
                    className="text-primary-400 hover:text-primary-300 ml-1 font-medium"
                  >
                    注册新账号
                  </button>
                </>
              ) : (
                <>
                  已有账号？
                  <button
                    onClick={() => setMode('login')}
                    className="text-primary-400 hover:text-primary-300 ml-1 font-medium"
                  >
                    去登录
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center mt-4 text-white/30 text-xs font-source">
          Hi小呈同学 - 记录生活，分享精彩
        </div>
      </div>
    </div>
  );
}
