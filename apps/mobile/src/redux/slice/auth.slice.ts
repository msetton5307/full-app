import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface AuthState {
  loading: boolean;
  isLoggedIn: boolean;
  personalized_category: boolean;
  isAdmin: boolean;
}

const initialState: AuthState = {
  loading: true,
  isLoggedIn: false,
  personalized_category: false,
  isAdmin: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserStatus(
      state,
      action: PayloadAction<{
        personalized_category: boolean;
        isLoggedIn: boolean;
        isAdmin?: boolean;
      }>,
    ) {
      console.log('action.payload -- ', action.payload);

      state.loading = false;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.personalized_category = action.payload?.personalized_category;
      state.isAdmin = action.payload?.isAdmin ?? false;
    },
  },
});

export const {setUserStatus} = authSlice.actions;
export default authSlice.reducer;
