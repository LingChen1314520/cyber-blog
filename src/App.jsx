import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Cpu, Save, Lock, Trash2, GitBranch,
  Power, User, Settings, Home, BookOpen, Layers, Mail, Github, MessageSquare, ArrowLeft, Tag, UserCircle, Phone, Smartphone, Clipboard, Upload, ChevronLeft, ChevronRight, Wrench, Link
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, getCountFromServer } from "firebase/firestore";
import AdminDashboard from './admin/AdminDashboard';

// ---------------------------------------------------------
// 1. 配置区域 (Firebase 配置)
// ---------------------------------------------------------

// 使用 CDN 引入 marked 库进行 Markdown 渲染
// 在此模拟环境中，我们假设 marked 已通过 CDN 引入并全局可用。
const marked = window.marked;

// NOTE: Please replace these with your actual Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------------------------------------------------
// 2. 工具组件定义
// ---------------------------------------------------------

// 自定义打字机效果组件
const Typewriter = ({ strings, delay = 100, deleteSpeed = 50, pause = 1500 }) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(delay);

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % strings.length;
      const fullText = strings[i];

      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? deleteSpeed : delay);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), pause);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, strings, delay, deleteSpeed, pause, typingSpeed]);

  return (
    <span>
      {text}
      <span className="animate-pulse ml-1 text-cyber">|</span>
    </span>
  );
};

// 导航按钮组件
const NavItem = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
      active 
        ? 'bg-cyber/10 text-cyber shadow-[0_0_10px_rgba(0,243,255,0.3)]' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={16} />
    <span className="text-sm font-bold tracking-wide">{label}</span>
  </button>
);

// 分页控件
const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange }) => (
  <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mt-8 bg-black/30 p-4 rounded-lg border border-white/10">
    
    {/* 每页显示数量设置 */}
    <div className="flex items-center space-x-2">
      <label className="text-xs text-gray-400 font-mono">每页显示:</label>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="bg-black/40 border border-white/10 text-white p-1 outline-none rounded cursor-pointer text-sm"
      >
        {[3, 5, 10, 20].map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
    </div>

    {/* 上一页/下一页控制 */}
    <div className='flex items-center space-x-4'>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-cyber hover:bg-cyber/10"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-sm font-mono text-white">
        {currentPage} / {totalPages || 1}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || totalPages === 0}
        className="p-2 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-cyber hover:bg-cyber/10"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  </div>
);

// ---------------------------------------------------------
// 3. 页面板块定义
// ---------------------------------------------------------

