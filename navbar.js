import { db, auth } from './config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// دالة إنشاء شريط التنقل
function createNavbar() {
    const navHTML = `
    <style>
        .nav-wrapper {
            position: fixed;
            bottom: 25px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 450px;
            z-index: 9999;
        }
        .bottom-bar {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(15px);
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 12px 10px;
            border-radius: 25px;
            box-shadow: 0 10px 30px rgba(0, 122, 255, 0.15); /* بروز أزرق باهت */
            border: 1px solid rgba(0, 122, 255, 0.1);
        }
        .nav-item {
            text-decoration: none;
            font-size: 24px;
            color: #8E8E93;
            transition: 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .nav-item.active {
            color: #007AFF;
            transform: translateY(-5px);
        }
        .nav-item span {
            font-size: 10px;
            margin-top: 4px;
            font-weight: bold;
        }
        .hidden { display: none !important; }
    </style>
    
    <div class="nav-wrapper">
        <nav class="bottom-bar">
            <a href="news.html" id="nav-home" class="nav-item">🏠<span>الرئيسية</span></a>
            <a href="chat.html" id="nav-chat" class="nav-item">💬<span>الدردشة</span></a>
            <a href="duas.html" id="nav-duas" class="nav-item">📖<span>الأدعية</span></a>
            <a href="prayer_times.html" id="nav-prayer" class="nav-item">🕌<span>الصلاة</span></a>
            <a href="competitions.html" id="nav-comps" class="nav-item">🏆<span>المسابقات</span></a>
            <a href="profile.html" id="nav-profile" class="nav-item">👤<span>ملفي</span></a>
        </nav>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', navHTML);

    // تحديد الصفحة النشطة تلقائياً
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll('.nav-item').forEach(item => {
        if(item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });

    // الربط مع إعدادات لوحة التحكم
    listenToNavConfig();
}

function listenToNavConfig() {
    onSnapshot(doc(db, "Settings", "AppConfig"), (docSnap) => {
        if (docSnap.exists()) {
            const config = docSnap.data();
            // ربط الأيدي في HTML مع الحقول في Firestore
            const mapping = {
                'nav-chat': config.showChat,
                'nav-duas': config.showDuas,
                'nav-comps': config.showComps,
                'nav-prayer': config.showPrayer
            };

            for (const [id, isVisible] of Object.entries(mapping)) {
                const element = document.getElementById(id);
                if (element) {
                    if (isVisible === false) {
                        element.classList.add('hidden');
                    } else {
                        element.classList.remove('hidden');
                    }
                }
            }
        }
    });
}

// تشغيل الدالة
createNavbar();
