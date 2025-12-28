import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {moderateScale} from '../utils/orientation';
import {Colors, Fonts} from '../themes';

export const CustomButtonSolid = ({
  label = '',
  onPress = () => {},
  containerStyle = {},
  labelStyle = {},
  LeftIcon = false,
  disabled = false,
  LeftImg = undefined,
}: {
  label: string;
  onPress: Function;
  containerStyle?: StyleProp<ViewStyle> | undefined;
  labelStyle?: StyleProp<TextStyle> | undefined;
  LeftIcon?: boolean;
  disabled?: boolean;
  LeftImg?: ImageSourcePropType | undefined;
}) => {
  return (
    <TouchableOpacity
      style={[
        disabled
          ? styles.solidButtonContainerDisabled
          : styles.solidButtonContainer,
        containerStyle,
      ]}
      activeOpacity={0.5}
      onPress={() => onPress()}
      disabled={disabled}>
      {LeftIcon ? (
        <Image
          source={LeftImg}
          style={{
            height: moderateScale(22),
            width: moderateScale(22),
            objectFit: 'contain',
          }}
        />
      ) : null}
      <Text style={[styles.buttonLabel, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

export const CustomButtonOutline = ({
  label = '',
  onPress = () => {},
  containerStyle = {},
  labelStyle = {},
  disabled = false,
}: {
  label: string;
  onPress: Function;
  containerStyle?: StyleProp<ViewStyle> | undefined;
  labelStyle?: StyleProp<TextStyle> | undefined;

  disabled?: boolean;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.outlineButtonContainer,
        disabled
          ? styles.outlineButtonContainerDisabled
          : styles.outlineButtonContainer,
        containerStyle,
      ]}
      activeOpacity={0.5}
      onPress={() => onPress()}
      disabled={disabled}>
      <Text
        style={[
          styles.solidbuttonLabel,
          disabled ? {color: Colors.gray_1} : {},
          labelStyle,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  solidButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Aztec_Gold,
    height: moderateScale(60),
    borderRadius: moderateScale(10),

    width: '90%',
    marginTop: moderateScale(20),
    flexDirection: 'row',
    alignSelf: 'center',
  },
  solidButtonContainerDisabled: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Aztec_Gold,
    height: moderateScale(50),
    borderRadius: moderateScale(10),
    borderWidth: 2,
    borderColor: Colors.Bone,
    width: '100%',
    marginTop: moderateScale(15),
    opacity: 0.5,
    flexDirection: 'row',
  },
  outlineButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Seashell,
    height: moderateScale(60),
    borderRadius: moderateScale(10),
    borderWidth: moderateScale(1),
    borderColor: Colors.Dutch_White,
    width: '90%',
    marginTop: moderateScale(20),
    flexDirection: 'row',
    alignSelf: 'center',
  },
  outlineButtonContainerDisabled: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray_2,
    height: moderateScale(60),
    borderRadius: moderateScale(10),
    borderWidth: moderateScale(1),
    borderColor: Colors.gray_1,
    width: '90%',
    marginTop: moderateScale(20),
    flexDirection: 'row',
    alignSelf: 'center',
  },
  buttonLabel: {
    fontFamily: Fonts.PoppinsBold,
    color: Colors.white,
    fontSize: moderateScale(18),
  },
  solidbuttonLabel: {
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.Aztec_Gold,
    fontSize: moderateScale(18),
  },
});
