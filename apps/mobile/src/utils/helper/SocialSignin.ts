import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { showMessage } from './Toast';
import { Dispatch } from '@reduxjs/toolkit';
import { NavigationProp } from '@react-navigation/native';
import { socialSignInApiCall } from '../service/AuthService';
import { SIGN_IN_TYPE_SOCIAL } from '@app/types';
import appleAuth from '@invertase/react-native-apple-authentication';
import base64 from 'base-64';



interface HandleGoogleSignInParams {
  _dispatch: Dispatch<any>;
  _device_token: string;
  _device_type: string;
}
interface HandleAppleLoginParams {
  _dispatch: Dispatch<any>;
  _device_token: string;
  _device_type: string;
}

export const handleGoogleSignIn = async ({
  _dispatch,
  _device_token,
  _device_type,
}: HandleGoogleSignInParams) => {
  try {
    console.log('Initiating Google Sign In...', _device_token);

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    await GoogleSignin.signOut();

    const resp = await GoogleSignin.signIn();

    const googleData = (resp as any).data;

    if (googleData?.idToken && googleData?.user?.id) {
      const socialPayload: SIGN_IN_TYPE_SOCIAL = {
        identityToken: googleData.idToken,
        socialId: googleData.user.id,
        email: googleData.user.email,
        fullName: `${googleData.user.givenName ?? ''} ${googleData.user.familyName ?? ''}`.trim(),
        registerType: 'Google',
        image_url: googleData.user.photo,
        device_token: _device_token,
        device_type: _device_type,
      };

      await _dispatch(socialSignInApiCall(socialPayload));
    } else {
      showMessage('Google Sign-In failed to return valid credentials.');
    }

  } catch (err: any) {
    console.error('Google sign-in error:', err);
    showMessage('Something went wrong!');
  }
};




export const handleAppleLogin = async ({
  _dispatch,
  _device_token,
  _device_type,
}: HandleAppleLoginParams) => {
  try {
    const _resp = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    // console.log('Apple sign-in response:', _resp);

    let decodedPayload: any = {};
    if (_resp?.identityToken) {
      const payloadPart = _resp.identityToken.split('.')[1];
      if (payloadPart) {
        decodedPayload = JSON.parse(base64.decode(payloadPart));
      }
    }

    // console.log('Decoded payload:', decodedPayload);

    const email = _resp?.email || decodedPayload?.email || '';
    let fullName = '';
    if (_resp?.fullName?.givenName) {
      fullName += _resp?.fullName?.givenName;
    }
    if (_resp?.fullName?.middleName) {
      fullName = fullName + ' ' + _resp?.fullName?.middleName;
    }
    if (_resp?.fullName?.familyName) {
      fullName = fullName + ' ' + _resp?.fullName?.familyName;
    }

    const obj: SIGN_IN_TYPE_SOCIAL = {
      email,
      fullName: fullName || '',
      identityToken: _resp?.identityToken || '',
      image_url: '',
      socialId: _resp?.user,
      registerType: 'Apple',
      device_token: _device_token,
      device_type: _device_type,
    };

    // console.log('Apple sign-in payload:', obj);

    await _dispatch(socialSignInApiCall(obj));
  } catch (_err: any) {
    console.error('Apple sign-in error:', _err);
    showMessage('Something went wrong!');
  }
};
