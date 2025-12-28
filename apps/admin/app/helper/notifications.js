const path = require("path")
let firebase_admin = require('firebase-admin');
let serviceAccount = require('../helper/key_file/sysavings-5ad56-firebase-adminsdk-fbsvc-75b87acc2f.json')

// Initialize the app with a service account, granting admin privileges
firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(
        {
            "type": "service_account",
            "project_id": "sysavings-5ad56",
            "private_key_id": "530d37f6d92e2a71392cc2b8eddd15990bacd3be",
            "private_key": "",
            "client_email": "firebase-adminsdk-fbsvc@sysavings-5ad56.iam.gserviceaccount.com",
            "client_id": "116033586974531888456",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40sysavings-5ad56.iam.gserviceaccount.com",
            "universe_domain": "googleapis.com"
        }
    )
});

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
