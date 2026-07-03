export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface ChatSettings {
  useAnonymous: boolean;
  anonymousName: string;
  anonymousAvatar: string;
}

export interface PersonalInfo {
  avatar: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  email: string;
  phone: string;
  location: string;
  socialLinks: SocialLink[];
  chatSettings: ChatSettings;
}

export interface User {
  id: string;
  username: string;
  pageId: string;
}

export interface PageData {
  id: string;
  data: PersonalInfo;
  ownerUsername?: string;
}

export interface PageListItem {
  id: string;
  name: string;
  title: string;
  avatar: string;
  username: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isAnonymous: boolean;
  type: 'text' | 'image' | 'emoji';
  content: string;
  timestamp: string;
}

export interface ChatListItem {
  chatId: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
  visitorId: string;
}

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}
