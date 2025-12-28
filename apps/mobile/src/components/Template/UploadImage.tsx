import {
  View,
  Text,
  StyleProp,
  ViewStyle,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {Colors, Fonts, Icons} from '../../themes';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/orientation';
import Css from '../../themes/Css';
import LinearGradient from 'react-native-linear-gradient';
import {getImageFromGallery} from '@app/utils/helper';

interface UploadImageProps {
  forEdit?: boolean;
  title?: string;
  image: string;
  onChangeValue?: Function;
  mainContainerStyle?: StyleProp<ViewStyle>;
  innerContainerStyle?: StyleProp<ViewStyle>;
  labelTextStyle?: StyleProp<ViewStyle>;
  index?: number;
  onPressRemove?: (i: number) => void;
}

const UploadImage = ({
  forEdit = false,
  title = 'Upload images:',
  image = '',
  onChangeValue = () => {},
  onPressRemove = () => {},
  mainContainerStyle = {},
  innerContainerStyle = {},
  labelTextStyle = {},
  index = 0,
}: UploadImageProps) => {
  const handleImageChange = (image: any) => {
    if (onChangeValue) {
      onChangeValue(image);
    }
  };

  const handleImageRemove = (_i: number) => {
    if (onPressRemove) {
      onPressRemove(_i);
    }
  };

  function chooseImage(isChoose = true) {
    if (isChoose === false) {
      handleImageChange({
        path: {},
        uri: '',
      });

      return;
    }

    getImageFromGallery({
      size: {width: 500, height: 500},
      isCrop: false,
      callback(res) {
        if (res.uri !== '' && res.path !== null) {
          handleImageChange(res);
        }
      },
      cropperCircleOverlay: true,
    });
  }

  return (
    <View style={[styles.mainContainer, mainContainerStyle]}>
      <Text style={[styles.labelText, labelTextStyle]}>{title}</Text>
      <View style={[styles.innerContainer, innerContainerStyle]}>
        {image === '' ? (
          <TouchableOpacity onPress={() => chooseImage()} activeOpacity={0.6}>
            <LinearGradient
              colors={[Colors.white, Colors.gainsboro]}
              style={styles.button}>
              <Text style={styles.buttonText}>Choose File</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              height: verticalScale(35),
              width: horizontalScale(35),
            }}>
            <Image
              source={{uri: image}}
              style={{
                height: verticalScale(35),
                width: horizontalScale(35),
                resizeMode: 'cover',
                borderRadius: moderateScale(3),
              }}
            />
          </View>
        )}
        <View style={styles.v}>
          <TouchableOpacity
            disabled={image === ''}
            onPress={() => chooseImage(false)}
            style={styles.touch}>
            <Text
              style={[
                styles.buttonTextCoosen,
                {
                  color:
                    image === '' ? Colors.Old_Silver : Colors.Dark_Aztec_Gold,
                },
              ]}>
              {image === '' ? 'No file chosen' : 'Remove image'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => chooseImage()}
          activeOpacity={0.6}
          style={[Css.iconContainer20, Css.mr5]}>
          <Image source={Icons.upload} style={Css.icon20} />
        </TouchableOpacity>
      </View>

      {!forEdit ? (
        index !== 0 && (
          <TouchableOpacity
            onPress={() => handleImageRemove(index)}
            activeOpacity={0.8}
            style={styles.remove}>
            <Image source={Icons.remove} style={styles.removeImage} />
          </TouchableOpacity>
        )
      ) : (
        <TouchableOpacity
          onPress={() => handleImageRemove(index)}
          activeOpacity={0.8}
          style={styles.remove}>
          <Image source={Icons.remove} style={styles.removeImage} />
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    borderWidth: moderateScale(1.5),
    borderColor: Colors.Aztec_Gold,
    borderRadius: moderateScale(10),
    width: '90%',
    alignSelf: 'center',
    marginTop: moderateScale(25),
    height: moderateScale(65),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    shadowOpacity: 1,
    shadowColor: '#4514A517',
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 5,
    borderStyle: 'dashed',
  },
  innerContainer: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: moderateScale(25),
  },
  labelText: {
    position: 'absolute',
    top: -10,
    left: 15,
    backgroundColor: 'white',
    paddingHorizontal: moderateScale(10),
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(15),
    color: Colors.Aztec_Gold,
    borderRadius: moderateScale(10),
    zIndex: 1,
  },
  button: {
    borderRadius: moderateScale(6),
    borderWidth: 0.5,
    borderColor: Colors.gainsboro,
  },
  buttonText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(11),
    color: Colors.black_olive,
    borderRadius: moderateScale(10),
    zIndex: 1,
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(5),
  },
  v: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  touch: {
    marginLeft: moderateScale(10),
  },
  buttonTextCoosen: {
    fontSize: moderateScale(11),
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.Old_Silver,
  },
  remove: {
    position: 'absolute',
    top: moderateScale(-10),
    right: 0,
    backgroundColor: Colors.white,
    padding: moderateScale(2),
  },
  removeImage: {
    resizeMode: 'contain',
    height: moderateScale(20),
    width: moderateScale(20),
    tintColor: Colors.Dark_Aztec_Gold,
  },
});
export default UploadImage;
