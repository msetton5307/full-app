import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import _ from 'lodash';
import {Colors, Fonts, Icons} from '../../../themes';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../utils/orientation';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import ProductCard from '../../../components/Template/ProductCard';
import {useIsFocused} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '@app/redux';
import {
  getAllDealListing,
  getUserDetails,
} from '@app/utils/service/UserService';
import CategoryCard from '@app/components/Template/CategoryCard';
import {
  getCategoryListing,
  updateCategoryAndKeywords,
} from '@app/utils/service/AuthService';
import {showMessage} from '@app/utils/helper/Toast';
import {goBack} from '@app/utils/helper/RootNaivgation';

const Categories = () => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(state => state.user.userInfo);

  const [categories, setCategories] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [hasListChanged, setHasListChanged] = useState<boolean>(false);

  useEffect(() => {
    if (isFocused) {
      getCategory(1);
      setHasListChanged(false);
    }
  }, [isFocused]);

  const keyExtractor = useCallback(
    (item: any, index: number) => index.toString(),
    [],
  );

  const getCategory = async (_page: number, searchQuery = search) => {
    if (_page === 1) {
      setPage(1);
      setHasMoreData(true);
    }

    setIsLoading(true);
    try {
      const result = await dispatch(
        getCategoryListing({
          length: 10,
          page: _page,
          search: searchQuery,
        }),
      );

      if (result.success) {
        if (_.isEmpty(result.data)) {
          setHasMoreData(false);
          if (_page === 1) {
            setCategories([]);
          }
        } else if (_page === 1) {
          setCategories(result.data);
        } else {
          setCategories(prev => [...prev, ...result.data]);
        }
      }
    } catch (error) {
      console.log('Error in handleSignIn:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused && !_.isEmpty(categories)) {
      const updatedList = userInfo?.personalized_category?.length
        ? categories?.map((category: any) => ({
            ...category,
            isSelected: userInfo.personalized_category.some(
              (personalized: any) => personalized.category === category._id,
            ),
          }))
        : categories;
      setCategoryList(updatedList);
    }
  }, [isFocused, categories, userInfo]);

  const debouncedSearch = useCallback(
    _.debounce(query => {
      getCategory(1, query);
    }, 500),
    [],
  );

  const toggleCategorySelection = useCallback(
    (id: string) => {
      setCategoryList(prevList =>
        prevList.map(item =>
          item._id === id ? {...item, isSelected: !item.isSelected} : item,
        ),
      );

      setHasListChanged(true);
    },
    [setCategoryList, categoryList],
  );

  const renderCategory = useCallback(
    ({item}: {item: any}) => (
      <CategoryCard
        item={item}
        onPress={() => {
          toggleCategorySelection(item._id);
        }}
      />
    ),
    [toggleCategorySelection],
  );

  async function handleSubmit(updateList: any) {
    const selectedCategories = updateList.filter(
      (item: any) => item.isSelected,
    );
    const payload = selectedCategories.map((item: any) => ({
      category: item._id,
      keywords: [],
    }));

    setIsLoading(true);

    try {
      const result = await dispatch(updateCategoryAndKeywords(payload));
      showMessage(result?.message);
      if (result?.success) {
        setHasListChanged(false);
        await dispatch(getUserDetails());
        goBack();
      }
    } catch (error) {
      showMessage('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const HeaderComponent = useCallback(() => {
    return (
      <View style={styles.header}>
        <Text style={styles.textStyle}>Categories</Text>
        {hasListChanged && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.checkContainer}
            onPress={() => handleSubmit(categoryList)}>
            <Image source={Icons.check} style={styles.check} />
          </TouchableOpacity>
        )}
      </View>
    );
  }, [hasListChanged, categoryList]);

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
          getCategory(_page);
        }
      }}
      fixedComponent={<HeaderComponent />}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={categoryList}
        keyExtractor={keyExtractor}
        renderItem={renderCategory}
        numColumns={3}
        ListEmptyComponent={
          <Text style={styles.empty}>{`No data found.`}</Text>
        }
        contentContainerStyle={styles.flatcontainer}
        columnWrapperStyle={Css.jcsb}
        scrollEnabled={false}
      />
    </GeneralTemplate>
  );
};

export default React.memo(Categories);

const styles = StyleSheet.create({
  flatcontainer: {
    width: '100%',
    alignSelf: 'center',
  },
  textStyle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
  },
  empty: {
    fontSize: moderateScale(16),
    color: 'grey',
    alignSelf: 'center',
    marginTop: verticalScale(100),
  },
  checkContainer: {
    width: horizontalScale(32),
    height: verticalScale(32),
    borderRadius: horizontalScale(40),
    backgroundColor: Colors.Aztec_Gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    width: horizontalScale(20),
    height: verticalScale(20),
    resizeMode: 'contain',
    tintColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: verticalScale(32),
    marginTop: verticalScale(10),
  },
});
