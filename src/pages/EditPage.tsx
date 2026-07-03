import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { getPage, updateMyPage } from '@/utils/api';
import { PersonalInfo, SocialLink } from '@/types';
import { Save, X, Plus, Trash2, ArrowLeft, Eye } from 'lucide-react';

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, myPage, showToast } = useStore();
  const [formData, setFormData] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadPage(id);
  }, [id]);

  const loadPage = async (pageId: string) => {
    // 只有自己的页面才能编辑
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
      socialLinks: [...prev.socialLinks, { platform: '新平台', url: 'https://example.com', icon: 'globe' }],
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
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <div className="w-full max-w-2xl animate-fadeIn">
        <div className="glass rounded-2xl p-8 md:p-12 shadow-2xl relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/page/${id}`)}
                className="p-2 rounded-lg glass hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white/70" />
              </button>
              <h1 className="text-2xl md:text-3xl font-outfit font-bold text-white">
                编辑我的主页
              </h1>
            </div>
            <button
              onClick={() => navigate(`/page/${id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/20 transition-colors text-white/70 text-sm"
            >
              <Eye className="w-4 h-4" />
              预览
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-white/80 font-medium mb-2 text-sm">头像链接</label>
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) => handleChange('avatar', e.target.value)}
                className="w-full px-4 py-3 rounded-lg glass bg-white/5 text-white placeholder-white/40
                  focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                placeholder="输入头像图片URL"
              />
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2 text-sm">姓名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 rounded-lg glass bg-white/5 text-white placeholder-white/40
                  focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                placeholder="输入姓名"
              />
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2 text-sm">职位/头衔</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-3 rounded-lg glass bg-white/5 text-white placeholder-white/40
                  focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                placeholder="输入职位或头衔"
              />
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2 text-sm">个人简介</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg glass bg-white/5 text-white placeholder-white/40
                  focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all resize-none"
                placeholder="输入个人简介"
              />
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2 text-sm">技能标签 (用逗号分隔)</label>
              <input
                type="text"
                value={formData.skills.join(', ')}
                onChange={(e) => handleSkillChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg glass bg-white/5 text-white placeholder-white/40
                  focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                placeholder="React, TypeScript, Node.js, ..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 font-medium mb-2 text-sm">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg glass bg-white/5 text-white placeholder-white/40
                    focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-white/80 font-medium mb-2 text-sm">电话</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg glass bg-white/5 text-white placeholder-white/40
                    focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                  placeholder="+86 138-0000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2 text-sm">所在地</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-4 py-3 rounded-lg glass bg-white/5 text-white placeholder-white/40
                  focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                placeholder="城市，国家"
              />
            </div>

            {/* Social links */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/80 font-medium text-sm">社交链接</label>
                <button
                  onClick={addSocialLink}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg glass hover:bg-white/20
                    transition-colors text-white/70 hover:text-white text-sm"
                >
                  <Plus className="w-4 h-4" />
                  添加
                </button>
              </div>

              <div className="space-y-3">
                {formData.socialLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-3 animate-fadeIn">
                    <input
                      type="text"
                      value={link.platform}
                      onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg glass bg-white/5 text-white placeholder-white/40
                        focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all text-sm"
                      placeholder="平台名称"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg glass bg-white/5 text-white placeholder-white/40
                        focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all text-sm"
                      placeholder="链接地址"
                    />
                    <select
                      value={link.icon}
                      onChange={(e) => handleSocialLinkChange(index, 'icon', e.target.value)}
                      className="px-3 py-2 rounded-lg glass bg-white/5 text-white
                        focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all text-sm"
                    >
                      <option value="github">GitHub</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter/微博</option>
                      <option value="globe">网站</option>
                    </select>
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="p-2 rounded-lg glass hover:bg-red-500/30 transition-colors text-white/60 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-white/20">
            <button
              onClick={() => navigate(`/page/${id}`)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg glass hover:bg-white/20
                transition-all text-white/80 hover:text-white font-medium"
            >
              <X className="w-5 h-5" />
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-400 to-secondary-500
                hover:from-primary-500 hover:to-secondary-600 transition-all text-white font-medium
                hover:shadow-lg hover:shadow-primary-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
