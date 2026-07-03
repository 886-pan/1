import { User, PageData, PersonalInfo, PageListItem, ChatSettings } from '@/types';

const TOKEN_KEY = 'auth-token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ========== 认证 API ==========

export async function checkHasUsers(): Promise<boolean> {
  const res = await fetch('/api/auth/check-first');
  const data = await res.json();
  return data.hasUsers;
}

export async function register(username: string, password: string): Promise<{ user: User; page: PageData; token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  setToken(data.token);
  return { user: data.user, page: data.page, token: data.token };
}

export async function login(username: string, password: string): Promise<{ user: User; page: PageData; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  setToken(data.token);
  return { user: data.user, page: data.page, token: data.token };
}

export async function getMe(): Promise<{ user: User; page: PageData } | null> {
  const token = getToken();
  if (!token) return null;

  const res = await fetch('/api/auth/me', { headers: authHeaders() });
  if (!res.ok) {
    clearToken();
    return null;
  }
  const data = await res.json();
  if (!data.success) return null;
  return { user: data.user, page: data.page };
}

// ========== 主页 API ==========

export async function updateMyPage(data: PersonalInfo): Promise<PageData> {
  const res = await fetch('/api/my-page', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ data }),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.page;
}

export async function updateChatSettings(settings: Partial<ChatSettings>): Promise<ChatSettings> {
  const res = await fetch('/api/my-page/chat-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(settings),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.chatSettings;
}

export async function listPages(): Promise<PageListItem[]> {
  const res = await fetch('/api/pages');
  const data = await res.json();
  return data.pages || [];
}

export async function getPage(id: string): Promise<PageData> {
  const res = await fetch(`/api/pages/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.page;
}

// ========== 聊天 API ==========

export async function createChatSession(pageId: string, visitorId: string, visitorName: string, visitorAvatar: string, isAnonymous: boolean): Promise<string> {
  const res = await fetch('/api/chat/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pageId, visitorId, visitorName, visitorAvatar, isAnonymous }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.chatId;
}

export async function getMessages(chatId: string) {
  const res = await fetch(`/api/chat/${chatId}/messages`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.messages;
}

export async function getMyChats() {
  const res = await fetch('/api/my-chats', { headers: authHeaders() });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.chats;
}

export async function uploadImage(base64: string, fileName: string): Promise<string> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64, fileName }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.url;
}