// 简介/主页板块
const IntroSection = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col justify-center min-h-[60vh]"
  >
    <div className="border-l-2 border-cyber pl-6 mb-8">
      <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white tracking-tight">
        系统 <span className="text-cyber">已就绪</span>
      </h1>
      <div className="text-xl text-gray-400 font-mono h-8 flex items-center gap-2">
        <span className="text-cyber">{'>'}</span>
        <Typewriter
          strings={[
            
            '我是小趴菜，很高兴为您服务。', 
            '全栈开发 / 赛博朋克 / 极客。', 
            '正在渲染数字世界...',
            '正在建立神经连接...', 
            '正在建立城市路网...',
            '成功建立数字世界。'
            
            
          ]}
          delay={80}
        />
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-6 mt-10">
      <div className="bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm">
        <h3 className="text-cyber font-bold mb-3 flex items-center gap-2"><User size={18}/> 身份档案</h3>
        <p className="text-gray-300 leading-relaxed text-sm">
          陈凌，一名热爱生活的大学生牛马。
        </p>
      </div>
      <div className="bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm">
        <h3 className="text-cyber font-bold mb-3 flex items-center gap-2"><Mail size={18}/> 接触节点</h3>
        <div className="space-y-3">
          {/* 邮箱 */}
          <p className="text-gray-300 flex items-center gap-3">
            <Mail size={16} className="text-white/50" />
            <a href="mailto:chenling3435@163.com" className="hover:text-cyber transition-colors">chenling3435@163.com</a>
          </p>
          {/* 电话 - 已更新 */}
          <p className="text-gray-300 flex items-center gap-3">
            <Phone size={16} className="text-white/50" />
            <span className="text-white/80">188-8888-8888</span> 
          </p>
          {/* 微信 - 已更新 */}
          <p className="text-gray-300 flex items-center gap-3">
            <Smartphone size={16} className="text-white/50" />
            <span className="text-white/80">cl16101314-520 </span> 
          </p>
          {/* GitHub - 仅图标和名称，点击跳转 */}
          <p className="text-gray-300 flex items-center gap-3">
            <Github size={16} className="text-white/50" />
            <a href="https://github.com/LingChen1314520" target="_blank" rel="noopener noreferrer" className="hover:text-cyber transition-colors font-bold">GitHub</a>
          </p>
          {/* CSDN - 仅图标和名称，点击跳转 */}
          <p className="text-gray-300 flex items-center gap-3">
            <MessageSquare size={16} className="text-white/50" />
            <a 
              href="https://blog.csdn.net/m0_74876592?spm=1011.2124.3001.5343" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-cyber transition-colors font-bold"
            >
              CSDN
            </a>
          </p>
        </div>
      </div>
      <div className="md:col-span-2 bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm">
        <h3 className="text-cyber font-bold mb-2 flex items-center gap-2"><Terminal size={18}/> 技术栈</h3>
        <div className="flex flex-wrap gap-2 mt-3">
          {['React', 'Firebase', 'Tailwind CSS', 'Node.js', 'TypeScript', 'Framer Motion', 'Three.js'].map(tag => (
            <span key={tag} className="text-xs bg-black/50 border border-cyber/30 text-cyber px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// 文章/项目详情页
const DetailView = ({ item, onBack, type, onSelectCategory }) => {
    // 确保 marked 库已加载
    const renderedHtml = typeof marked !== 'undefined' 
        ? marked.parse(item.content || '内容加载失败或Markdown库未就绪。')
        : 'Markdown 渲染库加载中...';

    // 统一图标和标签
    const categoryLabel = type === 'blog' ? '文章列表 // ARTICLE LIST' : '项目列表 // PROJECTS LIST';
    // 详情页导航图标保持不变，使用 BookOpen 和 Layers
    const CategoryIcon = type === 'blog' ? BookOpen : Layers; 

    return (
        <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
        >
            {/* 顶部分类导航 - 可点击 */}
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={onBack} 
                    className="text-cyber flex items-center gap-2 text-sm font-bold hover:text-white transition-colors p-2 rounded-lg bg-black/30 hover:bg-black/50"
                >
                    <ArrowLeft size={16} /> 返回列表
                </button>
                {/* 修复：使用 CategoryIcon 代替原来的三元表达式 */}
                <button
                    onClick={() => onSelectCategory(type)}
                    className="text-white flex items-center gap-1 text-sm font-bold hover:text-cyber transition-colors p-2 rounded-lg bg-black/30 hover:bg-black/50"
                >
                    <CategoryIcon size={16} />
                    {categoryLabel}
                </button>
            </div>
            
            <div className="bg-black/30 p-8 rounded-xl border border-cyber/30 shadow-[0_0_20px_rgba(0,243,255,0.1)]">
                <h1 className="text-4xl font-extrabold text-white mb-3">{item.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6 border-b border-white/10 pb-4">
                    <span>{new Date(item.date).toLocaleDateString('zh-CN')}</span>
                    {item.tags && item.tags.split(',').map(tag => (
                        <span key={tag} className="flex items-center gap-1 bg-white/5 text-cyber/80 px-2 py-0.5 rounded-full text-xs">
                            <Tag size={12} />{tag.trim()}
                        </span>
                    ))}
                </div>
                
                {/* Markdown 内容渲染区域 */}
                <div 
                    className="prose prose-invert max-w-none text-gray-300 leading-loose"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
            </div>
        </motion.div>
    );
};

// 文章列表板块 (已修改为项目列表的卡片和双列布局)
const BlogSection = ({ posts, isAdmin, onDelete, onSelect, postCount, currentPage, totalPages, onPageChange, pageSize, setPageSize }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }} 
    animate={{ opacity: 1, x: 0 }} 
    exit={{ opacity: 0, x: -20 }}
  >
    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {/* 文章列表标题图标保持 BookOpen */}
            <BookOpen className="text-cyber" /> 文章列表 // ARTICLE LIST
        </h2>
        {/* 文章总数量显示 */}
        <span className="text-sm text-gray-500 font-mono">
            索引数量: <span className="text-white font-bold">{postCount}</span>
        </span>
    </div>

    <div className="grid md:grid-cols-2 gap-6"> {/* 更改为双列网格布局 */}
      {posts.length === 0 && <div className="text-gray-500 italic col-span-2 text-center py-10">暂无文章数据...</div>}
      {posts.map(p => (
        <motion.div 
          key={p.id} 
          whileHover={{ y: -5, scale: 1.01 }} 
          transition={{ duration: 0.2 }}
          // 使用项目列表的卡片样式
          className="bg-white/5 border border-white/10 p-6 rounded-lg hover:border-cyber/50 transition-all group backdrop-blur-sm flex flex-col cursor-pointer"
          onClick={() => onSelect(p, 'blog')}
        >
          <div className="flex justify-between items-start mb-4">
            {/* 改变：文章列表卡片图标从 BookOpen 更改为 Clipboard (剪贴板/文档) */}
            <div className="p-3 bg-cyber/10 rounded-lg text-cyber">
              <Clipboard size={24} />
            </div>
            {isAdmin && (
              // 阻止事件冒泡
              <button onClick={(e) => {e.stopPropagation(); onDelete(p.id, 'posts');}} className="text-red-500 hover:bg-red-500/10 p-1 rounded">
                <Trash2 size={16}/>
              </button>
            )}
          </div>
          {/* 显示文章发布日期 */}
          <span className="text-cyber text-xs font-mono opacity-70 mb-2">
            {new Date(p.date).toLocaleDateString('zh-CN')}
          </span>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyber transition-colors">{p.title}</h3>
          {/* 摘要显示，保持行数限制 */}
          <p className="text-gray-400 text-sm mb-4 leading-relaxed flex-grow line-clamp-3">{p.content.substring(0, 100)}...</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {p.tags && p.tags.split(',').map(tag => (
              <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                #{tag.trim()}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
    {/* 分页控件 - 包含每页显示数量设置 */}
    <Pagination 
      currentPage={currentPage} 
      totalPages={totalPages} 
      onPageChange={onPageChange} 
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
    />
  </motion.div>
);

// 项目列表板块
const ProjectSection = ({ projects, isAdmin, onDelete, onSelect, projectCount, currentPage, totalPages, onPageChange, pageSize, setPageSize }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }} 
    animate={{ opacity: 1, x: 0 }} 
    exit={{ opacity: 0, x: -20 }}
  >
    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {/* 项目列表标题图标保持 Layers */}
            <Layers className="text-cyber" /> 项目列表 // PROJECTS LIST
        </h2>
        {/* 项目总数量显示 */}
        <span className="text-sm text-gray-500 font-mono">
            索引数量: <span className="text-white font-bold">{projectCount}</span>
        </span>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {projects.length === 0 && <div className="text-gray-500 italic col-span-2 text-center py-10">暂无项目数据...</div>}
      {projects.map(p => (
        <motion.div 
          key={p.id} 
          whileHover={{ y: -5, scale: 1.01 }} 
          transition={{ duration: 0.2 }}
          className="bg-white/5 border border-white/10 p-6 rounded-lg hover:border-cyber/50 transition-all group backdrop-blur-sm flex flex-col cursor-pointer"
          onClick={() => onSelect(p, 'project')}
        >
          <div className="flex justify-between items-start mb-4">
            {/* 改变：项目列表卡片图标从 GitBranch 更改为 Terminal (终端/代码) */}
            <div className="p-3 bg-cyber/10 rounded-lg text-cyber">
              <Terminal size={24} />
            </div>
            {isAdmin && (
              // 阻止事件冒泡
              <button onClick={(e) => {e.stopPropagation(); onDelete(p.id, 'projects');}} className="text-red-500 hover:bg-red-500/10 p-1 rounded">
                <Trash2 size={16}/>
              </button>
            )}
          </div>
          {/* 显示项目发布日期 - 增加日期显示以保持一致性 */}
          <span className="text-cyber text-xs font-mono opacity-70 mb-2">
            {new Date(p.date).toLocaleDateString('zh-CN')}
          </span>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyber transition-colors">{p.title}</h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed flex-grow line-clamp-3">{p.content.substring(0, 100)}...</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {p.tags && p.tags.split(',').map(tag => (
              <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                #{tag.trim()}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
    {/* 分页控件 - 包含每页显示数量设置 */}
    <Pagination 
      currentPage={currentPage} 
      totalPages={totalPages} 
      onPageChange={onPageChange} 
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
    />
  </motion.div>
);

// 工具箱板块
const ToolboxSection = () => {
    // 常用工具和文献资料链接
    const tools = [
        { name: 'Tailwind CSS', description: '极速构建界面的实用 CSS 框架。', url: 'https://tailwindcss.com/', icon: '⚡' },
        { name: 'React 官方文档', description: '现代 Web 交互式 UI 构建库。', url: 'https://reactjs.org/', icon: '⚛️' },
        { name: 'Firebase Console', description: '后端服务控制台，实时数据库/认证。', url: 'https://console.firebase.google.com/', icon: '🔥' },
        { name: 'Lucide Icons', description: '简单、一致的开源图标库。', url: 'https://lucide.dev/', icon: '✨' },
        { name: 'Framer Motion', description: '简化 React 动画和手势操作。', url: 'https://www.framer.com/motion/', icon: '🚀' },
        { name: 'MDN Web Docs', description: 'Web 开发的权威文档（HTML/CSS/JS）。', url: 'https://developer.mozilla.org/zh-CN/', icon: '🌐' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Wrench className="text-cyber" /> 工具箱 // TOOLKIT
                </h2>
                <span className="text-sm text-gray-500 font-mono">数字节点连接中...</span>
            </div>

            <p className="text-gray-400 mb-6 leading-relaxed">
                这里存放着一些我常用的数字工具和文献资料链接，帮助我快速地构建和优化数字世界。
            </p>

            <div className="grid md:grid-cols-2 gap-6">
                {tools.map((tool, index) => (
                    <motion.a 
                        key={index}
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0, 243, 255, 0.2)" }}
                        className="bg-white/5 border border-white/10 p-5 rounded-lg hover:border-cyber/50 transition-all block backdrop-blur-sm group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{tool.icon}</span>
                            <h3 className="text-xl font-bold text-white group-hover:text-cyber transition-colors flex items-center gap-2">
                                {tool.name} <Link size={16} className="text-cyber/70 group-hover:text-cyber" />
                            </h3>
                        </div>
                        <p className="text-gray-400 text-sm">{tool.description}</p>
                    </motion.a>
                ))}
            </div>
        </motion.div>
    );
};


// Markdown 导入功能
const MarkdownImporter = ({ onImport }) => {
    const fileInputRef = React.useRef(null);
    const [status, setStatus] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'text/markdown' && !file.name.endsWith('.md')) {
            setStatus({ type: 'error', message: '错误: 文件格式必须是 .md' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const titleMatch = content.match(/^#\s+(.*)/m);
            const title = titleMatch ? titleMatch[1].trim() : file.name.replace(/\.md$/i, '').trim();

            onImport({ title, content });
            setStatus({ type: 'success', message: `成功导入: "${title}"` });
        };
        reader.onerror = () => {
            setStatus({ type: 'error', message: '错误: 读取文件失败' });
        };
        reader.readAsText(file);
    };

    return (
        <div className="border border-white/10 p-4 rounded-lg bg-black/40">
            <label className="text-xs text-cyber mb-2 block font-mono">本地 Markdown 导入</label>
            <div className="flex gap-3 items-center">
                <input 
                    type="file" 
                    accept=".md"
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden"
                />
                <button 
                    onClick={() => fileInputRef.current.click()}
                    className="flex-1 bg-white/10 text-white font-bold py-2 hover:bg-white/20 transition-colors flex justify-center items-center gap-2 rounded text-sm"
                >
                    <Upload size={18} /> 一键导入 .md 文档
                </button>
            </div>
            {status && (
                <p className={`mt-2 text-xs font-mono ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {status.message}
                </p>
            )}
        </div>
    );
};

// 设置/管理板块
const SettingsSection = ({ 
  isAdmin, onLogin, onLogout, onPublish, 
  newTitle, setNewTitle, newContent, setNewContent, newType, setNewType, newTags, setNewTags, 
  onImportMarkdown, 
}) => {
  const [password, setPassword] = useState("");

  if (!isAdmin) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto mt-20 p-8 border border-cyber/30 bg-black/50 backdrop-blur-md rounded-lg shadow-[0_0_30px_rgba(0,243,255,0.1)]">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Lock size={48} className="text-cyber" />
          <h2 className="text-xl font-bold text-white tracking-widest">系统访问受限</h2>
        </div>
        <div className="space-y-4">
          <input 
            type="password" 
            className="w-full bg-white/5 border border-white/10 p-3 text-white focus:border-cyber focus:ring-1 focus:ring-cyber outline-none rounded transition-all text-center tracking-widest placeholder-gray-600"
            placeholder="输入安全密钥"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            onClick={() => onLogin(password)} 
            className="w-full bg-cyber text-black font-bold py-3 hover:bg-white transition-all rounded uppercase tracking-widest"
          >
            解锁控制台
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-cyber" /> 控制台 // ADMIN
        </h2>
        <button onClick={onLogout} className="text-xs border border-red-500/50 text-red-400 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-colors">
          断开连接
        </button>
      </div>

      {/* Markdown 导入功能 */}
      <MarkdownImporter onImport={onImportMarkdown} />

      {/* 数据发布区域 */}
      <div className="space-y-6 bg-white/5 p-6 rounded-xl border border-white/10 mt-6">
        <p className="text-sm text-gray-400">文章和项目的内容都支持 **Markdown** 格式。例如：`# 标题`、`**粗体**`、`[链接](URL)`。</p>
        <div>
          <label className="text-xs text-cyber mb-1 block font-mono">标题 // TITLE</label>
          <input 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)} 
            placeholder="输入标题..." 
            className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cyber outline-none rounded transition-colors" 
          />
        </div>
        
        <div>
          <label className="text-xs text-cyber mb-1 block font-mono">标签 (逗号分隔) // TAGS</label>
          <input 
            value={newTags} 
            onChange={e => setNewTags(e.target.value)} 
            placeholder="React, Frontend, Design" 
            className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cyber outline-none rounded transition-colors" 
          />
        </div>

        <div>
          <label className="text-xs text-cyber mb-1 block font-mono">内容 (支持 Markdown) // CONTENT</label>
          <textarea 
            value={newContent} 
            onChange={e => setNewContent(e.target.value)} 
            placeholder="使用 Markdown 格式输入正文..." 
            className="w-full bg-black/40 border border-white/10 p-3 text-white h-48 focus:border-cyber outline-none rounded transition-colors resize-none" 
          />
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs text-cyber mb-1 block font-mono">分类 // TYPE</label>
            <select 
              value={newType} 
              onChange={e => setNewType(e.target.value)} 
              className="w-full bg-black/40 border border-white/10 text-white p-3 outline-none rounded cursor-pointer hover:border-cyber/50 transition-colors"
            >
              <option value="blog">文章</option>
              <option value="project">项目</option>
            </select>
          </div>
          <button 
            onClick={onPublish} 
            className="flex-1 bg-cyber text-black font-bold p-3 hover:bg-white transition-colors flex justify-center items-center gap-2 rounded"
          >
            <Save size={18} /> 发布数据
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------
// 4. 主应用组件
// ---------------------------------------------------------
export default function App() {
  // 导航状态: 'intro', 'blog', 'projects', 'settings', 'toolbox'
  const [activeTab, setActiveTab] = useState('intro');
  // 管理模式
  const [isAdminMode, setIsAdminMode] = useState(false);
  // 选中的文章/项目详情 (null/object)
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(null);
  
  // 数据状态
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  // 计数状态
  const [postCount, setPostCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // 默认每页显示 5 条

  // 编辑状态
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("blog");
  const [newTags, setNewTags] = useState("");

  const particlesInit = useCallback(async engine => await loadSlim(engine), []);

  // 数据获取
  const fetchData = async () => {
    try {
      // 获取文章列表
      const qPosts = query(collection(db, "posts"), orderBy("date", "desc"));
      const postSnap = await getDocs(qPosts);
      setPosts(postSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      
      // 获取文章数量
      const countPostsSnap = await getCountFromServer(collection(db, "posts"));
      setPostCount(countPostsSnap.data().count);

      // 获取项目列表
      const qProjects = query(collection(db, "projects"), orderBy("date", "desc"));
      const projSnap = await getDocs(qProjects);
      setProjects(projSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      // 获取项目数量
      const countProjectsSnap = await getCountFromServer(collection(db, "projects"));
      setProjectCount(countProjectsSnap.data().count);

    } catch (error) {
      console.error("数据拉取失败:", error);
    }
  };

  useEffect(() => { 
    // 确保 marked 库的可用性
    if (typeof window.marked === 'undefined') {
        // 确保 marked 库在全局环境中可用
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/marked/4.0.17/marked.min.js";
        script.onload = () => console.log('Markdown library loaded.');
        document.head.appendChild(script);
    }
    fetchData();
  }, []);
  
  // 切换 Tab 时重置分页和详情页状态
  const handleSetActiveTab = (tab) => {
    setSelectedItem(null);
    setItemType(null);
    setActiveTab(tab);
    setCurrentPage(1); // 切换 Tab 重置到第一页
  };

  // 交互逻辑
  const handleLogin = (pwd) => {
    // 从环境变量获取管理员密码，如果没有设置则使用默认值（仅用于开发）
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'chen1234';

    if (pwd === adminPassword) {
      setIsAdmin(true);
      setIsAdminMode(true); // 切换到管理模式
      console.log("管理员权限已授予 // ADMIN ACCESS GRANTED");
    } else {
      console.log("访问拒绝 // ACCESS DENIED");
    }
  };

  const handlePublish = async () => {
    if (!newTitle || !newContent) {
      console.error("标题和内容不能为空！");
      return;
    }
    const collectionName = newType === 'blog' ? 'posts' : 'projects';
    await addDoc(collection(db, collectionName), {
      title: newTitle,
      content: newContent,
      tags: newTags.trim(), // 保存标签
      date: new Date().toISOString(),
    });
    setNewTitle(""); setNewContent(""); setNewTags("");
    fetchData(); // 重新拉取数据以更新列表和计数
    console.log("数据已同步至云端核心 // UPLOAD COMPLETE");
    // 自动跳转到对应板块查看
    handleSetActiveTab(newType === 'blog' ? 'blog' : 'projects');
  };

  const handleDelete = async (id, collectionName) => {
    // 使用自定义的模态框替代 window.confirm()
    // NOTE: 在这里使用 prompt 模拟，实际应用中建议使用自定义 modal
    const isConfirmed = window.prompt("确认从数据库删除此数据？输入 'DELETE' 确认操作。") === 'DELETE'; 
    if(!isConfirmed) return;
    
    try {
        await deleteDoc(doc(db, collectionName, id));
        fetchData();
        console.log(`文档 ${id} 已删除。`);
    } catch (error) {
        console.error("删除失败:", error);
    }
  };

  const handleSelect = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
  };

  const handleBack = () => {
    setSelectedItem(null);
    setItemType(null);
    // 确保导航回到列表页
    setActiveTab(itemType === 'blog' ? 'blog' : 'projects');
  }
  
  // 详情页顶部分类导航点击处理
  const handleAdminLogout = () => {
    setIsAdmin(false);
    setIsAdminMode(false);
    setActiveTab('intro');
  };

  // Markdown 文件导入回调
  const handleImportMarkdown = ({ title, content }) => {
    setNewTitle(title);
    // 移除第一个标题行（因为它被用作 title）
    const cleanedContent = content.replace(/^#\s+.*?\n/m, '').trim();
    setNewContent(cleanedContent);
    // 默认导入为文章
    setNewType('blog'); 
    console.log(`Markdown 内容已加载到编辑器。标题: ${title}`);
  }
  
  // 分页逻辑
  const itemsToDisplay = useMemo(() => {
    if (activeTab === 'blog') return posts;
    if (activeTab === 'projects') return projects;
    return [];
  }, [activeTab, posts, projects]);
  
  const totalItems = itemsToDisplay.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = itemsToDisplay.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  // 监听 pageSize 变化，如果当前页超出范围则重置
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    // 更改每页大小时，计算新的总页数，并确保当前页在有效范围内
    const newTotalPages = Math.ceil(totalItems / newSize);
    if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0) {
        setCurrentPage(1);
    }
  }

  // 渲染内容
  const renderContent = () => {
    if (isAdminMode) {
      return <AdminDashboard onLogout={handleAdminLogout} />;
    }

    if (selectedItem) {
      return <DetailView 
        item={selectedItem} 
        onBack={handleBack} 
        type={itemType} 
        onSelectCategory={handleSelectCategory}
      />;
    }
    
    switch (activeTab) {
      case 'intro':
        return <IntroSection />;
      case 'blog':
        return <BlogSection 
            posts={currentItems} // 仅显示当前页数据
            isAdmin={isAdmin} 
            onDelete={handleDelete} 
            onSelect={handleSelect} 
            postCount={postCount} 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            setPageSize={handlePageSizeChange} // 传递新的处理函数
        />;
      case 'projects':
        return <ProjectSection 
            projects={currentItems} // 仅显示当前页数据
            isAdmin={isAdmin} 
            onDelete={handleDelete} 
            onSelect={handleSelect} 
            projectCount={projectCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            setPageSize={handlePageSizeChange} // 传递新的处理函数
        />;
      case 'toolbox':
          return <ToolboxSection />;
      case 'settings':
        return <SettingsSection 
          isAdmin={isAdmin}
          onLogin={handleLogin}
          onLogout={() => setIsAdmin(false)}
          onPublish={handlePublish}
          newTitle={newTitle} setNewTitle={setNewTitle}
          newContent={newContent} setNewContent={setNewContent}
          newTags={newTags} setNewTags={setNewTags}
          newType={newType} setNewType={setNewType}
          onImportMarkdown={handleImportMarkdown} 
        />;
      default:
        return <IntroSection />;
    }
  };


  return (
    <div className="relative min-h-screen w-full text-gray-200 selection:bg-cyber selection:text-black font-sans overflow-x-hidden">
      {/* 粒子背景 */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "#050505" } }, // 深色背景
          fpsLimit: 60,
          interactivity: {
            events: { onHover: { enable: true, mode: "grab" } },
            modes: { grab: { distance: 150, links: { opacity: 0.8 } } },
          },
          particles: {
            color: { value: "#00f3ff" },
            links: { color: "#00f3ff", distance: 150, enable: true, opacity: 0.2, width: 1 },
            move: { enable: true, speed: 0.8 },
            number: { value: 50 },
            opacity: { value: 0.4 },
            size: { value: { min: 1, max: 2 } },
          },
        }}
        className="absolute inset-0 -z-10"
      />

      {/* 顶部导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-lg border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          {/* Logo - 修改为 "陈凌" */}
          <div 
            className="text-xl font-bold text-white tracking-widest flex items-center gap-2 font-mono cursor-pointer"
            onClick={() => handleSetActiveTab('intro')} // 使用新的处理函数
          >
            <Power size={18} className="text-cyber" /> 陈凌哥哥~~的赛博空间
          </div>

          {/* Menu */}
          <div className="flex items-center gap-1 md:gap-2 bg-black/40 rounded-full p-1 border border-white/5">
            <NavItem active={activeTab === 'intro' && !selectedItem} onClick={() => handleSetActiveTab('intro')} icon={Home} label="简介" />
            <NavItem active={activeTab === 'blog' && !selectedItem} onClick={() => handleSetActiveTab('blog')} icon={BookOpen} label="文章" />
            {/* 修复：导航栏项目图标改回 Layers */}
            <NavItem active={activeTab === 'projects' && !selectedItem} onClick={() => handleSetActiveTab('projects')} icon={Layers} label="项目" />
            
            {/* 新增工具箱导航，使用 Wrench 图标 */}
            <NavItem active={activeTab === 'toolbox' && !selectedItem} onClick={() => handleSetActiveTab('toolbox')} icon={Wrench} label="工具箱" />
            
            {/* 圆形头像 - 集成设置功能 */}
            {/* 这里的 UserCircle 已替换为 Image */}
            <div 
                className="ml-2 p-0.5 rounded-full border-2 border-cyber/50 hover:border-cyber transition-all cursor-pointer group overflow-hidden"
                onClick={() => handleSetActiveTab('settings')} // 点击头像进入设置/控制台
            >
                <img 
                  src="/image_c5a0fe.png" 
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover" 
                />
            </div>
            {/* 原来的设置 NavItem 已删除 */}
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="container mx-auto px-6 pt-32 pb-20 max-w-4xl min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div key={selectedItem ? 'detail' : activeTab}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 底部 */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-xs">
        <p className="font-mono mb-2">SYSTEM STATUS: ONLINE // LATENCY: 12ms</p>
        <p>&copy; 2025 CHEN LING. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}

export { db };