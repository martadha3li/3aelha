import { db, auth } from './config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function createNavbar() {
    const oldNav = document.querySelector('.nav-container-fixed');
    if (oldNav) oldNav.remove();

    const navHTML = `
    <style>
        /* الحاوية الرئيسية في أسفل الشاشة */
        .nav-container-fixed {
            position: fixed;
            bottom: 25px;
            right: 20px; /* مكان الأيقونة العائمة */
            display: flex;
            align-items: center;
            flex-direction: row-reverse; /* لفتح الشريط من اليمين إلى اليسار */
            z-index: 10000;
            direction: rtl;
        }

        /* أيقونة التشغيل العائمة */
        .nav-trigger-btn {
            width: 50px;
            height: 50px;
            background: #007AFF;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 122, 255, 0.4);
            font-size: 24px;
            z-index: 10001;
            transition: transform 0.3s ease;
        }
        .nav-trigger-btn:active { transform: scale(0.9); }

        /* شريط الأيقونات (الكبسولة) */
        .bottom-capsule-bar {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            height: 55px;
            display: flex;
            align-items: center;
            padding: 0 15px;
            border-radius: 25px;
            box-shadow: 0 8px 25px rgba(0, 122, 255, 0.15); /* بروز أزرق باهت */
            border: 0.5px solid rgba(0, 122, 255, 0.1);
            margin-left: 10px;
            
            /* حالة الإخفاء الافتراضية */
            width: 0;
            opacity: 0;
            visibility: hidden;
            transform: translateX(20px);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
            white-space: nowrap;
        }

        /* الحالة عند فتح الشريط */
        .nav-container-fixed.open .bottom-capsule-bar {
            width: 280px; /* يمكنك زيادة العرض حسب عدد الأيقونات */
            opacity: 1;
            visibility: visible;
            transform: translateX(0);
        }

        .nav-item-link {
            text-decoration: none;
            color: #8E8E93;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            min-width: 45px;
            transition: 0.2s;
        }
        .nav-item-link i { font-size: 20px; font-style: normal; margin-bottom: 2px; }
        .nav-item-link span { font-size: 8px; font-weight: bold; }
        .nav-item-link.active { color: #007AFF; }

        .hidden { display: none !important; }
    </style>
    
    <div class="nav-container-fixed" id="navContainer">
        <div class="nav-trigger-btn" id="mainTrigger">📱</div>

        <nav class="bottom-capsule-bar" id="actualNav">
            <a href="news.html" id="nav-home" class="nav-item-link"><i>🏠</i><span>الرئيسية</span></a>
            <a href="chat.html" id="nav-chat" class="nav-item-link"><i>💬</i><span>دردشة</span></a>
            <a href="duas.html" id="nav-duas" class="nav-item-link"><i>📖</i><span>أدعية</span></a>
            <a href="prayer_times.html" id="nav-prayer" class="nav-item-link"><i>🕌</i><span>صلاة</span></a>
            <a href="competitions.html" id="nav-comps" class="nav-item-link"><i>🏆</i><span>مسابقات</span></a>
        </nav>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', navHTML);

    const container = document.getElementById('navContainer');
    const trigger = document.getElementById('mainTrigger');

    // وظيفة الفتح والإغلاق
    trigger.onclick = () => {
        const isOpen = container.classList.toggle('open');
        trigger.innerHTML = isOpen ? "✕" : "📱";
        // تغيير لون الزر عند الفتح
        trigger.style.background = isOpen ? "#FF3B30" : "#007AFF"; 
    };

    // تحديد الصفحة النشطة
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll('.nav-item-link').forEach(item => {
        const href = item.getAttribute('href');
        if(href === currentPage || (currentPage === "" && href === "news.html")) {
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
