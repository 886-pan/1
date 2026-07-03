export interface EmojiCategory {
  name: string;
  emojis: string[];
}

export const emojiCategories: EmojiCategory[] = [
  {
    name: '表情',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
      '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗',
      '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝',
      '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑',
      '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌',
      '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢'
    ]
  },
  {
    name: '手势',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏',
      '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆',
      '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛',
      '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️'
    ]
  },
  {
    name: '爱心',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
      '💘', '💝', '💟', '♥️', '💌', '💋', '🌹', '🌷'
    ]
  },
  {
    name: '动物',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
      '🐧', '🐦', '🐤', '🦄', '🐝', '🦋', '🐌', '🐙'
    ]
  },
  {
    name: '食物',
    emojis: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐',
      '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑',
      '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🍿'
    ]
  },
  {
    name: '物品',
    emojis: [
      '🎉', '🎊', '🎁', '🎈', '🎂', '🍰', '🧁', '🍮',
      '☕', '🍵', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸',
      '💎', '🎵', '🎶', '🎸', '🎹', '🎺', '🎻', '🎮',
      '📱', '💻', '⌨️', '🖥️', '💡', '🔔', '🎯', '🏆'
    ]
  }
];

export interface SavedSticker {
  id: string;
  url: string;
  name: string;
  addedAt: string;
}

const SAVED_STICKERS_KEY = 'saved-stickers';

export function getSavedStickers(): SavedSticker[] {
  try {
    const stored = localStorage.getItem(SAVED_STICKERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading stickers:', e);
  }
  return [];
}

export function saveSticker(url: string, name: string): SavedSticker[] {
  const stickers = getSavedStickers();
  const newSticker: SavedSticker = {
    id: Date.now().toString(),
    url,
    name,
    addedAt: new Date().toISOString(),
  };
  stickers.unshift(newSticker);
  try {
    localStorage.setItem(SAVED_STICKERS_KEY, JSON.stringify(stickers.slice(0, 50)));
  } catch (e) {
    console.error('Error saving sticker:', e);
  }
  return stickers;
}

export function deleteSticker(id: string): SavedSticker[] {
  const stickers = getSavedStickers().filter(s => s.id !== id);
  try {
    localStorage.setItem(SAVED_STICKERS_KEY, JSON.stringify(stickers));
  } catch (e) {
    console.error('Error deleting sticker:', e);
  }
  return stickers;
}
