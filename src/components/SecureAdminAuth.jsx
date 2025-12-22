import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Key, AlertTriangle, CheckCircle,
  Eye, EyeOff, RefreshCw
} from 'lucide-react';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase 配置 (使用环境变量)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SecureAdminAuth = ({ onAuthenticated, onLogout }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 监听认证状态变化
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        onAuthenticated();
      }
    });

    return () => unsubscribe();
  }, [onAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess('登录成功！');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('登录失败:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('用户不存在');
          break;
        case 'auth/wrong-password':
          setError('密码错误');
          break;
        case 'auth/invalid-email':
          setError('邮箱格式不正确');
          break;
        case 'auth/too-many-requests':
          setError('尝试次数过多，请稍后再试');
          break;
        default:
          setError('登录失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少6位');
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess('注册成功！请使用新账号登录');
      setIsLogin(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('注册失败:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('邮箱已被注册');
          break;
        case 'auth/invalid-email':
          setError('邮箱格式不正确');
          break;
        case 'auth/weak-password':
          setError('密码强度太弱');
          break;
        default:
          setError('注册失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 z-50"
      >
        <CheckCircle size={16} />
        <span className="text-sm">已认证: {user.email}</span>
        <button
          onClick={handleLogout}
          className="ml-2 text-red-400 hover:text-red-300"
        >
          登出
        </button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/50 backdrop-blur-md border border-cyber/30 rounded-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-cyber/20 rounded-full">
              <Shield className="text-cyber" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? '管理员登录' : '创建管理员账号'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? '请输入管理员凭据' : '首次使用需要创建管理员账号'}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
          <div>
            <label className="block text-cyber/80 text-sm mb-2">邮箱地址</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyber focus:ring-1 focus:ring-cyber outline-none"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-cyber/80 text-sm mb-2">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-cyber focus:ring-1 focus:ring-cyber outline-none"
                placeholder="输入密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-cyber/80 text-sm mb-2">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyber focus:ring-1 focus:ring-cyber outline-none"
                placeholder="再次输入密码"
                required
              />
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2"
            >
              <AlertTriangle size={16} />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2"
            >
              <CheckCircle size={16} />
              {success}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyber text-black font-bold py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <Lock size={16} />
                {isLogin ? '登录' : '创建账号'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="text-cyber/70 hover:text-cyber text-sm transition-colors"
          >
            {isLogin ? '首次使用？创建管理员账号' : '已有账号？返回登录'}
          </button>
        </div>

        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-yellow-200/80 text-xs">
              <p className="font-semibold mb-1">安全提醒</p>
              <p>首次创建管理员账号后，请妥善保管登录凭据。建议定期更换密码。</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export { SecureAdminAuth, auth, db };