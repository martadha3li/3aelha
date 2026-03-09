import { auth, db } from './config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function createDynamicHeader() {
    // التأكد من عدم تكرار العنصر
    if (document.getElementById('headerWrapper')) return;

    const headerHTML = `
    <style>
        /* الحاوية الخارجية - فوق كل شيء حرفياً */
        #headerWrapper {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important; /* وضعناها في اليمين لتكون واضحة */
            z-index: 2147483647 !important; /* أعلى قيمة z-index ممكنة في المتصفحات */
            direction: rtl !important;
        }

        /* الأيقونة الدائرية (الزر العائم) */
        .header-capsule {
            background: #ffffff !important;
            width: 55px !important;
            height: 55px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
            border: 2px solid #007AFF !important;
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
            overflow: hidden !important;
            cursor: pointer !important;
        }

        /* عند الفتح تتمدد لتصبح كبسولة */
        .header-capsule.open {
            width: 300px !important;
            height: auto !important;
            border-radius: 20px !important;
            padding: 15px !important;
            flex-direction: column !important;
            cursor: default !important;
        }

        .circle-img {
            width: 45px !important;
            height: 45px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
        }

        .header-capsule.open .circle-img { display: none !important; }

        /* المحتوى الداخلي */
        .header-content {
            display: none !important;
            width: 100% !important;
            text-align: center !important;
        }

        .header-capsule.open .header-content { display: block !important; }

        .header-top {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 12px !important;
        }

        .close-x { font-size: 22px !important; cursor: pointer !important; color: #999 !important; }

        .grid-menu {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 10px !important;
            border-top: 1px solid #eee !important;
            padding-top: 10px !important;
        }

        .menu-btn {
            text-decoration: none !important;
            color: #333 !important;
            font-size: 11px !important;
            font-weight: bold !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 5px !important;
        }

        .menu-btn i { font-style: normal !important; font-size: 20px !important; }
        .menu-btn.logout { color: #FF3B30 !important; }
    </style>

    <div id="headerWrapper">
        <div class="header-capsule" id="headerCapsule">
            <img src="logo.png" class="circle-img" id="mainTrigger" onerror="this.src='https://via.placeholder.com/45/007AFF/FFFFFF?text=F'">

            <div class="header-content">
                <div class="header-top">
                    <b style="font-size:14px;">إعدادات المنصة</b>
                    <span class="close-x" id="closeHeader">✕</span>
                </div>
                <div class="grid-menu" id="adminGrid">
                    <a href="admin_config.html" class="menu-btn"><i>⚙️</i><span>أزرار</span></a>
                    <a href="add_news.html" class="menu-btn"><i>⊕</i><span>إضافة</span></a>
                    <a href="admin.html" class="menu-btn"><i>🛠️</i><span>لوحة</span></a>
                    <a href="#" class="menu-btn logout" id="logoutBtn"><i>🚪</i><span>خروج</span></a>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    const capsule = document.getElementById('headerCapsule');
    const trigger = document.getElementById('mainTrigger');
    const closeBtn = document.getElementById('closeHeader');

    trigger.onclick = () => capsule.classList.add('open');
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        capsule.classList.remove('open');
    };

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const snap = await getDoc(doc(db, "Users", user.uid));
            const role = (snap.data()?.role || "").toLowerCase();
            const isAdmin = role.includes('admin') || role.includes('مدير');
            // إذا لم يكن مديراً، يظهر فقط زر الخروج
            if (!isAdmin) {
                const btns = document.querySelectorAll('.grid-menu a:not(.logout)');
                btns.forEach(b => b.remove());
                document.getElementById('adminGrid').style.gridTemplateColumns = "1fr";
            }
        }
    });

    document.getElementById('logoutBtn').onclick = () => {
        if(confirm("تسجيل خروج؟")) auth.signOut().then(()=> location.reload());
    };
}

// تشغيل فوري وبأكثر من طريقة لضمان الظهور
createDynamicHeader();
window.onload = createDynamicHeader;
document.addEventListener('DOMContentLoaded', createDynamicHeader);
