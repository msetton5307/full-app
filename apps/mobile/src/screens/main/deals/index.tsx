/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import _ from 'lodash';
import {Colors, Fonts} from '../../../themes';
import {moderateScale, verticalScale} from '../../../utils/orientation';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import ProductCard from '../../../components/Template/ProductCard';
import {useIsFocused} from '@react-navigation/native';
import {useAppDispatch} from '@app/redux';
import {getAllDealListing} from '@app/utils/service/UserService';

const Deals = () => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const [lists, setList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState(0);

  useEffect(() => {
    if (isFocused) {
      getAllDeals(1);
    }
  }, [isFocused]);

  const keyExtractor = useCallback(
    (item: any, index: number) => index.toString(),
    [],
  );

  const getAllDeals = async (
    _page: number,
    isFeature = isFeatured,
    searchQuery = search,
  ) => {
    if (_page === 1) {
      setPage(1);
      setHasMoreData(true);
    }

    setIsLoading(true);
    try {
      const result = await dispatch(
        getAllDealListing({
          length: 6,
          page: _page,
          search: searchQuery,
          isFeature: isFeature === 1,
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
        } else {
          setList(prev => [...prev, ...result.data]);
        }
      }
    } catch (error) {
      console.log('Error in handleSignIn:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    _.debounce(query => {
      getAllDeals(1, isFeatured, query);
    }, 500),
    [isFeatured],
  );

  const HeaderComponent = useCallback(() => {
    return (
      <View>
        <Text style={style.textStyle}>Deals</Text>
        {/* <View style={style.tabContainer}>
          {['Latest Deal', 'Featured Deals'].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                style.tab,
                {
                  backgroundColor:
                    isFeatured === index
                      ? Colors.Cornsilk
                      : Colors.Floral_White,
                  borderBottomWidth:
                    isFeatured === index ? moderateScale(2) : moderateScale(0),
                },
              ]}
              onPress={() => {
                setIsFeatured(index);
                getAllDeals(1, index, search);
              }}>
              <Text style={[style.tabText]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View> */}
      </View>
    );
  }, [isFeatured, search, setIsFeatured]);

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
        renderItem={({item, index}) => (
          <ProductCard enableModal={true} item={item} key={index} jsonData={false}/>
        )}
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
