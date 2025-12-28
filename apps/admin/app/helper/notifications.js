const fs = require('fs');
const path = require("path")
let firebase_admin = require('firebase-admin');

const defaultServiceAccountPath = path.join(__dirname, 'key_file', 'sysavings-5ad56-aeb337580e7d.json');
const legacyServiceAccountPath = path.join(__dirname, 'key_file', 'sysavings-5ad56-firebase-adminsdk-fbsvc-75b87acc2f.json');
const oauthPlistPath = process.env.FIREBASE_OAUTH_PLIST_PATH;

const normalizePrivateKey = (rawKey) => {
    if (!rawKey) return rawKey;

    const unquotedKey = rawKey.replace(/^"|"$/g, '');
    return unquotedKey.replace(/\\n/g, '\n');
};

const decodeBase64PrivateKey = (rawKey) => {
    if (!rawKey) return null;

    try {
        const decoded = Buffer.from(rawKey, 'base64').toString('utf8');
        return normalizePrivateKey(decoded);
    } catch (error) {
        console.error('[NotificationHelper] Failed to decode FIREBASE_PRIVATE_KEY_BASE64 env var:', error);
        return null;
    }
};

const parsePlistClientId = (plistPath) => {
    if (!plistPath) return null;

    try {
        const contents = fs.readFileSync(plistPath, 'utf8');
        const clientIdMatch = contents.match(/<key>CLIENT_ID<\/key>\s*<string>([^<]+)<\/string>/i);
        if (clientIdMatch?.[1]) {
            return clientIdMatch[1].trim();
        }
    } catch (error) {
        console.error('[NotificationHelper] Failed to read OAuth plist credentials:', error);
    }

    return null;
};

const resolveOAuthRefreshTokenCredential = () => {
    const refreshToken = process.env.FIREBASE_OAUTH_REFRESH_TOKEN;
    const clientSecret = process.env.FIREBASE_OAUTH_CLIENT_SECRET;
    const clientId = process.env.FIREBASE_OAUTH_CLIENT_ID || parsePlistClientId(oauthPlistPath);

    if (!refreshToken || !clientSecret || !clientId) {
        return null;
    }

    return {
        type: 'authorized_user',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
    };
};

const parseServiceAccountFromJsonEnv = () => {
    const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!rawJson) return null;

    const tryParse = (value) => {
        const parsed = JSON.parse(value);
        if (parsed?.private_key) {
            parsed.private_key = normalizePrivateKey(parsed.private_key);
        }
        return parsed;
    };

    try {
        return tryParse(rawJson);
    } catch (_) {
        try {
            const decodedJson = Buffer.from(rawJson, 'base64').toString('utf8');
            return tryParse(decodedJson);
        } catch (error) {
            console.error('[NotificationHelper] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON env var:', error);
            return null;
        }
    }
};

const resolveServiceAccount = () => {
    const envJsonAccount = parseServiceAccountFromJsonEnv();
    if (envJsonAccount) return envJsonAccount;

    const envPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const envPrivateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
    const envClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const envProjectId = process.env.FIREBASE_PROJECT_ID;
    const configuredServiceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH;

    const resolvedPrivateKey = normalizePrivateKey(envPrivateKey) || decodeBase64PrivateKey(envPrivateKeyBase64);

    if (resolvedPrivateKey && envClientEmail && envProjectId) {
        return {
            type: 'service_account',
            project_id: envProjectId,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || undefined,
            private_key: resolvedPrivateKey,
            client_email: envClientEmail,
            client_id: process.env.FIREBASE_CLIENT_ID || undefined,
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || undefined,
            universe_domain: 'googleapis.com'
        };
    }

    const candidatePaths = [
        configuredServiceAccountPath,
        defaultServiceAccountPath,
        legacyServiceAccountPath
    ].filter(Boolean);

    for (const accountPath of candidatePaths) {
        if (!fs.existsSync(accountPath)) {
            continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fileAccount = require(accountPath);
        if (fileAccount?.private_key) {
            return {
                ...fileAccount,
                private_key: normalizePrivateKey(fileAccount.private_key)
            };
        }
    }

    return null;
};

const serviceAccount = resolveServiceAccount();
const oauthCredential = resolveOAuthRefreshTokenCredential();

let messagingClient = null;

try {
    if (serviceAccount) {
        firebase_admin.initializeApp({
            credential: firebase_admin.credential.cert(serviceAccount)
        });
        messagingClient = firebase_admin.messaging();
        console.info('[NotificationHelper] Firebase Admin initialized with service account credentials.');
    } else if (oauthCredential) {
        firebase_admin.initializeApp({
            credential: firebase_admin.credential.refreshToken(oauthCredential)
        });
        messagingClient = firebase_admin.messaging();
        console.info('[NotificationHelper] Firebase Admin initialized with OAuth refresh token credentials.');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        firebase_admin.initializeApp({
            credential: firebase_admin.credential.applicationDefault()
        });
        messagingClient = firebase_admin.messaging();
        console.info('[NotificationHelper] Firebase Admin initialized with application default credentials.');
    } else {
        console.warn('[NotificationHelper] Firebase credentials are missing; push notifications are disabled.');
    }
} catch (error) {
    console.error('[NotificationHelper] Failed to initialize Firebase Admin SDK; push notifications are disabled.', error);
}

class NotificationHelper {
    constructor() { }

    async pushNotification(message) {
        if (!messagingClient) {
            console.warn('[NotificationHelper.pushNotification] Messaging client is not initialized; skipping push.');
            return false;
        }

        try {
            // FCM Send notification
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

module.exports = new NotificationHelper()
