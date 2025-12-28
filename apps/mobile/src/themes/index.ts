const Images = {
  Splash: require('../assets/images/Splash.png'),
  Background: require('../assets/images/Background.png'),
  Logo: require('../assets/images/Logo.png'),
  img1: require('../assets/images/img1.png'),
  cat_freezer: require('../assets/images/cat_freezer.png'),
  cat_scooter: require('../assets/images/cat_scooter.png'),
  cat_chair: require('../assets/images/cat_chair.png'),
  cat_chocolate: require('../assets/images/cat_chocolate.png'),
  cat_cookies: require('../assets/images/cat_cookies.png'),
  cat_doll: require('../assets/images/cat_doll.png'),
  cat_laptop: require('../assets/images/cat_laptop.png'),
  cat_mobile: require('../assets/images/cat_mobile.png'),
  user: require('../assets/images/user.png'),
  no_pictures: require('../assets/images/no_pictures.png'),
};

const Icons = {
  Hide: require('../assets/icons/Hide.png'),
  add: require('../assets/icons/add.png'),
  Show: require('../assets/icons/Show.png'),
  Google: require('../assets/icons/Google.png'),
  Apple: require('../assets/icons/Apple.png'),
  ForgotIcon: require('../assets/icons/ForgotIcon.png'),
  VerifiedIcon: require('../assets/icons/VerifiedIcon.png'),
  resetIcon: require('../assets/icons/resetIcon.png'),
  category: require('../assets/icons/category.png'),
  setting: require('../assets/icons/setting.png'),
  Deals: require('../assets/icons/Deals.png'),
  Home: require('../assets/icons/Home.png'),
  HeaerIcon: require('../assets/icons/HeaerIcon.png'),
  Search: require('../assets/icons/Search.png'),
  Profile: require('../assets/icons/Profile.png'),
  Notification: require('../assets/icons/Notification.png'),
  Back: require('../assets/icons/Back.png'),
  img1: require('../assets/icons/img1.png'),
  amazon: require('../assets/icons/amazon.png'),
  pencil: require('../assets/icons/pencil.png'),

  check: require('../assets/icons/check.png'),
  Cloths: require('../assets/icons/Cloths.png'),
  Grocery: require('../assets/icons/Grocery.png'),
  HomeCat: require('../assets/icons/HomeCat.png'),
  Kitchen: require('../assets/icons/Kitchen.png'),
  Tech: require('../assets/icons/Tech.png'),
  Toys: require('../assets/icons/Toys.png'),
  camera: require('../assets/icons/camera.png'),
  cross: require('../assets/icons/cross.png'),
  upload: require('../assets/icons/upload.png'),
  icon_info: require('../assets/icons/icon_info.png'),
  icon_add: require('../assets/icons/icon_add.png'),
  //--------------------------------------------------------------------------
  header_app_logo: require('../assets/icons/header_app_logo.png'),
  header_back_button: require('../assets/icons/header_back_button.png'),
  //--------------------------------------------------------------------------
  arrow_down: require('../assets/icons/arrow_down.png'),
  arrow_up: require('../assets/icons/arrow_up.png'),
  arrow_left: require('../assets/icons/arrow_left.png'),
  arrow_right: require('../assets/icons/arrow_right.png'),
  //--------------------------------------------------------------------------
  active_dislike: require('../assets/icons/active_dislike.png'),
  inactive_dislike: require('../assets/icons/inactive_dislike.png'),
  active_favourite: require('../assets/icons/active_favourite.png'),
  inactive_favourite: require('../assets/icons/inactive_favourite.png'),
  active_like: require('../assets/icons/active_like.png'),
  inactive_like: require('../assets/icons/inactive_like.png'),
  active_link: require('../assets/icons/active_link.png'),
  inactive_link: require('../assets/icons/inactive_link.png'),
  active_save: require('../assets/icons/active_save.png'),
  inactive_save: require('../assets/icons/inactive_save.png'),
  active_share: require('../assets/icons/active_share.png'),
  inactive_share: require('../assets/icons/inactive_share.png'),
  remove: require('../assets/icons/remove.png'),
  favorite: require('../assets/icons/favorite.png'),
};

const Colors = {
  white: '#FFFFFF',
  black_olive: '#3B3B3B',
  tiger_Orange: '#BB863D',
  Aztec_Gold: '#CB9447',
  Dark_Aztec_Gold: '#B88033',
  Almond: '#EADECF',
  Bone: '#E3D3BF',
  Old_Silver: '#81808A',
  Gunmetal: '#29333F',
  Linen: '#F9EEE0',
  Desert_Sand: '#EAD1AE',
  Amaranth_Red: '#D42828',
  green: '#35AA07',
  dark: '#182230',
  black: '#000000',
  Cornsilk: '#FFF2DF',
  Floral_White: '#FFF9F0',
  Dutch_White: '#EEDCC2',
  Seashell: '#FDF7EE',
  dark_blue: '#2A3E4F',
  casper: '#ACB9C9',
  cool_blue: '#5280BB',
  pickled_bluewood: '#334B5E',
  regent_grey: '#8295A3',
  pale_sky: '#667682',
  gainsboro: '#E3E3E3',
  grayish: '#F2F2F2',
  gray_1: '#C8C8C8',
  gray_2: '#E6E6E6',
  Soft_Peach: '#ffecd4',
};

const Fonts = {
  PoppinsBold: 'Poppins-Bold',

  PoppinsLight: 'Poppins-Light',
  PoppinsMedium: 'Poppins-Medium',
  PoppinsRegular: 'Poppins-Regular',
  PoppinsSemiBold: 'Poppins-SemiBold',
};

function hexToRGB(
  hex: string,
  opacity: number = 1,
  defaultColor: string = 'red',
): string {
  let c: string[] | number;

  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = parseInt(c.join(''), 16);

    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(
      ',',
    )},${opacity})`;
  }

  return defaultColor;
}

export {Fonts, Images, Icons, Colors, hexToRGB};
