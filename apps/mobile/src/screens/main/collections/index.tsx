import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import ProductCard from '../../../components/Template/ProductCard';
import {Colors, Fonts} from '../../../themes';
import {moderateScale, verticalScale} from '../../../utils/orientation';
import {useAppDispatch} from '@app/redux';
import {
  getCollectionDeals,
  getCollections,
} from '@app/utils/service/UserService';
import {IMAGES_BUCKET_URL} from '@app/utils/constants';

interface CollectionType {
  _id: string;
  title: string;
  description?: string;
  coverImage?: string;
  coverImageUrl?: string;
  dealsCount?: number;
}

const Collections = () => {
  const dispatch = useAppDispatch();

  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<CollectionType | null>(
    null,
  );
  const [collectionDeals, setCollectionDeals] = useState<any[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);

  const resolveCoverImage = useCallback((collection: CollectionType) => {
    if (collection.coverImageUrl) {
      return collection.coverImageUrl;
    }

    if (collection.coverImage) {
      return `${IMAGES_BUCKET_URL.collections}${collection.coverImage}`;
    }

    return `${IMAGES_BUCKET_URL.collections}noImage.png`;
  }, []);

  const handleSelectCollection = useCallback(
    async (collection: CollectionType) => {
      setSelectedCollection(collection);
      setIsLoadingDeals(true);
      try {
        const response = await dispatch(
          getCollectionDeals({collectionId: collection._id}),
        );

        if (response.success) {
          setCollectionDeals(response.data || []);
        } else {
          setCollectionDeals([]);
        }
      } finally {
        setIsLoadingDeals(false);
      }
    },
    [dispatch],
  );

  const loadCollections = useCallback(async () => {
    setIsLoadingCollections(true);
    try {
      const response = await dispatch(getCollections());
      if (response.success) {
        const serverCollections: CollectionType[] = response.data || [];
        setCollections(serverCollections);
        if (serverCollections.length) {
          await handleSelectCollection(serverCollections[0]);
        } else {
          setSelectedCollection(null);
          setCollectionDeals([]);
        }
      } else {
        setCollections([]);
        setSelectedCollection(null);
        setCollectionDeals([]);
      }
    } finally {
      setIsLoadingCollections(false);
    }
  }, [dispatch, handleSelectCollection]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const collectionCard = useCallback(
    ({item}: {item: CollectionType}) => {
      const isActive = selectedCollection?._id === item._id;
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[style.collectionCard, isActive && style.collectionCardActive]}
          onPress={() => handleSelectCollection(item)}>
          <Image
            source={{uri: resolveCoverImage(item)}}
            style={style.collectionImage}
            resizeMode="cover"
          />
          <View style={style.collectionInfo}>
            <Text numberOfLines={1} style={style.collectionTitle}>
              {item.title}
            </Text>
            <Text style={style.collectionCount}>
              {item.dealsCount || 0} deal{(item.dealsCount || 0) === 1 ? '' : 's'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [handleSelectCollection, resolveCoverImage, selectedCollection?._id],
  );

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

  const collectionListEmpty = useMemo(() => {
    if (isLoadingCollections) {
      return null;
    }

    return (
      <Text style={style.emptyText}>
        No collections are available yet. Please check back later.
      </Text>
    );
  }, [isLoadingCollections]);

  const dealsEmpty = useMemo(() => {
    if (isLoadingDeals) {
      return null;
    }

    if (!selectedCollection) {
      return (
        <Text style={style.emptyText}>Select a collection to view its deals.</Text>
      );
    }

    return (
      <Text style={style.emptyText}>
        No deals are currently available for this collection.
      </Text>
    );
  }, [isLoadingDeals, selectedCollection]);

  return (
    <GeneralTemplate
      isLoading={isLoadingCollections && collections.length === 0}
      title="Collections">
      <View style={style.pageHeader}>
        <Text style={style.heading}>Collections</Text>
        <Text style={style.subHeading}>
          Browse curated collections from the admin team and open one to view
          all of its deals.
        </Text>
      </View>

      <Text style={style.sectionTitle}>Browse collections</Text>
      <FlatList
        data={collections}
        numColumns={2}
        keyExtractor={item => item._id}
        renderItem={collectionCard}
        columnWrapperStyle={style.collectionRow}
        ItemSeparatorComponent={() => <View style={style.collectionSeparator} />}
        ListEmptyComponent={collectionListEmpty}
        scrollEnabled={false}
      />

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

export default Collections;

const style = StyleSheet.create({
  pageHeader: {
    marginTop: moderateScale(10),
    gap: moderateScale(8),
  },
  heading: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(18),
  },
  subHeading: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  sectionTitle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(16),
    marginTop: moderateScale(20),
    marginBottom: moderateScale(8),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  collectionRow: {
    justifyContent: 'space-between',
  },
  collectionSeparator: {
    height: verticalScale(12),
  },
  collectionCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: Colors.Almond,
    width: '48%',
    overflow: 'hidden',
  },
  collectionCardActive: {
    borderColor: Colors.Aztec_Gold,
  },
  collectionImage: {
    width: '100%',
    height: moderateScale(120),
    backgroundColor: Colors.Cornsilk,
  },
  collectionInfo: {
    padding: moderateScale(10),
    gap: moderateScale(4),
  },
  collectionTitle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(14),
  },
  collectionCount: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(12),
  },
  dealCardWrapper: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: Colors.Almond,
    padding: moderateScale(4),
  },
});
