import {Dispatch} from 'redux';
import {setUserStatus} from '../../redux/slice/auth.slice';
import axios, {AxiosResponse} from 'axios';
import {instance} from '../server/instance';
import {API} from '../constants';
import {
  CATEGORY_LISTING_TYPE,
  RESET_PASSWORD_TYPE,
  SIGN_IN_TYPE,
  SIGN_IN_TYPE_SOCIAL,
  SIGN_UP_TYPE,
} from '../../types';
import {createFrom} from '../helper/Validation';
import Storage from '../storage';
import {navigate} from '../helper/RootNaivgation';
import {isEmpty} from 'lodash';

const {auth, cms, category} = API;

const _header = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

const signUp = (payload: SIGN_UP_TYPE) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        auth.signup,
        payload,
      );

      const {status, data} = result;

      return {
        success: status === 200 && data?.status === 200,
        message: data?.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
      };
    }
  };
};

const signIn = (payload: SIGN_IN_TYPE) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        auth.login,
        payload,
      );

      const {status, data} = result;

      if (status === 200 && data?.status === 200) {
        console.log('data asdasdasd-- ', data?.data?.token);
        Storage.setItem('token', data?.data?.token);
        Storage.setItem('refresh-token', data?.data?.refreshToken);
        Storage.setItem(
          'personalized_category',
          String(!isEmpty(data?.data?.personalized_category)),
        );
        Storage.setItem('is_admin', 'false');
        dispatch(
          setUserStatus({
            isLoggedIn: true,
            personalized_category: !isEmpty(data?.data?.personalized_category),
            isAdmin: false,
          }),
        );
        return {
          success: true,
          message: data?.message,
        };
      }

      return {
        success: status === 200 && data?.status === 200,
        message: data?.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
        data: error?.response?.data,
      };
    }
  };
};


const socialSignInApiCall = (payload: SIGN_IN_TYPE_SOCIAL) => {
  console.log('socialSignInApiCall payload -- ', payload);
  return async (dispatch: Dispatch) => {
    console.log('socialSignInApiCall called');
    try {
      const result: AxiosResponse<any> = await instance.post(
        auth.socialSignIn,
        payload,
      );

      const {status, data} = result;
      console.log('socialSignInApiCall result -- ', status, data);
      if (status === 200 && data?.status === 200) {
        console.log("authtoken -- ", data?.token);
        Storage.setItem('token', data?.token || ''); 
        Storage.setItem('refresh-token', data?.refreshToken || ''); 
        Storage.setItem(
          'personalized_category',
          String(!isEmpty(data?.data?.personalized_category)),
        );
        dispatch(
          setUserStatus({
            isLoggedIn: true,
            personalized_category: !isEmpty(data?.data?.personalized_category),
          }),
        );
        return {
          success: true,
          message: data?.message,
        };
      }

      return {
        success: status === 200 && data?.status === 200,
        message: data?.message,
      };
    } catch (error: any) {
      console.log('socialSignInApiCall error -- ', error);
      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
        data: error?.response?.data,
      };
    }
  };
};



const emailVerify = (payload: {email: string}) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        auth.newEmailVerify,
        payload,
      );

      const {status, data} = result;

      return {
        success: status === 200 && data?.status === 200,
        message: data?.message,
        data: data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
      };
    }
  };
};

const verifyNewEmailOTP = (payload: {otp: string; token: string}) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        auth.newEmailVerityOTP,
        {otp: payload.otp},
        {
          headers: {
            'x-access-token': payload.token,
          },
        },
      );

      const {status, data} = result;

      return {
        success: status === 200,
        message: data?.message,
        data: data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
      };
    }
  };
};

const fotgotPassword = (payload: {email: string}) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        auth.forgotPassword,
        payload,
      );

      const {status, data} = result;

      return {
        success: status === 200 && data?.status === 200,
        message: data?.message,
        data: data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
      };
    }
  };
};

