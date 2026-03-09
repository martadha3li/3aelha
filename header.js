import { auth, db } from './config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function createDynamicHeader() {
    const headerHTML = `
    <style>
        .header-wrapper {
            position: fixed;
            top: 12px;
            left: 0;
            right: 0;
            margin: auto;
            width: 92%;
            max-width: 420px;
            z-index: 20000; /* قيمة عالية لضمان الظهور فوق كل شيء */
            direction: rtl;
            pointer-events: none; /* للسماح باللمس خلف الحاوية الشفافة */
        }

        .header-capsule {
            pointer-events: auto; /* إعادة تفعيل اللمس للكبسولة فقط */
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border-radius: 24px;
            padding: 6px 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0,0,0,0.05);
            border: 0.5px solid rgba(255, 255, 255, 0.3);
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
            gap: 10px;
            font-weight: 700;
            font-size: 14px;
            color: #1c1c1e;
        }
        .header-logo img { 
            height: 32px; 
            width: 32px; 
            border-radius: 9px; 
            object-fit: cover;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .settings-trigger {
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 122, 255, 0.1);
            color: #007AFF;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            transition: 0.3s;
        }

        /* قسم الشبكة المطور */
        .header-dropdown {
            display: grid;
            grid-template-columns: repeat(4, 1fr); /* 4 أعمدة لتوزيع أفضل */
            gap: 8px;
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            padding: 0;
        }

        .header-capsule.open {
            background: rgba(255, 255, 255, 0.98);
            border-radius: 28px;
        }

        .header-capsule.open .header-dropdown {
            max-height: 120px;
            opacity: 1;
            padding: 15px 5px 10px 5px;
            margin-top: 8px;
            border-top: 0.5px solid rgba(0,0,0,0.05);
        }

        /* تنسيق أزرار التنقل */
        .head-nav-item {
            text-decoration: none;
            color: #3a3a3c;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 0;
            border-radius: 14px;
            transition: background 0.2s;
        }
        .head-nav-item:active { background: rgba(0,0,0,0.05); }
        
        .head-nav-item i { 
            font-size: 20px; 
            height: 24px;
            display: flex;
            align-items: center;
            font-style: normal;
        }
        
        .head-nav-item span { 
            font-size: 10px; 
            font-weight: 600; 
            white-space: nowrap;
        }

        .head-nav-item.admin i { color: #007AFF; }
        .head-nav-item.logout { color: #FF3B30; }

    </style>

    <div class="header-wrapper">
        <div class="header-capsule" id="headerCapsule">
            <div class="header-top-row">
                <div class="header-logo">
                    <img src="logo.png" onerror="this.src='https://via.placeholder.com/32'">
                    <span>عائلة 2026</span>
                </div>
                <div class="settings-trigger" id="headTrigger">⚙️</div>
            </div>

            <div class="header-dropdown">
                <div id="adminToolsHead" style="display: contents;">
                    <a href="admin_config.html" class="head-nav-item admin"><i>⚙️</i><span>الإعدادات</span></a>
                    <a href="add_news.html" class="head-nav-item admin"><i>⊕</i><span>إضافة</span></a>
                    <a href="admin.html" class="head-nav-item admin"><i>🛠️</i><span>اللوحة</span></a>
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

    // وظيفة الفتح والإغلاق بتأثير مرن
    trigger.onclick = (e) => {
        e.stopPropagation();
        const isOpen = capsule.classList.toggle('open');
        trigger.innerHTML = isOpen ? "✕" : "⚙️";
        trigger.style.background = isOpen ? "rgba(255, 59, 48, 0.1)" : "rgba(0, 122, 255, 0.1)";
        trigger.style.color = isOpen ? "#FF3B30" : "#007AFF";
    };

    // إغلاق عند الضغط خارج الكبسولة
    document.addEventListener('click', (e) => {
        if (!capsule.contains(e.target) && capsule.classList.contains('open')) {
            capsule.classList.remove('open');
            trigger.innerHTML = "⚙️";
            trigger.style.background = "rgba(0, 122, 255, 0.1)";
            trigger.style.color = "#007AFF";
        }
    });

    // التحكم بالصلاحيات
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const userSnap = await getDoc(doc(db, "Users", user.uid));
                const data = userSnap.data();
                const role = (data?.role || "").toLowerCase();
                const isAdmin = role.includes('admin') || role.includes('مدير');
                document.getElementById('adminToolsHead').style.display = isAdmin ? "contents" : "none";
                
                // تحديث عدد الأعمدة بناءً على الرتبة
                const dropdown = document.querySelector('.header-dropdown');
                dropdown.style.gridTemplateColumns = isAdmin ? "repeat(4, 1fr)" : "repeat(1, 1fr)";
            } catch (err) { console.error("Header Auth Error:", err); }
        }
    });

    logout.onclick = (e) => {
        e.preventDefault();
        if(confirm("هل تريد تسجيل الخروج؟")) {
            auth.signOut().then(() => window.location.href = "index.html");
        }
    };
}

createDynamicHeader();
