import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// CORS配置 - 生产环境
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const CLIENT_URL = process.env.CLIENT_URL || '';

// 数据存储文件
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CHAT_FILE = path.join(DATA_DIR, 'chats.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// 确保目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 中间件
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

// SEO 相关路由
app.get('/robots.txt', (req, res) => {
  const siteUrl = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml
`);
});

app.get('/sitemap.xml', (req, res) => {
  const siteUrl = `${req.protocol}://${req.get('host')}`;
  const store = loadUserStore();
  const pageUrls = Object.keys(store.pages).map(id => `  <url>
    <loc>${siteUrl}/page/${id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${siteUrl}/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
${pageUrls}
</urlset>`);
});

// 静态文件服务 - 生产环境
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ========== 数据类型 ==========

interface User {
  id: string;
  username: string;
  password: string;
  pageId: string;
  createdAt: string;
  lastLogin: string;
}

interface PageData {
  avatar: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  email: string;
  phone: string;
  location: string;
  socialLinks: { platform: string; url: string; icon: string }[];
  chatSettings: {
    useAnonymous: boolean;
    anonymousName: string;
    anonymousAvatar: string;
  };
}

interface Message {
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

interface ChatSession {
  id: string;
  pageId: string;
  createdAt: string;
  lastMessage: string;
  lastMessageTime: string;
  participants: string[];
}

interface UserStore {
  users: User[];
  pages: Record<string, PageData>;
}

// ========== 数据加载/保存 ==========

function loadUserStore(): UserStore {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      return { users: data.users || [], pages: data.pages || {} };
    }
  } catch (e) {
    console.error('Error loading user store:', e);
  }
  return { users: [], pages: {} };
}

function saveUserStore(store: UserStore) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('Error saving user store:', e);
  }
}

function loadChats(): Record<string, { messages: Message[]; session: ChatSession }> {
  try {
    if (fs.existsSync(CHAT_FILE)) {
      return JSON.parse(fs.readFileSync(CHAT_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading chats:', e);
  }
  return {};
}

function saveChats(chats: Record<string, { messages: Message[]; session: ChatSession }>) {
  try {
    fs.writeFileSync(CHAT_FILE, JSON.stringify(chats, null, 2));
  } catch (e) {
    console.error('Error saving chats:', e);
  }
}

// ========== 认证中间件 ==========

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: '未登录' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const store = loadUserStore();
    const user = store.users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: '用户不存在' });
    }
    (req as any).user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Token无效' });
  }
}

// ========== 认证 API ==========

app.get('/api/auth/check-first', (req, res) => {
  const store = loadUserStore();
  res.json({ success: true, hasUsers: store.users.length > 0 });
});

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: '用户名和密码必填' });
  }

  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ success: false, error: '用户名长度2-20字符' });
  }

  if (password.length < 4) {
    return res.status(400).json({ success: false, error: '密码至少4位' });
  }

  const store = loadUserStore();

  if (store.users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, error: '用户名已存在' });
  }

  const userId = nanoid(10);
  const pageId = nanoid(10);
  const now = new Date().toISOString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser: User = {
    id: userId,
    username,
    password: hashedPassword,
    pageId,
    createdAt: now,
    lastLogin: now,
  };

  const defaultPage: PageData = {
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20portrait%20photo%2C%20friendly%20smile%2C%20modern%20style%2C%20high%20quality&image_size=square',
    name: username,
    title: '点击编辑修改信息',
    bio: '在这里写一段关于你自己的介绍吧！',
    skills: ['技能1', '技能2', '技能3'],
    email: '',
    phone: '',
    location: '',
    socialLinks: [],
    chatSettings: {
      useAnonymous: false,
      anonymousName: `神秘旅人${Math.floor(Math.random() * 1000)}`,
      anonymousAvatar: '🦊',
    },
  };

  store.users.push(newUser);
  store.pages[pageId] = defaultPage;
  saveUserStore(store);

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    token,
    user: { id: userId, username, pageId },
    page: { id: pageId, data: defaultPage },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: '用户名和密码必填' });
  }

  const store = loadUserStore();
  const user = store.users.find(u => u.username === username);

  if (!user) {
    return res.status(400).json({ success: false, error: '用户名或密码错误' });
  }

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return res.status(400).json({ success: false, error: '用户名或密码错误' });
  }

  user.lastLogin = new Date().toISOString();
  saveUserStore(store);

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  const page = store.pages[user.pageId];

  res.json({
    success: true,
    token,
    user: { id: user.id, username: user.username, pageId: user.pageId },
    page: { id: user.pageId, data: page },
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const store = loadUserStore();
  const user = (req as any).user;
  const page = store.pages[user.pageId];
  res.json({
    success: true,
    user: { id: user.id, username: user.username, pageId: user.pageId },
    page: { id: user.pageId, data: page },
  });
});

// ========== 主页 API ==========

app.put('/api/my-page', authMiddleware, (req, res) => {
  const store = loadUserStore();
  const user = (req as any).user;
  const pageId = user.pageId;

  if (!store.pages[pageId]) {
    return res.status(404).json({ success: false, error: '主页不存在' });
  }

  store.pages[pageId] = { ...store.pages[pageId], ...req.body.data };
  saveUserStore(store);

  res.json({ success: true, page: { id: pageId, data: store.pages[pageId] } });
});

