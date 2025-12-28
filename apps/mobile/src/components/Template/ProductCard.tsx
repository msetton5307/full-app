import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ScrollView,
  Linking,
  Share,
} from 'react-native';
import {Colors, Fonts, Icons, Images} from '../../themes';
import {horizontalScale, moderateScale, verticalScale} from '../../utils/orientation';
import {IMAGES_BUCKET_URL} from '@app/utils/constants';
import {useAppDispatch} from '@app/redux';
import {
  applyDealFavorite,
  applyDealLiked,
  getDealDetails,
} from '@app/utils/service/UserService';
import Clipboard from '@react-native-clipboard/clipboard';
import Css from '@app/themes/Css';
import {CustomButtonOutline, CustomButtonSolid} from '../CustomButton';
import {showMessage} from '@app/utils/helper/Toast';

export interface ProductCardInterface {
  item: any;
  enableModal?: boolean;
  onUnFavorite?: () => void;
  editable?: boolean;
  onEditProduct?: (item: {}) => void;
  isShowFavorite?: boolean;
  isStatus?: string;
  jsonData?: boolean;
}

const formatPrice = (amount: number): string => {
  const amountStr = amount.toString();
  return amountStr.length > 4
    ? `$${amountStr.slice(0, 4)}...`
    : `$${amountStr}`;
};

type ProductDetails = {
  title: string;
  description: string;
  price: string;
  product_link: string;
  discount: string;
  // isFeature: item?.isFeature || false,
  brand_logo: string;
  // isPaymentDone: item?.isPaymentDone || false,
  status: string;
  images: any;
  discounted_price: string;
  company_name?: string;
};

type ViewProductDetails = {
  _id: string;
  isFavourite: boolean;
  brand_logo: string;
  image: string;
  title: string;
  discounted_price: string;
  deal_price: string;
  description: string;
  discount: string;
  isLike: boolean;
  isDislike: boolean;
  product_link: string;
  isJson?: boolean;
  company_name?: string;
};

