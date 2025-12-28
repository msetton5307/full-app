import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import StackNavigation from './src/navigators/StackNavigation';
import * as Sentry from '@sentry/react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PermissionsAndroid, StatusBar} from 'react-native';
import {Colors} from './src/themes';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {Platform} from 'react-native';
import {getDeviceToken} from './src/utils/helper/FirebaseToken';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {navigate} from './src/utils/helper/RootNaivgation';
// import Testing from './src/screens/Testing'

Sentry.init({
  dsn: 'https://04452149dba9ca85478cb2fe763cade7@o4508330395828224.ingest.us.sentry.io/4508692041039872',
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  // debug: false,
  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const App = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '709705813616-a6ogf2mefs3vt8qa8n05dfjhopg0v3ub.apps.googleusercontent.com',
      iosClientId:
        '709705813616-s3kuepih4ne7fdt3iu2q4n4dp9sg8tdu.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      profileImageSize: 120,
    });
  }, []);

  async function requestUserPermission() {
    await notifee.requestPermission();
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  useEffect(() => {
    // Foreground FCM message handler
    const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM notification arrived!', remoteMessage);

      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });

      await notifee.displayNotification({
        title: remoteMessage?.notification?.title,
        body: remoteMessage?.notification?.body,
        android: Platform.OS === 'android' ? {channelId} : undefined,
      });
    });

    // Notifee foreground notification click
    const unsubscribeForeground = notifee.onForegroundEvent(
      ({type, detail}) => {
        if (type === EventType.PRESS) {
          navigate('Notification');
        }
      },
    );

    // FCM notification opened from background
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('Notification opened from background:', remoteMessage);
        navigate('Notification');
      },
    );

    // FCM notification opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification opened from quit state:', remoteMessage);
          navigate('Notification');
        }
      });

    return () => {
      unsubscribeMessage();
      unsubscribeForeground();
      unsubscribeNotificationOpened();
    };
  }, []);

  useEffect(() => {
    async function requestAndroidPermissions() {
      if (Platform.OS === 'android') {
        console.log('Requesting Android permissions... opened');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      }
    }

    requestAndroidPermissions();
  }, []);

  useEffect(() => {
    getDeviceToken()
      .then(token => {
        console.log(token);
      })
      .catch(err => {
        console.log(err);
      });
    setTimeout(() => {
      requestUserPermission();
    }, 1500);
  }, []);


  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={Colors.Seashell} barStyle={'dark-content'} />
      <StackNavigation />
    </SafeAreaProvider>
  );
};

export default Sentry.wrap(App);
