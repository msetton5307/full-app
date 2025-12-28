const fs = require('fs');
const path = require("path")
let firebase_admin = require('firebase-admin');

const defaultServiceAccountPath = path.join(__dirname, 'key_file', 'sysavings-5ad56-firebase-adminsdk-fbsvc-75b87acc2f.json');

const resolveServiceAccount = () => {
    const envPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const envClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const envProjectId = process.env.FIREBASE_PROJECT_ID;

    if (envPrivateKey && envClientEmail && envProjectId) {
        return {
            type: 'service_account',
            project_id: envProjectId,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || undefined,
            private_key: envPrivateKey.replace(/\\n/g, '\n'),
            client_email: envClientEmail,
            client_id: process.env.FIREBASE_CLIENT_ID || undefined,
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || undefined,
            universe_domain: 'googleapis.com'
        };
    }

    if (fs.existsSync(defaultServiceAccountPath)) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fileAccount = require(defaultServiceAccountPath);
        return {
            ...fileAccount,
            private_key: fileAccount.private_key?.replace(/\\n/g, '\n')
        };
    }

    return null;
};

const serviceAccount = resolveServiceAccount();

if (serviceAccount) {
    // Initialize the app with a service account, granting admin privileges
    firebase_admin.initializeApp({
        credential: firebase_admin.credential.cert(serviceAccount)
    });
} else {
    console.warn('[NotificationHelper] Firebase credentials are missing; push notifications are disabled.');
}

class NotificationHelper {
    constructor() { }

    async pushNotification(message) {
        try {
            // FCM Send notification
            console.log('[NotificationHelper.pushNotification] Request payload:', JSON.stringify(message, null, 2));
            const response = await firebase_admin.messaging().send(message);
            console.log('[NotificationHelper.pushNotification] FCM response:', response);
            return true;
        } catch (error) {
            console.error('[NotificationHelper.pushNotification] Error sending push notification:', error);

            return false;
        }
    }
}

module.exports = new NotificationHelper()