app.put('/api/my-page/chat-settings', authMiddleware, (req, res) => {
  const store = loadUserStore();
  const user = (req as any).user;
  const pageId = user.pageId;

  if (!store.pages[pageId]) {
    return res.status(404).json({ success: false, error: '主页不存在' });
  }

  store.pages[pageId].chatSettings = {
    ...store.pages[pageId].chatSettings,
    ...req.body,
  };
  saveUserStore(store);

  res.json({ success: true, chatSettings: store.pages[pageId].chatSettings });
});

app.get('/api/pages', (req, res) => {
  const store = loadUserStore();
  const list = Object.entries(store.pages).map(([id, data]) => ({
    id,
    name: data.name,
    title: data.title,
    avatar: data.avatar,
    username: store.users.find(u => u.pageId === id)?.username || '未知',
  }));
  res.json({ success: true, pages: list });
});

app.get('/api/pages/:id', (req, res) => {
  const store = loadUserStore();
  const page = store.pages[req.params.id];
  if (!page) {
    return res.status(404).json({ success: false, error: '主页不存在' });
  }
  const owner = store.users.find(u => u.pageId === req.params.id);
  res.json({
    success: true,
    page: {
      id: req.params.id,
      data: page,
      ownerUsername: owner?.username || '未知',
    },
  });
});

// ========== 聊天 API ==========

app.post('/api/chat/session', (req, res) => {
  const { pageId, visitorId, visitorName, visitorAvatar, isAnonymous } = req.body;
  const store = loadUserStore();

  if (!store.pages[pageId]) {
    return res.status(404).json({ success: false, error: '主页不存在' });
  }

  const chats = loadChats();

  let session: ChatSession | null = null;
  for (const key of Object.keys(chats)) {
    if (chats[key].session.pageId === pageId &&
        chats[key].session.participants.includes(visitorId)) {
      session = chats[key].session;
      break;
    }
  }

  if (!session) {
    const chatId = nanoid(12);
    const now = new Date().toISOString();
    session = {
      id: chatId,
      pageId,
      createdAt: now,
      lastMessage: '',
      lastMessageTime: now,
      participants: [visitorId, `owner_${pageId}`],
    };
    chats[chatId] = { session, messages: [] };
    saveChats(chats);
  }

  res.json({ success: true, chatId: session.id });
});

app.get('/api/chat/:chatId/messages', (req, res) => {
  const chats = loadChats();
  const chat = chats[req.params.chatId];
  if (!chat) {
    return res.status(404).json({ success: false, error: '聊天不存在' });
  }
  res.json({ success: true, messages: chat.messages });
});

app.get('/api/my-chats', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const pageId = user.pageId;
  const chats = loadChats();
  const myChats = Object.values(chats)
    .filter(c => c.session.pageId === pageId)
    .map(c => ({
      chatId: c.session.id,
      lastMessage: c.session.lastMessage,
      lastMessageTime: c.session.lastMessageTime,
      messageCount: c.messages.length,
      visitorId: c.session.participants.find(p => p !== `owner_${pageId}`) || 'unknown',
    }))
    .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  res.json({ success: true, chats: myChats });
});

app.post('/api/upload', (req, res) => {
  const { image, fileName } = req.body;
  if (!image) {
    return res.status(400).json({ success: false, error: '缺少图片数据' });
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const ext = fileName?.split('.').pop() || 'png';
    const uniqueName = `${nanoid(10)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    fs.writeFileSync(filePath, base64Data, 'base64');

    // 生产环境URL
    const baseUrl = CLIENT_URL || `http://localhost:${PORT}`;
    const imageUrl = `${baseUrl}/uploads/${uniqueName}`;
    res.json({ success: true, url: imageUrl, name: uniqueName });
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ success: false, error: '上传失败' });
  }
});

// ========== Socket.IO ==========

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', ({ chatId }) => {
    socket.join(chatId);
  });

  socket.on('message', ({ chatId, message }: { chatId: string; message: Omit<Message, 'id' | 'timestamp' | 'chatId'> }) => {
    const chats = loadChats();
    const chat = chats[chatId];

    if (!chat) return;

    const fullMessage: Message = {
      ...message,
      id: nanoid(12),
      chatId,
      timestamp: new Date().toISOString(),
    };

    chat.messages.push(fullMessage);
    chat.session.lastMessage = message.type === 'text' ? message.content : message.type === 'image' ? '[图片]' : '[表情]';
    chat.session.lastMessageTime = fullMessage.timestamp;
    saveChats(chats);

    io.to(chatId).emit('message', fullMessage);
    io.emit(`page-notification:${chat.session.pageId}`, { chatId, message: fullMessage });
  });

  socket.on('leave', ({ chatId }) => {
    socket.leave(chatId);
  });

  socket.on('typing', ({ chatId, userName }) => {
    socket.to(chatId).emit('typing', { userName });
  });

  socket.on('stop-typing', ({ chatId }) => {
    socket.to(chatId).emit('stop-typing');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 前端路由回退 - 生产环境
if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled`);
});