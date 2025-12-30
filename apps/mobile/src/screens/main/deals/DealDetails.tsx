import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useAppDispatch} from '@app/redux';
import GeneralTemplate from '@app/components/Template/GeneralTemplate';
import {Colors, Fonts, Images} from '@app/themes';
import {moderateScale, verticalScale} from '@app/utils/orientation';
import {RootStackParamList} from '@app/types';
import {getDealDetails} from '@app/utils/service/UserService';
import {IMAGES_BUCKET_URL} from '@app/utils/constants';

const DealDetails = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'DealDetails'>>();
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [details, setDetails] = useState<any>();
  const [hasAttempted, setHasAttempted] = useState<boolean>(false);

  const dealId = route.params?.dealId;

  useEffect(() => {
    if (dealId) {
      fetchDealDetails(dealId);
    }
  }, [dealId]);

  const fetchDealDetails = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await dispatch(getDealDetails({id}));
      if (result?.success) {
        setDetails(result?.data);
      }
    } catch (error) {
      console.log('Error fetching deal details', error);
    } finally {
      setIsLoading(false);
      setHasAttempted(true);
    }
  };

  const detailImage = useMemo(() => {
    const apiImage = details?.images?.[0]?.image || details?.image;
    const fromParams = route.params?.image;
    const imagePath = apiImage || fromParams;

    if (!imagePath) {
      return undefined;
    }

    const isAbsolute = imagePath?.startsWith('http');
    return isAbsolute ? imagePath : `${IMAGES_BUCKET_URL.deals}${imagePath}`;
  }, [details, route.params]);

  const handleOpenLink = () => {
    const productLink = details?.product_link;
    if (productLink) {
      Linking.openURL(productLink).catch(err =>
        console.error('Error opening link:', err),
      );
    }
  };

  const title = details?.deal_title || route.params?.title || 'Deal details';
  const description =
    details?.description ||
    route.params?.description ||
    'Description coming soon.';
  const discount = details?.discount;
  const price = details?.deal_price;
  const actualPrice = details?.discounted_price;

  return (
    <GeneralTemplate
      enableBack
      isSearch={false}
      fixedComponent={<Text style={styles.headerTitle}>Deal Details</Text>}
      isLoading={isLoading}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          {discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% Off</Text>
            </View>
          ) : null}
          <Image
            source={
              detailImage
                ? {uri: detailImage}
                : Images.no_pictures
            }
            resizeMode="contain"
            style={styles.image}
            tintColor={detailImage ? undefined : Colors.gray_1}
          />
        </View>

        <Text style={styles.title}>{title}</Text>
        {actualPrice || price ? (
          <View style={styles.priceContainer}>
            {actualPrice ? (
              <Text style={styles.actualPrice}>{`$${actualPrice}`}</Text>
            ) : null}
            {price ? (
              <Text style={styles.offerPrice}>{`$${price}`}</Text>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.label}>Description</Text>
        <Text style={styles.description}>{description}</Text>

        {details?.product_link ? (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleOpenLink}>
            <Text style={styles.linkButtonText}>Open Deal</Text>
          </TouchableOpacity>
        ) : null}

        {!isLoading && hasAttempted && !details && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={Colors.Aztec_Gold} />
            <Text style={styles.loadingText}>Unable to load deal details.</Text>
          </View>
        )}
      </ScrollView>
    </GeneralTemplate>
  );
};

export default DealDetails;

const styles = StyleSheet.create({
  headerTitle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    marginTop: moderateScale(20),
  },
  container: {
    flexGrow: 1,
    gap: moderateScale(16),
    paddingBottom: moderateScale(40),
  },
  imageContainer: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.1,
    shadowColor: '#00000033',
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  discountBadge: {
    position: 'absolute',
    top: moderateScale(10),
    left: moderateScale(10),
    backgroundColor: Colors.Aztec_Gold,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(20),
    zIndex: 1,
  },
  discountText: {
    color: Colors.white,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(12),
  },
  image: {
    height: verticalScale(220),
    width: '90%',
  },
  title: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(18),
    color: Colors.black,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  actualPrice: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(14),
    color: Colors.gray_1,
    textDecorationLine: 'line-through',
  },
  offerPrice: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(16),
    color: Colors.Aztec_Gold,
  },
  label: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(14),
    color: Colors.black,
  },
  description: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(13),
    color: Colors.Old_Silver,
    lineHeight: moderateScale(18),
  },
  linkButton: {
    backgroundColor: Colors.Aztec_Gold,
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  linkButtonText: {
    color: Colors.white,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(14),
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  loadingText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(12),
    color: Colors.gray_1,
  },
});
