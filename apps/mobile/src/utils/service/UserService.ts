import { Dispatch } from 'redux';
import { AxiosResponse } from 'axios';
import { instance } from '../server/instance';
import { API, DEALS_BASE_URL } from '../constants';
import { createFrom } from '../helper/Validation';
import { setUserInfo } from '../../redux/slice/user.slice';
import {
  ADD_DEAL_TYPE,
  CHANGE_PASSWORD_TYPE,
  DEAL_LIKE_TYPE,
  DEAL_LISTING_TYPE,
  JSON_LISTING_TYPE,
  MERGE_JSON_LISTING_TYPE,
  UPDATE_SETTINGS_TYPE,
  UPDATE_USER_INFORMATION,
} from '@app/types';

const { user, settings, listing, notifications } = API;

const _header = {
  headers: {
    'Content-Type': 'multipart/form-data',
    Accept: 'multipart/form-data',
  },
};

const dealsBaseConfig = { baseURL: DEALS_BASE_URL };

const getUserDetails = () => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.get(user.profile);
      const { status, data } = result;

      if (data?.status === 200 && data?.status === 200) {
        dispatch(setUserInfo(result?.data?.data));
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
      };
    }
  };
};

const updateUserInfoRequest = (payload: UPDATE_USER_INFORMATION) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.put(
        user.editProfile,
        createFrom(payload),
        _header,
      );

      const { status, data } = result;

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

const changePasswordRequest = (payload: CHANGE_PASSWORD_TYPE) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        user.changePassword,
        payload,
      );

      const { status, data } = result;

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

const deleteUserAccount = () => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.delete(
        user.deleteAccount,
      );
      const { status, data } = result;

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

const updateUserSettings = (payload: UPDATE_SETTINGS_TYPE) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.put(
        settings.update,
        payload,
      );

      const { status, data } = result;

      return {
        success: status === 200,
        message: data?.message,
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

const getAllDealListing = (payload: DEAL_LISTING_TYPE) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        listing.dealListing,
        payload,
        dealsBaseConfig,
      );

      const { status, data } = result;

      return {
        success: status === 200,
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
const getAllDealListingMobile = (payload: DEAL_LISTING_TYPE) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        listing.newDealListing,
        payload,
        dealsBaseConfig,
      );

      const { status, data } = result;

      return {
        success: status === 200,
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
const getAllJsonDealListing = (payload: JSON_LISTING_TYPE) => {
  console.log('getAllJsonDealListing_payload', payload);
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        listing.jsonListing,
        payload,
        dealsBaseConfig,
      );

      const { status, data } = result;

      console.log('getAllJsonDealListing_result', data?.data?.data);

      return {
        success: status === 200,
        message: data?.message,
        data: data?.data?.data,
      };
    } catch (error: any) {
      console.log('getAllJsonDealListing_error', error);
      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
      };
    }
  };
};

const getMergedJsonDeals = (payload: MERGE_JSON_LISTING_TYPE) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.get(
        listing.mergeJsonDeals,
        {
          baseURL: DEALS_BASE_URL,
          params: {
            page: payload.page || 1,
            pageSize: payload.pageSize || 50,
          },
        },
      );

      const { status, data } = result;

      const dealsData = Array.isArray(data?.data?.data)
        ? data.data.data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : data?.data?.data ?? data?.data ?? [];

      return {
        success: status === 200,
        message: data?.message,
        data: dealsData,
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

const getDealDetails = (payload: { id: string }) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.get(
        `${listing.dealDetails}${payload.id}`,
        dealsBaseConfig,
      );
      const { status, data } = result;

      return {
        success: status === 200,
        message: data?.message,
        data: data?.data[0],
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

const getDealFavoriteList = (payload: DEAL_LISTING_TYPE) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        listing.dealFavoriteList,
        payload,
        dealsBaseConfig,
      );
      const { status, data } = result;
      const allDeals = data.data.docs.flatMap((item: any) => item.deals || []);
      return {
        success: status === 200,
        message: data?.message,
        data: allDeals,
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

const applyDealLiked = (payload: DEAL_LIKE_TYPE) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        listing.dealLike,
        payload,
        dealsBaseConfig,
      );

      const { status, data } = result;

      return {
        success: status === 200,
        message: data?.message,
        // data: data?.data[0],
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

const applyDealFavorite = (payload: { dealId: string }) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        listing.dealFavorite,
        payload,
        dealsBaseConfig,
      );

      const { status, data } = result;

      return {
        success: status === 200,
        message: data?.message,
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

const addNewDeal = (payload: FormData) => {
  console.log('payloadasdlAHSdklhjASLKdhjhj -- ', payload);
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        listing.addDeal,
        payload,
        { ..._header, ...dealsBaseConfig },
      );

      const { status, data } = result;

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

const getPostedDeal = (payload: DEAL_LISTING_TYPE) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        listing.postedDeals,
        payload,
        dealsBaseConfig,
      );

      const { status, data } = result;

      return {
        success: status === 200,
        data: data?.data?.docs,
        amount: data?.amount ? data?.amount : 0,
      };
    } catch (error: any) {
      console.log('error in posted deals -- ', error.response);
      return {
        success: false,
        message: error?.response
          ? `${error.response?.data?.error?.errorType}`
          : `${error?.message}`,
      };
    }
  };
};

const updateDeal = (payload: FormData) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.put(
        listing.updateDeal,
        payload,
        { ..._header, ...dealsBaseConfig },
      );

      const { status, data } = result;

      return {
        success: status === 200,
        message: data?.message,
        // data: data?.data[0],
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

const deleteDeal = (id: string) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.delete(
        `${listing.deleteDeal}/${id}`,
        dealsBaseConfig,
      );
      const { status, data } = result;
      return {
        success: status === 200,
        message: data?.message,
      };
    } catch (error) {
      console.log('error -- ', error);
    }
  };
};

const addBank = (payload: null) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.get(
        listing.addBank,
        dealsBaseConfig,
      );
      const { status, data } = result;
      return {
        success: status === 200,
        message: data?.message,
        data: data?.data,
      };
    } catch (error) {
      console.log('error -- ', error);
    }
  };
};

const getbankDetails = (payload: null) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.get(
        listing.banklist,
        dealsBaseConfig,
      );
      const { status, data } = result;
      return {
        success: status === 200,
        message: data?.message,
        data: data?.data,
      };
    } catch (error) {
      console.log('error -- ', error);
    }
  };
};

const notification = (payload: null) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.get(
        settings.notification,
      );
      const { status, data } = result;
      return {
        success: status === 200,
        message: data?.message,
        data: data?.data,
      };
    } catch (error) {
      console.log('error -- ', error);
    }
  };
};

const sendLatestDealNotification = (payload: {dealId: string}) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        notifications.sendLatestDeal,
        payload,
      );
      const {status, data} = result;
      return {
        success: status === 200,
        message: data?.message,
        data: data?.data,
      };
    } catch (error) {
      console.log('error -- ', error);
    }
  };
};

export {
  getUserDetails,
  updateUserInfoRequest,
  changePasswordRequest,
  deleteUserAccount,
  updateUserSettings,
  getAllDealListing,
  getDealDetails,
  getDealFavoriteList,
  applyDealLiked,
  applyDealFavorite,
  addNewDeal,
  getPostedDeal,
  updateDeal,
  deleteDeal,
  addBank,
  getbankDetails,
  notification,
  sendLatestDealNotification,
  getAllJsonDealListing,
  getAllDealListingMobile,
  getMergedJsonDeals,
};
