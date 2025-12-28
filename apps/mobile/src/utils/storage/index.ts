import {MMKV} from 'react-native-mmkv';

const storage = new MMKV({
  id: 'sysaving-storage',
  encryptionKey: 'encryption-key',
});

type Keys =
  | 'token'
  | 'refresh-token'
  | 'personalized_category'
  | 'rememberedEmail'
  | 'rememberedPassword'
  | 'rememberMe'
  | 'deviceToken'
  | 'is_admin'; // add more key

const Storage = {
  setItem: (key: Keys, value: string) => {
    storage.set(key, value);
  },

  getItem: (key: Keys): string | null => {
    return storage.getString(key) || null;
  },

  getNumber: (key: Keys): number | null => {
    return storage.getNumber(key) || null;
  },

  getBoolean: (key: Keys): boolean | null => {
    return storage.getBoolean(key) || null;
  },

  deleteItem: (key: Keys) => {
    storage.delete(key);
  },

  containsKey: (key: Keys): boolean | null => {
    return storage.contains(key);
  },

  clearAll: () => {
    storage.clearAll();
  },
};

export default Storage;
