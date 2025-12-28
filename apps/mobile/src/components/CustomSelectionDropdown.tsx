import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import {moderateScale} from '@app/utils/orientation';
import {Colors, Fonts, Icons} from '@app/themes';
import Modal from 'react-native-modal';

interface categorySelectionDropdown {
  mainContainerStyle?: StyleProp<ViewStyle> | undefined;
  title?: string;
  labelTextStyle?: StyleProp<ViewStyle> | undefined;
  onPressSelect: (_id: string, title: string) => void;
  selectedValue: string;
  dropdownList: any[];
  dropdownTitle?: string;
  forEdit?: boolean;
}

const CustomSelectionDropdown = ({
  mainContainerStyle = {},
  labelTextStyle = {},
  title = '',
  onPressSelect,
  selectedValue,
  dropdownList,
  dropdownTitle,
  forEdit = false,
}: categorySelectionDropdown) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  return (
    <View>
      <View style={[styles.mainContainer, mainContainerStyle]}>
        {title && (
          <Text style={[styles.labelText, labelTextStyle]}>{title}</Text>
        )}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => setOpenDropdown(true)}
          style={styles.inputView}>
          <Text style={[styles.valueStyle]}>
            {selectedValue ? selectedValue : '-- Select --'}
          </Text>
        </TouchableOpacity>
        {!forEdit && selectedValue && (
          <TouchableOpacity
            onPress={() => onPressSelect('', '')}
            activeOpacity={0.8}
            style={styles.remove}>
            <Image source={Icons.remove} style={styles.removeImage} />
          </TouchableOpacity>
        )}
      </View>
      <Modal
        isVisible={openDropdown}
        onBackdropPress={() => setOpenDropdown(false)}
        onBackButtonPress={() => setOpenDropdown(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropTransitionOutTiming={0}>
        <View style={[styles.dropdown]}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>{dropdownTitle}</Text>
          </View>
          <FlatList
            style={styles.dropdownView}
            showsVerticalScrollIndicator={false}
            bounces={false}
            data={dropdownList}
            ItemSeparatorComponent={() => (
              <View style={styles.itemSeperatorComp} />
            )}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              const isSelected = item?.title === selectedValue;
              return (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => {
                    onPressSelect(item?._id, item?.title);
                    setOpenDropdown(false);
                  }}
                  style={[
                    styles.optionsView,
                    {
                      backgroundColor: isSelected
                        ? Colors.Almond
                        : 'transparent',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.valueStyle,
                      {
                        marginLeft: moderateScale(30),
                        fontFamily: isSelected
                          ? Fonts.PoppinsSemiBold
                          : Fonts.PoppinsRegular,
                      },
                    ]}>
                    {item?.title}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

export default CustomSelectionDropdown;

const styles = StyleSheet.create({
  mainContainer: {
    borderWidth: moderateScale(2),
    borderColor: Colors.Almond,
    borderRadius: moderateScale(10),
    width: '90%',
    alignSelf: 'center',
    marginTop: moderateScale(25),
    height: moderateScale(65),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    shadowOpacity: 0.5,
    shadowColor: '#4514A517',
    shadowOffset: {height: 5, width: 5},
    elevation: 5,
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
  inputView: {
    width: '90%',
    height: moderateScale(55),
    justifyContent: 'center',
    marginTop: moderateScale(5),
    borderRadius: moderateScale(5),
    overflow: 'hidden',
  },
  valueStyle: {
    marginLeft: moderateScale(10),
    fontSize: moderateScale(12),
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.black_olive,
  },
  dropdown: {
    width: '80%',
    alignSelf: 'center',
    maxHeight: moderateScale(250),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    borderWidth: moderateScale(1),
    borderColor: Colors.Almond,
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: moderateScale(4),
    padding: moderateScale(10),
  },
  dropdownView: {
    maxHeight: moderateScale(200),
  },
  optionsView: {
    width: '100%',
    height: moderateScale(40),
    justifyContent: 'center',
  },
  itemSeperatorComp: {
    height: moderateScale(1),
    borderWidth: moderateScale(0.5),
    borderColor: Colors.Desert_Sand,
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
  dropdownHeader: {
    height: moderateScale(40),
    justifyContent: 'center',
  },
  dropdownTitle: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.black_olive,
    textAlign: 'center',
  },
});
