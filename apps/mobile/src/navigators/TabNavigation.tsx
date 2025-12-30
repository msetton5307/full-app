import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Image, Platform, StyleSheet, Text, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {moderateScale} from '../utils/orientation';
import {Colors, Fonts} from '../themes';
import {TabNavigationScreen} from './TabNavigationScreen';
import useKeyboardVisible from '../utils/hooks/useKeyboardVisible';
import {RootTabParamList} from '../types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabNav = () => {
  const keyboardVisible = useKeyboardVisible();
  const styles = customStyles(keyboardVisible);
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        freezeOnBlur: true,
        tabBarStyle: styles.tabBarStyle,
        tabBarPosition: 'bottom',
        headerPressOpacity: 1,
      }}>
      {TabNavigationScreen?.map((item: any, index: number) => (
        <Tab.Screen
          name={item?.name}
          component={item?.component}
          options={{
            tabBarIcon: ({focused}) =>
              getTabBarIcon(focused, item, keyboardVisible),
          }}
          key={index}
        />
      ))}
    </Tab.Navigator>
  );
};

const getTabBarIcon = (
  focused: boolean,
  item: any,
  keyboardVisible: boolean,
) => {
  const styles = customStyles(keyboardVisible);
  const iconColor = focused ? Colors.black : Colors.Old_Silver;
  const notificationIconSize = moderateScale(22);
  const defaultIconSize = moderateScale(20);

  if (item?.name === 'Notification') {
    return (
      <View style={styles.iconContainer}>
        <Svg
          width={notificationIconSize}
          height={notificationIconSize}
          viewBox="0 0 24 24"
          fill="none">
          <Path
            d="M12 3.5c-2.761 0-5 2.239-5 5v3.7c0 .53-.21 1.04-.586 1.414L5 15.028C4.63 15.398 4.89 16 5.414 16H18.586c.524 0 .784-.602.414-.972l-1.414-1.414A2 2 0 0 1 17 12.2V8.5c0-2.761-2.239-5-5-5Z"
            stroke={iconColor}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M10 17.5a2 2 0 0 0 4 0"
            stroke={iconColor}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text
          style={{
            color: focused ? Colors.Aztec_Gold : Colors.Old_Silver,
            fontFamily: Fonts.PoppinsMedium,
            fontSize: moderateScale(11),
            marginTop: moderateScale(1),
          }}>
          {item?.title}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.iconContainer}>
      <Image
        style={[
          styles.iconStyle,
          {
            tintColor: focused ? Colors.black : undefined,
            height: defaultIconSize,
            width: defaultIconSize,
          },
        ]}
        source={item?.Icon}
        resizeMode="contain"
      />
      <Text
        style={{
          color: focused ? Colors.Aztec_Gold : Colors.Old_Silver,
          fontFamily: Fonts.PoppinsMedium,
          fontSize: moderateScale(11),
          marginTop: moderateScale(1),
        }}>
        {item?.title}
      </Text>
    </View>
  );
};

export default TabNav;

const customStyles = (keyboardVisible: boolean) =>
  StyleSheet.create({
    tabBarStyle: {
      paddingTop: '5%',
      paddingHorizontal: '5%',
      height: moderateScale(70),
      borderRadius: moderateScale(40),
      backgroundColor: Colors.white,
      width: '90%',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? moderateScale(40) : moderateScale(20),

      marginLeft: '5%',
      display: keyboardVisible ? 'none' : 'flex',
    },
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      height: moderateScale(30),
      width: moderateScale(80),
    },
    iconStyle: {
      height: moderateScale(20),
      width: moderateScale(20),
      objectFit: 'contain',
    },
  });
