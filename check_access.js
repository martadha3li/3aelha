// check_access.js
import { db, auth } from './config.js';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getCountFromServer, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const MAX_USERS = 85;

export async function monitorSession(uid) {
    const sessionRef = doc(db, "ActiveSessions", uid);

    // 1. فحص عدد المستخدمين الحاليين
    const snapshot = await getCountFromServer(collection(db, "ActiveSessions"));
    const currentCount = snapshot.data().count;

// داخل دالة monitorSession
if (currentCount >= MAX_USERS) {
    // جلب بيانات المستخدم لفحص رتبته
    const userSnap = await getDoc(doc(db, "Users", uid));
    const role = userSnap.data()?.role;

    // إذا لم يكن مديراً، يذهب للانتظار
    if (role !== 'admin') {
        window.location.href = "waiting_room.html";
        return;
    }
}

    
    // 2. إذا تجاوز العدد 85 وكان المستخدم ليس لديه جلسة نشطة
    if (currentCount >= MAX_USERS) {
        // التحقق إذا كان المستخدم مسجلاً بالفعل (ربما قام بعمل Refresh)
        const checkMySession = await getDoc(sessionRef);
        if (!checkMySession.exists()) {
            window.location.href = "waiting_room.html";
            return;
        }
    }

    // 3. تسجيل دخول المستخدم الحالي كجلسة نشطة
    await setDoc(sessionRef, {
        uid: uid,
        lastActive: serverTimestamp()
    });

    // 4. حذف الجلسة عند إغلاق المتصفح أو الصفحة
    window.addEventListener('beforeunload', () => {
        deleteDoc(sessionRef);
    });
}
