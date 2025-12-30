import React from 'react';
import {
  Image,
  Platform,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {Colors, Fonts, Icons} from '../themes';
import {moderateScale} from '../utils/orientation';
import {goBack, navigate} from '../utils/helper/RootNaivgation';
import Css from '../themes/Css';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface CustomHeaderProps {
  headerContainer?: StyleProp<ViewStyle>;
  enableBack?: boolean;
  isSearch?: boolean;
  searchContainer?: StyleProp<ViewStyle>;
  searchValue?: string;
  setSearchValue?: Function;
  isProfileVisible?: boolean;
  marginTop?: number;
  title?: string;
  isNotificationVisible? :boolean
}

const Header = (props: CustomHeaderProps) => {
  const insets = useSafeAreaInsets();

  const {
    headerContainer = {},
    searchContainer = {},
    enableBack = false,
    searchValue = '',
    setSearchValue = () => {},
    isSearch = true,
    isProfileVisible = true,
    isNotificationVisible = true,
    marginTop = Platform.OS === 'ios' ? 0 : 0, // insets.top
    title = '',
  } = props;

  return (
    <View
      style={[
        styles.headerContainer,
        headerContainer,
        {
          marginTop: marginTop,
        },
      ]}>
      {enableBack ? (
        <TouchableOpacity
          onPress={() => {
            goBack();
          }}
          style={[Css.iconContainer36, Css.ml8]}>
          <Image
            style={Css.icon60}
            source={Icons.header_back_button}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : (
        <Image
          style={Css.icon60}
          source={Icons.header_app_logo}
          resizeMode="contain"
        />
      )}
      {isSearch ? (
        <View style={[styles.searchContainer, searchContainer]}>
          <TextInput
            placeholder="Search..."
            placeholderTextColor={Colors.Old_Silver}
            style={styles.searchInput}
            value={searchValue}
            onChangeText={e => setSearchValue(e)}
          />
          <Image source={Icons.Search} style={Css.icon20} />
        </View>
      ) : (
        <View style={{flex: 1}}>
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
      )}
      {isNotificationVisible && (
        <TouchableOpacity
          style={Css.iconContainer40}
          onPress={() =>
            navigate('TabNav', {
              screen: 'Notification',
            })
          }>
          <Image
            source={Icons.Notification}
            style={Css.icon40}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      {isProfileVisible && (
        <TouchableOpacity
          style={Css.iconContainer40}
          onPress={() => {
            navigate('Profile');
          }}>
          <Image
            source={Icons.Profile}
            style={Css.icon40}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingRight: moderateScale(10),
    justifyContent: 'space-between',
    borderBottomWidth: moderateScale(2),
    borderBottomColor: Colors.Linen,
    height: moderateScale(70),
    gap: moderateScale(10),
  },
  searchContainer: {
    flexDirection: 'row',
    borderWidth: moderateScale(1),
    flex: 1,
    height: moderateScale(45),
    alignItems: 'center',
    borderColor: Colors.Aztec_Gold,
    borderRadius: moderateScale(30),
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(10),
    backgroundColor: '#FFFAF5',
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    height: moderateScale(45),
    marginTop: Platform.OS === 'android' ? moderateScale(6) : 0, // adjustment for android input field
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsMedium,
    paddingEnd: moderateScale(8),
  },
  title: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(20),
    color: Colors.Aztec_Gold,
  },
});
