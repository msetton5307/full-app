import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors, Fonts, Icons} from '../../themes';
import {moderateScale} from '../../utils/orientation';
import {IMAGES_BUCKET_URL} from '@app/utils/constants';

export interface CategoryCardInterface {
  item: any;
  onPress?: (item: any) => void;
}

const CategoryCard = ({
  item = {},
  onPress = () => {},
}: CategoryCardInterface) => {
  return (
    <View
      style={[
        style.mainContainer,
        {
          borderWidth: !item?.placeholder ? 1 : 0,
        },
      ]}>
      {!item?.placeholder && (
        <>
          <TouchableOpacity
            style={style.addView}
            onPress={() => {
              if (onPress) {
                onPress(item);
              }
            }}>
            <Image
              source={item?.isSelected ? Icons.check : Icons.add}
              style={item?.isSelected ? style.img : style.plusImg}
            />
          </TouchableOpacity>
          <Image
            source={{uri: `${IMAGES_BUCKET_URL.category}/${item?.image}`}}
            style={style.logoStyle}
            resizeMode="contain"
          />
          <Text style={style.catName}>{item?.title}</Text>
        </>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  catName: {
    color: Colors.black_olive,
    fontSize: moderateScale(12),
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: moderateScale(20),
  },
  plusImg: {
    tintColor: Colors.Aztec_Gold,
    height: moderateScale(12),
    width: moderateScale(12),
    resizeMode: 'contain',
  },
  img: {
    tintColor: Colors.Aztec_Gold,
    height: moderateScale(20),
    width: moderateScale(20),
    resizeMode: 'contain',
  },
  addView: {
    height: moderateScale(30),
    width: moderateScale(30),
    borderRadius: moderateScale(50),
    borderWidth: moderateScale(1),
    borderColor: Colors.Aztec_Gold,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  mainContainer: {
    width: '30%',
    marginTop: moderateScale(20),
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    borderColor: Colors.Desert_Sand,
    alignItems: 'center',
  },
  logoStyle: {
    height: moderateScale(57),
    width: moderateScale(64),
    marginTop: moderateScale(15),
    alignSelf: 'center',
  },
});

export default CategoryCard;
