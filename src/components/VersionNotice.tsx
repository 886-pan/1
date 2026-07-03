import { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

const DISMISS_KEY = 'version-notice-dismissed';

export default function VersionNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 检查是否已经关闭过
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md glass rounded-2xl p-6 shadow-2xl border border-white/20">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/50" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-400 to-secondary-500
            flex items-center justify-center text-2xl">
            🌟
          </div>
          <div>
            <h2 className="text-xl font-outfit font-bold text-white">
              Hi小呈同学
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">
                V1.0 初代实验版
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 text-white/70 text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-2">
                  欢迎体验初代实验版本
                </p>
                <p className="text-white/60">
                  这是本项目的第一个公开发布版本，功能可能不够完善，后续将持续更新优化。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-white/50">
              当前版本包含的功能：
            </p>
            <ul className="text-white/60 space-y-1 pl-4">
              <li>• 用户注册登录系统</li>
              <li>• 个人空间创建与编辑</li>
              <li>• 实时私聊功能</li>
              <li>• 匿名/实名聊天切换</li>
              <li>• 图片与表情发送</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-400/20">
            <p className="text-primary-300 text-xs">
              💡 提示：本版本数据存储在服务器内存中，服务器重启后数据可能丢失。后续版本将添加持久化存储。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-white/40 text-xs">
            点击下方按钮开始使用
          </p>
          <button
            onClick={handleDismiss}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-400 to-secondary-500
              hover:from-primary-500 hover:to-secondary-600 transition-all text-white font-medium
              hover:shadow-lg hover:shadow-primary-500/30"
          >
            开始体验
          </button>
        </div>
      </div>
    </div>
  );
}