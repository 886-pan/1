import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { getPage, createChatSession, updateChatSettings } from '@/utils/api';
import { PersonalInfo } from '@/types';
import Avatar from '@/components/Avatar';
import SkillTag from '@/components/SkillTag';
import ContactItem from '@/components/ContactItem';
import SocialLinkButton from '@/components/SocialLinkButton';
import ChatWindow from '@/components/ChatWindow';
import { Edit2, Share2, Home, Check, MessageCircle, Eye, EyeOff, Settings } from 'lucide-react';

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, myPage, showToast } = useStore();
  const [info, setInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [useAnonymous, setUseAnonymous] = useState(false);

  // 从我的主页聊天设置中读取匿名状态
  useEffect(() => {
    if (myPage?.data?.chatSettings) {
      setUseAnonymous(myPage.data.chatSettings.useAnonymous);
    }
  }, [myPage]);

  useEffect(() => {
    if (id) loadPage(id);
  }, [id]);

  const loadPage = async (pageId: string) => {
    try {
      const page = await getPage(pageId);
      setInfo(page.data);
    } catch (error) {
      showToast('页面不存在', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const isMyPage = user?.pageId === id;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('链接已复制！可以分享给朋友了', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast('复制失败，请手动复制地址栏链接', 'error');
    }
  };

  const toggleAnonymous = async () => {
    const newValue = !useAnonymous;
    setUseAnonymous(newValue);
    try {
      await updateChatSettings({ useAnonymous: newValue });
      showToast(newValue ? '已切换为匿名模式' : '已切换为实名模式', 'success');
    } catch (error) {
      showToast('切换失败', 'error');
      setUseAnonymous(!newValue);
    }
  };

  const startChat = async () => {
    if (!id || !user) return;

    // 获取当前身份信息
    const settings = myPage?.data?.chatSettings;
    const isAnonymous = settings?.useAnonymous ?? false;
    const visitorName = isAnonymous
      ? settings?.anonymousName || '匿名用户'
      : myPage?.data?.name || user.username;
    const visitorAvatar = isAnonymous
      ? settings?.anonymousAvatar || '🦊'
      : myPage?.data?.avatar || '👤';

    try {
      const cid = await createChatSession(
        id,
        user.id,
        visitorName,
        visitorAvatar,
        isAnonymous
      );
      setChatId(cid);
      setShowChat(true);
    } catch (error) {
      showToast('启动聊天失败', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <div className="w-full max-w-2xl animate-fadeIn">
        <div className="glass rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10 pointer-events-none" />

          {/* Top action bar */}
          <div className="flex items-center justify-between mb-6 relative">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg glass hover:bg-white/20 transition-colors"
              title="返回首页"
            >
              <Home className="w-5 h-5 text-white/70" />
            </button>

            <div className="flex items-center gap-3">
              {/* 匿名/实名切换 - 仅当不是自己的页面时显示 */}
              {!isMyPage && (
                <button
                  onClick={toggleAnonymous}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium
                    ${useAnonymous
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'glass text-white/80 hover:bg-white/20'}`}
                  title={useAnonymous ? '当前匿名聊天' : '当前实名聊天'}
                >
                  {useAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="hidden sm:inline">{useAnonymous ? '匿名' : '实名'}</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/20
                  transition-all text-white/80 hover:text-white text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                {copied ? '已复制' : '分享'}
              </button>

              {isMyPage && (
                <button
                  onClick={() => navigate(`/page/${id}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-400 to-secondary-500
                    hover:from-primary-500 hover:to-secondary-600 transition-all text-white text-sm font-medium
                    hover:shadow-lg hover:shadow-primary-500/30"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑
                </button>
              )}
            </div>
          </div>

          {/* Owner badge */}
          {isMyPage && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-medium mb-4">
              <Settings className="w-3 h-3" />
              这是我的主页
            </div>
          )}

          {/* Header section */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 relative">
            <Avatar src={info.avatar} alt={info.name} />
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-outfit font-bold text-white mb-2">
                {info.name}
              </h1>
              <p className="text-lg md:text-xl font-source text-primary-300 mb-3">
                {info.title}
              </p>
              <p className="text-sm md:text-base font-source text-white/70 leading-relaxed max-w-md">
                {info.bio}
              </p>
            </div>
          </div>

          {/* Chat CTA - 仅当不是自己的页面时显示 */}
          {!isMyPage && (
            <button
              onClick={startChat}
              className="w-full mb-8 flex items-center justify-center gap-3 py-4 rounded-xl
                bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30
                hover:from-emerald-500/30 hover:to-teal-500/30 transition-all group"
            >
              <MessageCircle className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-white font-semibold font-outfit">
                  发起私聊
                  {useAnonymous && <span className="text-amber-300 text-sm ml-2">(匿名模式)</span>}
                </p>
                <p className="text-white/50 text-sm">
                  给{info.name}发送消息，支持图片和表情
                </p>
              </div>
            </button>
          )}

          {/* My page chat settings hint */}
          {isMyPage && (
            <div className="mb-8 p-4 rounded-xl glass bg-white/5 flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-primary-300 flex-shrink-0" />
              <p className="text-white/60 text-sm">
                访问其他用户主页时，可以点击"实名/匿名"按钮切换聊天身份
              </p>
            </div>
          )}

          <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8" />

          {/* Skills */}
          <div className="mb-8">
            <h2 className="text-lg font-outfit font-semibold text-white/90 mb-4">技能标签</h2>
            <div className="flex flex-wrap gap-3">
              {info.skills.map((skill, index) => (
                <SkillTag key={skill} skill={skill} index={index} />
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8" />

          {/* Contact */}
          <div className="mb-8">
            <h2 className="text-lg font-outfit font-semibold text-white/90 mb-4">联系方式</h2>
            <div className="space-y-3">
              <ContactItem type="email" value={info.email} />
              <ContactItem type="phone" value={info.phone} />
              <ContactItem type="location" value={info.location} />
            </div>
          </div>

          {info.socialLinks.length > 0 && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8" />
              <div>
                <h2 className="text-lg font-outfit font-semibold text-white/90 mb-4">社交链接</h2>
                <div className="flex flex-wrap gap-4">
                  {info.socialLinks.map((link, index) => (
                    <SocialLinkButton
                      key={link.platform}
                      platform={link.platform}
                      url={link.url}
                      icon={link.icon}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating chat button */}
      {!showChat && chatId && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-primary-400 to-secondary-500
            text-white shadow-lg shadow-primary-500/30 flex items-center justify-center
            hover:scale-110 transition-transform z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {showChat && chatId && info && (
        <div className="fixed bottom-6 right-6 z-50">
          <ChatWindow
            chatId={chatId}
            pageId={id!}
            pageOwner={info}
            isOwner={isMyPage}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  );
}
