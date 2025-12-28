import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text} from 'react-native';
import _ from 'lodash';
import {Colors, Fonts} from '../../../themes';
import {moderateScale, verticalScale} from '../../../utils/orientation';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import ProductCard from '../../../components/Template/ProductCard';
import {useIsFocused} from '@react-navigation/native';
import {useAppDispatch} from '@app/redux';
import {
  getDealFavoriteList,
  getUserDetails,
} from '@app/utils/service/UserService';

const Home = () => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const [favoriteList, setFavoriteList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  const getUserInfo = async () => {
    try {
      await dispatch(getUserDetails());
    } catch (error) {
      console.log('Error in handleSignIn:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getUserInfo();
      getAllFavoriteDeals(1);
    }
  }, [isFocused]);

  const keyExtractor = useCallback(
    (item: any, index: number) => index.toString(),
    [],
  );

  const getAllFavoriteDeals = async (_page: number, searchQuery = search) => {
    if (_page === 1) {
      setPage(1);
      setHasMoreData(true);
    }

    setIsLoading(true);
    try {
      const result = await dispatch(
        getDealFavoriteList({
          length: 6,
          page: _page,
          search: searchQuery,
        }),
      );

      if (result.success) {
        if (_.isEmpty(result.data)) {
          setHasMoreData(false);
          if (_page === 1) {
            setFavoriteList([]);
          }
        } else if (_page === 1) {
          setFavoriteList(result.data);
        } else {
          setFavoriteList(prev => [...prev, ...result.data]);
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
      getAllFavoriteDeals(1, query);
    }, 500),
    [],
  );

  return (
    <GeneralTemplate
      searchValue={search}
      enableBack
      title={'Favorite Deals'}
      setSearchValue={(value: string) => {
        console.log('value -- ', value);
        setSearch(value);
        debouncedSearch(value);
      }}
      fixedComponent={<Text style={style.textStyle}>Favorite Deals</Text>}
      isLoading={isLoading}
      scrollEnd={() => {
        if (!isLoading && hasMoreData) {
          let _page = page + 1;
          setPage(_page);
          getAllFavoriteDeals(_page);
        }
      }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={favoriteList}
        keyExtractor={keyExtractor}
        renderItem={({item, index}) => (
          <ProductCard
            onUnFavorite={() => {
              setFavoriteList(prevList =>
                prevList.filter(_item => _item._id !== item._id),
              );
            }}
            isShowFavorite={true}
            enableModal={true}
            item={item}
            key={index}
          />
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
  textStyle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    paddingTop: moderateScale(20),
  },
});
