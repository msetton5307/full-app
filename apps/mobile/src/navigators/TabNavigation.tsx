import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Image, Platform, StyleSheet, Text, View} from 'react-native';
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
  return (
    <View style={styles.iconContainer}>
      <Image
        style={[
          styles.iconStyle,
          {
            tintColor: focused ? 'black' : undefined,
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
