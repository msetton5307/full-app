import {ImageCallback, ImagePickerProps, PickerImage} from '@app/types';
import {Platform} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';

// Utility function to format the image object
const formatImage = (image: PickerImage): ImageCallback['path'] => {
  const {path, mime} = image;
  const fileName = path.split('/').pop() || 'unknown';
  return {
    name: fileName,
    type: mime,
    uri: Platform.OS === 'android' ? path : path.replace('file://', ''),
  };
};

// Function to pick an image from the gallery
export const getImageFromGallery = async ({
  isCrop = false,
  callback,
  size = {width: 400, height: 400},
  cropperCircleOverlay = false,
}: ImagePickerProps): Promise<void> => {
  try {
    const image = await ImageCropPicker.openPicker({
      width: size.width,
      height: size.height,
      cropping: isCrop,
      mediaType: 'photo',
      cropperCircleOverlay: cropperCircleOverlay,
    });

    callback({
      uri: image.path,
      path: formatImage(image),
    });
  } catch (error) {
    console.error('Gallery Error:', error);
    callback({
      uri: '',
      path: null,
    });
  }
};

// Function to capture an image using the camera
export const getImageFromCamera = async ({
  isCrop = false,
  callback,
  size = {width: 400, height: 400},
  cropperCircleOverlay = false,
}: ImagePickerProps): Promise<void> => {
  try {
    const image = await ImageCropPicker.openCamera({
      width: size.width,
      height: size.height,
      cropping: isCrop,
      mediaType: 'photo',
      cropperCircleOverlay: cropperCircleOverlay,
    });

    callback({
      uri: image.path,
      path: formatImage(image),
    });
  } catch (error) {
    console.error('Camera Error:', error);
    callback({
      uri: '',
      path: null,
    });
  }
};

export const checkImageUrl = async (url: string) => {
  try {
    const response = await fetch(url, {method: 'HEAD'});
    if (
      response.ok &&
      response.headers.get('content-type')?.startsWith('image/')
    ) {
      return true; // Valid image URL
    }
    return false; // Not a valid image
  } catch (error) {
    console.error('Error checking image URL:', error);
    return false; // Error in fetching the URL
  }
};

export const balancedData = (data: any) => {
  const items = [...data]; // Your original data
  const remainder = items.length % 3;
  if (remainder !== 0) {
    const placeholders = Array(3 - remainder).fill({placeholder: true});
    return [...items, ...placeholders];
  }
  return items;
};