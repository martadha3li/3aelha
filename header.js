import { auth, db } from './config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function createDynamicHeader() {
    // منع التكرار إذا تم استدعاء الدالة مرتين
    if (document.getElementById('headerCapsule')) return;

    const headerHTML = `
    <style>
        .header-wrapper {
            position: fixed;
            top: 15px;
            left: 0;
            right: 0;
            margin: auto;
            width: 92%;
            max-width: 420px;
            z-index: 100000; /* قيمة فلكية لضمان الظهور فوق كل شيء */
            direction: rtl;
            pointer-events: none;
        }

        .header-capsule {
            pointer-events: auto;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(25px) saturate(180%);
            -webkit-backdrop-filter: blur(25px) saturate(180%);
            border-radius: 24px;
            padding: 8px 16px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
            border: 0.5px solid rgba(255, 255, 255, 0.4);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 44px;
        }

        .header-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 800;
            font-size: 16px;
            color: #1c1c1e;
        }
        
        .header-logo img { 
            height: 34px; 
            width: 34px; 
            border-radius: 10px; 
            object-fit: cover;
            border: 1px solid rgba(0,0,0,0.05);
        }

        .settings-trigger {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 122, 255, 0.1);
            color: #007AFF;
            border-radius: 12px;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s ease;
        }

        /* حاوية الأيقونات المنسدلة */
        .header-dropdown {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-capsule.open {
            background: rgba(255, 255, 255, 0.96);
        }

        .header-capsule.open .header-dropdown {
            max-height: 120px;
            opacity: 1;
            padding: 15px 0 5px 0;
            margin-top: 10px;
            border-top: 0.5px solid rgba(0,0,0,0.05);
        }

        .head-nav-item {
            text-decoration: none;
            color: #3a3a3c;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 10px 0;
            border-radius: 15px;
            transition: background 0.2s;
        }

        .head-nav-item:active { background: rgba(0,0,0,0.05); }
        .head-nav-item i { font-size: 22px; font-style: normal; }
        .head-nav-item span { font-size: 10px; font-weight: 700; }
        .head-nav-item.admin i { color: #007AFF; }
        .head-nav-item.logout { color: #FF3B30; }

    </style>

    <div class="header-wrapper">
        <div class="header-capsule" id="headerCapsule">
            <div class="header-top-row">
                <div class="header-logo">
                    <img src="logo.png" onerror="this.src='https://via.placeholder.com/34'">
                    <span>عائلة 2026</span>
                </div>
                <div class="settings-trigger" id="headTrigger">⚙️</div>
            </div>

            <div class="header-dropdown">
                <div id="adminToolsHead" style="display: contents;">
                    <a href="admin_config.html" class="head-nav-item admin"><i>⚙️</i><span>إعدادات</span></a>
                    <a href="add_news.html" class="head-nav-item admin"><i>⊕</i><span>إضافة</span></a>
                    <a href="admin.html" class="head-nav-item admin"><i>🛠️</i><span>اللوحة</span></a>
                </div>
                <a href="#" class="head-nav-item logout" id="logoutHead"><i>🚪</i><span>خروج</span></a>
            </div>
        </div>
    </div>
    `;

    // حقن الكود في بداية الـ body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    const capsule = document.getElementById('headerCapsule');
    const trigger = document.getElementById('headTrigger');
    const logout = document.getElementById('logoutHead');

    // تفعيل وظيفة الفتح والإغلاق
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = capsule.classList.toggle('open');
        trigger.innerHTML = isOpen ? "✕" : "⚙️";
        trigger.style.color = isOpen ? "#FF3B30" : "#007AFF";
    });

    // إغلاق عند الضغط بالخارج
    document.addEventListener('click', (e) => {
        if (!capsule.contains(e.target) && capsule.classList.contains('open')) {
            capsule.classList.remove('open');
            trigger.innerHTML = "⚙️";
            trigger.style.color = "#007AFF";
        }
    });

    // فحص الصلاحيات
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userSnap = await getDoc(doc(db, "Users", user.uid));
            const role = (userSnap.data()?.role || "").toLowerCase();
            const isAdmin = role.includes('admin') || role.includes('مدير');
            const adminTools = document.getElementById('adminToolsHead');
            const dropdown = document.querySelector('.header-dropdown');
            
            if (adminTools) adminTools.style.display = isAdmin ? "contents" : "none";
            if (dropdown) dropdown.style.gridTemplateColumns = isAdmin ? "repeat(4, 1fr)" : "repeat(1, 1fr)";
        }
    });

    // تسجيل الخروج
    logout.addEventListener('click', (e) => {
        e.preventDefault();
        if(confirm("هل تريد تسجيل الخروج؟")) {
            auth.signOut().then(() => window.location.href = "index.html");
        }
    });
}

// التأكد من تحميل الصفحة بالكامل قبل تشغيل الدالة
if (document.readyState === 'complete') {
    createDynamicHeader();
} else {
    window.addEventListener('load', createDynamicHeader);
}
