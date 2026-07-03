import { useState, useRef, useEffect } from 'react';
import { Message, PersonalInfo } from '@/types';
import { getSocket } from '@/utils/socket';
import { getMessages, uploadImage } from '@/utils/api';
import { useStore } from '@/store/useStore';
import MessageBubble from './MessageBubble';
import EmojiPanel from './EmojiPanel';
import { Send, Smile, ImagePlus, X, ChevronLeft } from 'lucide-react';

interface ChatWindowProps {
  chatId: string;
  pageId: string;
  pageOwner: PersonalInfo;
  isOwner: boolean;
  onClose?: () => void;
}

export default function ChatWindow({
  chatId,
  pageId,
  pageOwner,
  isOwner,
  onClose,
}: ChatWindowProps) {
  const { user, myPage, showToast } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 获取当前用户身份信息
  const getMyIdentity = () => {
    if (!user || !myPage) return null;

    const settings = myPage.data.chatSettings;
    const isAnonymous = settings?.useAnonymous ?? false;

    return {
      id: user.id,
      name: isAnonymous
        ? settings?.anonymousName || '匿名用户'
        : myPage.data.name || user.username,
      avatar: isAnonymous
        ? settings?.anonymousAvatar || '🦊'
        : myPage.data.avatar || '👤',
      isAnonymous,
    };
  };

  // 加载历史消息并连接Socket
  useEffect(() => {
    if (!chatId) return;

    getMessages(chatId)
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(err => console.error('Failed to load messages:', err));

    const socket = getSocket();
    socket.emit('join', { chatId });

    const handleMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    };

    const handleTyping = ({ userName }: { userName: string }) => {
      setTypingUser(userName);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000);
    };

    socket.on('message', handleMessage);
    socket.on('typing', handleTyping);
    socket.on('stop-typing', () => setTypingUser(null));

    return () => {
      socket.off('message', handleMessage);
      socket.off('typing', handleTyping);
      socket.off('stop-typing', () => setTypingUser(null));
      socket.emit('leave', { chatId });
    };
  }, [chatId]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const sendMessage = (type: 'text' | 'image' | 'emoji', content: string) => {
    const identity = getMyIdentity();
    if (!identity || !chatId) return;

    const socket = getSocket();
    socket.emit('message', {
      chatId,
      message: {
        senderId: identity.id,
        senderName: identity.name,
        senderAvatar: identity.avatar,
        isAnonymous: identity.isAnonymous,
        type,
        content,
      },
    });
  };

  const handleSendText = () => {
    const text = inputText.trim();
    if (!text) return;
    sendMessage('text', text);
    setInputText('');
    setShowEmojiPanel(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }

    const identity = getMyIdentity();
    if (identity) {
      const socket = getSocket();
      socket.emit('typing', { chatId, userName: identity.name });
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    sendMessage('emoji', emoji);
    setShowEmojiPanel(false);
  };

  const handleSelectSticker = (url: string) => {
    sendMessage('image', url);
    setShowEmojiPanel(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const url = await uploadImage(base64, file.name);
        sendMessage('image', url);
      } catch (err) {
        showToast('上传失败', 'error');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const identity = getMyIdentity();
  const isOwnMessage = (msg: Message) => identity?.id === msg.senderId;

  const otherName = isOwner ? '访客' : pageOwner.name;
  const otherAvatar = isOwner ? '👤' : pageOwner.avatar;

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] w-full max-w-md bg-[#1e1f26] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#252630]">
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors md:hidden"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500
          flex items-center justify-center text-lg border-2 border-white/10 overflow-hidden">
          {otherAvatar?.startsWith('http') ? (
            <img src={otherAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            otherAvatar || '👤'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-outfit font-semibold text-white truncate">{otherName}</h3>
          {typingUser ? (
            <p className="text-xs text-primary-400">正在输入...</p>
          ) : (
            <p className="text-xs text-white/40">
              {identity?.isAnonymous ? '匿名聊天中' : '实名聊天中'}
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1a1b22]">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white/30">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm">开始聊天吧</p>
              <p className="text-xs mt-1">发送消息给{otherName}</p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isOwn={isOwnMessage(msg)} />
          ))
        )}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500
              flex items-center justify-center text-lg border-2 border-white/10">
              {otherAvatar?.startsWith('http') ? (
                <img src={otherAvatar} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                otherAvatar || '👤'
              )}
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/10">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="relative p-3 border-t border-white/10 bg-[#252630]">
        {showEmojiPanel && (
          <EmojiPanel
            onSelectEmoji={handleSelectEmoji}
            onSelectSticker={handleSelectSticker}
          />
        )}

        <div className="flex items-end gap-2">
          {/* Tool buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowEmojiPanel(!showEmojiPanel)}
              className={`p-2 rounded-lg transition-colors ${showEmojiPanel ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-white/10 text-white/50 hover:text-white/70'}`}
              title="表情"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white/70 transition-colors"
              title="发送图片"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              rows={1}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/5 text-white placeholder-white/30
                focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all
                resize-none text-sm"
              style={{ maxHeight: '100px' }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSendText}
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-xl transition-all
              ${inputText.trim()
                ? 'bg-gradient-to-r from-primary-400 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/30 hover:scale-105'
                : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
