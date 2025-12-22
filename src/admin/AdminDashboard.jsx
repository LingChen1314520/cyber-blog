import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, FileText, FolderOpen, Settings, LogOut,
  Plus, Edit, Trash2, Eye, Search, Filter, Download, Upload
} from 'lucide-react';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, deleteDoc, doc, getCountFromServer } from "firebase/firestore";
import { db } from '../App';

const AdminDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalProjects: 0,
    totalViews: 0,
    totalUsers: 0
  });
  const [editingItem, setEditingItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 新建/编辑表单状态
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    type: 'blog'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log("🔄 正在获取数据...");

      // 获取文章
      const postsQuery = query(collection(db, "posts"), orderBy("date", "desc"));
      const postsSnap = await getDocs(postsQuery);
      const postsData = postsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setPosts(postsData);
      console.log("📄 获取到文章数量:", postsData.length);

      // 获取项目
      const projectsQuery = query(collection(db, "projects"), orderBy("date", "desc"));
      const projectsSnap = await getDocs(projectsQuery);
      const projectsData = projectsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setProjects(projectsData);
      console.log("📁 获取到项目数量:", projectsData.length);

      // 更新统计
      setStats({
        totalPosts: postsData.length,
        totalProjects: projectsData.length,
        totalViews: postsData.reduce((sum, post) => sum + (post.views || 0), 0) +
                   projectsData.reduce((sum, project) => sum + (project.views || 0), 0),
        totalUsers: 1 // 简化处理
      });

      console.log("✅ 数据获取完成");
    } catch (error) {
      console.error("❌ 获取数据失败:", error);
      console.error("错误代码:", error.code);
      console.error("错误消息:", error.message);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      alert("标题和内容不能为空！");
      return;
    }

    console.log("🔄 开始创建文章...");
    console.log("表单数据:", formData);

    try {
      const collectionName = formData.type === 'blog' ? 'posts' : 'projects';
      console.log("📝 目标集合:", collectionName);

      const docData = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
        date: new Date().toISOString(),
        views: 0
      };
      console.log("📄 准备保存的数据:", docData);

      const docRef = await addDoc(collection(db, collectionName), docData);
      console.log("✅ 文章创建成功，文档ID:", docRef.id);

      setFormData({ title: '', content: '', tags: '', type: 'blog' });
      setShowCreateModal(false);
      fetchData();
      alert("创建成功！");
    } catch (error) {
      console.error("❌ 创建失败:", error);
      console.error("错误代码:", error.code);
      console.error("错误消息:", error.message);
      alert(`创建失败: ${error.message}`);
    }
  };

  const handleEdit = async () => {
    if (!editingItem || !formData.title || !formData.content) return;

    try {
      const collectionName = editingItem.type === 'blog' ? 'posts' : 'projects';
      await updateDoc(doc(db, collectionName, editingItem.id), {
        title: formData.title,
        content: formData.content,
        tags: formData.tags
      });

      setEditingItem(null);
      setFormData({ title: '', content: '', tags: '', type: 'blog' });
      fetchData();
      alert("更新成功！");
    } catch (error) {
      console.error("更新失败:", error);
      alert("更新失败，请重试");
    }
  };

  const handleDelete = async (item, type) => {
    if (!confirm(`确定删除"${item.title}"吗？此操作不可撤销！`)) return;

    try {
      const collectionName = type === 'blog' ? 'posts' : 'projects';
      await deleteDoc(doc(db, collectionName, item.id));
      fetchData();
      alert("删除成功！");
    } catch (error) {
      console.error("删除失败:", error);
      alert("删除失败，请重试");
    }
  };

  const startEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setFormData({
      title: item.title,
      content: item.content,
      tags: item.tags || '',
      type
    });
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-xl text-white`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon size={32} className="opacity-80" />
      </div>
    </motion.div>
  );

  const ContentTable = ({ data, type, title }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <button
          onClick={() => {
            setFormData({ ...formData, type });
            setShowCreateModal(true);
          }}
          className="bg-cyber text-black px-4 py-2 rounded-lg hover:bg-white transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> 新建
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-white/80 py-3 px-4">标题</th>
              <th className="text-white/80 py-3 px-4">标签</th>
              <th className="text-white/80 py-3 px-4">日期</th>
              <th className="text-white/80 py-3 px-4">浏览量</th>
              <th className="text-white/80 py-3 px-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="py-4 px-4 text-white">{item.title}</td>
                <td className="py-4 px-4 text-gray-400">
                  {item.tags?.split(',').map(tag => (
                    <span key={tag} className="bg-cyber/20 text-cyber px-2 py-1 rounded text-xs mr-1">
                      {tag.trim()}
                    </span>
                  ))}
                </td>
                <td className="py-4 px-4 text-gray-400">
                  {new Date(item.date).toLocaleDateString('zh-CN')}
                </td>
                <td className="py-4 px-4 text-gray-400">{item.views || 0}</td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item, type)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item, type)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 顶部导航 */}
      <nav className="bg-black/50 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyber">后台管理系统</h1>
          <button
            onClick={onLogout}
            className="text-red-400 hover:text-red-300 flex items-center gap-2"
          >
            <LogOut size={16} /> 退出登录
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-black/30 backdrop-blur-md min-h-screen p-6">
          <nav className="space-y-2">
            {[
              { id: 'overview', label: '数据概览', icon: BarChart3 },
              { id: 'posts', label: '文章管理', icon: FileText },
              { id: 'projects', label: '项目管理', icon: FolderOpen },
              { id: 'settings', label: '系统设置', icon: Settings }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-cyber/20 text-cyber border border-cyber/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-8">数据概览</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="总文章数"
                  value={stats.totalPosts}
                  icon={FileText}
                  color="from-blue-600 to-blue-800"
                />
                <StatCard
                  title="总项目数"
                  value={stats.totalProjects}
                  icon={FolderOpen}
                  color="from-green-600 to-green-800"
                />
                <StatCard
                  title="总浏览量"
                  value={stats.totalViews}
                  icon={Eye}
                  color="from-purple-600 to-purple-800"
                />
                <StatCard
                  title="活跃用户"
                  value={stats.totalUsers}
                  icon={Users}
                  color="from-orange-600 to-orange-800"
                />
              </div>

              {/* 最近活动 */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">最近活动</h3>
                <div className="space-y-3">
                  {[...posts.slice(0, 3), ...projects.slice(0, 3)]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.id} className="flex items-center gap-3 text-gray-300">
                        <div className="w-2 h-2 bg-cyber rounded-full"></div>
                        <span>
                          {item.type === 'blog' ? '文章' : '项目'}: {item.title}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {new Date(item.date).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'posts' && (
            <ContentTable data={posts} type="blog" title="文章管理" />
          )}

          {activeSection === 'projects' && (
            <ContentTable data={projects} type="project" title="项目管理" />
          )}

          {activeSection === 'settings' && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">系统设置</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-white/80 mb-2">网站标题</label>
                  <input
                    type="text"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white"
                    placeholder="CyberBlog"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">管理员邮箱</label>
                  <input
                    type="email"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white"
                    placeholder="admin@example.com"
                  />
                </div>
                <button className="bg-cyber text-black px-6 py-2 rounded-lg hover:bg-white transition-colors">
                  保存设置
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 新建/编辑模态框 */}
      {(showCreateModal || editingItem) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-white mb-6">
              {editingItem ? '编辑内容' : '新建内容'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="输入标题..."
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">标签 (逗号分隔)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="React, JavaScript, Web开发"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">类型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="blog">文章</option>
                  <option value="project">项目</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2">内容 (支持Markdown)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white h-48 resize-none"
                  placeholder="输入内容..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={editingItem ? handleEdit : handleCreate}
                className="flex-1 bg-cyber text-black py-2 rounded-lg hover:bg-white transition-colors"
              >
                {editingItem ? '更新' : '创建'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingItem(null);
                  setFormData({ title: '', content: '', tags: '', type: 'blog' });
                }}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;