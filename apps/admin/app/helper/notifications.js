const fs = require('fs');
const path = require("path")
let firebase_admin = require('firebase-admin');

const defaultServiceAccountPath = path.join(__dirname, 'key_file', 'sysavings-5ad56-aeb337580e7d.json');
const legacyServiceAccountPath = path.join(__dirname, 'key_file', 'sysavings-5ad56-firebase-adminsdk-fbsvc-75b87acc2f.json');
const oauthPlistPath = process.env.FIREBASE_OAUTH_PLIST_PATH;
const configuredServiceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH;
const applicationDefaultCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
const envPrivateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
const envClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const envProjectId = process.env.FIREBASE_PROJECT_ID;
const envPrivateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID;
const envClientId = process.env.FIREBASE_CLIENT_ID;
const envClientX509CertUrl = process.env.FIREBASE_CLIENT_X509_CERT_URL;

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
        credential: {
            type: 'authorized_user',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken
        },
        source: oauthPlistPath ? `OAuth plist (${oauthPlistPath})` : 'OAuth environment variables',
        metadata: { client_id: clientId }
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
    if (envJsonAccount) {
        return {
            credential: envJsonAccount,
            source: 'FIREBASE_SERVICE_ACCOUNT_JSON',
            metadata: {
                project_id: envJsonAccount.project_id,
                client_email: envJsonAccount.client_email
            }
        };
    }

    const resolvedPrivateKey = normalizePrivateKey(envPrivateKey) || decodeBase64PrivateKey(envPrivateKeyBase64);

    if (resolvedPrivateKey && envClientEmail && envProjectId) {
        return {
            credential: {
                type: 'service_account',
                project_id: envProjectId,
                private_key_id: envPrivateKeyId || undefined,
                private_key: resolvedPrivateKey,
                client_email: envClientEmail,
                client_id: envClientId || undefined,
                auth_uri: 'https://accounts.google.com/o/oauth2/auth',
                token_uri: 'https://oauth2.googleapis.com/token',
                auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
                client_x509_cert_url: envClientX509CertUrl || undefined,
                universe_domain: 'googleapis.com'
            },
            source: 'FIREBASE_PRIVATE_KEY/FIREBASE_CLIENT_EMAIL/FIREBASE_PROJECT_ID',
            metadata: {
                project_id: envProjectId,
                client_email: envClientEmail,
                private_key_id: envPrivateKeyId || undefined,
                client_id: envClientId || undefined
            }
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

        try {
            fs.accessSync(accountPath, fs.constants.R_OK);
        } catch (error) {
            if (accountPath === configuredServiceAccountPath) {
                console.warn(`[NotificationHelper] FIREBASE_CREDENTIALS_PATH is set to "${configuredServiceAccountPath}" but the file is not readable; continuing to check fallback credentials.`);
            }
            continue;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const fileAccount = require(accountPath);
            if (fileAccount?.private_key) {
                const sourceLabel = accountPath === configuredServiceAccountPath
                    ? `FIREBASE_CREDENTIALS_PATH (${accountPath})`
                    : `service account file (${accountPath})`;

                return {
                    credential: {
                        ...fileAccount,
                        private_key: normalizePrivateKey(fileAccount.private_key)
                    },
                    source: sourceLabel,
                    metadata: {
                        project_id: fileAccount.project_id,
                        client_email: fileAccount.client_email,
                        private_key_id: fileAccount.private_key_id
                    }
                };
            }
        } catch (error) {
            if (accountPath === configuredServiceAccountPath) {
                console.warn(`[NotificationHelper] FIREBASE_CREDENTIALS_PATH is set to "${configuredServiceAccountPath}" but the file could not be parsed; continuing to check fallback credentials.`);
            }
        }
    }

    return null;
};

const serviceAccountResolution = resolveServiceAccount();
const serviceAccount = serviceAccountResolution?.credential;
const oauthCredentialResolution = resolveOAuthRefreshTokenCredential();
const oauthCredential = oauthCredentialResolution?.credential;

const credentialGuidance = 'Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_PRIVATE_KEY/FIREBASE_CLIENT_EMAIL/FIREBASE_PROJECT_ID, FIREBASE_CREDENTIALS_PATH, or GOOGLE_APPLICATION_CREDENTIALS before attempting to send push notifications.';

const validateCredentialsPresence = () => {
    const hasApplicationDefault = Boolean(applicationDefaultCredentialsPath);
    const hasPartialServiceAccountEnv = Boolean(envPrivateKey || envPrivateKeyBase64 || envClientEmail || envProjectId);
    const hasPartialOauthEnv = Boolean(process.env.FIREBASE_OAUTH_REFRESH_TOKEN || process.env.FIREBASE_OAUTH_CLIENT_SECRET || process.env.FIREBASE_OAUTH_CLIENT_ID || oauthPlistPath);
    const hasResolvedCredential = Boolean(serviceAccount || oauthCredential || hasApplicationDefault);

    const invalidPathMessages = [];

    if (!hasResolvedCredential) {
        if (configuredServiceAccountPath && !fs.existsSync(configuredServiceAccountPath)) {
            invalidPathMessages.push(`FIREBASE_CREDENTIALS_PATH is set to "${configuredServiceAccountPath}" but the file could not be found.`);
        }

        if (applicationDefaultCredentialsPath && !fs.existsSync(applicationDefaultCredentialsPath)) {
            invalidPathMessages.push(`GOOGLE_APPLICATION_CREDENTIALS is set to "${applicationDefaultCredentialsPath}" but the file could not be found.`);
        }
    }

    if (invalidPathMessages.length) {
        throw new Error(`[NotificationHelper] ${invalidPathMessages.join(' ')} ${credentialGuidance}`);
    }

    if (hasResolvedCredential) {
        if (serviceAccount) {
            return;
        }

        if (oauthCredential) {
            return;
        }

        // Application default credentials are present (and path exists if provided).
        return;
    }

    const missingMessages = [];

    if (hasPartialServiceAccountEnv) {
        missingMessages.push('Service account environment variables are incomplete; provide FIREBASE_PRIVATE_KEY (or FIREBASE_PRIVATE_KEY_BASE64), FIREBASE_CLIENT_EMAIL, and FIREBASE_PROJECT_ID together or supply FIREBASE_SERVICE_ACCOUNT_JSON/FIREBASE_CREDENTIALS_PATH.');
    }

    if (hasPartialOauthEnv) {
        missingMessages.push('OAuth refresh token credentials are incomplete; set FIREBASE_OAUTH_REFRESH_TOKEN, FIREBASE_OAUTH_CLIENT_SECRET, and FIREBASE_OAUTH_CLIENT_ID (or FIREBASE_OAUTH_PLIST_PATH).');
    }

    if (!missingMessages.length) {
        missingMessages.push('No Firebase credentials were detected.');
    }

    throw new Error(`[NotificationHelper] ${missingMessages.join(' ')} ${credentialGuidance}`);
};

let messagingClient = null;

try {
    validateCredentialsPresence();

    if (serviceAccountResolution) {
        console.info('[NotificationHelper] Selected service account credentials from', serviceAccountResolution.source, JSON.stringify(serviceAccountResolution.metadata));
    } else if (oauthCredentialResolution) {
        console.info('[NotificationHelper] Selected OAuth refresh token credentials from', oauthCredentialResolution.source, JSON.stringify(oauthCredentialResolution.metadata));
    } else if (applicationDefaultCredentialsPath) {
        console.info('[NotificationHelper] Selected application default credentials from path', applicationDefaultCredentialsPath);
    } else {
        console.info('[NotificationHelper] Selected application default credentials from ambient environment.');
    }

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
    }
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
