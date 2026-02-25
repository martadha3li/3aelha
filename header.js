import { auth, db } from './config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function createDynamicHeader() {
    const headerHTML = `
    <style>
        .header-wrapper {
            position: fixed;
            top: 15px;
            left: 0;
            right: 0;
            margin: auto;
            width: 90%;
            max-width: 400px;
            z-index: 11000;
            direction: rtl;
        }

        /* الكبسولة الرئيسية */
        .header-capsule {
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border-radius: 22px;
            padding: 8px 15px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 8px 25px rgba(0, 122, 255, 0.12);
            border: 0.5px solid rgba(0, 122, 255, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }

        /* الصف العلوي (اللوجو وزر التحكم) */
        .header-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 40px;
        }

        .header-logo {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 800;
            font-size: 15px;
            color: #1c1c1e;
        }
        .header-logo img { height: 30px; border-radius: 6px; }

        .settings-trigger {
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #c6d9e4;
            border-radius: 12px;
            cursor: pointer;
            font-size: 18px;
            transition: 0.2s;
        }

        /* قسم الأيقونات المنسدل */
        .header-dropdown {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            max-height: 0; /* مخفي افتراضياً */
            opacity: 0;
            transition: all 0.3s ease;
            padding: 0;
        }

        .header-capsule.open .header-dropdown {
            max-height: 100px; /* يظهر عند الفتح */
            opacity: 1;
            padding: 15px 0 5px 0;
            margin-top: 5px;
            border-top: 0.5px solid #eee;
        }

        /* أيقونات الأزرار داخل المنسدل */
        .head-nav-item {
            text-decoration: none;
            color: #8E8E93;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            font-size: 10px;
            font-weight: bold;
        }
        .head-nav-item i { font-size: 18px; font-style: normal; }
        .head-nav-item.admin { color: #007AFF; }
        .head-nav-item.logout { color: #FF3B30; }

    </style>

    <div class="header-wrapper">
        <div class="header-capsule" id="headerCapsule">
            <div class="header-top-row">
                <div class="header-logo">
                    <img src="logo.png" onerror="this.src='https://via.placeholder.com/30'">
                    <span>العائلة 2026</span>
                </div>
                <div class="settings-trigger" id="headTrigger">⚙️</div>
            </div>

            <div class="header-dropdown">
                <div id="adminToolsHead" style="display: contents;">
                 <a href="admin_config.html" class="head-nav-item admin">⚙️ إعدادات الأزرار</a>
                    <a href="add_news.html" class="head-nav-item admin"><i>⊕</i><span>إضافة</span></a>
                    <a href="admin.html" class="head-nav-item admin"><i>🛠️</i><span>لوحة التحكم</span></a>
                </div>
                                   

                <a href="#" class="head-nav-item logout" id="logoutHead"><i>🚪</i><span>خروج</span></a>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    const capsule = document.getElementById('headerCapsule');
    const trigger = document.getElementById('headTrigger');
    const logout = document.getElementById('logoutHead');

    // وظيفة الفتح والإغلاق
    trigger.onclick = () => {
        const isOpen = capsule.classList.toggle('open');
        trigger.innerHTML = isOpen ? "✕" : "⚙️";
    };

    // التحقق من الصلاحيات لإظهار أدوات المدير
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userSnap = await getDoc(doc(db, "Users", user.uid));
            const role = (userSnap.data()?.role || "").toLowerCase();
            const isAdmin = role.includes('admin') || role.includes('مدير');
            document.getElementById('adminToolsHead').style.display = isAdmin ? "contents" : "none";
        }
    });

    logout.onclick = () => {
        if(confirm("تسجيل خروج؟")) auth.signOut().then(() => location.reload());
    };
}

createDynamicHeader();
