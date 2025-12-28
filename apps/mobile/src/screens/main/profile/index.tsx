import React, {useState} from 'react';
import {Alert, Image, StyleSheet, Text, View} from 'react-native';
import {Colors, Fonts, Images} from '../../../themes';
import {moderateScale} from '../../../utils/orientation';
import TextInput from '../../../components/TextInput';
import {CustomButtonOutline} from '../../../components/CustomButton';
import {navigate} from '../../../utils/helper/RootNaivgation';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import {useAppDispatch, useAppSelector} from '@app/redux';
import {IMAGES_BUCKET_URL} from '@app/utils/constants';
import {deleteUserAccount} from '@app/utils/service/UserService';
import {showMessage} from '@app/utils/helper/Toast';
import {logout} from '@app/utils/service/AuthService';

const Profile = () => {
  const dispatch = useAppDispatch();
  const userDetails = useAppSelector(userState => userState.user.userInfo);
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeleteAccount() {
    setIsLoading(true);
    const result = await dispatch(deleteUserAccount());

    setIsLoading(false);
    showMessage(result?.message);
    if (!result?.success) {
      return;
    } else {
      const res = await dispatch(logout());
    }
  }

  return (
    <GeneralTemplate enableBack isSearch={false} isProfileVisible={false} title='Profile' >
      <View style={style.ProfileView}>
        <Image
          source={
            userDetails?.profile_image
              ? {
                  uri: IMAGES_BUCKET_URL.profile.concat(
                    userDetails?.profile_image,
                  ),
                }
              : Images.user
          }
          style={style.profileImg}
        />
      </View>
      <TextInput
        value={''}
        title="Full Name:"
        placeholder={`${userDetails?.fullName || ''}`}
        editable={false}
        mainContainerStyle={Css.w100}
      />
      <TextInput
        value={''}
        title="Email ID:"
        placeholder={`${userDetails?.email || ''}`}
        editable={false}
        mainContainerStyle={Css.w100}
      />
      <CustomButtonOutline
        label="Edit Profile"
        onPress={() => {
          navigate('EditProfile');
        }}
        containerStyle={Css.w100}
      />
      <CustomButtonOutline
        label="Change Password"
        onPress={() => {
          navigate('ChangePassword');
        }}
        containerStyle={Css.w100}
      />
      <CustomButtonOutline
        label="Favorite Deal"
        onPress={() => {
          navigate('FavouriteDeals');
        }}
        containerStyle={Css.w100}
      />
      <CustomButtonOutline
        label="Payout Details"
        onPress={() => {
          navigate('Payout');
        }}
        containerStyle={Css.w100}
      />
      <CustomButtonOutline
        label="Payout History"
        onPress={() => {
          navigate('PayoutHistory');
        }}
        containerStyle={Css.w100}
      />
      <CustomButtonOutline
        label="Delete Account"
        onPress={() => {
          Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete your account?',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'Delete',
                onPress: () => {
                  handleDeleteAccount();
                },
                style: 'destructive',
              },
            ],
            {cancelable: true},
          );
        }}
        containerStyle={Css.w100}
      />
      <CustomButtonOutline
        label="Contact Us"
        onPress={() => navigate('ContactUs')}
        containerStyle={Css.w100}
      />
    </GeneralTemplate>
  );
};

export default Profile;
const style = StyleSheet.create({
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
});
