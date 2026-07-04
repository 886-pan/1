import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { getPage, updateMyPage, uploadImage } from '@/utils/api';
import { PersonalInfo, SocialLink } from '@/types';
import { Save, X, Plus, Trash2, ArrowLeft, Camera, ChevronRight } from 'lucide-react';

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, myPage, showToast } = useStore();
  const [formData, setFormData] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = '编辑资料 - Hi小呈同学';
    if (id) loadPage(id);
  }, [id]);

  const loadPage = async (pageId: string) => {
    if (user?.pageId !== pageId) {
      showToast('只能编辑自己的主页', 'error');
      navigate(`/page/${pageId}`);
      return;
    }

    try {
      const page = await getPage(pageId);
      setFormData(page.data);
    } catch (error) {
      showToast('页面不存在', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PersonalInfo, value: string | string[]) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const newLinks = [...prev.socialLinks];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, socialLinks: newLinks };
    });
  };

  const addSocialLink = () => {
    setFormData((prev) => prev ? {
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '新平台', url: 'https://', icon: 'globe' }],
    } : prev);
  };

  const removeSocialLink = (index: number) => {
    setFormData((prev) => prev ? {
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    } : prev);
  };

  const handleSkillChange = (value: string) => {
    const skills = value.split(',').map((s) => s.trim()).filter((s) => s);
    setFormData((prev) => prev ? { ...prev, skills } : prev);
  };

  const handleAvatarUpload = () => {
    setShowAvatarMenu(true);
  };

  const handleChooseFromAlbum = () => {
    setShowAvatarMenu(false);
    fileInputRef.current?.click();
  };

  const handleTakePhoto = () => {
    setShowAvatarMenu(false);
    cameraInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const url = await uploadImage(base64, file.name);
        setFormData((prev) => prev ? { ...prev, avatar: url } : prev);
        showToast('头像上传成功！', 'success');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showToast('上传失败，请重试', 'error');
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !formData) return;
    setSaving(true);
    try {
      await updateMyPage(formData);
      showToast('保存成功！', 'success');
      navigate(`/page/${id}`);
    } catch (error) {
      showToast('保存失败，请重试', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(`/page/${id}`)}
            className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">编辑资料</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-1">
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
          <div className="relative">
            <img
              src={formData.avatar}
              alt="头像"
              className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
            />
            <button
              onClick={handleAvatarUpload}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center
                hover:bg-primary-600 transition-colors border-2 border-gray-900 disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <p className="text-white/50 text-sm">点击头像更换</p>
            {uploading && <p className="text-primary-400 text-xs mt-1">上传中...</p>}
          </div>
          <ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
        </div>

        <div className="bg-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center px-4 py-4 border-b border-white/5">
            <span className="text-white/70 w-20">姓名</span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
              placeholder="请输入姓名"
            />
            <ChevronRight className="w-5 h-5 text-white/30" />
          </div>

          <div className="flex items-center px-4 py-4 border-b border-white/5">
            <span className="text-white/70 w-20">头衔</span>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
              placeholder="请输入职位或头衔"
            />
            <ChevronRight className="w-5 h-5 text-white/30" />
          </div>

          <div className="flex items-start px-4 py-4 border-b border-white/5">
            <span className="text-white/70 w-20 pt-1">简介</span>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={3}
              className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none resize-none"
              placeholder="请输入个人简介"
            />
          </div>

          <div className="flex items-center px-4 py-4 border-b border-white/5">
            <span className="text-white/70 w-20">技能</span>
            <input
              type="text"
              value={formData.skills.join(', ')}
              onChange={(e) => handleSkillChange(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
              placeholder="用逗号分隔，如：React, TypeScript"
            />
            <ChevronRight className="w-5 h-5 text-white/30" />
          </div>

          <div className="flex items-center px-4 py-4 border-b border-white/5">
            <span className="text-white/70 w-20">邮箱</span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
              placeholder="email@example.com"
            />
            <ChevronRight className="w-5 h-5 text-white/30" />
          </div>

          <div className="flex items-center px-4 py-4 border-b border-white/5">
            <span className="text-white/70 w-20">电话</span>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
              placeholder="138-0000-0000"
            />
            <ChevronRight className="w-5 h-5 text-white/30" />
          </div>

          <div className="flex items-center px-4 py-4">
            <span className="text-white/70 w-20">所在地</span>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
              placeholder="城市，国家"
            />
            <ChevronRight className="w-5 h-5 text-white/30" />
          </div>
        </div>

        <div className="bg-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
            <span className="text-white/70">社交链接</span>
            <button
              onClick={addSocialLink}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20
                transition-colors text-white/70 hover:text-white text-sm"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          {formData.socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <input
                type="text"
                value={link.platform}
                onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm"
                placeholder="平台名称"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm"
                placeholder="链接地址"
              />
              <button
                onClick={() => removeSocialLink(index)}
                className="p-1.5 rounded-lg hover:bg-red-500/30 transition-colors text-white/40 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {formData.socialLinks.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-white/30 text-sm">暂无社交链接</p>
            </div>
          )}
        </div>

        <div className="h-24" />
      </div>

      {/* 头像选择菜单 */}
      {showAvatarMenu && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowAvatarMenu(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md p-4 pb-8 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-800 rounded-2xl overflow-hidden">
              <button
                onClick={handleTakePhoto}
                className="w-full py-4 text-white text-center hover:bg-white/5 transition-colors border-b border-white/10"
              >
                <Camera className="w-5 h-5 inline mr-2" />
                拍照
              </button>
              <button
                onClick={handleChooseFromAlbum}
                className="w-full py-4 text-white text-center hover:bg-white/5 transition-colors"
              >
                �️ 从相册/文件选择
              </button>
            </div>
            <button
              onClick={() => setShowAvatarMenu(false)}
              className="w-full mt-3 py-4 bg-gray-800 rounded-2xl text-white font-medium hover:bg-white/5 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-white/10 p-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500
            hover:from-primary-600 hover:to-secondary-600 text-white font-medium transition-all
            hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
