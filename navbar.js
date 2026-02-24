import { db, auth } from './config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function createNavbar() {
    // إزالة أي شريط قديم لمنع التكرار
    const oldNav = document.querySelector('.nav-wrapper');
    if (oldNav) oldNav.remove();

    const navHTML = `
   <style>
        .nav-wrapper {
            position: fixed;
            bottom: 25px;
            /* استخدام left و right مع auto يضمن التوسط في جميع المتصفحات */
            left: 0;
            right: 0;
            margin-left: auto;
            margin-right: auto;
            width: 88%;
            max-width: 400px;
            z-index: 10000; /* قيمة عالية جداً ليتفوق على أي مودال */
            display: block;
            direction: rtl; /* لضمان ترتيب الأيقونات من اليمين لليسار */
        }
        .bottom-bar {
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 10px 5px;
            border-radius: 22px;
            box-shadow: 0 8px 25px rgba(0, 122, 255, 0.15); /* بروز أزرق باهت */
            border: 0.5px solid rgba(0, 122, 255, 0.1);
        }
        .nav-item {
            text-decoration: none;
            color: #8E8E93;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            transition: all 0.2s ease;
        }
        .nav-item i {
            font-size: 20px;
            margin-bottom: 2px;
            font-style: normal;
        }
        .nav-item span {
            font-size: 9px;
            font-weight: 600;
        }
        .nav-item.active {
            color: #007AFF;
        }
        .hidden { display: none !important; }
    </style>
    
    <div class="nav-wrapper">
        <nav class="bottom-bar">
            <a href="news.html" id="nav-home" class="nav-item"><i>🏠</i><span>الرئيسية</span></a>
            <a href="chat.html" id="nav-chat" class="nav-item"><i>💬</i><span>الدردشة</span></a>
            <a href="duas.html" id="nav-duas" class="nav-item"><i>📖</i><span>الأدعية</span></a>
            <a href="prayer_times.html" id="nav-prayer" class="nav-item"><i>🕌</i><span>الصلاة</span></a>
            <a href="competitions.html" id="nav-comps" class="nav-item"><i>🏆</i><span>المسابقات</span></a>
            <a href="profile.html" id="nav-profile" class="nav-item"><i>👤</i><span>ملفي</span></a>
        </nav>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', navHTML);

    // تحديد الصفحة النشطة
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll('.nav-item').forEach(item => {
        if(item.getAttribute('href') === currentPage || (currentPage === "" && item.getAttribute('href') === "news.html")) {
            item.classList.add('active');
        }
    });

    listenToNavConfig();
}

function listenToNavConfig() {
    onSnapshot(doc(db, "Settings", "AppConfig"), (docSnap) => {
        if (docSnap.exists()) {
            const config = docSnap.data();
            const mapping = {
                'nav-chat': config.showChat,
                'nav-duas': config.showDuas,
                'nav-comps': config.showComps,
                'nav-prayer': config.showPrayer
            };

            for (const [id, isVisible] of Object.entries(mapping)) {
                const element = document.getElementById(id);
                if (element) {
                    isVisible === false ? element.classList.add('hidden') : element.classList.remove('hidden');
                }
            }
        }
    });
}

createNavbar();
