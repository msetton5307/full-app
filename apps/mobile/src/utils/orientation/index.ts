import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('screen');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Cache the scale ratios to avoid recalculating
const widthRatio = width / guidelineBaseWidth;
const heightRatio = height / guidelineBaseHeight;

// Use concise arrow functions
const horizontalScale = (size: number): number => size * widthRatio;
const verticalScale = (size: number): number => size * heightRatio;
const moderateScale = (size: number, factor: number = 0.5): number =>
  size + (horizontalScale(size) - size) * factor;

export {horizontalScale, verticalScale, moderateScale};
