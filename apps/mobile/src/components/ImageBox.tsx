import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {IMAGES_BUCKET_URL} from '@app/utils/constants';
import {moderateScale} from '@app/utils/orientation';
import {Colors, Fonts, Icons} from '@app/themes';

interface imgList {
  images: any[];
  onPressRemove: (_id: string) => void;
}
const ImageBox = ({images = [], onPressRemove}: imgList) => {
  return (
    <View style={styles.mainContainer}>
      <Text style={[styles.labelText]}>Deal Images:</Text>
      <FlatList
        contentContainerStyle={{marginTop: moderateScale(22)}}
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={{width: moderateScale(15)}} />
        )}
        bounces={false}
        renderItem={({item}) => {
          return (
            <View style={styles.imgContainer}>
              <Image
                source={{
                  uri: `${IMAGES_BUCKET_URL.deals}${item?.image}`,
                }}
                style={styles.imgStyle}
              />
              <TouchableOpacity
                onPress={() => onPressRemove(item?._id)}
                activeOpacity={0.8}
                style={styles.remove}>
                <Image source={Icons.remove} style={styles.removeImage} />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};

export default ImageBox;

const styles = StyleSheet.create({
  mainContainer: {
    borderWidth: moderateScale(2),
    borderColor: Colors.Almond,
    borderRadius: moderateScale(10),
    width: '100%',
    alignSelf: 'center',
    marginTop: moderateScale(25),
    height: moderateScale(135),
    // alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(10),
    backgroundColor: Colors.white,
    shadowOpacity: 0.5,
    shadowColor: '#4514A517',
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 5,
  },
  imgContainer: {
    width: moderateScale(100),
    height: moderateScale(100),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(1.5),
    borderRadius: moderateScale(10),
    borderColor: Colors.Aztec_Gold,
    borderStyle: 'dashed',
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
  imgStyle: {
    width: moderateScale(80),
    height: moderateScale(80),
    resizeMode: 'contain',
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
