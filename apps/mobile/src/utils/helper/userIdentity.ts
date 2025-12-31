import {store} from '@app/redux';
import Storage from '../storage';

const USER_ID_KEY = 'user_id';

const generateLocalUserId = () => {
  const uuid = globalThis?.crypto?.randomUUID?.();

  if (uuid) {
    return uuid;
  }

  const randomSegment = () => Math.random().toString(16).slice(2, 10);

  return `anon-${randomSegment()}-${randomSegment()}`;
};

export const getPersistentUserId = (): string => {
  const state = store.getState();
  const authenticatedUserId =
    state.user.userInfo?._id || state.user.userInfo?.id || state.user.userInfo?.userId;

  if (authenticatedUserId) {
    const normalizedId = String(authenticatedUserId);
    Storage.setItem(USER_ID_KEY, normalizedId);
    return normalizedId;
  }

  const storedUserId = Storage.getItem(USER_ID_KEY);
  if (storedUserId) {
    return storedUserId;
  }

  const generatedId = generateLocalUserId();
  Storage.setItem(USER_ID_KEY, generatedId);
  return generatedId;
};

