import {store} from '@app/redux';
import Storage from '../storage';

const USER_ID_KEY = 'user_id';
const SESSION_ID_KEY = 'session_id';

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

export const getPersistentSessionId = (): string => {
  const storedSessionId = Storage.getItem(SESSION_ID_KEY);

  if (storedSessionId) {
    return storedSessionId;
  }

  const generatedSessionId = generateLocalUserId();
  Storage.setItem(SESSION_ID_KEY, generatedSessionId);

  return generatedSessionId;
};

export const getLoggedInUserMongoId = (): string | undefined => {
  const state = store.getState();
  const loggedInUserId = state.user.userInfo?._id;

  return loggedInUserId ? String(loggedInUserId) : undefined;
};
