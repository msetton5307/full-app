import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface UserState {
  userInfo: any;
  settings: {
    notification: boolean;
    preferences: boolean;
    email_notification: boolean;
  };
  // Other user-related state properties
}

const initialState: UserState = {
  userInfo: null,
  settings: {
    email_notification: false,
    notification: false,
    preferences: false,
  },
  // Initialize other state properties
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo(state, action: PayloadAction<any | null>) {
      state.userInfo = action.payload;
    },
    updateSettings(
      state,
      action: PayloadAction<{key: keyof UserState['settings']; value: boolean}>,
    ) {
      const {key, value} = action.payload;
      state.settings[key] = value;
    },
  },
});

export const {setUserInfo,updateSettings} = userSlice.actions;
export default userSlice.reducer;
