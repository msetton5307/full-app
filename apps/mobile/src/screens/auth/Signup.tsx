import React, {useCallback, useEffect, useState} from 'react';
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
import {Colors, Fonts, Icons, Images} from '../../themes';
import {moderateScale, verticalScale} from '../../utils/orientation';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import TextInput from '../../components/TextInput';
import {CustomButtonSolid} from '../../components/CustomButton';
import {goBack, navigate} from '../../utils/helper/RootNaivgation';
import MyStatusBar from '../../utils/helper/MyStatusBar';
import Css from '../../themes/Css';
import {showMessage} from '@app/utils/helper/Toast';
import {
  validateEmail,
  validatePassword,
  validMinLength,
} from '@app/utils/helper/Validation';
import {useAppDispatch} from '@app/redux';
import {
  emailVerify,
  signIn,
  signUp,
  verifyNewEmailOTP,
} from '@app/utils/service/AuthService';
import Loader from '@app/utils/helper/Loader';
import CustomOtpInputBox from '@app/components/CustomOtpInputBox';
import BottomSheet from '@app/components/BottomSheet';
import useKeyboardVisible from '@app/utils/hooks/useKeyboardVisible';
import Storage from '@app/utils/storage';
import {
  handleAppleLogin,
  handleGoogleSignIn,
} from '@app/utils/helper/SocialSignin';

interface SignUpProps {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const dispatch = useAppDispatch();
  const keyboardVisible = useKeyboardVisible();

  const [isAcceptTerms, setIsAcceptTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [isClear, setIsClear] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(90);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [verifyToken, setVerifyToken] = useState('');
  const [deviceToken, setDeviceToken] = useState('');

  const [info, setInfo] = useState<SignUpProps>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const updateValue = (field: string, value: string) => {
    setInfo(inf => ({
      ...inf,
      [field]: value,
    }));
  };

  const validateFields = () => {
    let isValid = true;

    if (info.fullName == '') {
      showMessage('Full name is required');
      isValid = false;
    } else if (info.fullName.length < 2 || info.fullName.length > 15) {
      showMessage('Full name should be between 2 and 15 characters');
      isValid = false;
    } else if (info.email == '') {
      showMessage('Email is required');
      isValid = false;
    } else if (!validateEmail(info.email)) {
      showMessage('Please enter a valid email address');
      isValid = false;
    } else if (info.password == '') {
      showMessage('Password is required.');
      isValid = false;
    } else if (!validMinLength.test(info.password)) {
      showMessage('Password must be at least 8 characters long.');
      isValid = false;
    } else if (!validatePassword(info.password)) {
      showMessage(
        'Password must contain at least one number, one uppercase and one lowercase letter.',
      );
      isValid = false;
    } else if (info.confirmPassword == '') {
      showMessage('Confirm Password is required.');
      isValid = false;
    } else if (info.password !== info.confirmPassword) {
      showMessage('Passwords do not match.');
      isValid = false;
    } else if (!isAcceptTerms) {
      showMessage('You must accept the terms and conditions.');
      isValid = false;
    }

    return isValid;
  };

  useEffect(() => {
    const storedToken = Storage.getItem('deviceToken');
    if (storedToken) {
      setDeviceToken(storedToken);
    }
  }, []);

  async function handleSubmit() {
    if (validateFields()) {
      try {
        setIsLoading(true);
        let signUpObj = {
          fullName: info.fullName,
          email: info.email.toLowerCase(),
          password: info.password,
          confirmPassword: info.confirmPassword,
          isAcceptAllPolicies: isAcceptTerms,
        };
        console.log('signUpObj -- ', signUpObj);
        const result = await dispatch(signUp(signUpObj));

        showMessage(result?.message);
        if (result?.success) {
          verifyNewEmail('new');
        }
      } catch (error) {
        console.log('Error in handleSignIn:', error);
      }
    }
  }

  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(
        signIn({
          email: info.email.toLowerCase(),
          password: info.password,
          device_type: Platform.OS === 'ios' ? 'ios' : 'android',
          device_token: deviceToken,
        }),
      );

      showMessage(result?.message);
    } catch (error) {
      showMessage('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [info, dispatch]);

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

  /* -------------------------- RENDER VIEW --------------------------------- */
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
              onPress={() => verifyNewEmail('resend')}
              disabled={isRunning}
              style={{color: Colors.Aztec_Gold}}>
              {!isRunning ? 'Resend' : formatTime(timer)}
            </Text>
          </Text>
          <CustomButtonSolid
            label={'Verify'}
            onPress={() => handleVerifyOTP()}
            containerStyle={{marginTop: moderateScale(30)}}
          />
        </ScrollView>
      </View>
    );
  };

