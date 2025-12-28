import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ImageBackground,
} from 'react-native';
import React, {useEffect} from 'react';
import {goBack} from '@app/utils/helper/RootNaivgation';
import Css from '@app/themes/Css';
import {Colors, Fonts, Icons, Images} from '@app/themes';
import {moderateScale} from '@app/utils/orientation';
import MyStatusBar from '@app/utils/helper/MyStatusBar';
import {useAppDispatch} from '@app/redux';
import {useIsFocused} from '@react-navigation/native';
import RenderHtml, {MixedStyleDeclaration} from 'react-native-render-html';
import {getTermsAndConditions} from '@app/utils/service/AuthService';
import Header from '@app/components/Header';

const TermsCondition = () => {
  const {width, height} = useWindowDimensions();
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const [termsAndConditions, setTermsAndConditions] = React.useState<any>({});

  useEffect(() => {
    if (isFocused) {
      fetchTermsAndConditions();
    }
  }, [isFocused]);

  const fetchTermsAndConditions = async () => {
    try {
      const result = await dispatch(getTermsAndConditions());
      setTermsAndConditions(result?.data?.content);
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
          title={'Terms & Conditions'}
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
          {termsAndConditions && (
            <RenderHtml
              contentWidth={width}
              source={{
                html: `${termsAndConditions}`,
              }}
              tagsStyles={tagsStyles}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default TermsCondition;
