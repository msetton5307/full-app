import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors, Fonts, Icons, Images} from '../../themes';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/orientation';
import Css from '../../themes/Css';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import MyStatusBar from '../../utils/helper/MyStatusBar';
import CategoryCard from '../../components/Template/CategoryCard';
import {CustomButtonSolid} from '../../components/CustomButton';
import {navigate} from '../../utils/helper/RootNaivgation';
import {useAppDispatch} from '@app/redux';
import {useIsFocused} from '@react-navigation/native';
import {
  getCategoryAndKeywords,
  updateCategoryAndKeywords,
} from '@app/utils/service/AuthService';
import {balancedData} from '@app/utils/helper';
import {isEmpty} from 'lodash';
import {showMessage} from '@app/utils/helper/Toast';
import Loader from '@app/utils/helper/Loader';
import Storage from '@app/utils/storage';
import {setUserStatus} from '@app/redux/slice/auth.slice';

const {height, width} = Dimensions.get('screen');

const CategoryKeyword = () => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const [searchValue, setSearchValue] = useState('');
  const [CategoryList, setCategoryList] = useState<any[]>([]);
  const [KeywordList, setKeywordList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCategory = async () => {
    try {
      const result = await dispatch(getCategoryAndKeywords({search: ''}));
      if (result && result.data) {
        setCategoryList(result.data);
      }
    } catch (error) {
      console.log('Error in handleSignIn:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getCategory();
    }
  }, [isFocused]);

  const toggleCategorySelection = (item: any, id: string, status: any) => {
    setCategoryList(prevList =>
      prevList.map(item =>
        item._id === id ? {...item, isSelected: !item.isSelected} : item,
      ),
    );

    if (status) {
      setKeywordList(prevList => [...prevList, item]);
    } else {
      setKeywordList(prevList =>
        prevList.filter(keyword => keyword._id !== id),
      );
    }
  };

  const toggleKeywordSelection = (categoryId: string, keywordId: string) => {
    const updatedCategories = KeywordList.map(category => {
      if (category._id === categoryId) {
        return {
          ...category,
          keywords: category.keywords
            ? category.keywords.map((key: any) =>
                key._id === keywordId
                  ? {...key, isSelected: !key.isSelected}
                  : key,
              )
            : [],
        };
      }
      return category;
    });
    setKeywordList(updatedCategories);
  };

  async function handleSubmit() {
    if (!KeywordList || KeywordList.length === 0) {
      showMessage('Please select at least one category.');
      return;
    }

    const formattedPayload = KeywordList.map((item: any) => ({
      category: item._id,
      keywords: item.keywords
        .filter((keyword: any) => keyword.isSelected)
        .map((keyword: any) => keyword._id),
    }));

    setIsLoading(true);
    try {
      const result = await dispatch(
        updateCategoryAndKeywords(formattedPayload),
      );

      showMessage(result?.message);
    } catch (error) {
      showMessage('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSkip() {
    Storage.setItem('personalized_category', 'true');
    dispatch(
      setUserStatus({
        isLoggedIn: true,
        personalized_category: true,
      }),
    );
  }

  const filteredCategories = CategoryList?.filter(category =>
    category?.title.toLowerCase().includes(searchValue?.toLowerCase()),
  );

  return (
    <ImageBackground
      source={Images.Background}
      style={{height: height, width: width}}
      resizeMode="stretch">
      <Loader visible={isLoading} />
      <MyStatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />

      <View
        style={[Css.f1, Css.w90, Css.asc]}
        onStartShouldSetResponder={() => {
          Keyboard.dismiss();
          return false;
        }}>
        <KeyboardAwareScrollView
          style={Css.w100}
          showsVerticalScrollIndicator={false}>
          <View style={Css.w100}>
            <View style={styles.v}>
              <Text style={styles.textStyle}>Select Categories</Text>
              <TouchableOpacity onPress={() => handleSkip()}>
                <Text style={styles.skipStyle}>Skip</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search..."
                placeholderTextColor={Colors.Old_Silver}
                style={styles.searchInput}
                value={searchValue}
                onChangeText={e => setSearchValue(e)}
              />
              <View style={Css.iconContainer20}>
                <Image source={Icons.Search} style={Css.icon20} />
              </View>
            </View>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={balancedData(filteredCategories)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}: any) => (
                <CategoryCard
                  item={item}
                  key={index}
                  onPress={() =>
                    toggleCategorySelection(
                      item,
                      item._id,
                      item?.isSelected ? false : true,
                    )
                  }
                />
              )}
              numColumns={3}
              contentContainerStyle={styles.flatcontainer}
              columnWrapperStyle={Css.jcsb}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.empty}>{`No data found.`}</Text>
              }
            />
          </View>
          {!isEmpty(KeywordList) && (
            <>
              <Text style={styles.textStyle}>Select Keywords</Text>
              {!KeywordList.some(
                item =>
                  Array.isArray(item.keywords) && item.keywords.length > 0,
              ) ? (
                <Text style={[styles.empty, {marginTop: verticalScale(10)}]}>
                  No keywords availble in this category
                </Text>
              ) : (
                <View>
                  {KeywordList.map((item, index) => (
                    <>
                      {!isEmpty(item?.keywords) && (
                        <View key={index} style={styles.wrapContainer}>
                          {item?.keywords?.map((_item: any, idx: number) => (
                            <TouchableOpacity
                              onPress={() =>
                                toggleKeywordSelection(
                                  _item.category_id,
                                  _item._id,
                                )
                              }
                              style={[
                                styles.optionMainContainer,
                                {
                                  backgroundColor: _item.isSelected
                                    ? Colors.Aztec_Gold
                                    : Colors.white,
                                },
                              ]}
                              key={idx}>
                              <Text
                                style={[
                                  {
                                    color: _item.isSelected
                                      ? Colors.white
                                      : Colors.black_olive,
                                  },
                                  styles.keyStyle,
                                ]}>
                                {_item.keyword}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </>
                  ))}
                </View>
              )}
            </>
          )}
          <View style={Css.mb25} />
        </KeyboardAwareScrollView>
      </View>
      <View style={{flex: 0.2, paddingHorizontal: horizontalScale(20)}}>
        <CustomButtonSolid
          containerStyle={Css.w100}
          label="Continue"
          onPress={() => handleSubmit()}
        />
      </View>
    </ImageBackground>
  );
};

export default CategoryKeyword;

const styles = StyleSheet.create({
  textStyle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    marginTop: moderateScale(20),
  },
  empty: {
    fontSize: moderateScale(16),
    color: 'grey',
    alignSelf: 'center',
    marginTop: verticalScale(100),
  },
  skipStyle: {
    color: Colors.Dark_Aztec_Gold,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(15),
    marginTop: moderateScale(20),
  },
  keyStyle: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(12),
    marginHorizontal: horizontalScale(10),
  },
  searchContainer: {
    flexDirection: 'row',
    borderWidth: moderateScale(1),
    flex: 1,
    height: moderateScale(45),
    alignItems: 'center',
    borderColor: Colors.Aztec_Gold,
    borderRadius: moderateScale(30),
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(10),
    backgroundColor: '#FFFAF5',
    marginTop: moderateScale(15),
  },
  searchInput: {
    flex: 1,
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsMedium,
  },
  flatcontainer: {
    width: '100%',
    alignSelf: 'center',
  },
  wrapContainer: {
    marginTop: moderateScale(15),
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    gap: moderateScale(10),
  },
  optionMainContainer: {
    borderWidth: 1,
    padding: moderateScale(10),
    borderRadius: moderateScale(25),
    borderColor: Colors.Desert_Sand,
    alignItems: 'center',
  },
  v: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});