  /* --------------------------- Verify ----------------------------------- */
  const verifyNewEmail = useCallback(
    async (type: 'new' | 'resend') => {
      setIsLoading(true);
      try {
        const result = await dispatch(
          emailVerify({
            email: info.email.toLowerCase(),
          }),
        );

        if (result?.success) {
          setIsClear(true);
          resetTimer(true);
          setIsVisible(true);
          setVerifyToken(result.data.token);
          setTimeout(() => setIsClear(false), 1000);
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

    setIsLoading(true);
    try {
      const result = await dispatch(
        verifyNewEmailOTP({
          otp: otp,
          token: verifyToken,
        }),
      );

      if (result?.success) {
        setIsClear(true);
        setIsVisible(false);
        resetTimer(false);
        setTimeout(() => {
          handleLogin();
        }, 1000);
      }
      showMessage(result?.message);
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [otp, verifyToken, dispatch]);

  return (
    <ImageBackground source={Images.Background} style={[Css.h100, Css.w100]}>
      <SafeAreaView style={style.container}>
        {/* <MyStatusBar
          backgroundColor={Colors.dark_blue}
          barStyle={'dark-content'}
        /> */}
        <MyStatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
        <Loader visible={isLoading} />
        <KeyboardAwareScrollView
          style={style.container}
          showsVerticalScrollIndicator={false}>
          <View style={Css.w100}>
            <Image
              source={Images.Logo}
              style={style.logo}
              resizeMode="contain"
            />
            <Text style={style.SignUpText}>Sign Up</Text>

            <TextInput
              value={info.fullName}
              onChangeText={v => updateValue('fullName', v)}
              title="Full Name:"
              placeholder={'Enter your name'}
            />
            <TextInput
              value={info.email}
              onChangeText={v => updateValue('email', v)}
              title="Email ID:"
              placeholder={'Enter your email address'}
              textContentType="username"
              autoComplete="username"
            />
            <TextInput
              value={info.password}
              onChangeText={v => updateValue('password', v)}
              title="Desired Password:"
              placeholder={'*************'}
              textType={'password'}
            />
            <TextInput
              value={info.confirmPassword}
              onChangeText={v => updateValue('confirmPassword', v)}
              title="Confirm Password:"
              placeholder={'*************'}
              textType={'password'}
            />
            <View style={style.v1}>
              <TouchableOpacity
                onPress={() => setIsAcceptTerms(!isAcceptTerms)}
                style={style.touch1}>
                <View style={style.box}>
                  {isAcceptTerms && (
                    <Image source={Icons.check} style={style.check} />
                  )}
                </View>
              </TouchableOpacity>
              <View>
                <Text style={[style.txt]}>
                  {' Accept '}
                  {
                    <Text
                      style={{color: Colors.Aztec_Gold}}
                      onPress={() => {
                        navigate('TermsCondition');
                      }}>
                      Terms and Conditions
                    </Text>
                  }
                  {' to sign up'}
                </Text>
              </View>
            </View>
            <CustomButtonSolid
              label={'Sign Up'}
              onPress={() => {
                handleSubmit();
                // navigate('CategoryKeyword');
              }}
            />
            <Text style={style.txt1}>Or</Text>
            <CustomButtonSolid
              label={'Sign Up with Google'}
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
                label={'Sign Up with Apple'}
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

            <Text style={[style.txt, {marginVertical: moderateScale(30),textAlign: 'center'}]}>
              {'Already have an account? '}
              {
                <Text
                  onPress={() => goBack()}
                  style={{
                    color: Colors.Aztec_Gold,
                    fontFamily: Fonts.PoppinsMedium,
                  }}>
                  Login
                </Text>
              }
            </Text>
          </View>
        </KeyboardAwareScrollView>
        <BottomSheet
          enableLoader={true}
          isloadervisible={isVisible && isLoading}
          isVisible={isVisible}
          animationType={'slide'}
          onBackDropPress={() => {
            // setIsVisible(false);
          }}
          height={keyboardVisible ? '70%' : '55%'}
          children={
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.white,
              }}>
              {renderOtpVerification()}
            </View>
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Signup;

const style = StyleSheet.create({
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
  txt: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(14),
    textAlign: 'left',
  },
  txt1: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(18),
    marginTop: moderateScale(20),
    marginBlock: moderateScale(5),
    textAlign: 'center',
  },
  VerifiedIconstyle: {
    height: moderateScale(60),
    width: moderateScale(60),
    alignSelf: 'center',
    marginVertical: moderateScale(10),
  },
  forgotpwd: {
    color: Colors.black_olive,
    fontSize: moderateScale(23),
    textAlign: 'center',
    fontFamily: Fonts.PoppinsSemiBold,
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
  resendOtp: {
    color: Colors.black_olive,
    fontSize: moderateScale(18),
    textAlign: 'center',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: moderateScale(30),
  },
});
