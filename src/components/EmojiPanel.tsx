import { useState } from 'react';
import { emojiCategories, getSavedStickers, saveSticker, SavedSticker } from '@/utils/emojis';
import { Smile, Image, Star, Trash2 } from 'lucide-react';

interface EmojiPanelProps {
  onSelectEmoji: (emoji: string) => void;
  onSelectSticker?: (url: string) => void;
}

export default function EmojiPanel({ onSelectEmoji, onSelectSticker }: EmojiPanelProps) {
  const [activeTab, setActiveTab] = useState<'emoji' | 'sticker'>('emoji');
  const [activeCategory, setActiveCategory] = useState(0);
  const [stickers, setStickers] = useState<SavedSticker[]>(getSavedStickers());

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, fileName: file.name }),
        });
        const data = await res.json();
        if (data.url) {
          const newStickers = saveSticker(data.url, file.name);
          setStickers(newStickers);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteSticker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定删除该表情吗？')) {
      import('@/utils/emojis').then(({ deleteSticker }) => {
        setStickers(deleteSticker(id));
      });
    }
  };

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-[#2a2b33] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('emoji')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2
            ${activeTab === 'emoji' ? 'text-primary-400 border-b-2 border-primary-400 bg-white/5' : 'text-white/60 hover:text-white/80'}`}
        >
          <Smile className="w-4 h-4" />
          表情
        </button>
        <button
          onClick={() => setActiveTab('sticker')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2
            ${activeTab === 'sticker' ? 'text-primary-400 border-b-2 border-primary-400 bg-white/5' : 'text-white/60 hover:text-white/80'}`}
        >
          <Star className="w-4 h-4" />
          收藏
        </button>
      </div>

      {activeTab === 'emoji' && (
        <>
          {/* Category tabs */}
          <div className="flex gap-1 p-2 border-b border-white/5 overflow-x-auto">
            {emojiCategories.map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(i)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                  ${activeCategory === i ? 'bg-primary-500/20 text-primary-300' : 'text-white/50 hover:text-white/70 hover:bg-white/5'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="h-56 overflow-y-auto p-2 grid grid-cols-8 gap-1">
            {emojiCategories[activeCategory].emojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => onSelectEmoji(emoji)}
                className="w-full aspect-square flex items-center justify-center text-xl
                  hover:bg-white/10 rounded-lg transition-colors hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}

      {activeTab === 'sticker' && (
        <>
          {/* Upload */}
          <div className="p-2 border-b border-white/5">
            <label className="flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-white/20
              text-white/50 hover:text-white/70 hover:border-white/30 cursor-pointer transition-colors text-sm">
              <Image className="w-4 h-4" />
              添加表情
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* Sticker grid */}
          <div className="h-56 overflow-y-auto p-2">
            {stickers.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/30 text-sm">
                暂无收藏表情
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {stickers.map((sticker) => (
                  <div key={sticker.id} className="relative group">
                    <button
                      onClick={() => onSelectSticker?.(sticker.url)}
                      className="w-full aspect-square rounded-lg overflow-hidden border border-white/10
                        hover:border-primary-400/50 transition-colors"
                    >
                      <img src={sticker.url} alt={sticker.name} className="w-full h-full object-cover" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSticker(sticker.id, e)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full
                        opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
