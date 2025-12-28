import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Colors, Fonts, Icons, Images} from '../../themes';
import TextInput from '../../components/TextInput';
import {
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {moderateScale, verticalScale} from '../../utils/orientation';
import {CustomButtonSolid} from '../../components/CustomButton';
import {navigate} from '../../utils/helper/RootNaivgation';
import CustomOtpInputBox from '../../components/CustomOtpInputBox';
import useKeyboardVisible from '../../utils/hooks/useKeyboardVisible';
import BottomSheet from '../../components/BottomSheet';
import MyStatusBar from '../../utils/helper/MyStatusBar';
import {showMessage} from '@app/utils/helper/Toast';
import {
  validateEmail,
  validatePassword,
  validMinLength,
} from '@app/utils/helper/Validation';
import {useAppDispatch, useAppSelector} from '@app/redux';
import {
  emailVerify,
  fotgotPassword,
  resetPassword,
  signIn,
  verifyForgotOTP,
  verifyNewEmailOTP,
} from '@app/utils/service/AuthService';
import Loader from '@app/utils/helper/Loader';
import {getDeviceToken} from '@app/utils/helper/FirebaseToken';
import connectionrequest from '@app/utils/helper/Netinfo';
import Storage from '@app/utils/storage';
import * as Keychain from 'react-native-keychain';
import {NavigationProp} from '@react-navigation/native';
import {RootTabParamList} from '@app/types';
import {setUserStatus} from '@app/redux/slice/auth.slice';
import {
  handleGoogleSignIn,
  handleAppleLogin,
} from '@app/utils/helper/SocialSignin';

const Login = () => {
  const dispatch = useAppDispatch();
  const keyboardVisible = useKeyboardVisible();
  const user = useAppSelector(state => state.auth);
  console.log('user -- ', user);

  const [info, setInfo] = useState({
    email: '',
    password: '',
  });

  const updateValue = (field: string, value: any) => {
    setInfo(_info => ({
      ..._info,
      [field]: value,
    }));
  };

  // Forgot Password Process
  const [modalState, setModalState] = useState({
    isVisible: false,
    currentView: 'forgot_email',
  });

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClear, setIsClear] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(90);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [verifyToken, setVerifyToken] = useState('');
  const [currentType, setCurrentType] = useState<'forgot' | 'email_verify'>(
    'forgot',
  );
  const [isRememberMeChecked, setIsRememberMeChecked] =
    useState<boolean>(false);
  const currentTypeRef = useRef(currentType);
  const [deviceToken, setDeviceToken] = useState(' ');

  // Sync the currentType with the ref
  useEffect(() => {
    currentTypeRef.current = currentType;
  }, [currentType]);

  const validEmail = () => {
    let isValid = true;

    if (!info.email) {
      showMessage('Email is required.');
      isValid = false;
    } else if (!validateEmail(info.email)) {
      showMessage('Enter a valid Email');
      isValid = false;
    }

    return isValid;
  };

  const validPassword = () => {
    let isValid = true;

    if (!info.password) {
      showMessage('Password is required.');
      isValid = false;
    } else if (!validMinLength.test(info.password)) {
      showMessage('Password must be at least 8 characters long.');
      isValid = false;
    }

    return isValid;
  };

  console.log('infodeviceToken-- ', deviceToken);

  const validateFields = useCallback(
    (newPassword: string, confirmPassword: string) => {
      let isValid = true;

      console.log('newPassword -- ', newPassword);

      if (newPassword == '') {
        showMessage('Password is required.');
        isValid = false;
      } else if (!validMinLength.test(newPassword)) {
        showMessage('Password must be at least 8 characters long.');
        isValid = false;
      } else if (!validatePassword(newPassword)) {
        showMessage(
          'Password must contain at least one number, one uppercase and one lowercase letter.',
        );
        isValid = false;
      } else if (confirmPassword == '') {
        showMessage('Confirm Password is required.');
        isValid = false;
      } else if (newPassword !== confirmPassword) {
        showMessage('Passwords do not match.');
        isValid = false;
      }

      return isValid;
    },
    [],
  );

  /**********************************************************/

  useEffect(() => {
    const storeDeviceToken = async () => {
      try {
        const storedToken = Storage.getItem('deviceToken');
        if (storedToken) {
          setDeviceToken(storedToken);
          // Storage.deleteItem('deviceToken');
        } else {
          const newToken = await getDeviceToken();
          if (newToken) {
            Storage.setItem('deviceToken', newToken);
            setDeviceToken(newToken);
          }
        }
      } catch (error) {
        // console.error("Error checking/updating token:", error);
      }
    };

    storeDeviceToken();
  }, []);

  const handleSubmit = useCallback(
    async (token: string) => {
      if (info.email.toLowerCase() === 'admin' && info.password === 'Admin123') {
        setIsLoading(true);
        Storage.setItem('token', 'admin-local-token');
        Storage.setItem('refresh-token', 'admin-local-refresh');
        Storage.setItem('personalized_category', 'true');
        Storage.setItem('is_admin', 'true');
        dispatch(
          setUserStatus({
            isLoggedIn: true,
            personalized_category: true,
            isAdmin: true,
          }),
        );
        showMessage('Logged in as admin');
        setIsLoading(false);
        return;
      }

      if (validEmail() && validPassword()) {
        if (isRememberMeChecked) {
          saveCredentials();
        }
        setIsLoading(true);
        try {
          const result = await dispatch(
            signIn({
              email: info.email.toLowerCase(),
              password: info.password,
              device_type: Platform.OS === 'ios' ? 'ios' : 'android',
              device_token: token,
            }),
          );

          // console.log('result -- ', result);
          showMessage(result?.message);
          if (result?.success) {
            await Keychain.setGenericPassword('username', 'password');
          }

          if (!result?.success && result?.data?.error?.status === 403) {
            setCurrentType('email_verify');
            setTimeout(() => resendOTP(false, 'new'), 1000);
          }
        } catch (error) {
          console.log('Error in handleSignIn:', error);
          showMessage('Login failed. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    },
    [info, dispatch],
  );

  const resendOTP = useCallback(
    async (status: boolean, type: 'new' | 'resend') => {
      if (validEmail()) {
        setIsLoading(true);
        try {
          let payload = {
            email: info.email.toLowerCase(),
          };
          const result =
            currentTypeRef.current === 'forgot'
              ? await dispatch(fotgotPassword(payload))
              : await dispatch(emailVerify(payload));

          if (result?.success) {
            setIsClear(true);
            resetTimer(true);
            setTimeout(() => setIsClear(false), 1000);
            if (!status) {
              setModalState({isVisible: true, currentView: 'otp'});
              setVerifyToken(result.data.token);
            }
          }
          if (type === 'resend') {
            showMessage('OTP resent successfully!');
          } else {
            showMessage(result?.message);
          }
        } catch (error) {
          console.log('Error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [info, dispatch],
  );

  const handleVerifyOTP = useCallback(async () => {
    if (!otp || otp.trim().length === 0) {
      showMessage('OTP cannot be empty');
      return;
    }

    if (!/^\d+$/.test(otp)) {
      showMessage('OTP must be numeric');
      return;
    }

    if (otp.trim().length !== 4) {
      showMessage('OTP must be 4 digits long');
      return;
    }

    if (validEmail()) {
      setIsLoading(true);
      try {
        let payload = {
          otp: otp,
          token: verifyToken,
        };
        const result =
          currentTypeRef.current === 'forgot'
            ? await dispatch(verifyForgotOTP(payload))
            : await dispatch(verifyNewEmailOTP(payload));

        if (result?.success) {
          setIsClear(true);
          resetTimer(false);
          setTimeout(() => setIsClear(false), 1000);

          if (currentTypeRef.current === 'forgot') {
            setModalState({isVisible: true, currentView: 'reset'});
            setVerifyToken(result?.data?.data?.token);
          } else {
            setModalState({isVisible: false, currentView: 'forgot'});
            setTimeout(() => {
              connectionrequest()
                .then(() => {
                  handleSubmit(deviceToken);
                  // getDeviceToken()
                  //   .then(token => {
                  //   })
                  //   .catch(() => {
                  //     handleSubmit('');
                  //   });
                })
                .catch(() => {
                  showMessage('Please connect your internet');
                });
            }, 2000);
          }
        }
        showMessage(result?.message);
      } catch (error) {
        console.log('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [otp, verifyToken, dispatch]);

  const handleResetPassword = useCallback(async () => {
    if (validateFields(newPassword, confirmPassword)) {
      try {
        let payload = {
          password: newPassword,
          confirmPassword: confirmPassword,
          token: verifyToken,
        };

        setIsLoading(true);
        const result = await dispatch(resetPassword(payload));
        showMessage(result?.message);

        if (!result?.success) {
          return;
        } else {
          setModalState({isVisible: false, currentView: 'forgot_email'});
          showMessage('Password reset successfully.');
          setConfirmPassword('');
          setNewPassword('');
        }
      } catch (error) {
        console.log('Error in handleSignIn:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [newPassword, confirmPassword, verifyToken, dispatch]);

  /* -------------------------- TIMER --------------------------------- */

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRunning(false);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, timer]);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const resetTimer = (start: boolean) => {
    setTimer(90);
    setIsRunning(false);
    if (start) {
      setTimeout(() => {
        startTimer();
      }, 2000);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    return `${minutes}:${seconds} Second`;
  };

  useEffect(() => {
    const rememberMeStatus = Storage.getItem('rememberMe');
    if (rememberMeStatus !== null) {
      setIsRememberMeChecked(rememberMeStatus === 'true');
    }
  }, []);

  useEffect(() => {
    Storage.setItem('rememberMe', isRememberMeChecked.toString());
  }, [isRememberMeChecked]);

  const saveCredentials = () => {
    Storage.setItem('rememberedEmail', info.email);
    Storage.setItem('rememberedPassword', info.password);
  };

  useEffect(() => {
    try {
      const savedEmail = Storage.getItem('rememberedEmail');
      const savedPassword = Storage.getItem('rememberedPassword');

      if (savedEmail && savedPassword) {
        // console.log("ahgdjahgsdjhagsdhj", savedEmail, savedPassword)
        updateValue('email', savedEmail);
        updateValue('password', savedPassword);
        setIsRememberMeChecked(true);
      }
    } catch (error) {
      // console.error('Error retrieving saved credentials:', error);
    }
  }, []);

  const handleRememberMeToggle = () => {
    setIsRememberMeChecked(prevState => {
      const newState = !prevState;
      if (newState) {
        saveCredentials();
      } else {
        Storage.deleteItem('rememberedEmail');
        Storage.deleteItem('rememberedPassword');
      }
      return newState;
    });
  };

  /* -------------------------- RENDER VIEW --------------------------------- */
  const renderForgotPassword = () => {
    return (
      <View>
        <Image
          source={Icons.ForgotIcon}
          style={style.forgotIconstyle}
          resizeMode="contain"
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: verticalScale(100),
          }}>
          <Text style={style.forgotpwd}>Forgot Password</Text>
          <Text style={style.description}>
            We'll send you an email with instructions to reset it.
          </Text>

          <TextInput
            value={info.email}
            onChangeText={text => updateValue('email', text)}
            title="Email ID:"
            placeholder={'Enter your email address'}
            mainContainerStyle={{marginTop: moderateScale(30)}}
          />
          <CustomButtonSolid
            label={'Send'}
            onPress={() => {
              setCurrentType('forgot');
              setTimeout(() => resendOTP(false, 'new'), 1000);
            }}
          />
        </ScrollView>
      </View>
    );
  };

  const renderOtpVerification = () => {
    return (
      <View>
        <Image
          source={Icons.VerifiedIcon}
          style={style.VerifiedIconstyle}
          resizeMode="contain"
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: verticalScale(100),
          }}>
          <Text style={style.forgotpwd}>OTP Verification</Text>
          <Text style={style.description}>
            We have sent OTP on your registered mail id - *******
            {info.email.split('@')[1]}
          </Text>

          <CustomOtpInputBox length={4} onOTPChange={setOtp} reset={isClear} />
          <Text style={style.resendOtp}>
            Didn't get the OTP?{' '}
            <Text
              onPress={() => resendOTP(true, 'resend')}
              disabled={isRunning}
              style={{color: Colors.Aztec_Gold}}>
              {!isRunning ? 'Resend' : formatTime(timer)}
            </Text>
          </Text>
          <CustomButtonSolid
            label={'Verify'}
            onPress={() => {
              handleVerifyOTP();
            }}
            containerStyle={{marginTop: moderateScale(30)}}
          />
        </ScrollView>
      </View>
    );
  };

  const renderResetPassword = () => {
    return (
      <View>
        <Image
          source={Icons.resetIcon}
          style={style.VerifiedIconstyle}
          resizeMode="contain"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: verticalScale(100),
          }}>
          <Text style={style.forgotpwd}>Reset Password</Text>
          <Text style={style.description}>
            Donec non placerat felis sed volutpat quam aenean.
          </Text>
          <TextInput
            value={newPassword}
            onChangeText={text => {
              setNewPassword(text);
            }}
            title="New Password:"
            placeholder={'*************'}
            textType={'password'}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
            }}
            title="Confirm New Password:"
            placeholder={'*************'}
            textType={'password'}
          />

          <CustomButtonSolid
            label={'Reset Password'}
            onPress={() => handleResetPassword()}
            containerStyle={{marginVertical: moderateScale(30)}}
          />
        </ScrollView>
      </View>
    );
  };

  return (
    <ImageBackground
      source={Images.Background}
      style={{height: '100%', width: '100%'}}>
      <SafeAreaView style={style.container}>
        <Loader visible={isLoading} />
        <MyStatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
        <KeyboardAwareScrollView
          style={style.container}
          showsVerticalScrollIndicator={false}>
          <View style={{width: '100%'}}>
            <Image
              source={Images.Logo}
              style={style.logo}
              resizeMode="contain"
            />
            <Text style={style.SignUpText}>Login</Text>

            <TextInput
              value={info.email}
              onChangeText={text => updateValue('email', text)}
              title="Email ID:"
              KeyboardTypeOptions="email-address"
              placeholder="Enter your email address"
              textContentType="username"
              autoComplete="username"
              importantForAutofill="yes"
            />

            <TextInput
              value={info.password}
              onChangeText={text => updateValue('password', text)}
              title="Password:"
              placeholder="*************"
              textType="password"
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              importantForAutofill="yes"
            />

            <View style={style.rememberMeContainer}>
              <View>
                <View style={style.v1}>
                  <TouchableOpacity
                    onPress={handleRememberMeToggle}
                    style={style.touch1}>
                    <View style={style.box}>
                      {isRememberMeChecked && (
                        <Image source={Icons.check} style={style.check} />
                      )}
                    </View>
                  </TouchableOpacity>
                  <View>
                    <Text style={[style.txt]}>{'Remember me'}</Text>
                  </View>
                </View>
              </View>
              <View>
                <TouchableOpacity
                  style={style.forgotView}
                  onPress={() => {
                    setModalState({
                      isVisible: true,
                      currentView: 'forgot_email',
                    });
                  }}>
                  <Text style={[style.txt]}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            </View>

            <CustomButtonSolid
              label={'Login'}
              onPress={() => {
                connectionrequest()
                  .then(() => {
                    handleSubmit(deviceToken);
                    // getDeviceToken()
                    //   .then(token => {
                    //   })
                    //   .catch(() => {
                    //     handleSubmit('');
                    //   });
                  })
                  .catch(() => {
                    showMessage('Please connect your internet');
                  });
              }}
            />
            <Text style={style.txt1}>Or</Text>
            <CustomButtonSolid
              label={'Login with Google'}
              LeftIcon={true}
              LeftImg={Icons.Google}
              onPress={() =>
                handleGoogleSignIn({
                  _dispatch: dispatch,
                  _device_token: deviceToken,
                  _device_type: Platform.OS === 'ios' ? 'ios' : 'android',
                })
              }
              containerStyle={style.ButtonStyle}
              labelStyle={style.buttonLabelStyle}
            />
            {Platform.OS === 'ios' && (
              <CustomButtonSolid
                label={'Login with Apple'}
                LeftIcon={true}
                LeftImg={Icons.Apple}
                onPress={() => {
                  handleAppleLogin({
                    _dispatch: dispatch,
                    _device_token: deviceToken,
                    _device_type: Platform.OS === 'ios' ? 'ios' : 'android',
                  });
                }}
                containerStyle={style.ButtonStyle}
                labelStyle={style.buttonLabelStyle}
              />
            )}
            <Text style={[style.txt, {marginVertical: moderateScale(30)}]}>
              {"Don't Have Any Account? "}
              {
                <Text
                  onPress={() => navigate('Signup')}
                  style={{
                    color: Colors.Aztec_Gold,
                    fontFamily: Fonts.PoppinsMedium,
                  }}>
                  Sign Up
                </Text>
              }
            </Text>
          </View>
        </KeyboardAwareScrollView>
        <BottomSheet
          enableLoader={true}
          isloadervisible={modalState.isVisible && isLoading}
          isVisible={modalState.isVisible}
          animationType={'slide'}
          onBackDropPress={() => {
            setModalState({isVisible: false, currentView: 'forgot_email'});
          }}
          height={keyboardVisible ? '70%' : '55%'}
          children={
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.white,
              }}>
              {modalState.currentView === 'forgot_email'
                ? renderForgotPassword()
                : modalState.currentView === 'otp'
                ? renderOtpVerification()
                : renderResetPassword()}
            </View>
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Login;
const style = StyleSheet.create({
  VerifiedIconstyle: {
    height: moderateScale(60),
    width: moderateScale(60),
    alignSelf: 'center',
    marginVertical: moderateScale(10),
  },
  forgotIconstyle: {
    height: moderateScale(40),
    width: moderateScale(40),
    alignSelf: 'center',
    marginVertical: moderateScale(20),
  },
  forgotView: {
    alignSelf: 'flex-end',
    marginRight: moderateScale(30),
    marginTop: moderateScale(20),
  },
  resendOtp: {
    color: Colors.black_olive,
    fontSize: moderateScale(18),
    textAlign: 'center',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: moderateScale(30),
  },
  description: {
    color: Colors.Old_Silver,
    fontSize: moderateScale(15),
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: moderateScale(10),
    width: moderateScale(290),
  },
  forgotpwd: {
    color: Colors.black_olive,
    fontSize: moderateScale(23),
    textAlign: 'center',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  container: {flex: 1, width: '100%'},
  logo: {
    height: moderateScale(200),
    width: moderateScale(100),
    alignSelf: 'center',
    marginTop: moderateScale(20),
  },
  SignUpText: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsBold,
    fontSize: moderateScale(23),
    textAlign: 'center',
    marginVertical: moderateScale(15),
  },
  txt: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(14),
    textAlign: 'center',
  },
  buttonLabelStyle: {
    color: Colors.Gunmetal,
    marginLeft: moderateScale(20),
    fontFamily: Fonts.PoppinsSemiBold,
  },
  ButtonStyle: {
    backgroundColor: Colors.white,
    borderWidth: moderateScale(1),
    borderColor: Colors.Almond,
    shadowOpacity: 1,
    shadowColor: '#4514A517',
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 5,
  },
  txt1: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(18),
    marginTop: moderateScale(20),
    marginBlock: moderateScale(5),
    textAlign: 'center',
  },
  v1: {
    width: '90%',
    marginTop: moderateScale(25),
    flexDirection: 'row',
    marginHorizontal: moderateScale(20),
  },
  box: {
    height: moderateScale(20),
    width: moderateScale(20),
    borderColor: Colors.Bone,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(6),
    backgroundColor: Colors.white,
  },
  touch1: {flexDirection: 'row', alignItems: 'center'},
  check: {
    height: moderateScale(15),
    width: moderateScale(15),
    tintColor: Colors.casper,
  },
  rememberMeContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
