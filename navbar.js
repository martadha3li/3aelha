import { db, auth } from './config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function createNavbar() {
    const oldNav = document.querySelector('.nav-wrapper');
    if (oldNav) oldNav.remove();

    const navHTML = `
    <style>
        .nav-wrapper {
            position: fixed;
            bottom: 25px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            z-index: 10000;
            direction: rtl;
        }

        /* كبسولة الشريط السفلي */
        .bottom-capsule {
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border-radius: 25px;
            height: 55px;
            display: flex;
            align-items: center;
            padding: 0 10px;
            box-shadow: 0 8px 25px rgba(0, 122, 255, 0.15);
            border: 0.5px solid rgba(0, 122, 255, 0.1);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            min-width: 60px;
            max-width: 90%;
            overflow: hidden;
        }

        /* حاوية الأيقونات المخفية */
        .nav-items-container {
            display: flex;
            align-items: center;
            width: 0;
            opacity: 0;
            transition: all 0.3s ease;
            overflow: hidden;
            gap: 5px;
        }

        /* عند فتح الكبسولة */
        .bottom-capsule.expanded {
            padding: 0 15px;
        }
        .bottom-capsule.expanded .nav-items-container {
            width: auto;
            opacity: 1;
            margin-left: 10px;
        }

        .nav-item {
            text-decoration: none;
            color: #8E8E93;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: 50px;
            transition: 0.2s;
        }
        .nav-item i { font-size: 20px; font-style: normal; margin-bottom: 2px; }
        .nav-item span { font-size: 8px; font-weight: bold; white-space: nowrap; }
        .nav-item.active { color: #007AFF; }

        /* زر الفتح والإغلاق (أيقونة التطبيق أو رمز القائمة) */
        .nav-toggle-btn {
            width: 40px;
            height: 40px;
            background: #007AFF;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            flex-shrink: 0;
            box-shadow: 0 4px 10px rgba(0, 122, 255, 0.3);
        }

        .hidden { display: none !important; }
    </style>
    
    <div class="nav-wrapper">
        <div class="bottom-capsule" id="navCapsule">
            <div class="nav-toggle-btn" id="navTrigger">📱</div>

            <div class="nav-items-container" id="navItemsBox">
                <a href="news.html" id="nav-home" class="nav-item"><i>🏠</i><span>الرئيسية</span></a>
                <a href="chat.html" id="nav-chat" class="nav-item"><i>💬</i><span>الدردشة</span></a>
                <a href="duas.html" id="nav-duas" class="nav-item"><i>📖</i><span>الأدعية</span></a>
                <a href="prayer_times.html" id="nav-prayer" class="nav-item"><i>🕌</i><span>الصلاة</span></a>
                <a href="competitions.html" id="nav-comps" class="nav-item"><i>🏆</i><span>المسابقات</span></a>
                <a href="profile.html" id="nav-profile" class="nav-item"><i>👤</i><span>ملفي</span></a>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', navHTML);

    const capsule = document.getElementById('navCapsule');
    const trigger = document.getElementById('navTrigger');

    // وظيفة التمدد
    trigger.onclick = () => {
        const isExpanded = capsule.classList.toggle('expanded');
        trigger.innerHTML = isExpanded ? "✕" : "📱";
    };

    // تحديد الصفحة النشطة تلقائياً
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll('.nav-item').forEach(item => {
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
