import { Message } from '@/types';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <div
            className={`px-4 py-2.5 rounded-2xl max-w-xs break-words text-sm leading-relaxed
              ${isOwn
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-br-md'
                : 'bg-white/10 text-white/90 rounded-bl-md'}`}
          >
            {message.content}
          </div>
        );
      case 'emoji':
        return (
          <div className={`text-4xl ${isOwn ? 'text-right' : 'text-left'}`}>
            {message.content}
          </div>
        );
      case 'image':
        return (
          <div className={`max-w-52 ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
            {!imageLoaded && (
              <div className="w-full h-32 bg-white/5 rounded-xl animate-pulse" />
            )}
            <img
              src={message.content}
              alt="图片消息"
              className={`rounded-xl max-h-64 object-cover border border-white/10 ${isOwn ? 'rounded-tr-md' : 'rounded-tl-md'}
                ${imageLoaded ? 'block' : 'hidden'}`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500
          flex items-center justify-center text-lg border-2 border-white/10">
          {message.senderAvatar}
        </div>
      </div>

      {/* Message content */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-1 max-w-[70%]`}>
        {!isOwn && (
          <span className="text-xs text-white/40 font-medium">{message.senderName}</span>
        )}
        {renderContent()}
        <span className="text-xs text-white/30">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
