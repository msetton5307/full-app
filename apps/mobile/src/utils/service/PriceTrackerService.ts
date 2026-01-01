import {Dispatch} from 'redux';
import {AxiosResponse} from 'axios';
import {instance} from '../server/instance';
import {API} from '../constants';
import {PRICE_TRACKER_PAYLOAD} from '@app/types';

const {priceTracker} = API;

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.errorType ||
  error?.message ||
  fallback;

export const createPriceTracker = (payload: PRICE_TRACKER_PAYLOAD) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.post(
        priceTracker.create,
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
        message: getErrorMessage(error, 'Unable to save tracker'),
      };
    }
  };
};

export const listPriceTrackers = () => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.get(priceTracker.list);
      const {status, data} = result;
      return {
        success: status === 200 && data?.status === 200,
        message: data?.message,
        data: data?.data || [],
      };
    } catch (error: any) {
      return {
        success: false,
        message: getErrorMessage(error, 'Unable to load price trackers'),
      };
    }
  };
};

export const deletePriceTracker = (id: string) => {
  return async (dispatch: Dispatch) => {
    try {
      const result: AxiosResponse<any> = await instance.delete(
        priceTracker.remove(id),
      );
      const {status, data} = result;
      return {
        success: status === 200 && data?.status === 200,
        message: data?.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: getErrorMessage(error, 'Unable to remove tracker'),
      };
    }
  };
};
