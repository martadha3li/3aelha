// notifications.js
import { db, auth } from './config.js';
import { collection, query, where, onSnapshot, orderBy, limit, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// رابط صوت التنبيه (يمكنك استبداله بملف mp3 محلي في مجلد المشروع)
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');

export function initNotifications() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // طلب إذن الإشعارات
            if ("Notification" in window && Notification.permission === "default") {
                Notification.requestPermission();
            }
            // بدء المراقبة
            watchPrivateMessages(user.uid);
        }
    });
}

function watchPrivateMessages(uid) {
    const q = query(
        collection(db, "PrivateMessages"),
        where("receiverId", "==", uid),
        orderBy("timestamp", "desc"),
        limit(1)
    );

    let isFirstRun = true;

    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
                if (isFirstRun) {
                    isFirstRun = false;
                    return;
                }

                const msgData = change.doc.data();
                
                // التحقق: هل المستخدم حالياً داخل نفس المحادثة؟
                const urlParams = new URLSearchParams(window.location.search);
                const currentChatPartner = urlParams.get('id');
                const isPagePrivateChat = window.location.pathname.includes('private_chat.html');

                if (isPagePrivateChat && currentChatPartner === msgData.senderId) {
                    // إذا كان في نفس الصفحة، نشغل صوت خفيف فقط بدون إشعار منبثق
                    notificationSound.play().catch(e => console.log("Audio play blocked by browser"));
                    return; 
                }

                // جلب اسم المرسل
                const senderSnap = await getDoc(doc(db, "Users", msgData.senderId));
                const senderName = senderSnap.exists() ? senderSnap.data().fullName : "رسالة جديدة";

                // تشغيل الصوت وإظهار الإشعار
                playAndNotify(senderName, msgData.text, msgData.senderId);
            }
        });
    });
}

function playAndNotify(title, body, senderId) {
    // تشغيل الصوت
    notificationSound.play().catch(e => console.log("Audio play blocked until user interacts with page"));

    // إظهار الإشعار المرئي
    if (Notification.permission === "granted") {
        const n = new Notification(title, {
            body: body,
            icon: "logo.png"
        });

        n.onclick = () => {
            window.focus();
            window.location.href = `private_chat.html?id=${senderId}`;
        };
    }
}
