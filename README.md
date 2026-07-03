# Hi小呈同学 V1.0

这是个人主页生成器的初代实验版本。

## 功能特性

- 用户注册登录系统
- 个人主页创建与编辑
- 实时私聊功能
- 匿名/实名聊天切换
- 图片与表情发送

## 技术栈

- 前端：React + TypeScript + Tailwind CSS + Vite
- 后端：Express + Socket.IO
- 认证：JWT + bcrypt

## 本地开发

```bash
npm install
npm run dev
```

## 生产部署

```bash
npm run build
npm start
```

## 环境变量

- `PORT` - 服务端口（默认3001）
- `JWT_SECRET` - JWT密钥
- `CLIENT_URL` - 客户端URL（生产环境）