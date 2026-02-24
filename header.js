import { auth, db } from './config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function createHeader() {
    // إزاحة محتوى الصفحة للأسفل لكي لا يختفي خلف الهيدر
    document.body.style.paddingTop = "70px";

    const headerHTML = `
    <style>
        .main-header {
            position: fixed; top: 0; left: 0; right: 0; height: 65px;
            background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            display: flex; justify-content: space-between; align-items: center;
            padding: 0 20px; z-index: 11000; border-bottom: 0.5px solid #E5E5EA;
        }
        .header-logo { display: flex; align-items: center; gap: 10px; font-weight: bold; font-size: 18px; color: #1c1c1e; }
        .header-logo img { height: 35px; border-radius: 8px; }
        
        .menu-trigger { 
            width: 40px; height: 40px; background: #f2f2f7; border-radius: 12px; 
            display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px;
        }

        /* القائمة الجانبية (Side Menu) */
        .side-menu {
            position: fixed; top: 0; left: -280px; width: 260px; height: 100%;
            background: white; z-index: 12000; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 10px 0 30px rgba(0,0,0,0.1); padding: 30px 20px;
            display: flex; flex-direction: column; gap: 15px;
        }
        .side-menu.active { left: 0; }
        
        .overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.3); 
            z-index: 11500; display: none; backdrop-filter: blur(2px);
        }
        .overlay.active { display: block; }

        .menu-item {
            padding: 15px; border-radius: 12px; background: #f9f9fb;
            text-decoration: none; color: #1c1c1e; font-weight: 600;
            display: flex; align-items: center; gap: 10px; font-size: 15px;
        }
        .menu-item:active { background: #e5e5ea; }
        .logout-btn { color: #FF3B30; margin-top: auto; background: #fff1f0; }
    </style>

    <header class="main-header">
        <div class="header-logo">
            <img src="logo.png" onerror="this.src='https://via.placeholder.com/35'">
            <span>العائلة 2026</span>
        </div>
        <div class="menu-trigger" id="openMenu">⚙️</div>
    </header>

    <div class="overlay" id="menuOverlay"></div>

    <div class="side-menu" id="sideMenu">
        <h3 style="margin-bottom:20px;">القائمة</h3>
        
        <a href="profile.html" class="menu-item">👤 ملفي الشخصي</a>
        
        <div id="adminMenu" style="display:none; flex-direction: column; gap: 15px;">
            <a href="add_news.html" class="menu-item">➕ إضافة خبر جديد</a>
            <a href="admin.html" class="menu-item">🛠️ لوحة التحكم</a>
            <a href="admin_config.html" class="menu-item">⚙️ إعدادات الأزرار</a>
        </div>

        <a href="#" class="menu-item logout-btn" id="logoutBtn">🚪 تسجيل الخروج</a>
    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // منطق فتح وإغلاق القائمة
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    const trigger = document.getElementById('openMenu');

    const toggleMenu = () => {
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
    };

    trigger.onclick = toggleMenu;
    overlay.onclick = toggleMenu;

    // التحقق من الصلاحيات لإظهار أزرار الإدارة
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userSnap = await getDoc(doc(db, "Users", user.uid));
            if (userSnap.exists()) {
                const role = (userSnap.data().role || "").toLowerCase();
                if (role.includes('admin') || role.includes('مدير')) {
                    document.getElementById('adminMenu').style.display = 'flex';
                }
            }
        }
    });

    // تسجيل الخروج
    document.getElementById('logoutBtn').onclick = () => {
        if(confirm("هل تريد تسجيل الخروج؟")) auth.signOut().then(() => location.reload());
    };
}

createHeader();
