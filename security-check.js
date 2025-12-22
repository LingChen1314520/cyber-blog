#!/usr/bin/env node

/**
 * 安全检查脚本
 * 检查项目中的安全配置
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔒 CyberBlog 安全检查\n');

// 检查 .env.local 文件
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local 文件存在');

  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const hasPassword = envContent.includes('VITE_ADMIN_PASSWORD=');
  const passwordLine = envContent.split('\n').find(line => line.startsWith('VITE_ADMIN_PASSWORD='));

  if (hasPassword && passwordLine) {
    const password = passwordLine.split('=')[1];
    if (password && password !== 'chen1234' && password !== 'your_secure_password_here') {
      console.log('✅ 管理员密码已配置');
    } else {
      console.log('⚠️  管理员密码使用默认值，请修改');
    }
  } else {
    console.log('❌ 缺少管理员密码配置');
  }
} else {
  console.log('❌ .env.local 文件不存在');
}

// 检查 .gitignore
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env.local') || gitignoreContent.includes('*.local')) {
    console.log('✅ .gitignore 正确配置，环境文件不会被提交');
  } else {
    console.log('⚠️  .gitignore 可能未正确配置环境文件');
  }
} else {
  console.log('❌ .gitignore 文件不存在');
}

// 检查源代码中是否还有硬编码密码
const appJsxPath = path.join(__dirname, 'src', 'App.jsx');
if (fs.existsSync(appJsxPath)) {
  const appContent = fs.readFileSync(appJsxPath, 'utf8');
  if (appContent.includes('"chen1234"')) {
    console.log('❌ 源代码中仍包含硬编码密码');
  } else {
    console.log('✅ 源代码中无硬编码密码');
  }

  if (appContent.includes('import.meta.env.VITE_ADMIN_PASSWORD')) {
    console.log('✅ 使用环境变量获取密码');
  } else {
    console.log('⚠️  未检测到环境变量使用');
  }
}

console.log('\n📋 安全建议:');
console.log('1. 定期更换管理员密码');
console.log('2. 启用 Firebase Authentication 以获得更好的安全性');
console.log('3. 定期检查 Firestore 安全规则');
console.log('4. 监控 Firebase Console 的活动日志');

console.log('\n🔗 相关文档:');
console.log('- SECURITY.md: 详细安全指南');
console.log('- FIREBASE_DEBUG.md: Firebase 配置指南');
console.log('- ADMIN_README.md: 管理后台使用指南');