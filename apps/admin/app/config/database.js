const mongoose = require('mongoose');
const { db: dbConfig } = require('./index');

mongoose.set('strictQuery', false);


module.exports = async () => {
  const connectionUri = process.env.DB_URI || dbConfig?.uri;
  const host = process.env.DB_HOST || dbConfig?.host || 'localhost';
  const port = process.env.DB_PORT || dbConfig?.port || 27017;
  const database = process.env.DB_DATABASE || dbConfig?.database || 'admin';
  const username = process.env.DB_USERNAME ?? dbConfig?.username;
  const password = process.env.DB_PASSWORD ?? dbConfig?.password;
  const authSource = process.env.DB_AUTH_SOURCE ?? dbConfig?.authSource;

  const normalizedHost = host.replace(/^mongodb(\+srv)?:\/\//, '');
  const isAtlasHost = normalizedHost.includes('mongodb.net');
  const protocol = isAtlasHost ? 'mongodb+srv' : 'mongodb';
  const credentials = username && password ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : '';
  const query = authSource ? `?authSource=${encodeURIComponent(authSource)}` : '';
  const url = connectionUri || `${protocol}://${credentials}${normalizedHost}${isAtlasHost ? '' : `:${port}`}/${database}${query}`;

  try {
    const shouldApplyAuthOptions = !connectionUri?.includes('@') && (username || password);

    const options = shouldApplyAuthOptions
      ? {
          auth: {
            username,
            password
          },
          ...(authSource ? { authSource } : {})
        }
      : authSource
      ? { authSource }
      : {};

    const db = await mongoose.connect(url, options);

    global.dbUrl = db.connections[0].db;
    console.log('DB connected successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB using URL:', url);
    throw error;
  }
};
