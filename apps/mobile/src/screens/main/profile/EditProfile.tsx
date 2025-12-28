import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Colors, Fonts, Icons, Images} from '../../../themes';
import {moderateScale} from '../../../utils/orientation';
import TextInput from '../../../components/TextInput';
import {CustomButtonSolid} from '../../../components/CustomButton';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import {useAppDispatch, useAppSelector} from '@app/redux';
import BottomSheet from '@app/components/BottomSheet';
import {getImageFromCamera, getImageFromGallery} from '@app/utils/helper';
import {showMessage} from '@app/utils/helper/Toast';
import {
  getUserDetails,
  updateUserInfoRequest,
} from '@app/utils/service/UserService';
import {UPDATE_USER_INFORMATION} from '@app/types';
import {goBack} from '@app/utils/helper/RootNaivgation';
import { IMAGES_BUCKET_URL } from '@app/utils/constants';

const EditProfile = () => {
  const dispatch = useAppDispatch();
  const userDetails = useAppSelector(userState => userState.user.userInfo);

  const [name, setname] = useState(userDetails?.fullName);
  const [email, setemail] = useState(userDetails?.email);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [profilePicture, setProfilePicture] = useState({
    imageUri: userDetails?.profile_image ? IMAGES_BUCKET_URL.profile.concat(userDetails?.profile_image) : '',
    imagePath: {},
  });

  console.log('profilePicture -- ',profilePicture);
  

  const validateFields = () => {
    let isValid = true;

    if (name.trim() == '') {
      showMessage('First name is required');
      isValid = false;
    } else if (name.length < 2 || name.length > 15) {
      showMessage('First name should be between 2 and 15 characters');
      isValid = false;
    }

    return isValid;
  };

  async function handleSubmit() {
    if (validateFields()) {
      try {
        setIsLoading(true);

        let obj: UPDATE_USER_INFORMATION = {
          fullName: name,
        };

        if (profilePicture.imagePath !== null) {
          obj.profile_image = profilePicture.imagePath;
        }

        const result = await dispatch(updateUserInfoRequest(obj));

        setIsLoading(false);
        showMessage(result?.message);
        if (!result?.success) {
          return;
        } else {
          const res = await dispatch(getUserDetails());
          if (res.success) {
            goBack();
          }
        }
      } catch (error) {
        console.log('Error in handleSignIn:', error);
      }
    }
  }

  return (
    <GeneralTemplate isSearch={false} enableBack title='Edit Profile'>
      <Text style={styles.textStyle}>Profile</Text>
      <View style={styles.ProfileView}>
        <Image
          source={
            profilePicture.imageUri
              ? {uri: profilePicture.imageUri}
              : Images.user
          }
          style={styles.profileImg}
        />
        <TouchableOpacity
          onPress={() => setIsVisible(true)}
          style={styles.cameraIconContainer}
          activeOpacity={0.8}>
          <Image source={Icons.camera} style={Css.icon20} />
        </TouchableOpacity>
      </View>
      <TextInput
        value={name}
        onChangeText={setname}
        title="Full Name:"
        placeholder={'Enter your full name'}
        mainContainerStyle={Css.w100}
      />
      <TextInput
        value={''}
        onChangeText={setemail}
        title="Email ID:"
        editable={false}
        placeholder={email}
        mainContainerStyle={Css.w100}
      />
      <CustomButtonSolid
        label="Save Profile"
        onPress={() => handleSubmit()}
        containerStyle={Css.w100}
      />

      <BottomSheet
        isVisible={isVisible}
        animationType={'slide'}
        onBackDropPress={() => setIsVisible(false)}
        height={'30%'}
        children={
          <View style={styles.v1}>
            <Text style={styles.t1}>Select Image</Text>

            {['Take Photo', 'Choose from Library...'].map((item, index) => {
              return (
                <CustomButtonSolid
                  key={index}
                  label={item}
                  onPress={() => {
                    setIsVisible(false);
                    setTimeout(() => {
                      if (index == 0) {
                        getImageFromCamera({
                          size: {width: 500, height: 500},
                          isCrop: true,
                          callback(res) {
                            if (res.uri !== '' && res.path !== null) {
                              setProfilePicture({
                                imageUri: res.uri,
                                imagePath: res.path,
                              });
                            }
                          },
                          cropperCircleOverlay: true,
                        });
                      } else {
                        getImageFromGallery({
                          size: {width: 500, height: 500},
                          isCrop: true,
                          callback(res) {
                            if (res.uri !== '' && res.path !== null) {
                              setProfilePicture({
                                imageUri: res.uri,
                                imagePath: res.path,
                              });
                            }
                          },
                          cropperCircleOverlay: true,
                        });
                      }
                    }, 1000);
                  }}
                  containerStyle={Css.w90}
                />
              );
            })}
          </View>
        }
      />
    </GeneralTemplate>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  textStyle: {
    color: Colors.black,
    textAlign: 'center',
    fontSize: moderateScale(16),
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: moderateScale(20),
  },
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
  v1: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  t1: {
    color: Colors.Aztec_Gold,
    textAlign: 'center',
    fontSize: moderateScale(16),
    fontFamily: Fonts.PoppinsMedium,
    marginTop: moderateScale(20),
  },
});
