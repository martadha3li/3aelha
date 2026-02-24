import { auth, db } from './config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function createFloatingHeader() {
    // إزالة أي هيدر قديم لضمان عدم التكرار
    const oldHeader = document.querySelector('.floating-menu-container');
    if (oldHeader) oldHeader.remove();

    const headerHTML = `
    <style>
        /* أيقونة القائمة العائمة */
        .floating-menu-btn {
            position: fixed;
            top: 20px;
            left: 20px; /* تظهر في جهة اليسار كما طلبت */
            width: 45px;
            height: 45px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            z-index: 12000;
            cursor: pointer;
            border: 1px solid rgba(0,122,255,0.1);
            font-size: 22px;
            transition: transform 0.2s active;
        }
        .floating-menu-btn:active { transform: scale(0.9); }

        /* النافذة المنسدلة */
        .dropdown-menu {
            position: fixed;
            top: 75px;
            left: 20px;
            width: 220px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            display: none; /* مخفية افتراضياً */
            flex-direction: column;
            padding: 8px;
            z-index: 12000;
            border: 1px solid #eee;
            animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .dropdown-menu.show { display: flex; }

        .menu-link {
            padding: 12px 15px;
            text-decoration: none;
            color: #1c1c1e;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            border-radius: 12px;
            transition: 0.2s;
        }
        .menu-link:active { background: #f2f2f7; }
        .menu-link.admin-only { color: #007AFF; }
        .menu-link.logout { color: #FF3B30; border-top: 1px solid #f2f2f2; margin-top: 5px; border-radius: 0 0 12px 12px; }

        /* غطاء خلفي لإغلاق القائمة عند الضغط خارجها */
        .menu-overlay {
            position: fixed;
            inset: 0;
            z-index: 11500;
            display: none;
        }
        .menu-overlay.show { display: block; }
    </style>

    <div class="floating-menu-container">
        <div class="floating-menu-btn" id="menuBtn">⚙️</div>
        
        <div class="menu-overlay" id="menuOverlay"></div>

        <div class="dropdown-menu" id="dropdownMenu">
            <a href="profile.html" class="menu-link">👤 ملفي الشخصي</a>
            
            <div id="adminSection" style="display:none;">
                <a href="add_news.html" class="menu-link admin-only">➕ إضافة خبر</a>
                <a href="admin.html" class="menu-link admin-only">🛠️ لوحة التحكم</a>
                <a href="admin_config.html" class="menu-link admin-only">⚙️ إعدادات الأزرار</a>
            </div>

            <a href="#" class="menu-link logout" id="logoutBtn">🚪 تسجيل الخروج</a>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('dropdownMenu');
    const overlay = document.getElementById('menuOverlay');

    // فتح وإغلاق القائمة
    const toggleMenu = () => {
        const isShow = menu.classList.toggle('show');
        overlay.classList.toggle('show');
        btn.innerHTML = isShow ? "✕" : "⚙️"; // تتغير الأيقونة عند الفتح
    };

    btn.onclick = toggleMenu;
    overlay.onclick = toggleMenu;

    // التحقق من الصلاحيات
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userSnap = await getDoc(doc(db, "Users", user.uid));
            if (userSnap.exists()) {
                const role = (userSnap.data().role || "").toLowerCase();
                if (role.includes('admin') || role.includes('مدير')) {
                    document.getElementById('adminSection').style.display = 'block';
                }
            }
        }
    });

    // تسجيل الخروج
    document.getElementById('logoutBtn').onclick = () => {
        if(confirm("هل تريد تسجيل الخروج؟")) auth.signOut().then(() => location.reload());
    };
}

createFloatingHeader();
