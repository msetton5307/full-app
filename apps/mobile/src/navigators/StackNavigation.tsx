import React from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {createStackNavigator, StackScreenProps} from '@react-navigation/stack';
import {useAppSelector} from '../redux';
import {RootStackParamList} from '../types';
import Splash from '../screens/auth/Splash';
import {navigationRef} from '../utils/helper/RootNaivgation';
import Signup from '../screens/auth/Signup';
import Login from '../screens/auth/Login';
import CategoryKeyword from '../screens/auth/CategoryKeyword';
import TabNav from './TabNavigation';
import Profile from '../screens/main/profile';
import Payout from '../screens/main/profile/Payout';
import TermsCondition from '../screens/main/settings/TermsCondition';
import PrivacyPolicy from '../screens/main/settings/PrivacyPolicy';
import EditProfile from '../screens/main/profile/EditProfile';
import PayoutHistory from '../screens/main/profile/PayoutHistory';
import ChangePassword from '../screens/main/profile/ChangePassword';
import FavouriteDeals from '../screens/main/profile/FavouriteDeals';
import ContactUs from '../screens/main/profile/ContactUs';
import EditPost from '@app/screens/main/post/EditPost';

const Stack = createStackNavigator<RootStackParamList>();

export default function StackNavigation() {
  const AuthState = useAppSelector(state => state.auth);

  const theme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'white',
    },
  };

  const AuthScreens = {
    Login: Login,
    Signup: Signup,
    TermsCondition: TermsCondition,
  };

  const OnBoard = {
    CategoryKeyword: CategoryKeyword,
  };

  const MainScreens = {
    TabNav: TabNav,
    Profile: Profile,
    Payout: Payout,
    TermsCondition: TermsCondition,
    PrivacyPolicy: PrivacyPolicy,
    EditProfile: EditProfile,
    PayoutHistory: PayoutHistory,
    ChangePassword: ChangePassword,
    FavouriteDeals: FavouriteDeals,
    ContactUs: ContactUs,
    EditPost: EditPost,
  };

  // console.log(
  //   '!AuthState.isLoggedIn && !AuthState.personalized_category -- ',
  //   AuthState.isLoggedIn,
  //   AuthState.personalized_category,
  // );

  const Screens =
    !AuthState.isLoggedIn 
      ? AuthScreens
      : MainScreens;

  if (AuthState.loading) {
    return <Splash />;
  } else {
    return (
      <NavigationContainer ref={navigationRef} theme={theme}>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {Object.entries(Screens).map(([name, component], index) => (
            <Stack.Screen
              key={index}
              name={name as keyof RootStackParamList} // Casting the name to RootStackParamList keys
              component={
                component as React.ComponentType<
                  StackScreenProps<RootStackParamList>
                >
              } // Casting the component type
              // options={{gestureEnabled: false}}
            />
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
