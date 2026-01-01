import { BASE_URL } from '@env';

export const DEFAULT_API_BASE_URL =
  'https://griffon-destined-martin.ngrok-free.app';
export const DEFAULT_DEALS_BASE_URL = 'https://api.sysavings.com';

export const API_BASE_URL = BASE_URL || DEFAULT_API_BASE_URL;
export const DEALS_BASE_URL = DEFAULT_DEALS_BASE_URL;

export const API = {
  auth: {
    login: 'api/user/login',
    signup: 'api/user/signup',
    newEmailVerify: 'api/user/resent/emailverify',
    newEmailVerityOTP: 'api/user/email/verify',
    forgotPassword: 'api/user/forgotpassword',
    verifyOTP: 'api/user/validateotp',
    resetPassword: 'api/user/resetpassword',
    logout: 'api/user/logout',
    updateCategory: 'api/user/personalized/category/update',
    refreshToken: 'api/user/refreshtoken',
    socialSignIn: 'api/user/social/signin',
  },
  user: {
    profile: 'api/user/profile',
    editProfile: 'api/user/edit/profile',
    changePassword: 'api/user/changepassword',
    deleteAccount: 'api/user/delete',
  },
  cms: {
    termsAndConditions: 'api/cms/details/terms-policies',
    privacyPolicy: 'api/cms/details/privacy-policy',
  },
  settings: {
    update: 'api/user/settings/update',
    notification: 'api/user/notification/listing',
  },
  collection: {
    listing: 'api/collection/listing',
    deals: (id: string) => `api/collection/${id}/deals`,
  },
  notifications: {
    sendLatestDeal: 'api/notification/latest-deal',
  },
  priceTracker: {
    create: 'api/price-tracker',
    list: 'api/price-tracker',
    remove: (id: string) => `api/price-tracker/${id}`,
  },
  category: {
    listing: 'api/category/listing',
    keywords: 'api/category/keyword/listing',
  },
  listing: {
    dealListing: 'api/deal/listing/user',
    newDealListing: 'api/deal/listing',
    dealDetails: 'api/deal/get/',
    dealLike: 'api/deal/like',
    dealFavorite: 'api/deal/favorite',
    dealFavoriteList: 'api/deal/favorite/list',
    dealView: 'api/deal/view',
    dealCtaClick: 'api/deal/cta-click',
    reportExpired: 'api/deal/report-expired',
    addDeal: 'api/deal/add',
    postedDeals: 'api/deal/listing/user/created',
    updateDeal: 'api/deal/update',
    deleteDeal: 'api/deal/delete',
    addBank: 'api/bank/account/add',
    banklist: 'api/bank/account/details',
    jsonListing: 'api/deal/get/json',
    mergeJsonDeals: 'api/mergeJSON/paginated',
  },
};

export const IMAGES_BUCKET_URL = {
  profile: `${API_BASE_URL}/uploads/users/`,
  category: `${API_BASE_URL}/uploads/category`,
  brand: `${API_BASE_URL}/uploads/`,
  deals: `${API_BASE_URL}/uploads/DealImages/`,
  collections: `${API_BASE_URL}/uploads/collections/`,
};