const ProductCard = ({
  item = {},
  enableModal = false,
  onUnFavorite = () => {},
  editable,
  onEditProduct = () => {},
  isShowFavorite = false,
  isStatus = '',
  jsonData = false,
}: ProductCardInterface) => {
  const [details, setDetails] = useState<ProductDetails>({
    brand_logo: '',
    description: '',
    discount: '',
    discounted_price: '',
    images: [],
    price: '',
    product_link: '',
    status: 'Approved',
    title: '',
    company_name: '',
  });

  useEffect(() => {
    if (jsonData) {
      setDetails({
        title: item?.Name || '',
        description: '',
        price: item?.Price2 || '',
        product_link: item?.Url || '',
        discount: item?.Off || '',
        // isFeature: item?.isFeature || false,
        brand_logo: item?.brand_logo || '',
        // isPaymentDone: item?.isPaymentDone || false,
        status: 'Approved',
        images: item?.Image ? item?.Image : '',
        discounted_price: item?.Price1 || '',
        company_name: item?.Company || '',
      });
    } else {
      setDetails({
        title: item?.deal_title || '',
        description: item?.description || '',
        price: item?.deal_price ? `$${item?.deal_price}` : '',
        product_link: item?.product_link || '',
        discount: item?.discount || '',
        // isFeature: item?.isFeature || false,
        brand_logo: item?.brand_logo
          ? `${IMAGES_BUCKET_URL.brand}${item?.brand_logo}`
          : '',
        // isPaymentDone: item?.isPaymentDone || false,
        status: item?.status || false,
        images: item?.images
          ? `${IMAGES_BUCKET_URL.deals}${item?.images[0]?.image}`
          : '',
        discounted_price: item?.discounted_price
          ? `$${item?.discounted_price}`
          : '',
      });
    }
  }, [jsonData, item]);

  const dispatch = useAppDispatch();
  const [productDetails, setProductDetails] = useState<ViewProductDetails>({
    _id: '',
    isFavourite: false,
    brand_logo: '',
    image: '',
    title: '',
    discounted_price: '',
    deal_price: '',
    description: '',
    discount: '',
    isLike: false,
    isDislike: false,
    product_link: '',
    isJson: false,
  });
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const getProductDetails = useCallback(
    async (item: any) => {
      if (jsonData) {
        setProductDetails({
          _id: item?._id,
          brand_logo: item?.brand_logo || '',
          deal_price: item?.Price2 || '',
          description: '',
          discounted_price: item?.Price1 || '',
          discount: item?.Off || '',
          image: item?.Image ? item?.Image : '',
          isDislike: false,
          isFavourite: false,
          isLike: false,
          product_link: item?.Url || '',
          title: item?.Name || '',
          isJson: true,
          company_name: item?.Company || '',
        });

        setIsVisible(true);
      } else {
        try {
          const result = await dispatch(
            getDealDetails({
              id: item._id,
            }),
          );
          console.log('getProductDetails result_details', result);
          if (result.success) {
            setIsVisible(true);
            setProductDetails({
              _id: result.data?._id,
              brand_logo: item?.brand_logo
                ? `${IMAGES_BUCKET_URL.brand}${item?.brand_logo}`
                : '',
              deal_price: item?.deal_price ? `$${item?.deal_price}` : '',
              description: result.data?.description,
              discount: item?.discount || result.data?.discount || '',
              discounted_price: item?.discounted_price
                ? `$${item?.discounted_price}`
                : '',
              image: item?.images
                ? `${IMAGES_BUCKET_URL.deals}${item?.images[0]?.image}`
                : '',
              isDislike: result.data?.isDislike,
              isFavourite: result.data?.isFavourite,
              isLike: result.data?.isLike,
              product_link: result.data?.product_link,
              title: item?.deal_title || '',
              isJson: false,
            });
          }
        } catch (error) {
          console.log('Error', error);
        }
      }
    },
    [jsonData, item],
  );

  const handleLikeDislike = useCallback(
    async (id: string, action: 'like' | 'dislike', currentState: boolean) => {
      try {
        const result = await dispatch(
          applyDealLiked({
            dealId: id,
            isDisLike: action === 'dislike' ? !currentState : false,
            isLike: action === 'like' ? !currentState : false,
          }),
        );
        if (result.success) {
          setProductDetails(prev => ({
            ...prev,
            [action === 'like' ? 'isLike' : 'isDislike']: !currentState,
            [action === 'like' ? 'isDislike' : 'isLike']: false,
          }));
        }
      } catch (error) {
        console.log(`Error handling ${action}`, error);
      }
    },
    [dispatch],
  );

  const copyToClipboard = (link: string) => {
    if (link !== '' && link !== undefined) {
      Clipboard.setString(`${link}`);
      showMessage('Link copied to clipboard!');
    }
  };

  const openLink = (link: string) => {
    if (link !== '' && link !== undefined) {
      Linking.openURL(link).catch(err =>
        console.error('Error opening link:', err),
      );
    }
  };

  const handleFavourite = useCallback(
    async (id: string, isFavourite: boolean) => {
      try {
        const result = await dispatch(applyDealFavorite({dealId: id}));
        if (result.success) {
          setProductDetails(prev => ({
            ...prev,
            isFavourite: !isFavourite,
          }));
        }
      } catch (error) {
        console.log('Error handling favourite', error);
      }
    },
    [dispatch],
  );

  const share = async (data: ViewProductDetails) => {
    try {
      const shareOptions = {
        title: data?.title,
        message: `${data?.title}.\n${data?.product_link}`,
        url: data?.product_link, // Image hosted online
      };

      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing: ', error);
    }
  };

  const modalTitle = productDetails?.title || details?.title;
  const modalDiscount = productDetails?.discount || details?.discount;
  const modalDiscountedPrice =
    productDetails?.discounted_price || details?.discounted_price;
  const modalDealPrice = productDetails?.deal_price || details?.price;
  const modalDescription =
    productDetails?.description?.trim()?.length
      ? productDetails?.description
      : details?.description?.trim()?.length
        ? details?.description
        : 'Description coming soon.';
  const modalImage = productDetails?.image || (details?.images as string);
  const modalProductLink = productDetails?.product_link || details?.product_link;
  const modalBrandLogo = productDetails?.brand_logo || details?.brand_logo;

  return (
    <>
      <TouchableOpacity
        disabled={!enableModal}
        style={styles.mainContainer}
        onPress={() => getProductDetails(item)}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          {details?.brand_logo && (
            <Image
              source={{uri: details?.brand_logo}}
              style={styles.logoStyle}
              resizeMode="contain"
            />
          )}

          {details?.company_name && (
            <View
              style={{
                backgroundColor: Colors.Linen,
                paddingHorizontal: 10,
                paddingVertical: 2,
                borderRadius: 30,
              }}>
              <Text
                style={{
                  fontFamily: Fonts.PoppinsMedium,
                  color: Colors.black_olive,
                  fontSize: 10,
                }}>
                {details?.company_name}
              </Text>
            </View>
          )}
          {isShowFavorite && (
            <TouchableOpacity
              onPress={() => {
                handleFavourite(
                  productDetails?._id,
                  productDetails?.isFavourite,
                );
                onUnFavorite();
              }}
              style={styles.favorite}>
              <Image
                source={Icons.favorite}
                style={styles.favoriteImg}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}

          {isStatus && <Text style={styles.pending}>{isStatus}</Text>}
        </View>

        <Image
          source={
            details?.images ? {uri: `${details?.images}`} : Images.no_pictures
          }
          style={styles.productImg}
          tintColor={details?.images ? undefined : Colors.gray_1}
          resizeMode="contain"
        />

        {details?.title && (
          <Text
            style={styles.productNameText}
            numberOfLines={2}
            ellipsizeMode="tail">
            {details?.title}
          </Text>
        )}

        {details?.discount && (
          <View style={styles.offView}>
            <Text style={styles.offText}>{`${details?.discount}% off`}</Text>
          </View>
        )}
        <View style={styles.priceView}>
          {details?.discounted_price && (
            <Text style={styles.actualPrice}>
              {Number.isNaN(details?.discounted_price)
                ? parseFloat(details?.discounted_price)?.toFixed(2)
                : details?.discounted_price}
            </Text>
          )}
          {details?.price && (
            <Text style={styles.offerPrice}>{details?.price}</Text>
          )}
        </View>
        {editable && (
          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.editButton}
            onPress={onEditProduct}>
            <Image source={Icons.pencil} style={styles.editIcon} />
            <Text style={styles.editText}>Edit Deal</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal style={styles.modalStyle} visible={isVisible} transparent>
        <View style={styles.modalInnerContainer}>
          <SafeAreaView style={styles.safeareaStyle}>
            <View style={styles.modalVisibleContainer}>
              <TouchableOpacity
                style={styles.crossiconContainer}
                onPress={() => setIsVisible(false)}>
                <Image style={Css.icon20} source={Icons.cross} />
              </TouchableOpacity>
              <ScrollView
                style={[Css.w100, styles.modalScroll]}
                contentContainerStyle={[Css.w100, Css.g10, styles.modalScrollContent]}
                showsVerticalScrollIndicator={false}>
                <View style={styles.productDeatilsLogoContainer}>
                  {modalBrandLogo && (
                    <Image
                      source={{
                        uri: modalBrandLogo,
                      }}
                      style={[styles.logoStyle, Css.mt0]}
                      resizeMode="contain"
                    />
                  )}

                  {details?.company_name && (
                    <Text
                      style={{
                        fontFamily: Fonts.PoppinsMedium,
                        color: Colors.black_olive,
                        fontSize: 12,
                      }}>
                      {details?.company_name}
                    </Text>
                  )}
                </View>
                <View style={styles.productHeroContainer}>
                  {modalDiscount && (
                    <View style={styles.productDiscountBadge}>
                      <Text style={styles.productDiscountText}>
                        {modalDiscount}% Off
                      </Text>
                    </View>
                  )}
                  <Image
                    source={
                      modalImage
                        ? {
                            uri: modalImage,
                          }
                        : Images.no_pictures
                    }
                    style={[styles.productDetailsImg]}
                    resizeMode="contain"
                    tintColor={
                      productDetails?.image ? undefined : Colors.gray_1
                    }
                  />
                </View>
                <View style={[styles.rowContainer, styles.namePriceContainer]}>
                  {modalTitle && (
                    <Text style={styles.productDetailsProductNameText}>
                      {modalTitle}
                    </Text>
                  )}
                  {modalDiscountedPrice || modalDealPrice ? (
                    <View style={[styles.dealsPriceContainer]}>
                      <Text style={styles.detailsActualPrice}>
                        {modalDiscountedPrice}
                      </Text>
                      <Text style={styles.detailsOfferPrice}>
                        {`${modalDealPrice}`}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={[styles.rowContainer, styles.descriptionContainer]}>
                  <Text style={styles.detailsDescLabel}>Description</Text>
                  <Text style={styles.detailsDescValue}>{modalDescription}</Text>
                </View>
                <View style={[Css.w100, !productDetails?.isJson && Css.mt20]}>
                  <View style={[Css.fdr, Css.jcc, Css.aic, Css.g2]}>
                    {!productDetails.isJson && (
                      <>
                        <TouchableOpacity
                          onPress={() =>
                            handleLikeDislike(
                              productDetails._id,
                              'like',
                              productDetails.isLike,
                            )
                          }
                          style={Css.iconContainer32}>
                          <Image
                            style={Css.icon32}
                            source={
                              productDetails?.isLike
                                ? Icons.active_like
                                : Icons.inactive_like
                            }
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            handleLikeDislike(
                              productDetails?._id,
                              'dislike',
                              productDetails?.isDislike,
                            )
                          }
                          style={Css.iconContainer32}>
                          <Image
                            style={Css.icon32}
                            source={
                              productDetails?.isDislike
                                ? Icons.active_dislike
                                : Icons.inactive_dislike
                            }
                          />
                        </TouchableOpacity>
                      </>
                    )}

                    <TouchableOpacity
                      onPress={() => {
                        share(productDetails);
                      }}
                      style={Css.iconContainer32}>
                      <Image style={Css.icon32} source={Icons.active_share} />
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={Css.iconContainer32}>
                          <Image style={Css.icon32} source={Icons.active_save} />
                        </TouchableOpacity> */}
                    <TouchableOpacity
                      onPress={() => copyToClipboard(modalProductLink)}
                      style={Css.iconContainer32}>
                      <Image
                        style={Css.icon32}
                        source={Icons.inactive_link} // active_link
                      />
                    </TouchableOpacity>
                    {!jsonData && (
                      <TouchableOpacity
                        onPress={() => {
                          handleFavourite(
                            productDetails?._id,
                            productDetails?.isFavourite,
                          );
                          onUnFavorite();
                        }}
                        style={Css.iconContainer32}>
                        <Image
                          style={Css.icon32}
                          source={
                            productDetails?.isFavourite
                              ? Icons.active_favourite
                              : Icons.inactive_favourite
                          }
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={Css.mb20} />
                  {/* {!productDetails?.isJson && (
                        <CustomButtonOutline
                          label="Expired"
                          onPress={() => {}}
                          disabled
                          containerStyle={Css.w100}
                        />
                      )} */}
                </View>
              </ScrollView>
              <CustomButtonSolid
                label="See Deal"
                onPress={() => openLink(modalProductLink)}
                containerStyle={[Css.w100, Css.mt5]}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '47%',
    borderWidth: 1,
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    borderColor: Colors.Desert_Sand,
    marginTop: moderateScale(20),
    gap: moderateScale(10),
  },
  offerPrice: {
    color: Colors.Amaranth_Red,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(15),
    marginLeft: moderateScale(10),
    textDecorationLine: 'line-through',
    flexShrink: 1,
    textAlign: 'center',
  },
  actualPrice: {
    color: Colors.green,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(15),
    flexShrink: 1,
    textAlign: 'center',
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  productNameText: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(12),
    width: '70%',
    textAlign: 'center',
    alignSelf: 'center',
  },
  offText: {
    color: Colors.white,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(11),
  },
  offView: {
    width: '50%',
    backgroundColor: Colors.Amaranth_Red,
    borderRadius: moderateScale(5),
    alignSelf: 'center',
    alignItems: 'center',
    padding: moderateScale(5),
  },
  productImg: {
    height: moderateScale(97),
    width: moderateScale(79),
    alignSelf: 'center',
  },
  productDetailsImg: {
    height: moderateScale(150),
    width: moderateScale(150),
    alignSelf: 'center',
    marginTop: moderateScale(10),
  },
  logoStyle: {
    height: moderateScale(20),
    width: moderateScale(50),
  },
  favorite: {
    backgroundColor: Colors.Aztec_Gold,
    height: moderateScale(25),
    width: moderateScale(25),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.tiger_Orange,
    borderWidth: moderateScale(2),
  },
  pending: {
    color: Colors.Aztec_Gold,
    fontSize: moderateScale(12),
    fontFamily: Fonts.PoppinsSemiBold,
  },
  favoriteImg: {
    height: moderateScale(15),
    width: moderateScale(15),
  },
  modalStyle: {
    margin: 0,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: '#000000cc',
  },
  safeareaStyle: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalVisibleContainer: {
    // height: '80%',
    height: '80%',
    maxHeight: '80%',
    width: '85%',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(15),
    overflow: 'hidden',
    padding: moderateScale(15),
  },
  crossiconContainer: {
    height: moderateScale(40),
    width: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Cornsilk,
    position: 'absolute',
    top: moderateScale(10),
    right: moderateScale(10),
    overflow: 'hidden',
    borderRadius: moderateScale(40),
    zIndex: 10,
  },
  modalScroll: {
    flex: 1,
  },
  rowContainer: {
    width: '100%',
    padding: moderateScale(15),
    borderRadius: moderateScale(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 1,
    shadowColor: '#4514A517',
    shadowOffset: {
      height: 0,
      width: 0,
    },
    elevation: 5,
    backgroundColor: Colors.white,
  },
  productHeroContainer: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(15),
    padding: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productDiscountBadge: {
    position: 'absolute',
    top: moderateScale(10),
    left: moderateScale(10),
    backgroundColor: Colors.Amaranth_Red,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    borderRadius: moderateScale(20),
  },
  productDiscountText: {
    color: Colors.white,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(11),
  },
  productDeatilsLogoContainer: {
    borderRadius: moderateScale(50),
    maxWidth: horizontalScale(230),
    height: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Cornsilk,
    paddingHorizontal: moderateScale(20),
    alignSelf: 'flex-start'
  },
  namePriceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: moderateScale(5),
  },
  productDetailsProductNameText: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(14),
    alignSelf: 'center',
    textAlign: 'center',
  },
  labelRed: {
    color: Colors.Amaranth_Red,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(9),
  },
  labelGreen: {
    color: Colors.green,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(9),
  },
  dealsPriceContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  detailsActualPrice: {
    color: Colors.green,
    fontFamily: Fonts.PoppinsBold,
    fontSize: moderateScale(22),
  },
  detailsOfferPrice: {
    color: Colors.Amaranth_Red,
    fontFamily: Fonts.PoppinsLight,
    fontSize: moderateScale(16),
    textDecorationLine: 'line-through',
    marginTop: moderateScale(2),
  },
  detailsDescLabel: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(12),
  },
  detailsDescValue: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
  },
  descriptionContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: moderateScale(6),
  },
  editIcon: {
    width: moderateScale(13.5),
    height: moderateScale(13.5),
  },
  editButton: {
    alignSelf: 'center',
    width: moderateScale(120),
    height: moderateScale(40),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(7),
    backgroundColor: Colors.Seashell,
    borderWidth: moderateScale(2),
    borderColor: Colors.Dutch_White,
  },
  editText: {
    marginLeft: moderateScale(5),
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(14),
    color: Colors.Aztec_Gold,
  },
  modalScrollContent: {
    paddingBottom: moderateScale(10),
  },
});

export default ProductCard;