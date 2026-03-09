import { auth, db } from './config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function createDynamicHeader() {
    if (document.getElementById('headerCapsule')) return;

    const headerHTML = `
    <style>
        .header-wrapper {
            position: fixed;
            top: 20px;
            left: 20px; /* تم وضعه في الزاوية ليبدأ كدائرة */
            z-index: 100000;
            direction: rtl;
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* الكبسولة تبدأ كدائرة صغيرة */
        .header-capsule {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 50px; /* شكل دائري */
            width: 50px;  /* عرض الدائرة */
            height: 50px; /* طول الدائرة */
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            border: 0.5px solid rgba(255,255,255,0.4);
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
            cursor: pointer;
        }

        /* عندما تنفتح الكبسولة تتمدد */
        .header-capsule.open {
            width: 320px; /* تتمدد عرضياً */
            height: auto;
            border-radius: 25px;
            padding: 10px 15px;
            cursor: default;
        }

        .header-content {
            display: none; /* مخفي في وضع الدائرة */
            width: 100%;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .header-capsule.open .header-content {
            display: block;
            opacity: 1;
        }

        /* الأيقونة التي تظهر في وضع الدائرة (الشعار) */
        .circle-trigger-img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        .header-capsule.open .circle-trigger-img {
            display: none; /* تختفي عند الفتح لتظهر المحتويات */
        }

        /* تنسيق الصف العلوي داخل الكبسولة المفتوحة */
        .header-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .header-logo-inner { display: flex; align-items: center; gap: 10px; font-weight: bold; font-size: 14px; }
        .header-logo-inner img { width: 30px; height: 30px; border-radius: 8px; }

        .close-btn { font-size: 20px; color: #8e8e93; cursor: pointer; padding: 5px; }

        /* شبكة الأيقونات */
        .header-dropdown {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            border-top: 0.5px solid #eee;
            padding-top: 10px;
        }

        .head-nav-item {
            text-decoration: none;
            color: #3a3a3c;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }
        .head-nav-item i { font-size: 20px; font-style: normal; }
        .head-nav-item span { font-size: 9px; font-weight: bold; }
        .head-nav-item.logout { color: #FF3B30; }
        .head-nav-item.admin { color: #007AFF; }
    </style>

    <div class="header-wrapper" id="headerWrapper">
        <div class="header-capsule" id="headerCapsule">
            <img src="logo.png" class="circle-trigger-img" id="circleTrigger" onerror="this.src='https://via.placeholder.com/40'">

            <div class="header-content">
                <div class="header-top-row">
                    <div class="header-logo-inner">
                        <img src="logo.png">
                        <span>منصة العائلة</span>
                    </div>
                    <div class="close-btn" id="closeHeader">✕</div>
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
    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    const capsule = document.getElementById('headerCapsule');
    const circleTrigger = document.getElementById('circleTrigger');
    const closeBtn = document.getElementById('closeHeader');
    const logout = document.getElementById('logoutHead');

    // فتح الكبسولة عند الضغط على الدائرة
    circleTrigger.onclick = () => {
        capsule.classList.add('open');
    };

    // إغلاق الكبسولة عند الضغط على X
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        capsule.classList.remove('open');
    };

    // التحقق من الصلاحيات
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userSnap = await getDoc(doc(db, "Users", user.uid));
            const isAdmin = (userSnap.data()?.role || "").toLowerCase().match(/admin|مدير/);
            document.getElementById('adminToolsHead').style.display = isAdmin ? "contents" : "none";
            
            // تعديل العرض بناءً على الصلاحية
            if (!isAdmin) {
                capsule.style.setProperty('--open-width', '150px');
                document.querySelector('.header-dropdown').style.gridTemplateColumns = "repeat(1, 1fr)";
            }
        }
    });

    logout.onclick = () => {
        if(confirm("تسجيل خروج؟")) auth.signOut().then(() => location.reload());
    };
}

// التشغيل
if (document.readyState === 'complete') { createDynamicHeader(); } 
else { window.addEventListener('load', createDynamicHeader); }
