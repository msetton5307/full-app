import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {Colors, Images} from '../../themes';
import {moderateScale} from '../../utils/orientation';
import Css from '../../themes/Css';
import Header from '../Header';
import {RefreshControl} from 'react-native-gesture-handler';
import MyStatusBar from '@app/utils/helper/MyStatusBar';

const {height, width} = Dimensions.get('screen');

interface GeneralTemplateInterface {
  headerContainer?: StyleProp<ViewStyle>;
  searchContainer?: StyleProp<ViewStyle>;
  enableBack?: boolean;
  searchValue?: string;
  setSearchValue?: Function;
  fixedComponent?: React.ReactNode;
  children?: React.ReactNode;
  isSearch?: boolean;
  isProfileVisible?: boolean;
  isLoading?: boolean;
  scrollEnd?: () => void;
  title?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const GeneralTemplate = ({
  headerContainer = {},
  searchContainer = {},
  enableBack = false,
  searchValue = '',
  setSearchValue = () => {},
  fixedComponent = <></>,
  children = <></>,
  isSearch = true,
  isProfileVisible = true,
  isLoading = false,
  scrollEnd = () => {},
  title = '',
  isRefreshing = false,
  onRefresh = () => {},
}: GeneralTemplateInterface) => {
  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20; // Threshold to trigger pagination

    if (isCloseToBottom) {
      scrollEnd();
    }
  };

  return (
    <ImageBackground
      source={Images.Background}
      style={{height: height, width: width}}
      resizeMode="stretch">
      <View style={styles.container}>

        <MyStatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Header
            enableBack={enableBack}
            headerContainer={headerContainer}
            isProfileVisible={isProfileVisible}
            isSearch={isSearch}
            searchContainer={searchContainer}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            title={title}
          />
          <View
            style={styles.main}
            onStartShouldSetResponder={() => {
              Keyboard.dismiss();
              return false;
            }}>
            <View style={Css.w100}>{fixedComponent}</View>
            <ScrollView
              style={{
                flex: 1,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: moderateScale(Platform.OS === 'ios' ? 120 : 180),
              }}>
              {isRefreshing && (
                <ActivityIndicator
                  size="small"
                  color={Colors.Aztec_Gold}
                  style={{
                    marginVertical: 10,
                  }}
                />
              )}
              {children}
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color={Colors.Aztec_Gold}
                  style={{
                    marginVertical: 10,
                  }}
                />
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

export default GeneralTemplate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
  },
  main: {
    flex: 1,
    width: '90%',
    alignSelf: 'center',
  },
});
