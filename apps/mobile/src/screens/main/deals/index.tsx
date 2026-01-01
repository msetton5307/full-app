/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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

type TabKey = 'hot' | 'new' | 'stores';

const Deals = () => {
  const isFocused = useIsFocused();
  const route = useRoute<RouteProp<RootTabParamList, 'Deals'>>();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const scrollRef = useRef<ScrollView | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('hot');
  const [tabWidth, setTabWidth] = useState<number>(0);
  const indicatorPosition = useRef(new Animated.Value(0)).current;

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

  const tabs: {key: TabKey; label: string}[] = useMemo(
    () => [
      {key: 'hot', label: 'Hot'},
      {key: 'new', label: 'New'},
      {key: 'stores', label: 'Stores'},
    ],
    [],
  );

  const animateIndicatorTo = useCallback(
    (index: number) => {
      if (tabWidth === 0) {
        return;
      }

      Animated.timing(indicatorPosition, {
        toValue: tabWidth * index,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    [indicatorPosition, tabWidth],
  );

  useEffect(() => {
    const tabIndex = tabs.findIndex(tab => tab.key === activeTab);
    if (tabIndex >= 0) {
      animateIndicatorTo(tabIndex);
    }
  }, [activeTab, animateIndicatorTo, tabs]);

  const handleTabPress = useCallback(
    (key: TabKey) => {
      setActiveTab(key);

      const tabIndex = tabs.findIndex(tab => tab.key === key);
      if (tabIndex >= 0) {
        animateIndicatorTo(tabIndex);
      }

      scrollRef.current?.scrollTo({y: 0, animated: false});
    },
    [animateIndicatorTo, tabs],
  );

  const HeaderComponent = useCallback(() => {
    return (
      <View>
        <Text style={style.textStyle}>Deals</Text>
        <View
          style={style.tabContainer}
          onLayout={event => {
            const {width} = event.nativeEvent.layout;
            setTabWidth(width / tabs.length);
          }}>
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[style.tab, isActive && style.activeTab]}
                onPress={() => handleTabPress(tab.key)}>
                <Text
                  style={[
                    style.tabText,
                    isActive ? style.activeTabText : style.inactiveTabText,
                  ]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
          {tabWidth > 0 && (
            <Animated.View
              style={[
                style.tabIndicator,
                {
                  width: tabWidth,
                  transform: [{translateX: indicatorPosition}],
                },
              ]}
            />
          )}
        </View>
      </View>
    );
  }, [activeTab, animateIndicatorTo, handleTabPress, indicatorPosition, tabWidth, tabs]);

  const hotDeals = useMemo(() => placeholderHotDeals, []);
  const stores = useMemo(() => placeholderStores, []);

  const renderHotDeals = useCallback(() => {
    return (
      <View style={style.sectionContainer}>
        <Text style={style.sectionHeading}>Hot Deals</Text>
        <FlatList
          data={hotDeals}
          horizontal
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={({item, index}) => {
            return (
              <View style={[style.horizontalCard]}>
                <ProductCard
                  enableModal={true}
                  item={item}
                  key={index}
                  jsonData={false}
                  autoOpenModal={false}
                />
              </View>
            );
          }}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text style={style.empty}>{`No hot deals yet.`}</Text>}
          contentContainerStyle={style.horizontalList}
        />
      </View>
    );
  }, [hotDeals]);

  const renderNewDeals = useCallback(() => {
    return (
      <View style={style.sectionContainer}>
        <Text style={style.sectionHeading}>New Deals</Text>
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
    );
  }, [autoOpenDealId, keyExtractor, lists, navigation]);

  const renderStores = useCallback(() => {
    return (
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
    );
  }, [stores]);

  const renderActiveSection = useMemo(() => {
    switch (activeTab) {
      case 'hot':
        return renderHotDeals();
      case 'new':
        return renderNewDeals();
      case 'stores':
        return renderStores();
      default:
        return null;
    }
  }, [activeTab, renderHotDeals, renderNewDeals, renderStores]);

  return (
    <GeneralTemplate
      searchValue={search}
      setSearchValue={(value: string) => {
        console.log('value -- ', value);
        setSearch(value);
        if (activeTab === 'new') {
          debouncedSearch(value);
        }
      }}
      isLoading={isLoading}
      scrollEnd={() => {
        if (activeTab === 'new' && !isLoading && hasMoreData) {
          let _page = page + 1;
          setPage(_page);
          getAllDeals(_page);
        }
      }}
      fixedComponent={<HeaderComponent />}
      scrollRef={scrollRef}
      onScroll={undefined}
      >
      {renderActiveSection}
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
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(4),
    position: 'relative',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(10),
  },
  tabText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
  },
  activeTabText: {
    color: Colors.white,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  inactiveTabText: {
    color: Colors.black_olive,
  },
  activeTab: {
    zIndex: 2,
  },
  tabIndicator: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Colors.Aztec_Gold,
    borderRadius: moderateScale(12),
    top: 0,
    left: 0,
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
