/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useState} from 'react';
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
    marginTop: moderateScale(15)
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
});
