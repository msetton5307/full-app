import React, {useEffect} from 'react';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {Colors, Fonts, Icons, Images} from '../../../themes';
import {moderateScale} from '../../../utils/orientation';
import Css from '../../../themes/Css';
import {useAppDispatch} from '@app/redux';
import {useIsFocused} from '@react-navigation/native';
import RenderHtml, {MixedStyleDeclaration} from 'react-native-render-html';
import {getPrivacyPolicy} from '@app/utils/service/AuthService';
import MyStatusBar from '@app/utils/helper/MyStatusBar';
import {goBack} from '@app/utils/helper/RootNaivgation';
import Header from '@app/components/Header';

const PrivacyPolicy = () => {
  const {width, height} = useWindowDimensions();
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const [privacyPolicy, setPrivacyPolicy] = React.useState<any>({});

  useEffect(() => {
    if (isFocused) {
      fetchPrivacy();
    }
  }, [isFocused]);

  const fetchPrivacy = async () => {
    try {
      const result = await dispatch(getPrivacyPolicy());
      setPrivacyPolicy(result?.data?.content);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const tagsStyles: Record<string, MixedStyleDeclaration> = {
    p: {
      fontSize: moderateScale(15),
      lineHeight: 24,
      margin: 0,
      fontFamily: Fonts.PoppinsRegular,
      color: Colors.pickled_bluewood,
    },
    h1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors.Aztec_Gold,
      marginBottom: 10,
    },
    h2: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors.Aztec_Gold,
      marginBottom: 8,
    },
    ul: {
      marginVertical: 10,
    },
    li: {
      fontSize: 16,
      color: '#555',
      lineHeight: 22,
    },
    a: {
      color: '#1e90ff',
      textDecorationLine: 'underline',
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
  };

  return (
    <ImageBackground
      source={Images.Background}
      style={StyleSheet.absoluteFillObject}
      resizeMode="stretch">
      <SafeAreaView style={{flex: 1}}>
        {/* <MyStatusBar
          backgroundColor={Colors.dark_blue}
          barStyle={'dark-content'}
        /> */}
        <MyStatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />

        <Header
          marginTop={0}
          title={'Privacy Policy'}
          isSearch={false}
          enableBack
          isProfileVisible={false}
          isNotificationVisible={false}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}>
          {privacyPolicy && (
            <RenderHtml
              contentWidth={width}
              source={{
                html: `${privacyPolicy}`,
              }}
              tagsStyles={tagsStyles}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingRight: moderateScale(10),
    borderBottomWidth: moderateScale(2),
    borderBottomColor: Colors.Linen,
    height: moderateScale(80),
    gap: moderateScale(10),
  },
  title: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(16),
    color: Colors.Aztec_Gold,
  },
});
