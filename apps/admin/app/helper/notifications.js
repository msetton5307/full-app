const fs = require('fs');
const path = require('path');
const firebase_admin = require('firebase-admin');

const serviceAccountPath = path.join(__dirname, 'key_file', 'sysavings-5ad56-aeb337580e7d.json');

const loadServiceAccount = () => {
    if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`[NotificationHelper] Expected Firebase service account file at "${serviceAccountPath}". Place your Admin SDK JSON credentials there to enable push notifications.`);
    }

    const serviceAccount = require(serviceAccountPath);
    const normalizedPrivateKey = serviceAccount.private_key?.replace(/\\n/g, '\n') || serviceAccount.private_key;

    return {
        ...serviceAccount,
        private_key: normalizedPrivateKey
    };
};

let messagingClient = null;

try {
    const serviceAccount = loadServiceAccount();

    firebase_admin.initializeApp({
        credential: firebase_admin.credential.cert(serviceAccount)
    });

    messagingClient = firebase_admin.messaging();
    console.info('[NotificationHelper] Firebase Admin initialized with hardcoded service account credentials.');
} catch (error) {
    console.error('[NotificationHelper] Failed to initialize Firebase Admin SDK; push notifications are disabled.', error);
    throw error;
}

class NotificationHelper {
    constructor() { }

    async pushNotification(message) {
        if (!messagingClient) {
            console.warn('[NotificationHelper.pushNotification] Messaging client is not initialized; skipping push.');
            return false;
        }

        try {
            console.log('[NotificationHelper.pushNotification] Request payload:', JSON.stringify(message, null, 2));
            const response = await messagingClient.send(message);
            console.log('[NotificationHelper.pushNotification] FCM response:', response);
            return true;
        } catch (error) {
            console.error('[NotificationHelper.pushNotification] Error sending push notification:', error);

            return false;
        }
    }
}

module.exports = new NotificationHelper();
