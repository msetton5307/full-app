import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import {Colors, Fonts} from '../../../themes';
import {moderateScale, verticalScale} from '../../../utils/orientation';
import {useAppDispatch} from '@app/redux';
import {getCollections} from '@app/utils/service/UserService';
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
  const navigation = useNavigation<any>();

  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

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
    (collection: CollectionType) => {
      navigation.navigate('CollectionDeals', {
        collectionId: collection._id,
        title: collection.title,
        description: collection.description,
        coverImageUrl: resolveCoverImage(collection),
      });
    },
    [navigation, resolveCoverImage],
  );

  const loadCollections = useCallback(async () => {
    setIsLoadingCollections(true);
    try {
      const response = await dispatch(getCollections());
      if (response.success) {
        const serverCollections: CollectionType[] = response.data || [];
        setCollections(serverCollections);
      } else {
        setCollections([]);
      }
    } finally {
      setIsLoadingCollections(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const collectionCard = useCallback(
    ({item}: {item: CollectionType}) => {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={style.collectionCard}
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
    [handleSelectCollection, resolveCoverImage],
  );

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
});
