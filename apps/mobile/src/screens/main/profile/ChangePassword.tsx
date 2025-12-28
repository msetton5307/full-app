import React, {useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import {Colors, Fonts} from '../../../themes';
import {moderateScale} from '../../../utils/orientation';
import TextInput from '../../../components/TextInput';
import {CustomButtonSolid} from '../../../components/CustomButton';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import {showMessage} from '@app/utils/helper/Toast';
import {validatePassword, validMinLength} from '@app/utils/helper/Validation';
import {useAppDispatch} from '@app/redux';
import {changePasswordRequest} from '@app/utils/service/UserService';
import {goBack} from '@app/utils/helper/RootNaivgation';

const ChangePassword = () => {
  const dispatch = useAppDispatch();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateFields = () => {
    let isValid = true;

    if (oldPassword == '') {
      showMessage('Old Password is required.');
      isValid = false;
    } else if (!validMinLength.test(oldPassword)) {
      showMessage('Old Password must be at least 8 characters long.');
      isValid = false;
    } else if (newPassword == '') {
      showMessage('New Password is required.');
      isValid = false;
    } else if (!validMinLength.test(newPassword)) {
      showMessage('New Password must be at least 8 characters long.');
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      showMessage(
        'New Password must contain at least one number, one uppercase and one lowercase letter.',
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
  };

  async function handleSubmit() {
    if (validateFields()) {
      try {
        setIsLoading(true);
        const result = await dispatch(
          changePasswordRequest({
            old_password: oldPassword,
            new_password: newPassword,
            confirm_password: newPassword,
          }),
        );

        setIsLoading(false);
        showMessage(result?.message);
        if (!result?.success) {
          return;
        } else {
          goBack();
        }
      } catch (error) {
        console.log('Error in handleSignIn:', error);
      }
    }
  }

  return (
    <GeneralTemplate isSearch={false} enableBack title="Change Password">
      <TextInput
        value={oldPassword}
        onChangeText={text => {
          setOldPassword(text);
        }}
        title="Old Password:"
        placeholder={'*************'}
        textType={'password'}
        mainContainerStyle={Css.w100}
      />
      <TextInput
        value={newPassword}
        onChangeText={text => {
          setNewPassword(text);
        }}
        title="New Password:"
        placeholder={'*************'}
        textType={'password'}
        mainContainerStyle={Css.w100}
      />
      <TextInput
        value={confirmPassword}
        onChangeText={text => {
          setConfirmPassword(text);
        }}
        title="Confirm New Password:"
        placeholder={'*************'}
        textType={'password'}
        mainContainerStyle={Css.w100}
      />
      <CustomButtonSolid
        label="Save Profile"
        onPress={() => handleSubmit()}
        containerStyle={Css.w100}
      />
    </GeneralTemplate>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  profileImg: {
    height: moderateScale(112),
    width: moderateScale(112),
    borderRadius: moderateScale(80),
  },
  ProfileView: {
    height: moderateScale(130),
    width: moderateScale(130),
    borderRadius: moderateScale(100),
    backgroundColor: Colors.white,
    alignSelf: 'center',
    borderColor: Colors.white,
    borderWidth: moderateScale(4),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(20),
    shadowOpacity: 1,
    shadowColor: '#4514A517',
    elevation: 5,
  },
  cameraIconContainer: {
    height: moderateScale(36),
    width: moderateScale(36),
    borderRadius: moderateScale(36),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderWidth: moderateScale(1.5),
    borderColor: Colors.Aztec_Gold,
  },
});
