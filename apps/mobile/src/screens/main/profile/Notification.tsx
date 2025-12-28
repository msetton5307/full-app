import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import {Colors, Fonts, Icons} from '../../../themes';
import {moderateScale, verticalScale} from '../../../utils/orientation';
import {useAppDispatch} from '@app/redux';
import {notification} from '@app/utils/service/UserService';
import {IMAGES_BUCKET_URL} from '@app/utils/constants';

const Notification = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [data, setData] = useState<any>([]);

  useEffect(() => {
    handlenotification();
  }, []);

  async function handlenotification() {
    try {
      setIsLoading(true);
      const result = await dispatch(notification(null));
      console.log(result, 'result');

      setIsLoading(false);
      if (result?.success) {
        setData(result?.data);
      }
    } catch (error) {
      console.log('Error in handleSignIn:', error);
    }
  }
  return (
    <GeneralTemplate
      enableBack
      isSearch={false}
      fixedComponent={<Text style={styles.textStyle}>Notification</Text>}>
      <View style={[Css.w100, Css.g8]}>
        {/* <NotificationPanel label={'Posted Deal Notification'} /> */}
        {/* <NotificationPanel label={'New Deal Notification'} /> */}
        {data?.notificationListing?.length > 0 ? (
          <NotificationPanel data={data} />
        ) : (
          <Text style={styles.empty}>{`No data found.`}</Text>
        )}
      </View>
    </GeneralTemplate>
  );
};

const NotificationPanel = ({data}: {data: any}) => {

  return (
    <>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>{'Posted Deal Notification'}</Text>
      </View>
      <View style={styles.dataContainer}>
        {data?.notificationListing?.map((item: any, index: number) => {
          return (
            <View
              style={[
                styles.rowContainer,
                index === 0 ? {borderTopWidth: moderateScale(0)} : {},
              ]}
              key={index}>
              <View style={styles.leftIconContainer}>
                <Image
                  resizeMode="contain"
                  style={Css.icon50}
                  source={{
                    uri: item?.isWeb
                      ? item?.notification_image
                      : `${IMAGES_BUCKET_URL.deals}${item?.notification_image}`,
                  }}
                />
              </View>
              <View style={[Css.f1]}>
                <Text style={styles.cardLabelText} numberOfLines={1}>
                  {item?.notification_title}
                </Text>
                <Text style={styles.cardDescText}>
                  {item?.isWeb
                    ? item?.notification_message
                    : item?.notification_description}
                </Text>

                <TouchableOpacity
                  disabled
                  style={[
                    styles.approvedButton,
                    {
                      backgroundColor:
                        item?.notification_message == 'Pending'
                          ? '#BDBDBD'
                          : item?.notification_message == 'Rejected'
                          ? '#DB8B8B'
                          : '#93B763',
                    },
                  ]}>
                  <Text style={styles.buttonText}>
                    {item?.isWeb ? item?.status : item?.notification_message}
                  </Text>
                </TouchableOpacity>

                {/* {index % 3 === 1 ? (
                  <TouchableOpacity style={styles.pendingButton}>
                    <Text style={styles.buttonText}>Pending</Text>
                  </TouchableOpacity>
                ) : null}
                {index % 3 === 2 ? (
                  <TouchableOpacity style={styles.rejectedButton}>
                    <Text style={styles.buttonText}>Rejected</Text>
                  </TouchableOpacity> */}
                {/* ) : null} */}
              </View>
              {item?.marked_as_read == false ? (
                <View style={styles.activeDot} />
              ) : null}
            </View>
          );
        })}
      </View>
    </>
  );
};

export default Notification;

const styles = StyleSheet.create({
  textStyle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    marginTop: moderateScale(20),
  },
  labelContainer: {
    paddingVertical: moderateScale(5),
    borderRadius: moderateScale(20),
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Soft_Peach,
    borderWidth: 1,
    borderColor: Colors.Bone,
    marginTop: moderateScale(10),
  },
  labelText: {
    paddingHorizontal: moderateScale(10),
    color: Colors.Dark_Aztec_Gold,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(14),
    flex: 1,
  },
  cardLabelText: {
    color: Colors.Dark_Aztec_Gold,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(14),
    width: moderateScale(210),
  },
  cardDescText: {
    color: Colors.Old_Silver,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(14),
    marginVertical: moderateScale(5),
    width: moderateScale(240),
  },
  priceText: {
    color: Colors.white,
    fontFamily: Fonts.PoppinsBold,
    fontSize: moderateScale(16),
  },
  rowContainer: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(20),
    gap: moderateScale(5),
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.Aztec_Gold,
  },
  leftIconContainer: {
    height: moderateScale(70),
    width: moderateScale(70),
    borderRadius: moderateScale(70),
    overflow: 'hidden',
    backgroundColor: Colors.gray_2,
    borderWidth: moderateScale(1),
    borderColor: Colors.gray_1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(5)
  },
  rightIconContainer: {
    height: moderateScale(50),
    width: moderateScale(50),
    borderRadius: moderateScale(50),
    overflow: 'hidden',
    backgroundColor: Colors.Aztec_Gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(2),
    borderColor: Colors.Dark_Aztec_Gold,
  },
  dataContainer: {
    width: '98%',
    borderRadius: moderateScale(10),
    backgroundColor: Colors.white,
    shadowOpacity: 1,
    shadowColor: '#4514A517',
    shadowOffset: {
      height: 0,
      width: 0,
    },
    elevation: 5,
    alignSelf: 'center',
  },
  approvedButton: {
    // height: moderateScale(24),
    // width: moderateScale(80),
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(5),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(2),
    maxWidth: '95%',
  },
  pendingButton: {
    height: moderateScale(24),
    width: moderateScale(80),
    backgroundColor: '#BDBDBD',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(5),
  },
  rejectedButton: {
    height: moderateScale(24),
    width: moderateScale(80),
    backgroundColor: '#DB8B8B',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(5),
  },
  buttonText: {
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.white,
    fontSize: moderateScale(11),
  },
  activeDot: {
    height: moderateScale(10),
    width: moderateScale(10),
    position: 'absolute',
    top: moderateScale(20),
    right: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: Colors.Aztec_Gold,
  },
  empty: {
    fontSize: moderateScale(16),
    color: 'grey',
    alignSelf: 'center',
    marginTop: verticalScale(100),
  },
});