const verifyForgotOTP = (payload: {otp: string; token: string}) => {
  return async (dispatch: Dispatch) => {
    try {
      console.log('verifyForgotOTP payload -- ', payload);
      const result: AxiosResponse<any> = await instance.post(
        auth.verifyOTP,
        {otp: payload.otp},
        {
          headers: {
            'x-access-token': payload.token,
          },
        },
      );

      const {status, data} = result;

      return {
        success: status === 200,
        message: data?.message,
        data: data,
      };
    } catch (error: any) {
      console.log('verifyForgotOTP error -- ', error.response);
      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
      };
    }
  };
};

const resetPassword = (payload: RESET_PASSWORD_TYPE) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        auth.resetPassword,
        {confirmPassword: payload.confirmPassword, password: payload.password},
        {
          headers: {
            'x-access-token': payload.token,
          },
        },
      );

      const {status, data} = result;

      return {
        success: status === 200,
        message: data?.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
      };
    }
  };
};

const logout = () => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.get(auth.logout);

      const {status, data} = result;

      if (status === 200) {
        Storage.deleteItem("token");
        Storage.deleteItem("personalized_category");
        Storage.deleteItem("refresh-token");
        Storage.deleteItem('is_admin');
        dispatch(
          setUserStatus({
            isLoggedIn: false,
            personalized_category: false,
            isAdmin: false,
          }),
        );
      }

      return {
        success: status === 200 && data?.status === 201,
        message: data?.message,
      };
    } catch (error: any) {
      if (error?.response) {
        Storage.clearAll();
        dispatch(
          setUserStatus({
            isLoggedIn: false,
            personalized_category: false,
            isAdmin: false,
          }),
        );
      }

      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
      };
    }
  };
};

const getTermsAndConditions = () => {
  console.log('Call API - getTermsAndConditions');
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.get(
        cms.termsAndConditions,
      );

      const {status, data} = result;

      return {
        success: status === 200 && data?.status === 201,
        message: data?.message,
        data: result?.data?.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `${error.response?.data?.message}`,
      };
    }
  };
};

const getPrivacyPolicy = () => {
  console.log('Call API - getPrivacyPolicy');
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.get(cms.privacyPolicy);

      const {status, data} = result;

      return {
        success: status === 200 && data?.status === 201,
        message: data?.message,
        data: result?.data?.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `${error.response?.data?.message}`,
      };
    }
  };
};

const getCategoryListing = (payload: CATEGORY_LISTING_TYPE) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        category.listing,
        payload,
      );
      const {status, data} = result;

      return {
        success: status === 200 && data?.status === 200,
        message: data?.message,
        data: data?.data?.docs,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
      };
    }
  };
};

const getCategoryAndKeywords = (payload: {search?: string}) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        category.keywords,
        payload,
      );
      const {status, data} = result;

      return {
        success: status === 200 && data?.status === 200,
        message: data?.message,
        data: data?.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
      };
    }
  };
};

const updateCategoryAndKeywords = (payload: any) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.put(
        auth.updateCategory,
        payload,
      );
      const {status, data} = result;

      if (status === 200 && data?.status === 200) {
        Storage.setItem('personalized_category', 'true');
        dispatch(
          setUserStatus({
            isLoggedIn: true,
            personalized_category: true,
          }),
        );
      }

      return {
        success: status === 200 && data?.status === 200,
        message: data?.message,
        data: data?.data,
      };
    } catch (error: any) {
      console.log('error -- ', error.response);

      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
      };
    }
  };
};

export {
  signIn,
  logout,
  signUp,
  socialSignInApiCall,
  emailVerify,
  verifyNewEmailOTP,
  fotgotPassword,
  verifyForgotOTP,
  resetPassword,
  getTermsAndConditions,
  getPrivacyPolicy,
  getCategoryListing,
  getCategoryAndKeywords,
  updateCategoryAndKeywords,
};
