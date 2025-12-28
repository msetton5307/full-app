import {NavigatorScreenParams} from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  CategoryKeyword: undefined;
  TabNav: NavigatorScreenParams<RootTabParamList> | undefined;
  Profile: undefined;
  EditProfile: undefined;
  Payout: undefined;
  PayoutHistory: undefined;
  PrivacyPolicy: undefined;
  TermsCondition: undefined;
  ChangePassword: undefined;
  FavouriteDeals: undefined;
  ContactUs: undefined;
  EditPost: any;
};

export type RootTabParamList = {
  Home: undefined;
  Categories: undefined;
  Deals: undefined;
  Notification: undefined;
  Setting: undefined;
};

export type PickerImage = {
  path: string;
  mime: string;
};

export type ImageCallback = {
  uri: string;
  path: {
    name: string;
    type: string;
    uri: string;
  } | null;
};

// Define the input props type for the camera function
export type ImagePickerProps = {
  isCrop?: boolean;
  callback: (res: ImageCallback) => void;
  size?: {
    width?: number;
    height?: number;
  };
  cropperCircleOverlay?: boolean;
};

// ----------------------- API PAYLOAD ----------------------------
export interface SIGN_UP_TYPE {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isAcceptAllPolicies: boolean;
}

export interface SIGN_IN_TYPE {
  email: string;
  password: string;
  device_type: string;
  device_token: string;
}

export interface SIGN_IN_TYPE_SOCIAL {
  socialId: string;
  identityToken?: string;
  fullName?: string;
  email?: string;
  registerType: string; //['Normal', 'Apple', 'Google','Facebook']
  image_url?: string;
  device_token: string;
  device_type: string;
}
export interface RESET_PASSWORD_TYPE {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface CATEGORY_LISTING_TYPE {
  page?: number;
  length?: number;
  search?: string;
}

export interface UPDATE_USER_INFORMATION {
  fullName: string;
  profile_image?: any;
  email?: string;
}

export interface CHANGE_PASSWORD_TYPE {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UPDATE_SETTINGS_TYPE {
  notifications: boolean;
  preferences: boolean;
  email_notifications: boolean;
}

export interface DEAL_LISTING_TYPE {
  page?: number;
  length?: number;
  search?: string;
  isFeature?: boolean;
  status?:string;
  isPaymentDone?:boolean;
}
export interface JSON_LISTING_TYPE {
  page?: number;
  limit?: number;
  search?: string;
}

export interface MERGE_JSON_LISTING_TYPE {
  page?: number;
  pageSize?: number;
}

export interface DEAL_LIKE_TYPE {
  isLike: boolean;
  isDisLike: boolean;
  dealId: string;
}

export interface ADD_DEAL_TYPE {
  deal_title: string;
  deal_price: string;
  description: string;
  categoryId: string;
  brand_logo: string;
  product_link: string;
  discount: string;
  image: any;
}
