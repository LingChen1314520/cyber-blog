import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdHMN_tqZUuplsAl8jxRTCJdTnvvUb8Ak",
  authDomain: "tech-portfolio-4cc08.firebaseapp.com",
  projectId: "tech-portfolio-4cc08",
  storageBucket: "tech-portfolio-4cc08.firebasestorage.app",
  messagingSenderId: "282238563314",
  appId: "1:282238563314:web:62d02e23a7a18bc72f316b",
  measurementId: "G-6XV43YRZTB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 测试连接
async function testConnection() {
  try {
    console.log("🔄 Testing Firebase connection...");

    // 尝试读取数据
    const querySnapshot = await getDocs(collection(db, "posts"));
    console.log("✅ 成功连接到Firestore，当前文章数量:", querySnapshot.size);

    // 显示现有文章
    querySnapshot.forEach((doc) => {
      console.log("📄 文章:", doc.id, "->", doc.data().title);
    });

    // 尝试写入测试数据
    const docRef = await addDoc(collection(db, "posts"), {
      title: "测试文章 - " + new Date().toLocaleString(),
      content: "这是一个自动生成的测试文章",
      tags: "test,auto",
      date: new Date().toISOString(),
      views: 0
    });
    console.log("✅ 测试数据写入成功，文档ID:", docRef.id);

  } catch (error) {
    console.error("❌ Firebase连接测试失败:", error);
    console.error("错误详情:", error.message);
    console.error("错误代码:", error.code);
  }
}

testConnection();