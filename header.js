import { auth, db } from './config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function createDynamicHeader() {
    if (document.getElementById('mainHeaderContainer')) return;

    const headerHTML = `
    <style>
        /* الحاوية الثابتة في أعلى الشاشة */
        #mainHeaderContainer {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px; /* ارتفاع الشريط */
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 200000;
            border-bottom: 0.5px solid #d1d1d6;
            display: flex;
            align-items: center;
            padding: 0 15px;
            direction: rtl;
        }

        .header-flex {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
        }

        .header-logo-section {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 800;
            color: #1c1c1e;
        }

        .header-logo-section img {
            width: 35px;
            height: 35px;
            border-radius: 10px;
            object-fit: cover;
        }

        .admin-trigger-circle {
            width: 38px;
            height: 38px;
            background: #f2f2f7;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            transition: 0.3s;
        }

        /* نافذة الخيارات المنسدلة */
        .admin-dropdown-panel {
            position: absolute;
            top: 70px;
            left: 15px;
            width: 220px;
            background: white;
            border-radius: 18px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            display: none;
            flex-direction: column;
            padding: 8px;
            border: 0.5px solid #eee;
            animation: fadeInDown 0.3s ease;
        }

        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            text-decoration: none;
            color: #333;
            font-size: 14px;
            font-weight: 600;
            border-radius: 12px;
        }

        .dropdown-item:active { background: #f2f2f7; }
        .dropdown-item.logout { color: #FF3B30; border-top: 0.5px solid #eee; margin-top: 5px; }

    </style>

    <div id="mainHeaderContainer">
        <div class="header-flex">
            <div class="header-logo-section">
                <img src="logo.png" onerror="this.src='https://via.placeholder.com/35'">
                <span>عائلة 2026</span>
            </div>
            
            <div class="admin-trigger-circle" id="headerMenuBtn">⚙️</div>
        </div>

        <div class="admin-dropdown-panel" id="headerDropdown">
            <div id="adminLinks" style="display:none;">
                <a href="admin_config.html" class="dropdown-item">⚙️ إعدادات الأزرار</a>
                <a href="add_news.html" class="dropdown-item">⊕ إضافة خبر</a>
                <a href="admin.html" class="dropdown-item">🛠️ لوحة التحكم</a>
            </div>
            <a href="profile.html" class="dropdown-item">👤 ملفي الشخصي</a>
            <a href="#" class="dropdown-item logout" id="logoutAction">🚪 تسجيل الخروج</a>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    const menuBtn = document.getElementById('headerMenuBtn');
    const dropdown = document.getElementById('headerDropdown');

    menuBtn.onclick = (e) => {
        e.stopPropagation();
        dropdown.style.display = (dropdown.style.display === 'flex') ? 'none' : 'flex';
    };

    document.onclick = () => dropdown.style.display = 'none';

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const snap = await getDoc(doc(db, "Users", user.uid));
            const role = (snap.data()?.role || "").toLowerCase();
            const isAdmin = role.includes('admin') || role.includes('مدير');
            if (isAdmin) document.getElementById('adminLinks').style.display = 'block';
        }
    });

    document.getElementById('logoutAction').onclick = () => {
        if(confirm("تسجيل خروج؟")) auth.signOut().then(() => location.reload());
    };
}

createDynamicHeader();
