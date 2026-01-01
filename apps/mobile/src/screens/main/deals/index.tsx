/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import _ from 'lodash';
import {Colors, Fonts} from '../../../themes';
import {moderateScale, verticalScale} from '../../../utils/orientation';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import ProductCard from '../../../components/Template/ProductCard';
import {RouteProp, useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useAppDispatch} from '@app/redux';
import {getMergedJsonDeals} from '@app/utils/service/UserService';
import {RootTabParamList} from '@app/types';

const placeholderHotDeals = [
  {
    id: 'hot-1',
    deal_title: 'Admin Pick: Summer Savings Bundle',
    description: 'Curated picks hand-selected for the best value.',
    discount: 'Up to 40% off',
    discounted_price: '29.99',
    deal_price: 29.99,
    product_link: '#',
  },
  {
    id: 'hot-2',
    deal_title: 'Editor’s Choice: Everyday Essentials',
    description: 'Top-rated items bundled for everyday use.',
    discount: 'Save $15',
    discounted_price: '49.99',
    deal_price: 49.99,
    product_link: '#',
  },
];

const placeholderStores = [
  {
    id: 'store-1',
    name: 'Amazon',
    promo: 'Lightning deals and Prime member exclusives live now.',
  },
  {
    id: 'store-2',
    name: 'Best Buy',
    promo: 'Weekend doorbusters on laptops, TVs, and accessories.',
  },
  {
    id: 'store-3',
    name: 'Walmart',
    promo: 'Rollback specials on essentials and back-to-school gear.',
  },
];

