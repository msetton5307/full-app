/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import _ from 'lodash';
import {Colors, Fonts} from '../../../themes';
import {moderateScale, verticalScale} from '../../../utils/orientation';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import ProductCard from '../../../components/Template/ProductCard';
import {useIsFocused} from '@react-navigation/native';
import {useAppDispatch} from '@app/redux';
import {getMergedJsonDeals, getUserDetails} from '@app/utils/service/UserService';

const Home = () => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const [dealsList, setDealsList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isNewDeals, setIsNewDeals] = useState(0); // 0 = Deals (mobile), 1 = New Deals (json)

  const getUserInfo = async () => {
    try {
      await dispatch(getUserDetails());
    } catch (error) {
      console.log('Error in getUserInfo:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getUserInfo();
      // Reset everything when screen comes into focus
      resetAndFetchDeals();
    }
  }, [isFocused]);

  const keyExtractor = useCallback(
    (item: any, index: number) => `${item._id || item.id || index}`,
    [],
  );

  const resetAndFetchDeals = () => {
    setPage(1);
    setHasMoreData(true);
    setDealsList([]);
    getAllDeals(1, isNewDeals, search);
  };

  const getAllDeals = async (
    _page: number,
    tabIndex = isNewDeals,
    searchQuery = search,
  ) => {
    // Prevent multiple simultaneous calls
    if (isLoading && _page > 1) return;

    // Reset pagination state for new searches or tab changes
    if (_page === 1) {
      setHasMoreData(true);
      if (searchQuery !== '') {
        setIsSearchLoading(true);
      }
    }

    setIsLoading(true);

    try {
      let result: any;

      if (tabIndex === 0 || tabIndex === 1) {
        // Both tabs now use the paginated merge endpoint
        result = await dispatch(
          getMergedJsonDeals({
            page: _page,
            pageSize: 50,
          }),
        );

        if (result.success) {
          if (_.isEmpty(result.data)) {
            setHasMoreData(false);
            if (_page === 1) setDealsList([]);
          } else {
            if (_page === 1) {
              setDealsList(result.data);
            } else {
              setDealsList(prev => [...prev, ...result.data]);
            }

            // Check if we have less data than requested (indicating end of data)
            if (result.data.length < 50) {
              setHasMoreData(false);
            }
          }
        } else {
          console.log('JSON deals API failed:', result);
          if (_page === 1) setDealsList([]);
          setHasMoreData(false);
        }
      }
    } catch (error) {
      console.log('Error in getAllDeals:', error);
      if (_page === 1) setDealsList([]);
      setHasMoreData(false);
    } finally {
      setIsLoading(false);
      setIsSearchLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    _.debounce(query => {
      setPage(1);
      getAllDeals(1, isNewDeals, query);
    }, 500),
    [isNewDeals],
  );

  const handleTabPress = (index: number) => {
    console.log(
      'Tab pressed:',
      index,
      index === 0 ? 'Deals (Mobile)' : 'New Deals (JSON)',
    );

    if (index !== isNewDeals) {
      setIsNewDeals(index);
      setPage(1);
      setHasMoreData(true);
      setDealsList([]);
      setIsLoading(true);

      // Small delay to ensure state updates are processed
      setTimeout(() => {
        getAllDeals(1, index, search);
      }, 100);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMoreData) {
      const nextPage = page + 1;
      setPage(nextPage);
      getAllDeals(nextPage, isNewDeals, search);
    }
  };

  const HeaderComponent = useCallback(() => {
    return (
      <View>
        <Text style={style.textStyle}>All Deals</Text>
        <View style={style.tabContainer}>
          {['New Deals', 'Deals'].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                style.tab,
                {
                  backgroundColor:
                    isNewDeals === index
                      ? Colors.Cornsilk
                      : Colors.Floral_White,
                  borderBottomWidth:
                    isNewDeals === index ? moderateScale(2) : moderateScale(0),
                },
              ]}
              onPress={() => handleTabPress(index)}>
              <Text style={[style.tabText]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [isNewDeals]);

  return (
    <GeneralTemplate
      searchValue={search}
      setSearchValue={(value: string) => {
        console.log('Search value changed:', value);
        setSearch(value);
        debouncedSearch(value);
      }}
      isLoading={isLoading}
      scrollEnd={handleLoadMore}>
      <HeaderComponent />

      {isSearchLoading ||
      (isLoading && page === 1 && dealsList.length === 0) ? (
        <View style={style.loaderOverlay}>
          <ActivityIndicator size="large" color={Colors.Aztec_Gold} />
        </View>
      ) : (
        <View>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={dealsList}
            keyExtractor={keyExtractor}
            renderItem={({item, index}) => (
              <ProductCard
                enableModal={true}
                item={item}
                key={`${isNewDeals}_${item._id || item.id}_${index}`}
                jsonData={isNewDeals === 1}
              />
            )}
            numColumns={2}
            ListEmptyComponent={
              !isLoading ? (
                <Text style={style.empty}>
                  {`No ${isNewDeals === 0 ? 'deals' : 'new deals'} found${
                    search !== '' ? ' for your search' : ''
                  }.`}
                </Text>
              ) : null
            }
            contentContainerStyle={style.flatcontainer}
            columnWrapperStyle={Css.jcsb}
            scrollEnabled={false}
            // ListFooterComponent={
            //   isLoading && page > 1 ? (
            //     <View style={style.footerLoader}>
            //       <ActivityIndicator size="small" color={Colors.Aztec_Gold} />
            //     </View>
            //   ) : null
            // }
          />
        </View>
      )}
    </GeneralTemplate>
  );
};

export default Home;

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
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  textStyle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    paddingVertical: moderateScale(20),
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
  footerLoader: {
    paddingVertical: verticalScale(20),
    alignItems: 'center',
  },
});
