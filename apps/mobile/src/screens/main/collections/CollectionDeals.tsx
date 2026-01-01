import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import ProductCard from '../../../components/Template/ProductCard';
import {Colors, Fonts} from '../../../themes';
import {moderateScale, verticalScale} from '../../../utils/orientation';
import {useAppDispatch} from '@app/redux';
import {getCollectionDeals} from '@app/utils/service/UserService';
import {RootStackParamList} from '@app/types';
import {IMAGES_BUCKET_URL} from '@app/utils/constants';

const CollectionDeals = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CollectionDeals'>>();
  const dispatch = useAppDispatch();
  const {collectionId, title, description, coverImageUrl, coverImage} =
    route.params;

  const [collectionDeals, setCollectionDeals] = useState<any[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);

  const resolveCoverImage = useCallback(() => {
    if (coverImageUrl) {
      return coverImageUrl;
    }

    if (coverImage) {
      return `${IMAGES_BUCKET_URL.collections}${coverImage}`;
    }

    return `${IMAGES_BUCKET_URL.collections}noImage.png`;
  }, [coverImage, coverImageUrl]);

  const loadCollectionDeals = useCallback(async () => {
    setIsLoadingDeals(true);
    try {
      const response = await dispatch(
        getCollectionDeals({collectionId: collectionId}),
      );

      if (response.success) {
        setCollectionDeals(response.data || []);
      } else {
        setCollectionDeals([]);
      }
    } finally {
      setIsLoadingDeals(false);
    }
  }, [collectionId, dispatch]);

  useEffect(() => {
    loadCollectionDeals();
  }, [loadCollectionDeals]);

  const dealCard = useCallback(({item, index}: {item: any; index: number}) => {
    return (
      <View style={style.dealCardWrapper}>
        <ProductCard
          enableModal={true}
          item={item}
          key={`${item?._id || index}_${index}`}
          jsonData={true}
          autoOpenModal={false}
        />
      </View>
    );
  }, []);

  const dealsEmpty = useMemo(() => {
    if (isLoadingDeals) {
      return null;
    }

    return (
      <Text style={style.emptyText}>
        No deals are currently available for this collection.
      </Text>
    );
  }, [isLoadingDeals]);

  return (
    <GeneralTemplate isLoading={false} title={title}>
      <View style={style.header}>
        <Image
          source={{uri: resolveCoverImage()}}
          style={style.coverImage}
          resizeMode="cover"
        />
        <View style={style.headerContent}>
          <Text style={style.title}>{title}</Text>
          {description ? (
            <Text style={style.description}>{description}</Text>
          ) : null}
        </View>
      </View>

      <View style={style.sectionHeader}>
        <Text style={style.sectionTitle}>Deals</Text>
        {isLoadingDeals && (
          <ActivityIndicator size="small" color={Colors.Aztec_Gold} />
        )}
      </View>

      <FlatList
        data={collectionDeals}
        keyExtractor={(item, index) => `${item?._id || index}_${index}`}
        renderItem={dealCard}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={style.separator} />}
        ListEmptyComponent={dealsEmpty}
      />
    </GeneralTemplate>
  );
};

export default CollectionDeals;

const style = StyleSheet.create({
  header: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: Colors.Almond,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: moderateScale(160),
    backgroundColor: Colors.Cornsilk,
  },
  headerContent: {
    padding: moderateScale(12),
    gap: moderateScale(6),
  },
  title: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(18),
  },
  description: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: moderateScale(20),
    marginBottom: moderateScale(8),
  },
  sectionTitle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(16),
  },
  separator: {
    height: verticalScale(10),
  },
  emptyText: {
    color: Colors.gray_1,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(13),
    marginTop: moderateScale(4),
  },
  dealCardWrapper: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: Colors.Almond,
    padding: moderateScale(4),
  },
});