const Deals = () => {
  const isFocused = useIsFocused();
  const route = useRoute<RouteProp<RootTabParamList, 'Deals'>>();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const [lists, setList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [pendingDealId, setPendingDealId] = useState<string | undefined>(
    route.params?.dealId,
  );
  const [autoOpenDealId, setAutoOpenDealId] = useState<string | undefined>(
    route.params?.dealId,
  );

  useEffect(() => {
    if (isFocused) {
      getAllDeals(1);
    }
  }, [getAllDeals, isFocused]);

  useEffect(() => {
    if (route.params?.dealId) {
      setPendingDealId(String(route.params?.dealId));
    }
  }, [route.params?.dealId]);

  useEffect(() => {
    if (!pendingDealId) {
      return;
    }

    const hasDeal = lists.some(item => {
      const itemId =
        item?._id || item?.deal_id || item?.id || item?.dealId || item?.dealID;

      return itemId && String(itemId) === pendingDealId;
    });

    if (hasDeal) {
      setAutoOpenDealId(pendingDealId);
    } else if (!isLoading && hasMoreData && lists.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      getAllDeals(nextPage);
    } else if (!isLoading && !hasMoreData) {
      navigation.navigate('DealDetails', {dealId: pendingDealId});
      navigation.setParams?.({dealId: undefined});
      setPendingDealId(undefined);
      setAutoOpenDealId(undefined);
    }
  }, [
    pendingDealId,
    lists,
    isLoading,
    hasMoreData,
    navigation,
    page,
    getAllDeals,
  ]);

  const keyExtractor = useCallback((item: any, index: number) => {
    const itemId = item?._id || item?.deal_id || item?.id || index;
    return `${itemId}_${index}`;
  }, []);

  const getAllDeals = useCallback(
    async (_page: number) => {
      if (_page === 1) {
        setPage(1);
        setHasMoreData(true);
      }

      if (isLoading && _page > 1) {
        return;
      }

      setIsLoading(true);
      try {
        const result = await dispatch(
          getMergedJsonDeals({
            page: _page,
            pageSize: 50,
          }),
        );

        if (result.success) {
          if (_.isEmpty(result.data)) {
            setHasMoreData(false);
            if (_page === 1) {
              setList([]);
            }
          } else if (_page === 1) {
            setList(result.data);
            if (result.data.length < 50) {
              setHasMoreData(false);
            }
          } else {
            setList(prev => [...prev, ...result.data]);
            if (result.data.length < 50) {
              setHasMoreData(false);
            }
          }
        } else if (_page === 1) {
          setList([]);
          setHasMoreData(false);
        }
      } catch (error) {
        console.log('Error in handleSignIn:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, isLoading],
  );

  const debouncedSearch = useCallback(
    _.debounce((_query?: string) => {
      getAllDeals(1);
    }, 500),
    [getAllDeals],
  );

  const HeaderComponent = useCallback(() => {
    return (
      <View>
        <Text style={style.textStyle}>Deals</Text>
      </View>
    );
  }, []);

  const hotDeals = useMemo(() => placeholderHotDeals, []);
  const stores = useMemo(() => placeholderStores, []);

  return (
    <GeneralTemplate
      searchValue={search}
      setSearchValue={(value: string) => {
        console.log('value -- ', value);
        setSearch(value);
        debouncedSearch(value);
      }}
      isLoading={isLoading}
      scrollEnd={() => {
        if (!isLoading && hasMoreData) {
          let _page = page + 1;
          setPage(_page);
          getAllDeals(_page);
        }
      }}
      fixedComponent={<HeaderComponent />}
      >
      <View style={style.sectionContainer}>
        <Text style={style.sectionHeading}>Hot</Text>
        <FlatList
          horizontal
          data={hotDeals}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={({item, index}) => (
            <View style={style.horizontalCard}>
              <ProductCard
                enableModal={false}
                item={item}
                key={index}
                jsonData={false}
                autoOpenModal={false}
              />
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text style={style.empty}>{`No hot deals yet.`}</Text>}
          contentContainerStyle={style.horizontalList}
        />
      </View>

      <View style={style.sectionContainer}>
        <Text style={style.sectionHeading}>New</Text>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={lists}
          keyExtractor={keyExtractor}
          renderItem={({item, index}) => {
            const itemId =
              item?._id || item?.deal_id || item?.id || item?.dealId || item?.dealID;
            const shouldAutoOpen =
              autoOpenDealId && itemId && String(itemId) === autoOpenDealId;

            return (
              <ProductCard
                enableModal={true}
                item={item}
                key={index}
                jsonData={true}
                autoOpenModal={!!shouldAutoOpen}
                onModalOpen={() => {
                  setAutoOpenDealId(undefined);
                  setPendingDealId(undefined);
                  navigation.setParams?.({dealId: undefined});
                }}
              />
            );
          }}
          numColumns={2}
          ListEmptyComponent={<Text style={style.empty}>{`No data found.`}</Text>}
          contentContainerStyle={style.flatcontainer}
          columnWrapperStyle={Css.jcsb}
          scrollEnabled={false}
        />
      </View>

      <View style={style.sectionContainer}>
        <Text style={style.sectionHeading}>Stores</Text>
        <View style={style.storeGrid}>
          {stores.map(store => (
            <View key={store.id} style={style.storeCard}>
              <Text style={style.storeName}>{store.name}</Text>
              <Text style={style.storePromo}>{store.promo}</Text>
            </View>
          ))}
        </View>
      </View>
    </GeneralTemplate>
  );
};

export default Deals;

const style = StyleSheet.create({
  flatcontainer: {
    width: '100%',
    alignSelf: 'center',
  },
  empty: {
    fontSize: moderateScale(16),
    color: 'grey',
    alignSelf: 'center',
    marginTop: verticalScale(100),
  },
  textStyle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    // paddingVertical: moderateScale(20),
    marginTop: moderateScale(15),
  },
  tabContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    justifyContent: 'space-between',
    width: '100%',
    alignSelf: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(50),
    borderBottomColor: Colors.Aztec_Gold,
  },
  tabText: {
    color: Colors.black_olive,
    fontSize: moderateScale(14),
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: moderateScale(16),
  },
  sectionHeading: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.black,
    marginBottom: moderateScale(10),
  },
  horizontalList: {
    paddingBottom: moderateScale(10),
  },
  horizontalCard: {
    width: moderateScale(180),
    marginRight: moderateScale(12),
  },
  storeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  storeCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginBottom: moderateScale(12),
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },
  storeName: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(15),
    color: Colors.black,
    marginBottom: moderateScale(4),
  },
  storePromo: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(13),
    color: Colors.black_olive,
  },
});
