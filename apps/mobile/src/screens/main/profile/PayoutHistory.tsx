import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import {Colors, Fonts, Icons} from '../../../themes';
import {moderateScale, verticalScale} from '../../../utils/orientation';
import {useAppDispatch} from '@app/redux';
import {showMessage} from '@app/utils/helper/Toast';
import {getPostedDeal} from '@app/utils/service/UserService';
import {IMAGES_BUCKET_URL} from '@app/utils/constants';

const PayoutHistory = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  interface DealItem {
    dealimages: {image: string}[];
    deal_title: string;
  }

  const [data, setData] = useState<DealItem[]>([]);
  const [amount, setAmount] = useState<number>();

  useEffect(() => {
    handlepayoutHistory();
  }, []);

  async function handlepayoutHistory() {
    try {
      setIsLoading(true);
      const result = await dispatch(
        getPostedDeal({
          status: 'approved',
          isPaymentDone: true,
        }),
      );
      console.log(result, 'result');

      setIsLoading(false);
      if (result?.success) {
        setData(result?.data);
        setAmount(result?.amount);
      }
    } catch (error) {
      console.log('Error in handleSignIn:', error);
    }
  }

  return (
    <GeneralTemplate
      enableBack
      fixedComponent={<Text style={styles.textStyle}>Payout History</Text>}>
      <View style={[Css.w100, Css.g8]}>
        {data?.length > 0 ? (
          <View style={styles.dataContainer}>
            {data.map((item, index) => {
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
                        uri: `${IMAGES_BUCKET_URL.deals}${item?.dealimages[0]?.image}`,
                      }}
                    />
                  </View>
                  <Text style={styles.labelText} numberOfLines={1}>
                    {item?.deal_title}
                  </Text>
                  <View style={styles.rightIconContainer}>
                    <Text style={styles.priceText}>${amount?.toString()}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.empty}>{`No data found.`}</Text>
        )}
      </View>
    </GeneralTemplate>
  );
};

export default PayoutHistory;

const styles = StyleSheet.create({
  textStyle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    marginTop: moderateScale(20),
  },
  labelText: {
    paddingHorizontal: moderateScale(10),
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(14),
    flex: 1,
  },
  priceText: {
    color: Colors.white,
    fontFamily: Fonts.PoppinsBold,
    fontSize: moderateScale(16),
  },
  rowContainer: {
    flexDirection: 'row',
    padding: moderateScale(10),
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
    backgroundColor: Colors.Soft_Peach,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '100%',
    borderRadius: moderateScale(10),
    borderWidth: 1,
    marginTop: moderateScale(20),
    borderColor: Colors.Aztec_Gold,
  },
  empty: {
    fontSize: moderateScale(16),
    color: 'grey',
    alignSelf: 'center',
    marginTop: verticalScale(100),
  },
});
