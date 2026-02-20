// onesignal-handler.js
export async function initOneSignal(userUID, db, updateDoc, doc) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
            appId: "a96c2d21-5d88-40fb-8c60-4c0911e9be15",
            allowLocalhostAsSecureOrigin: true,
        });

        // مزامنة المعرف مع قاعدة البيانات عند التغيير
        OneSignal.User.PushSubscription.addEventListener("change", async (event) => {
            const subscriptionId = event.current.id;
            if (subscriptionId && userUID) {
                try {
                    await updateDoc(doc(db, "Users", userUID), {
                        onesignalId: subscriptionId
                    });
                    console.log("OneSignal ID Updated");
                } catch (e) {
                    console.error("Error updating OneSignal ID:", e);
                }
            }
        });
    });
}

// دالة إرسال الإشعارات العالمية (تستدعى عند الحاجة)
export async function sendPush(title, message, targetId = null) {
    const API_KEY = "os_v2_app_vfwc2ik5rbapxddajqerd2n6cvtafaovwwiuf2nkps4g2bz22qnrja5xrna73qgctjxpea6lenhvmrk3hlrsepe7zarj7anqawvd7wy";
    const APP_ID = "a96c2d21-5d88-40fb-8c60-4c0911e9be15";

    const body = {
        app_id: APP_ID,
        headings: { "ar": title },
        contents: { "ar": message },
    };

    if (targetId) body.include_subscription_ids = [targetId];
    else body.included_segments = ["All"];

    await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": `Basic ${API_KEY}`
        },
        body: JSON.stringify(body)
    });
}
